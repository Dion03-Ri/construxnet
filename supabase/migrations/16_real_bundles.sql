-- ============================================================
-- Obtanet — Migration 16: Aus Bedarf werden echte Bündel
--
-- Bisher endete das Beschaffungsformular in einer Zusammenfassung. Der
-- Bedarf wurde nirgends gespeichert, und die Pool-Übersicht zeigte eine
-- feste Liste aus dem Code. Damit war der Kern des Produkts eine
-- Attrappe: alles, was wir an Materialnummern, Abgleich und gemeinsamem
-- Katalog gebaut haben, zahlt sich erst aus, wenn Bedarfe tatsächlich
-- zusammenlaufen.
--
-- Diese Migration macht daraus einen laufenden Vorgang.
--
-- Warum eine Funktion und keine Insert-Policy: das Zusammenführen ist
-- eine Entscheidung, die niemand selbst treffen darf. Wer sein eigenes
-- Bündel anlegen könnte, könnte auch die Rabattstufen hineinschreiben.
-- Ausserdem müssen zwei gleichzeitige Einreichungen für dasselbe
-- Material im selben Bündel landen und nicht in zweien — das geht nur
-- server-seitig unter Sperre.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- Der Schlüssel, auf dem gebündelt wird
-- ------------------------------------------------------------
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS material_id TEXT;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS material_label TEXT;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS current_discount_pct NUMERIC DEFAULT 0;
-- Teilnehmerzahl muss auf dem Bündel liegen: die Teilnahmen selbst sind
-- durch RLS verdeckt, ein Client könnte sie also nicht zählen. Genau das
-- ist gewollt — sichtbar ist die Menge, nie wer sie beisteuert.
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS bundles_match_idx
    ON bundles (material_id, region, status, deadline);

-- ------------------------------------------------------------
-- Rabattstufen — dieselbe Staffel wie im Code (data/procurement.ts).
-- Solange die Stufen nicht endgültig entschieden sind, steht die
-- Wahrheit an genau zwei Stellen; ändert sich eine, muss die andere mit.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bundle_tier(p_volume NUMERIC)
RETURNS TABLE (tier INT, discount NUMERIC)
LANGUAGE sql IMMUTABLE AS $$
    SELECT CASE
             WHEN p_volume >= 501 THEN 5
             WHEN p_volume >= 351 THEN 4
             WHEN p_volume >= 201 THEN 3
             WHEN p_volume >= 101 THEN 2
             ELSE 1
           END,
           CASE
             WHEN p_volume >= 501 THEN 20
             WHEN p_volume >= 351 THEN 16
             WHEN p_volume >= 201 THEN 12
             WHEN p_volume >= 101 THEN 9
             ELSE 5
           END;
$$;

-- ------------------------------------------------------------
-- Kennzahlen eines Bündels neu rechnen.
--
-- SECURITY DEFINER, weil dabei über alle Teilnahmen summiert wird — auch
-- über fremde, die der Aufrufer nicht sehen darf. Herauskommen nur
-- Summen, nie einzelne Firmen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bundle_recalc(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_volume NUMERIC;
    v_count  INTEGER;
    v_tier   INT;
    v_disc   NUMERIC;
BEGIN
    SELECT COALESCE(SUM(requested_volume), 0), COUNT(DISTINCT buyer_company_id)
      INTO v_volume, v_count
      FROM bundle_participations
     WHERE bundle_id = p_bundle_id
       AND status <> 'CANCELLED';

    SELECT t.tier, t.discount INTO v_tier, v_disc FROM bundle_tier(v_volume) t;

    UPDATE bundles
       SET current_volume       = v_volume,
           participant_count    = v_count,
           current_tier         = v_tier,
           current_discount_pct = v_disc
     WHERE id = p_bundle_id;
END;
$$;

-- ------------------------------------------------------------
-- Bedarf einreichen: einem passenden Bündel beitreten oder eines anlegen
--
-- Passend heisst: dieselbe Materialnummer, dieselbe Region, noch offen
-- und die Frist nicht abgelaufen. Die Materialnummer ist der Grund,
-- warum das überhaupt funktioniert — ohne sie lägen „Beton C25/30" und
-- „Transportbeton 25/30" in zwei Töpfen.
--
-- Wer denselben Bedarf zweimal einreicht, erhöht seine Menge, statt
-- doppelt zu zählen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_demand(
    p_material_id    TEXT,
    p_material_label TEXT,
    p_sia            TEXT,
    p_unit           TEXT,
    p_category       TEXT,
    p_region         TEXT,
    p_volume         NUMERIC,
    p_kbob_price     NUMERIC,
    p_project_id     UUID DEFAULT NULL,
    p_days_open      INT DEFAULT 14
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_company UUID;
    v_bundle  UUID;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;
    IF p_volume IS NULL OR p_volume <= 0 THEN
        RAISE EXCEPTION 'Menge muss grösser als null sein.';
    END IF;

    -- Offenes Bündel für dieselbe Nummer und Region suchen und sperren,
    -- damit zwei gleichzeitige Einreichungen nicht zwei Bündel anlegen.
    SELECT id INTO v_bundle
      FROM bundles
     WHERE material_id = p_material_id
       AND region      = p_region
       AND status      = 'OPEN'
       AND deadline    > NOW()
     ORDER BY deadline ASC
     LIMIT 1
       FOR UPDATE;

    IF v_bundle IS NULL THEN
        INSERT INTO bundles (
            title, material_id, material_label, material_category,
            sia_specification, region, unit,
            target_volume, tier1_target, tier2_target, tier3_target,
            tier1_discount_pct, tier2_discount_pct, tier3_discount_pct,
            kbob_reference_price, deadline, status
        ) VALUES (
            p_material_label || ' · ' || p_region,
            p_material_id, p_material_label, p_category,
            COALESCE(p_sia, ''), p_region, p_unit,
            -- Zielmenge ist die nächste erreichbare Stufe, nicht die
            -- höchste: ein Ziel, das niemand erreicht, entmutigt nur.
            201, 101, 201, 351,
            9, 12, 16,
            p_kbob_price, NOW() + (p_days_open || ' days')::INTERVAL, 'OPEN'
        )
        RETURNING id INTO v_bundle;
    END IF;

    -- Teilnahme anlegen oder aufstocken.
    UPDATE bundle_participations
       SET requested_volume = requested_volume + p_volume,
           project_id       = COALESCE(p_project_id, project_id)
     WHERE bundle_id        = v_bundle
       AND buyer_company_id = v_company
       AND status <> 'CANCELLED';

    IF NOT FOUND THEN
        INSERT INTO bundle_participations (
            bundle_id, buyer_company_id, requested_volume, project_id, status
        ) VALUES (v_bundle, v_company, p_volume, p_project_id, 'PENDING');
    END IF;

    PERFORM bundle_recalc(v_bundle);
    RETURN v_bundle;
END;
$$;

-- ------------------------------------------------------------
-- Teilnahme zurückziehen. Das Bündel bleibt bestehen, die Menge sinkt —
-- und mit ihr womöglich die Rabattstufe. Genau diese Ehrlichkeit
-- gehört dazu.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION withdraw_demand(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_company UUID;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    UPDATE bundle_participations
       SET status = 'CANCELLED'
     WHERE bundle_id = p_bundle_id
       AND buyer_company_id = v_company;

    PERFORM bundle_recalc(p_bundle_id);
END;
$$;

-- ------------------------------------------------------------
-- Rechte
--
-- Bündel bleiben für alle lesbar — das ist der Sinn: man muss sehen
-- können, wo sich etwas sammelt, um beizutreten. Sichtbar sind nur
-- Summen. Schreiben geht ausschliesslich über die Funktionen oben.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "bundle_participations_insert_own" ON bundle_participations;
CREATE POLICY "bundle_participations_insert_own" ON bundle_participations
    FOR INSERT WITH CHECK (buyer_company_id = current_company_id());

DROP POLICY IF EXISTS "bundle_participations_update_own" ON bundle_participations;
CREATE POLICY "bundle_participations_update_own" ON bundle_participations
    FOR UPDATE USING (buyer_company_id = current_company_id())
    WITH CHECK (buyer_company_id = current_company_id());
