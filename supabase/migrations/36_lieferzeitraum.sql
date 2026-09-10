-- ============================================================
-- Obtanet — Migration 36: Wann geliefert wird, und wohin
--
-- Ein Bündel hatte bisher keinen Lieferzeitraum. Es gab `deadline` (bis
-- wann gesammelt wird) und die Angebotsfrist — kein Feld dafür, wann das
-- Material auf die Baustelle soll. Drei Folgen:
--
--   1. Der Besteller erfuhr nie, wann er sein Material bekommt.
--   2. Das Werk bot blind auf einen Aufwand, den es nicht kannte —
--      500 m³ in einer Woche sind etwas völlig anderes als 500 m³ über
--      ein halbes Jahr.
--   3. Kapazität liess sich gar nicht prüfen. Ohne Zeitraum gibt es
--      nichts, wogegen man prüfen könnte.
--
-- DER ZEITRAUM GEHÖRT AN DIE TEILNAHME, NICHT ANS BÜNDEL. Nicht alle im
-- Bündel brauchen zur gleichen Zeit; einer betoniert im Mai, der nächste
-- im Juli. Aus den einzelnen Zeiträumen entsteht die Mengenkurve des
-- Bündels — und genau die sieht das Werk beim Bieten.
--
-- Monatsebene reicht. Ein Werk plant seine Auslastung in Monaten, nicht in
-- Tagen, und ein Besteller weiss im Voraus ohnehin selten mehr.
--
-- Und: DIE BAUSTELLE WIRD PFLICHT. Bisher stand in `submit_demand` ein
-- `p_project_id UUID DEFAULT NULL` — man konnte einem Bündel beitreten,
-- ohne zu sagen, wohin geliefert werden soll. Für die Zuteilung ganzer
-- Baustellen an mehrere Werke (CLAUDE.md, Abschnitt 5) ist das tödlich:
-- keine Baustelle, keine Adresse, kein Radius, nichts zum Zuteilen.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Spannweite: wie weit ein Bündel zeitlich auseinanderliegen darf
--
-- Ohne Grenze landet ein Mai-Bedarf im selben Bündel wie einer vom
-- Frühling des nächsten Jahres, und kein Werk kann das preisen.
-- ------------------------------------------------------------
INSERT INTO app_settings (key, value)
VALUES ('buendel_spannweite_monate', '3')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 2) Die Felder
--
-- Als DATE auf den Monatsersten normalisiert. Ein eigener Monatstyp wäre
-- sauberer, aber DATE rechnet mit `age()` und `date_trunc()` ohne
-- Klimmzüge, und jede Abfrage bleibt lesbar.
-- ------------------------------------------------------------
ALTER TABLE bundle_participations ADD COLUMN IF NOT EXISTS liefer_von DATE;
ALTER TABLE bundle_participations ADD COLUMN IF NOT EXISTS liefer_bis DATE;
ALTER TABLE bundles              ADD COLUMN IF NOT EXISTS liefer_von DATE;
ALTER TABLE bundles              ADD COLUMN IF NOT EXISTS liefer_bis DATE;

COMMENT ON COLUMN bundle_participations.liefer_von IS
    'Erster Liefermonat dieser Baustelle, auf den Monatsersten normalisiert.';
COMMENT ON COLUMN bundles.liefer_von IS
    'Hüllkurve aller Teilnahmen — frühester Monat. Abgeleitet, nicht eingegeben.';

-- ------------------------------------------------------------
-- 3) Testbündel weg
--
-- Sie haben weder Zeitraum noch Baustelle. Ihnen einen anzudichten hiesse,
-- erfundene Daten in die Datenbank zu schreiben, die später niemand mehr
-- als erfunden erkennt. Der Auftraggeber hat bestätigt, dass es
-- ausschliesslich Testbündel sind.
--
-- Reihenfolge wegen der Fremdschlüssel: erst was am Bündel hängt.
-- ------------------------------------------------------------
DELETE FROM sia_contracts        WHERE bundle_id IS NOT NULL;
DELETE FROM supplier_bids        WHERE bundle_id IS NOT NULL;
DELETE FROM bundle_participations;
DELETE FROM bundles;

-- Jetzt, wo keine Zeile mehr ohne Baustelle dasteht, darf die Spalte
-- verlangt werden. Die Regel steht damit in der Tabelle und nicht bloss
-- in einer Funktion, die man umgehen könnte.
ALTER TABLE bundle_participations ALTER COLUMN project_id SET NOT NULL;
ALTER TABLE bundle_participations ALTER COLUMN liefer_von SET NOT NULL;
ALTER TABLE bundle_participations ALTER COLUMN liefer_bis SET NOT NULL;
ALTER TABLE bundle_participations
    ADD CONSTRAINT bundle_participations_zeitraum_check
    CHECK (liefer_bis >= liefer_von);

-- ------------------------------------------------------------
-- 4) Die Mengenkurve
--
-- Aus vier Teilnahmen wird keine Zahl, sondern ein Verlauf:
--
--     Mai      140 m³
--     Juni     215 m³
--     Juli     110 m³
--     August    35 m³
--
-- Verteilt wird gleichmässig über die Monate des jeweiligen Zeitraums.
-- Wer es genauer weiss, kann später einen Abrufplan hinterlegen; für den
-- Anfang ist die Gleichverteilung ehrlicher als eine erfundene Kurve.
--
-- Rundungsdifferenzen bleiben bewusst unkorrigiert: die Summe der Monate
-- kann um ein paar Zehntel von der Gesamtmenge abweichen. Für eine
-- Kapazitätsprüfung ist das ohne Belang, und eine Korrektur müsste
-- willkürlich einen Monat bevorzugen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mengenkurve(p_bundle_id UUID)
RETURNS TABLE (monat DATE, menge NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT m::DATE AS monat,
           ROUND(SUM(p.requested_volume
                     / (1 + (EXTRACT(YEAR FROM age(p.liefer_bis, p.liefer_von)) * 12
                             + EXTRACT(MONTH FROM age(p.liefer_bis, p.liefer_von))))), 2)
      FROM bundle_participations p
      CROSS JOIN LATERAL generate_series(p.liefer_von, p.liefer_bis, INTERVAL '1 month') AS m
     WHERE p.bundle_id = p_bundle_id
       AND COALESCE(p.status, 'PENDING') <> 'CANCELLED'
     GROUP BY m
     ORDER BY m
$$;

REVOKE ALL ON FUNCTION mengenkurve(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mengenkurve(UUID) TO authenticated, service_role;

COMMENT ON FUNCTION mengenkurve(UUID) IS
    'Die Menge eines Bündels über die Monate. Grundlage für Gebot und Kapazitätsprüfung.';

-- ------------------------------------------------------------
-- 5) Bedarf einreichen — mit Baustelle und Zeitraum
--
-- Die alte Fassung wird ersetzt, nicht ergänzt. Ein zweiter Eingang ohne
-- Zeitraum wäre genau die Lücke, die diese Migration schliesst.
--
-- Beim Zusammenlegen kommt eine Bedingung dazu: Ein bestehendes Bündel
-- nimmt den Bedarf nur auf, wenn die gemeinsame Hüllkurve die Spannweite
-- nicht sprengt. Sonst entsteht ein eigenes. Das ist die deterministische
-- Vorstufe dessen, was später die Bündelungs-KI feiner entscheidet — sie
-- braucht dieselben Felder, nur klüger gelesen.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS submit_demand(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, UUID, INT);

CREATE OR REPLACE FUNCTION submit_demand(
    p_material_id    TEXT,
    p_material_label TEXT,
    p_sia            TEXT,
    p_unit           TEXT,
    p_category       TEXT,
    p_region         TEXT,
    p_volume         NUMERIC,
    p_kbob_price     NUMERIC,
    p_project_id     UUID,
    p_liefer_von     DATE,
    p_liefer_bis     DATE,
    p_days_open      INT DEFAULT 14
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company     UUID;
    v_bundle      UUID;
    v_von         DATE := date_trunc('month', p_liefer_von)::DATE;
    v_bis         DATE := date_trunc('month', p_liefer_bis)::DATE;
    v_spanne      INT  := einstellung_zahl('buendel_spannweite_monate', 3)::INT;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;
    IF p_volume IS NULL OR p_volume <= 0 THEN
        RAISE EXCEPTION 'Menge muss grösser als null sein.';
    END IF;
    IF p_project_id IS NULL THEN
        RAISE EXCEPTION 'Ohne Baustelle geht es nicht — es muss feststehen, wohin geliefert wird.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND company_id = v_company) THEN
        RAISE EXCEPTION 'Diese Baustelle gehört nicht zu deiner Firma.';
    END IF;
    IF v_von IS NULL OR v_bis IS NULL THEN
        RAISE EXCEPTION 'Der Lieferzeitraum fehlt. Ohne ihn kann kein Werk seinen Aufwand rechnen.';
    END IF;
    IF v_bis < v_von THEN
        RAISE EXCEPTION 'Der Lieferzeitraum endet vor seinem Anfang.';
    END IF;
    IF (EXTRACT(YEAR FROM age(v_bis, v_von)) * 12 + EXTRACT(MONTH FROM age(v_bis, v_von))) >= v_spanne THEN
        RAISE EXCEPTION
            'Der Lieferzeitraum umfasst mehr als % Monate. Reiche die Etappen einzeln ein — ein Bündel über ein halbes Jahr kann kein Werk seriös preisen.',
            v_spanne;
    END IF;

    -- Offenes Bündel für dieselbe Nummer und Region suchen, das den
    -- Zeitraum verträgt. FOR UPDATE, damit zwei gleichzeitige
    -- Einreichungen nicht zwei Töpfe erzeugen, wo einer entstehen sollte.
    SELECT id INTO v_bundle
      FROM bundles
     WHERE material_id = p_material_id
       AND region      = p_region
       AND status      = 'OPEN'
       AND deadline    > NOW()
       AND (EXTRACT(YEAR  FROM age(GREATEST(liefer_bis, v_bis), LEAST(liefer_von, v_von))) * 12
          + EXTRACT(MONTH FROM age(GREATEST(liefer_bis, v_bis), LEAST(liefer_von, v_von)))) < v_spanne
     ORDER BY deadline ASC
     LIMIT 1
       FOR UPDATE;

    IF v_bundle IS NULL THEN
        INSERT INTO bundles (
            title, material_id, material_label, material_category,
            sia_specification, region, unit,
            target_volume, tier1_target, tier2_target, tier3_target,
            tier1_discount_pct, tier2_discount_pct, tier3_discount_pct,
            kbob_reference_price, deadline, status,
            liefer_von, liefer_bis
        ) VALUES (
            p_material_label || ' · ' || p_region,
            p_material_id, p_material_label, p_category,
            COALESCE(p_sia, ''), p_region, p_unit,
            -- Zielmenge ist die nächste erreichbare Stufe, nicht die
            -- höchste: ein Ziel, das niemand erreicht, entmutigt nur.
            201, 101, 201, 351,
            9, 12, 16,
            p_kbob_price, NOW() + (p_days_open || ' days')::INTERVAL, 'OPEN',
            v_von, v_bis
        )
        RETURNING id INTO v_bundle;
    END IF;

    -- EINE ZEILE JE BAUSTELLE, nicht je Firma.
    --
    -- Vorher wurde alles einer Firma in einer Teilnahme zusammengezogen.
    -- Das ging, solange niemand wissen musste, wohin geliefert wird — mit
    -- der Zuteilung ganzer Baustellen an mehrere Werke geht es nicht mehr:
    -- eine Firma mit zwei Baustellen im selben Bündel hätte eine davon
    -- verloren, und mit ihr deren Adresse und Zeitraum.
    --
    -- Derselbe Bedarf für dieselbe Baustelle stockt weiterhin auf, und der
    -- Zeitraum wächst dabei auf die Hülle beider Angaben.
    UPDATE bundle_participations
       SET requested_volume = requested_volume + p_volume,
           liefer_von       = LEAST(liefer_von, v_von),
           liefer_bis       = GREATEST(liefer_bis, v_bis)
     WHERE bundle_id        = v_bundle
       AND buyer_company_id = v_company
       AND project_id       = p_project_id
       AND status <> 'CANCELLED';

    IF NOT FOUND THEN
        INSERT INTO bundle_participations (
            bundle_id, buyer_company_id, requested_volume, project_id, status,
            liefer_von, liefer_bis
        ) VALUES (v_bundle, v_company, p_volume, p_project_id, 'PENDING', v_von, v_bis);
    END IF;

    -- Die Hüllkurve des Bündels nachziehen.
    UPDATE bundles b
       SET liefer_von = k.von,
           liefer_bis = k.bis
      FROM (SELECT MIN(liefer_von) AS von, MAX(liefer_bis) AS bis
              FROM bundle_participations
             WHERE bundle_id = v_bundle
               AND COALESCE(status, 'PENDING') <> 'CANCELLED') k
     WHERE b.id = v_bundle;

    PERFORM bundle_recalc(v_bundle);
    RETURN v_bundle;
END;
$$;

REVOKE ALL ON FUNCTION submit_demand(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,NUMERIC,UUID,DATE,DATE,INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_demand(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,NUMERIC,UUID,DATE,DATE,INT) TO authenticated;

-- Eine Baustelle, eine Zeile. Als Index statt als Prüfung in der Funktion:
-- was die Tabelle garantiert, kann keine zweite Funktion umgehen.
CREATE UNIQUE INDEX IF NOT EXISTS bundle_participations_je_baustelle
    ON bundle_participations (bundle_id, project_id)
 WHERE status <> 'CANCELLED';

-- ------------------------------------------------------------
-- 6) Die Plan-Grenze zählt Bündel, nicht Baustellen
--
-- Der Wächter aus Migration 26 zählte Zeilen in `bundle_participations`.
-- Solange eine Firma je Bündel genau eine Zeile hatte, war das dasselbe.
-- Seit Punkt 5 hat sie eine Zeile JE BAUSTELLE — und damit hätte eine
-- Firma mit zwei Baustellen im selben Bündel plötzlich zwei ihrer
-- erlaubten Bündel verbraucht.
--
-- Die Grenze heisst „gleichzeitige Bündel" und muss auch das zählen.
-- Sonst hätte Migration 36 eine Grenze verschärft, die niemand angefasst
-- hat — und der Fehler wäre erst am Starttag aufgefallen, wenn die
-- Grenzen scharf geschaltet werden.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION plan_limit_guard() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
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

    SELECT COUNT(DISTINCT p.bundle_id) INTO v_offen
      FROM bundle_participations p
      JOIN bundles b ON b.id = p.bundle_id
     WHERE p.buyer_company_id = NEW.buyer_company_id
       AND p.status <> 'CANCELLED'
       AND b.status IN ('OPEN', 'SEALED_BIDDING')
       AND p.bundle_id <> NEW.bundle_id;   -- eine weitere Baustelle im
                                           -- SELBEN Bündel ist kein zweites

    IF v_offen >= v_limit THEN
        RAISE EXCEPTION
            'PLAN_LIMIT: Die Stufe % erlaubt % laufendes Bündel gleichzeitig. Beende ein laufendes oder wechsle die Stufe unter /konto.',
            v_plan, v_limit
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;
