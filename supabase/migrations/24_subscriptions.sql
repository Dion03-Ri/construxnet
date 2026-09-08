-- ============================================================
-- ABONNEMENTE
--
-- Der ganze Weg bis zur Zahlung: waehlen, bestaetigen, wechseln,
-- kuendigen, wieder aufnehmen. Was fehlt, ist genau ein Schritt — die
-- Zahlung selbst. Bis die angebunden ist, endet ein kostenpflichtiges
-- Abo im Zustand PENDING_PAYMENT.
--
-- SICHERHEIT: Der Client darf diese Tabelle NIE schreiben. Koennte er
-- es, setzte sich jeder in einer Zeile auf ENTERPRISE/ACTIVE. Alle
-- Aenderungen laufen ueber die SECURITY-DEFINER-Funktionen unten, und
-- die setzen ein kostenpflichtiges Abo ausschliesslich auf
-- PENDING_PAYMENT. Auf ACTIVE stellt es spaeter nur der Webhook des
-- Zahlungsanbieters mit dem Dienstschluessel.
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id                UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,

    plan                      TEXT NOT NULL DEFAULT 'FREE'
                              CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
    status                    TEXT NOT NULL DEFAULT 'ACTIVE'
                              CHECK (status IN ('ACTIVE', 'PENDING_PAYMENT', 'PAST_DUE', 'CANCELLED')),

    -- Was nach dem Laufzeitende gelten soll. Eine Kuendigung nimmt
    -- nichts sofort weg — bezahlt ist bezahlt.
    pending_plan              TEXT CHECK (pending_plan IN ('FREE', 'PRO', 'ENTERPRISE')),

    started_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end        TIMESTAMPTZ,
    cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at              TIMESTAMPTZ,

    -- Zahlungsanbieter. Noch nicht angebunden, die Felder stehen schon
    -- da, damit die Anbindung spaeter keine Migration der Zustaende ist.
    provider                  TEXT CHECK (provider IN ('STRIPE')),
    provider_customer_id      TEXT,
    provider_subscription_id  TEXT,

    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_company_idx ON subscriptions (company_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Lesen: nur das eigene Abo. Schreiben: niemand.
DROP POLICY IF EXISTS "Eigenes Abo lesen" ON subscriptions;
CREATE POLICY "Eigenes Abo lesen" ON subscriptions
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub')
    );

-- ------------------------------------------------------------
-- Die eigene Firma, einmal bestimmt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION my_company_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub' LIMIT 1
$$;

-- ------------------------------------------------------------
-- Abo holen, und wenn keines da ist, das kostenlose anlegen.
-- Jede Firma hat ein Abo — „kein Abo" waere ein zweiter Zustand, den
-- jede Abfrage mitdenken muesste.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION subscription_mine()
RETURNS subscriptions
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_company UUID := my_company_id();
    v_row subscriptions;
BEGIN
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Kein Firmenprofil';
    END IF;

    SELECT * INTO v_row FROM subscriptions WHERE company_id = v_company;
    IF NOT FOUND THEN
        INSERT INTO subscriptions (company_id) VALUES (v_company) RETURNING * INTO v_row;
    END IF;
    RETURN v_row;
END;
$$;

-- ------------------------------------------------------------
-- Eine Stufe waehlen.
--
-- FREE gilt sofort. PRO und ENTERPRISE landen auf PENDING_PAYMENT —
-- solange keine Zahlung angebunden ist, wird daraus nichts von selbst.
-- Genau das ist die Grenze, die diese Migration zieht.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION subscription_choose(p_plan TEXT)
RETURNS subscriptions
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_row subscriptions;
BEGIN
    IF p_plan NOT IN ('FREE', 'PRO', 'ENTERPRISE') THEN
        RAISE EXCEPTION 'Unbekannte Stufe: %', p_plan;
    END IF;

    v_row := subscription_mine();

    IF p_plan = 'FREE' THEN
        -- Herunterstufen nimmt nichts weg, was bezahlt ist: die
        -- bezahlte Stufe laeuft bis zum Periodenende weiter.
        IF v_row.status = 'ACTIVE' AND v_row.plan <> 'FREE' AND v_row.current_period_end > NOW() THEN
            UPDATE subscriptions
               SET pending_plan = 'FREE', cancel_at_period_end = TRUE,
                   cancelled_at = NOW(), updated_at = NOW()
             WHERE id = v_row.id RETURNING * INTO v_row;
        ELSE
            UPDATE subscriptions
               SET plan = 'FREE', status = 'ACTIVE', pending_plan = NULL,
                   cancel_at_period_end = FALSE, cancelled_at = NULL,
                   current_period_end = NULL, updated_at = NOW()
             WHERE id = v_row.id RETURNING * INTO v_row;
        END IF;
    ELSE
        UPDATE subscriptions
           SET pending_plan = p_plan, status = 'PENDING_PAYMENT',
               cancel_at_period_end = FALSE, cancelled_at = NULL,
               updated_at = NOW()
         WHERE id = v_row.id RETURNING * INTO v_row;
    END IF;

    RETURN v_row;
END;
$$;

-- ------------------------------------------------------------
-- Kuendigen und wieder aufnehmen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION subscription_cancel()
RETURNS subscriptions
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_row subscriptions;
BEGIN
    v_row := subscription_mine();
    UPDATE subscriptions
       SET cancel_at_period_end = TRUE, pending_plan = 'FREE',
           cancelled_at = NOW(), updated_at = NOW()
     WHERE id = v_row.id RETURNING * INTO v_row;
    RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION subscription_resume()
RETURNS subscriptions
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_row subscriptions;
BEGIN
    v_row := subscription_mine();
    UPDATE subscriptions
       SET cancel_at_period_end = FALSE, pending_plan = NULL,
           cancelled_at = NULL, updated_at = NOW()
     WHERE id = v_row.id RETURNING * INTO v_row;
    RETURN v_row;
END;
$$;

-- ------------------------------------------------------------
-- Faellige Abos weiterschalten. Ohne Zeitgeber beim Lesen aufgerufen,
-- wie advance_due_bundles.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION advance_due_subscriptions() RETURNS VOID
LANGUAGE sql SECURITY DEFINER AS $$
    UPDATE subscriptions
       SET plan = COALESCE(pending_plan, 'FREE'),
           status = 'ACTIVE',
           pending_plan = NULL,
           cancel_at_period_end = FALSE,
           current_period_end = NULL,
           updated_at = NOW()
     WHERE cancel_at_period_end = TRUE
       AND current_period_end IS NOT NULL
       AND current_period_end <= NOW();
$$;

GRANT EXECUTE ON FUNCTION subscription_mine()            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION subscription_choose(TEXT)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION subscription_cancel()          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION subscription_resume()          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION advance_due_subscriptions()    TO anon, authenticated;
