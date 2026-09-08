-- ============================================================
-- GRENZEN JE ABO-STUFE
--
-- „Gratis: Teilnahme an EINEM Smart Pool" steht auf der Preisseite. Bisher
-- stand es nur da — geprueft wurde es nirgends.
--
-- Geprueft wird hier, in einem Trigger auf `bundle_participations`, und
-- nicht in der Anwendung. Eine Grenze, die der Browser durchsetzt, ist
-- keine: der Aufruf laesst sich nachbauen. Der Trigger deckt ausserdem
-- JEDEN Weg ab, auf dem eine Teilnahme entsteht — heute submit_demand,
-- morgen vielleicht ein anderer.
--
-- AUSGESCHALTET AUSGELIEFERT. Vor dem Start wuerde die Grenze die eigene
-- Erprobung blockieren. Einschalten mit einer Zeile, ohne neue
-- Auslieferung:
--     UPDATE app_settings SET value = 'on' WHERE key = 'plan_limits';
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
-- Keine Policy: nur der Dienstschluessel und SECURITY-DEFINER-Funktionen.

INSERT INTO app_settings (key, value) VALUES ('plan_limits', 'off')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- Wie viele gleichzeitige Buendel eine Stufe erlaubt.
--
-- ACHTUNG, ZWEITE STELLE: dieselben Zahlen stehen in `data/plans.ts` als
-- `poolLimit`. Die Anwendung ZEIGT sie, diese Tabelle SETZT sie DURCH.
-- Wer eine aendert, muss die andere mitaendern.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_limits (
    plan       TEXT PRIMARY KEY CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
    pool_limit INTEGER          -- NULL = ohne Grenze
);
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

INSERT INTO plan_limits (plan, pool_limit) VALUES
    ('FREE', 1), ('PRO', NULL), ('ENTERPRISE', NULL)
ON CONFLICT (plan) DO UPDATE SET pool_limit = EXCLUDED.pool_limit;

-- ------------------------------------------------------------
-- Der Waechter.
--
-- Gezaehlt werden nur LAUFENDE Buendel: was vergeben, gescheitert oder
-- abgesagt ist, belegt keinen Platz mehr. Sonst waere die Gratis-Stufe
-- nach dem ersten abgeschlossenen Geschaeft fuer immer voll.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION plan_limit_guard() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_an     TEXT;
    v_plan   TEXT;
    v_limit  INTEGER;
    v_offen  INTEGER;
BEGIN
    SELECT value INTO v_an FROM app_settings WHERE key = 'plan_limits';
    IF COALESCE(v_an, 'off') <> 'on' THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(s.plan, 'FREE') INTO v_plan
      FROM subscriptions s WHERE s.company_id = NEW.buyer_company_id;
    v_plan := COALESCE(v_plan, 'FREE');

    SELECT pool_limit INTO v_limit FROM plan_limits WHERE plan = v_plan;
    IF v_limit IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*) INTO v_offen
      FROM bundle_participations p
      JOIN bundles b ON b.id = p.bundle_id
     WHERE p.buyer_company_id = NEW.buyer_company_id
       AND p.status <> 'CANCELLED'
       AND b.status IN ('OPEN', 'SEALED_BIDDING');

    IF v_offen >= v_limit THEN
        RAISE EXCEPTION
            'PLAN_LIMIT: Die Stufe % erlaubt % laufendes Bündel gleichzeitig. Beende ein laufendes oder wechsle die Stufe unter /konto.',
            v_plan, v_limit
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS plan_limit_check ON bundle_participations;
CREATE TRIGGER plan_limit_check
    BEFORE INSERT ON bundle_participations
    FOR EACH ROW EXECUTE FUNCTION plan_limit_guard();
