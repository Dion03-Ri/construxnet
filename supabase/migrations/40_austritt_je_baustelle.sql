-- ============================================================
-- Obtanet — Migration 40: Zwei Fehler, die Migration 36 verursacht hat
--
-- Beim Durchsehen des Ganzen aufgefallen. Beide stammen daher, dass eine
-- Teilnahme seit Migration 36 EINE ZEILE JE BAUSTELLE ist und nicht mehr
-- eine je Firma.
--
--   1. `withdraw_demand(bundle_id)` hat alle Teilnahmen der Firma an
--      diesem Bündel storniert. Eine Firma mit zwei Baustellen im selben
--      Bündel wollte eine zurückziehen — und verlor beide, ohne Hinweis.
--      Das ist die schlimmere Sorte Fehler: er tut mehr als verlangt und
--      sagt nichts davon.
--
--   2. Die Hüllkurve des Bündels (`liefer_von`/`liefer_bis`) wurde nur
--      beim Einreichen nachgezogen. Trat jemand aus, blieb sie stehen —
--      ein Bündel behielt einen Liefermonat, den niemand mehr brauchte,
--      und die Kapazitätsprüfung rechnete gegen einen Monat zu viel.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Die Hüllkurve gehört in `bundle_recalc`
--
-- Dort, wo ohnehin Menge, Stufe und Teilnehmerzahl nachgezogen werden.
-- Eine Regel an einer Stelle: jeder Weg, der eine Teilnahme ändert, ruft
-- diese Funktion.
--
-- `participant_count` zählt weiterhin DISTINCT nach Firma und nicht die
-- Zeilen — sonst hätte eine Firma mit zwei Baustellen die k-Anonymität
-- allein erfüllt, und ein Bündel wäre mit einem einzigen Besteller in die
-- Ausschreibung gegangen. Das war schon vorher richtig gebaut und bleibt
-- es; hier steht es, damit es beim nächsten Umbau nicht verlorengeht.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bundle_recalc(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_volume NUMERIC;
    v_count  INTEGER;
    v_tier   INT;
    v_disc   NUMERIC;
    v_von    DATE;
    v_bis    DATE;
BEGIN
    SELECT COALESCE(SUM(requested_volume), 0), COUNT(DISTINCT buyer_company_id),
           MIN(liefer_von), MAX(liefer_bis)
      INTO v_volume, v_count, v_von, v_bis
      FROM bundle_participations
     WHERE bundle_id = p_bundle_id
       AND status <> 'CANCELLED';

    SELECT t.tier, t.discount INTO v_tier, v_disc FROM bundle_tier(v_volume) t;

    UPDATE bundles
       SET current_volume       = v_volume,
           participant_count    = v_count,
           current_tier         = v_tier,
           current_discount_pct = v_disc,
           liefer_von           = v_von,
           liefer_bis           = v_bis
     WHERE id = p_bundle_id;
END;
$$;

-- ------------------------------------------------------------
-- 2) Austreten je Baustelle
--
-- Ohne Angabe wird nur ausgetreten, wenn es genau eine Baustelle gibt.
-- Bei mehreren wird ABGEWIESEN statt geraten: „welche denn?" ist eine
-- Frage, die die Datenbank nicht für den Nutzer beantworten darf.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS withdraw_demand(UUID);

CREATE OR REPLACE FUNCTION withdraw_demand(
    p_bundle_id  UUID,
    p_project_id UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company UUID;
    v_status  TEXT;
    v_frist   TIMESTAMP WITH TIME ZONE;
    v_anzahl  INT;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    SELECT status, deadline INTO v_status, v_frist FROM bundles WHERE id = p_bundle_id;
    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;

    IF v_status <> 'OPEN' THEN
        RAISE EXCEPTION 'Das Bündel ist nicht mehr in der Sammelphase (%). Ein Austritt ist ab der Ausschreibung nicht mehr möglich.', v_status;
    END IF;

    IF v_frist IS NOT NULL AND NOW() >= v_frist THEN
        RAISE EXCEPTION 'Die Frist ist abgelaufen. Ein Austritt ist nicht mehr möglich.';
    END IF;

    SELECT COUNT(*) INTO v_anzahl
      FROM bundle_participations
     WHERE bundle_id = p_bundle_id AND buyer_company_id = v_company AND status <> 'CANCELLED';

    IF v_anzahl = 0 THEN
        RAISE EXCEPTION 'Du nimmst an diesem Bündel nicht teil.';
    END IF;

    IF p_project_id IS NULL AND v_anzahl > 1 THEN
        RAISE EXCEPTION
            'Du bist mit % Baustellen in diesem Bündel. Sag, welche zurückgezogen werden soll — sonst verlörest du beide.',
            v_anzahl;
    END IF;

    UPDATE bundle_participations
       SET status = 'CANCELLED'
     WHERE bundle_id = p_bundle_id
       AND buyer_company_id = v_company
       AND status <> 'CANCELLED'
       AND (p_project_id IS NULL OR project_id = p_project_id);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Für diese Baustelle nimmst du an dem Bündel nicht teil.';
    END IF;

    PERFORM bundle_recalc(p_bundle_id);
END;
$$;

REVOKE ALL ON FUNCTION withdraw_demand(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION withdraw_demand(UUID, UUID) TO authenticated;

-- ------------------------------------------------------------
-- 3) `submit_demand` ohne die doppelte Hüllkurve
--
-- Wortgleich zu Migration 36, nur ohne den Block, der die Hüllkurve
-- inline nachzog — den besitzt jetzt `bundle_recalc`, das ohnehin am Ende
-- gerufen wird. Zwei Kopien derselben Rechnung sind eine zu viel.
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

    PERFORM bundle_recalc(v_bundle);
    RETURN v_bundle;
END;
$$;

