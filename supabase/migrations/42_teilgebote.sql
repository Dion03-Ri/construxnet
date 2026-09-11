-- ============================================================
-- Obtanet — Migration 42: Teil-Gebote
--
-- Ein Werk darf auf einen ANTEIL bieten. Damit wird ein 2'000-m³-Bündel
-- lieferbar, das kein einzelnes Werk stemmt.
--
-- AUFGETEILT WIRD NACH GANZEN BAUSTELLEN, nicht nach Prozentschnitt durch
-- jede Lieferung. Eine Bodenplatte kommt aus einem Werk — zwei Werke auf
-- derselben Etappe heissen zwei Rezepturen, zwei Farbtöne, Fugenprobleme.
-- Kein Polier macht das mit.
--
-- Ganze Baustellen gehen aber nie glatt auf: 80/110/145/165 m³ ergeben
-- kein Drittel. Deshalb trägt ein Gebot ZWEI Zahlen — Zielanteil und
-- Puffer. „Rund 33 %, ±5 Punkte." Bekommt das Werk 36 % statt 33 %, gilt
-- derselbe Rabattsatz; es rechnet pro Kubikmeter, die drei Punkte mehr
-- kosten es nichts. Es muss dem Puffer nur VORHER zugestimmt haben, und
-- genau das ist die zweite Zahl.
--
-- DER ZUSCHLAG BLEIBT EINE RECHENREGEL, keine KI-Entscheidung. Wer verdeckt
-- bietet und verliert, muss erfahren können warum; „das Modell fand die
-- andere Kombination besser" besteht vor keinem Werk und vor keinem
-- Gericht. Gleiche Eingabe, gleiches Ergebnis.
--
-- EHRLICH ZUR GRENZE DES VERFAHRENS: Die Zuteilung arbeitet gierig — die
-- günstigsten Werke zuerst, die grössten Baustellen zuerst. Das ist
-- nachvollziehbar und immer gleich, aber es ist NICHT beweisbar die
-- billigste aller Kombinationen: bei ungünstigen Mengenverhältnissen kann
-- eine andere Verteilung ganzer Baustellen rechnerisch knapp besser sein.
-- Ein exaktes Verfahren wäre ein Rucksackproblem mit Nebenbedingungen; der
-- Aufwand lohnt erst, wenn es echte Bündel mit vielen Baustellen gibt.
-- Diese Grenze gehört in die AGB-Formulierung: zugeschlagen wird nach
-- einem veröffentlichten Verfahren, nicht „zum bestmöglichen Preis".
-- ============================================================

-- ------------------------------------------------------------
-- 1) Was ein Gebot jetzt trägt
-- ------------------------------------------------------------
ALTER TABLE supplier_bids ADD COLUMN IF NOT EXISTS anteil_pct NUMERIC NOT NULL DEFAULT 100;
ALTER TABLE supplier_bids ADD COLUMN IF NOT EXISTS puffer_pct NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN supplier_bids.anteil_pct IS
    'Zielanteil am Bündel in Prozent. 100 = das ganze Bündel.';
COMMENT ON COLUMN supplier_bids.puffer_pct IS
    'Wie viele Prozentpunkte über oder unter dem Ziel akzeptiert werden. Ganze Baustellen gehen nie glatt auf.';

-- ------------------------------------------------------------
-- 2) Wer welche Baustelle beliefert
--
-- Eine Zeile je Baustelle. Der UNIQUE-Index auf `participation_id` ist die
-- eigentliche Garantie: eine Baustelle kann gar nicht zwei Werke bekommen.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zuteilungen (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id           UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    participation_id    UUID NOT NULL UNIQUE REFERENCES bundle_participations(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL REFERENCES companies(id),
    menge               NUMERIC NOT NULL,
    bestellerpreis      NUMERIC NOT NULL,
    lieferantenpreis    NUMERIC NOT NULL,
    provision_chf       NUMERIC NOT NULL,
    zugeteilt_am        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE zuteilungen ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS zuteilungen_bundle_idx ON zuteilungen (bundle_id);
CREATE INDEX IF NOT EXISTS zuteilungen_werk_idx   ON zuteilungen (supplier_company_id);

-- Sichtbar für das belieferte Werk und für den Besteller dieser Baustelle.
-- Nicht für die anderen Werke im selben Bündel: aus der Verteilung liesse
-- sich ablesen, wer wie viel bekommen hat.
DROP POLICY IF EXISTS "zuteilungen_select_beteiligte" ON zuteilungen;
CREATE POLICY "zuteilungen_select_beteiligte" ON zuteilungen
    FOR SELECT USING (
        supplier_company_id = current_company_id()
        OR EXISTS (
            SELECT 1 FROM bundle_participations p
             WHERE p.id = zuteilungen.participation_id
               AND p.buyer_company_id = current_company_id()
        )
    );

REVOKE INSERT, UPDATE, DELETE ON zuteilungen FROM anon, authenticated;
GRANT SELECT ON zuteilungen TO authenticated;

-- ------------------------------------------------------------
-- 3) Die Mengenkurve EINER Baustelle
--
-- `mengenkurve()` summiert das ganze Bündel. Für die Zuteilung muss jede
-- Baustelle einzeln über ihre Monate verteilt werden — sonst weiss
-- niemand, welche Last ein Werk mit einer bestimmten Baustelle übernimmt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION baustelle_kurve(p_participation_id UUID)
RETURNS TABLE (monat DATE, menge NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT m::DATE,
           ROUND(p.requested_volume
                 / (1 + (EXTRACT(YEAR  FROM age(p.liefer_bis, p.liefer_von)) * 12
                       + EXTRACT(MONTH FROM age(p.liefer_bis, p.liefer_von)))), 4)
      FROM bundle_participations p
      CROSS JOIN LATERAL generate_series(p.liefer_von, p.liefer_bis, INTERVAL '1 month') AS m
     WHERE p.id = p_participation_id
$$;

REVOKE ALL ON FUNCTION baustelle_kurve(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION baustelle_kurve(UUID) TO service_role;

-- ------------------------------------------------------------
-- 4) Die Zuteilung
--
-- Gierig, und bewusst so: die günstigsten Werke zuerst, die grössten
-- Baustellen zuerst. Nachvollziehbar und bei gleicher Eingabe immer gleich.
--
-- Der Ablauf:
--
--   1. Werke nach Preis sortieren, Baustellen nach Menge.
--   2. Jedes Werk bekommt der Reihe nach Baustellen, solange es seine
--      Obergrenze (Ziel + Puffer) nicht übersteigt UND seine Kapazität in
--      jedem betroffenen Monat reicht.
--   3. Bleibt eine Baustelle übrig, ist das Bündel nicht gedeckt — dann
--      gibt es keinen Zuschlag. Ein halb gedecktes Bündel wäre ein halbes
--      Versprechen.
--   4. Liegt ein Werk unter seiner UNTERGRENZE (Ziel − Puffer), hat es
--      bekommen, was es nicht wollte. Es fällt heraus und alles wird neu
--      gerechnet — höchstens so oft, wie es Werke gibt.
--
-- Gibt Zeilen zurück oder nichts. Schreibt nichts.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bundle_zuteilen(p_bundle_id UUID)
RETURNS TABLE (participation_id UUID, supplier_company_id UUID, bid_id UUID)
-- Nicht STABLE: die Funktion legt Arbeitstabellen an, und das lässt
-- PostgreSQL in einer nicht-volatilen Funktion nicht zu. Sie ändert
-- trotzdem nichts am Datenbestand — die Tabellen verschwinden mit der
-- Transaktion.
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_bundle    bundles%ROWTYPE;
    v_gesamt    NUMERIC;
    v_raus      UUID[] := ARRAY[]::UUID[];   -- Werke, die unter ihre Grenze fielen
    v_runde     INT := 0;
    v_max       INT;
    v_gebot     RECORD;
    v_ort       RECORD;
    v_passt     BOOLEAN;
    v_unter     UUID;
BEGIN
    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id;
    IF v_bundle.id IS NULL THEN RETURN; END IF;

    SELECT COALESCE(SUM(requested_volume), 0) INTO v_gesamt
      FROM bundle_participations
     WHERE bundle_id = p_bundle_id AND COALESCE(status,'PENDING') <> 'CANCELLED';
    IF v_gesamt <= 0 THEN RETURN; END IF;

    SELECT COUNT(*) + 1 INTO v_max FROM supplier_bids WHERE bundle_id = p_bundle_id;

    CREATE TEMP TABLE IF NOT EXISTS t_zuteilung (
        participation_id UUID, supplier_company_id UUID, bid_id UUID, menge NUMERIC
    ) ON COMMIT DROP;
    CREATE TEMP TABLE IF NOT EXISTS t_last (
        supplier_company_id UUID, monat DATE, menge NUMERIC
    ) ON COMMIT DROP;

    <<runden>>
    LOOP
        v_runde := v_runde + 1;
        EXIT WHEN v_runde > v_max;
        DELETE FROM t_zuteilung;
        DELETE FROM t_last;

        FOR v_gebot IN
            SELECT b.id AS bid_id, b.supplier_company_id,
                   ROUND(v_gesamt * GREATEST(b.anteil_pct - b.puffer_pct, 0) / 100, 4) AS boden,
                   ROUND(v_gesamt * LEAST(b.anteil_pct + b.puffer_pct, 100) / 100, 4) AS decke
              FROM supplier_bids b
             WHERE b.bundle_id = p_bundle_id
               AND NOT (b.supplier_company_id = ANY (v_raus))
               -- Wer NUR das ganze Bündel nimmt (Untergrenze = 100 %), hat
               -- in einer Aufteilung nichts verloren: er lässt sich per
               -- Definition nicht teilweise bedienen. Solche Gebote reissen
               -- die gierige Verteilung mit — sie nehmen Baustellen an,
               -- erreichen ihre Untergrenze nie, fliegen raus, und was sie
               -- angenommen hatten, ist dann unverteilt. Sie werden in
               -- `award_bundle` als Alleinanbieter geprüft.
               AND ROUND(v_gesamt * GREATEST(b.anteil_pct - b.puffer_pct, 0) / 100, 4) < v_gesamt
             ORDER BY b.customer_price_net ASC, b.created_at ASC
        LOOP
            FOR v_ort IN
                SELECT p.id, p.requested_volume
                  FROM bundle_participations p
                 WHERE p.bundle_id = p_bundle_id
                   AND COALESCE(p.status,'PENDING') <> 'CANCELLED'
                   AND NOT EXISTS (SELECT 1 FROM t_zuteilung z WHERE z.participation_id = p.id)
                 ORDER BY p.requested_volume DESC, p.id
            LOOP
                -- Passt die Baustelle noch unter die Decke?
                CONTINUE WHEN (SELECT COALESCE(SUM(z.menge), 0) FROM t_zuteilung z
                                WHERE z.supplier_company_id = v_gebot.supplier_company_id)
                              + v_ort.requested_volume > v_gebot.decke;

                -- Und reicht die Kapazität in jedem betroffenen Monat?
                SELECT NOT EXISTS (
                    SELECT 1
                      FROM baustelle_kurve(v_ort.id) k
                      LEFT JOIN t_last l
                             ON l.supplier_company_id = v_gebot.supplier_company_id
                            AND l.monat = k.monat
                      CROSS JOIN LATERAL kapazitaet_frei(
                              v_gebot.supplier_company_id, v_bundle.material_category,
                              k.monat, p_bundle_id) f
                     WHERE k.menge + COALESCE(l.menge, 0) > f.frei_gebucht
                ) INTO v_passt;
                CONTINUE WHEN NOT v_passt;

                INSERT INTO t_zuteilung VALUES
                    (v_ort.id, v_gebot.supplier_company_id, v_gebot.bid_id, v_ort.requested_volume);

                INSERT INTO t_last AS tl (supplier_company_id, monat, menge)
                SELECT v_gebot.supplier_company_id, k.monat, k.menge FROM baustelle_kurve(v_ort.id) k;
            END LOOP;
        END LOOP;

        -- Alles gedeckt?
        IF EXISTS (
            SELECT 1 FROM bundle_participations p
             WHERE p.bundle_id = p_bundle_id
               AND COALESCE(p.status,'PENDING') <> 'CANCELLED'
               AND NOT EXISTS (SELECT 1 FROM t_zuteilung z WHERE z.participation_id = p.id)
        ) THEN
            RETURN;                              -- keine volle Deckung, kein Zuschlag
        END IF;

        -- Liegt jemand unter seiner Untergrenze?
        SELECT b.supplier_company_id INTO v_unter
          FROM supplier_bids b
         WHERE b.bundle_id = p_bundle_id
           AND NOT (b.supplier_company_id = ANY (v_raus))
           AND COALESCE((SELECT SUM(z.menge) FROM t_zuteilung z
                          WHERE z.supplier_company_id = b.supplier_company_id), 0)
               < ROUND(v_gesamt * GREATEST(b.anteil_pct - b.puffer_pct, 0) / 100, 4)
         ORDER BY b.customer_price_net DESC
         LIMIT 1;

        EXIT runden WHEN v_unter IS NULL;
        v_raus := v_raus || v_unter;             -- raus und nochmal
    END LOOP;

    RETURN QUERY SELECT z.participation_id, z.supplier_company_id, z.bid_id FROM t_zuteilung z;
END;
$$;

REVOKE ALL ON FUNCTION bundle_zuteilen(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bundle_zuteilen(UUID) TO service_role;

-- ------------------------------------------------------------
-- 5) Bieten mit Anteil
--
-- Die Sperre aus Migration 35 („Teilgebote sind noch nicht freigeschaltet")
-- fällt. Neu wird gegen den ANTEIL gerechnet, nicht gegen das ganze
-- Bündel: wer ein Drittel will, muss auch nur ein Drittel fahren können.
-- Reserviert wird ebenfalls nur der Anteil.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_bid(
    p_bundle_id         UUID,
    p_lieferantenpreis  NUMERIC,
    p_list_price        NUMERIC DEFAULT 0,
    p_anteil_pct        NUMERIC DEFAULT 100,
    p_puffer_pct        NUMERIC DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company UUID;
    v_bundle  bundles%ROWTYPE;
    v_min     RECORD;
    v_darf    RECORD;
    v_eng     RECORD;
    v_rabatt  NUMERIC;
    v_kunde   NUMERIC;
    v_bid     UUID;
    v_anteil  NUMERIC := COALESCE(p_anteil_pct, 100);
    v_puffer  NUMERIC := COALESCE(p_puffer_pct, 0);
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    SELECT * INTO v_darf FROM bietfaehig(v_company);
    IF NOT v_darf.ok THEN
        RAISE EXCEPTION '%', v_darf.grund;
    END IF;

    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id FOR UPDATE;
    IF v_bundle.id IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;
    IF v_bundle.status <> 'SEALED_BIDDING' THEN
        RAISE EXCEPTION 'Für dieses Bündel läuft gerade keine Ausschreibung.';
    END IF;
    IF v_bundle.bid_deadline IS NOT NULL AND v_bundle.bid_deadline < NOW() THEN
        RAISE EXCEPTION 'Die Angebotsfrist ist abgelaufen.';
    END IF;
    IF p_lieferantenpreis IS NULL OR p_lieferantenpreis <= 0 THEN
        RAISE EXCEPTION 'Preis muss grösser als null sein.';
    END IF;

    IF v_anteil <= 0 OR v_anteil > 100 THEN
        RAISE EXCEPTION 'Der Anteil muss zwischen 1 und 100 Prozent liegen.';
    END IF;
    IF v_puffer < 0 OR v_puffer > 25 THEN
        RAISE EXCEPTION 'Der Puffer muss zwischen 0 und 25 Prozentpunkten liegen.';
    END IF;
    -- Ein Teilgebot ohne Puffer ist fast immer unerfüllbar: ganze
    -- Baustellen treffen einen Prozentwert nie genau. Lieber hier sagen
    -- als das Werk später wortlos übergehen.
    IF v_anteil < 100 AND v_puffer = 0 THEN
        RAISE EXCEPTION
            'Ein Teilgebot braucht einen Puffer. Ganze Baustellen ergeben nie genau % Prozent — sag, wie viele Punkte darüber oder darunter für dich noch in Ordnung sind.',
            v_anteil;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM lieferant_kapazitaet
         WHERE company_id = v_company AND material_category = v_bundle.material_category
    ) THEN
        RAISE EXCEPTION
            'Für % ist keine Kapazität hinterlegt. Trag im Lieferprofil ein, welche Menge du je Monat fahren kannst.',
            v_bundle.material_category;
    END IF;

    -- Geprüft wird gegen den Anteil samt Puffer nach oben: so viel könnte
    -- dieses Werk höchstens bekommen.
    SELECT k.monat, k.gebraucht, k.frei INTO v_eng
      FROM (
        SELECT mk.monat,
               ROUND(mk.menge * LEAST(v_anteil + v_puffer, 100) / 100, 2) AS gebraucht,
               f.frei_gebucht AS frei
          FROM mengenkurve(p_bundle_id) mk
          CROSS JOIN LATERAL kapazitaet_frei(
                  v_company, v_bundle.material_category, mk.monat, p_bundle_id) f
      ) k
     WHERE k.gebraucht > k.frei
     ORDER BY k.monat
     LIMIT 1;

    IF v_eng.monat IS NOT NULL THEN
        RAISE EXCEPTION
            'Deine Kapazität reicht nicht: im % bräuchte dein Anteil %, frei sind %.',
            to_char(v_eng.monat, 'Mon YYYY'), v_eng.gebraucht, v_eng.frei;
    END IF;

    SELECT * INTO v_min FROM mindestgebot(p_bundle_id);
    IF v_min.kbob IS NULL THEN
        RAISE EXCEPTION 'Für dieses Bündel fehlt der Referenzpreis. Ohne ihn ist kein Gebot bewertbar.';
    END IF;

    v_rabatt := ROUND(((v_min.kbob - p_lieferantenpreis) / v_min.kbob) * 100, 2);

    IF p_lieferantenpreis > v_min.max_lieferantenpreis THEN
        RAISE EXCEPTION
            'Gebot zu hoch: % je Einheit sind % %% unter Referenz. Verlangt sind % %% (davon % %% für die Besteller und % %% Vermittlung) — also höchstens % je Einheit.',
            ROUND(p_lieferantenpreis, 2), v_rabatt,
            v_min.gesamtrabatt_pct, v_min.mindestrabatt_pct, v_min.provision_pct,
            v_min.max_lieferantenpreis;
    END IF;

    v_kunde := ROUND(p_lieferantenpreis + v_min.kbob * v_min.provision_pct / 100, 2);

    DELETE FROM supplier_bids
     WHERE bundle_id = p_bundle_id AND supplier_company_id = v_company;

    INSERT INTO supplier_bids (
        bundle_id, supplier_company_id,
        list_price_net, lieferantenpreis_net, offered_discount_percent,
        customer_price_net, platform_fee_percent, price_vs_kbob_index,
        anteil_pct, puffer_pct
    ) VALUES (
        p_bundle_id, v_company,
        COALESCE(NULLIF(p_list_price, 0), v_min.kbob),
        p_lieferantenpreis, v_rabatt, v_kunde,
        v_min.provision_pct, v_kunde - v_min.kbob,
        v_anteil, v_puffer
    )
    RETURNING id INTO v_bid;

    DELETE FROM kapazitaets_bindung
     WHERE company_id = v_company AND bundle_id = p_bundle_id AND zustand = 'RESERVIERT';

    INSERT INTO kapazitaets_bindung (company_id, bundle_id, material_category, monat, menge, zustand)
    SELECT v_company, p_bundle_id, v_bundle.material_category, k.monat,
           ROUND(k.menge * v_anteil / 100, 4), 'RESERVIERT'
      FROM mengenkurve(p_bundle_id) k;

    RETURN v_bid;
END;
$$;

-- ------------------------------------------------------------
-- 6) Der Zuschlag mit Aufteilung
--
-- Ablauf:
--
--   1. `bundle_zuteilen()` rechnet die Verteilung. Sie bevorzugt von
--      selbst die günstigsten Werke; ein Werk mit Anteil 100 und genug
--      Kapazität nimmt dabei alles.
--   2. Kommen dabei MEHRERE Werke heraus, wird gegen das beste Gebot
--      geprüft, das allein alles könnte. Ein einzelner Lieferant ist für
--      die Besteller objektiv besser — ein Ansprechpartner, eine Rechnung,
--      eine Rezeptur. Deshalb gewinnt er auch dann, wenn die Aufteilung
--      bis zu einem Prozentpunkt (einstellbar) günstiger wäre.
--
--      Keine absolute Bevorzugung: Sind drei Werke zusammen drei Punkte
--      besser, wäre es den Bestellern gegenüber falsch, das Geld
--      liegenzulassen.
--   3. Deckt nichts das Bündel vollständig, scheitert es. Ein halb
--      gedecktes Bündel wäre ein halbes Versprechen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION award_bundle(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_bundle    bundles%ROWTYPE;
    v_gesamt    NUMERIC;
    v_kosten    NUMERIC;
    v_werke     INT;
    v_solo      RECORD;
    v_schwelle  NUMERIC;
    v_prov      NUMERIC;
    v_schnitt   NUMERIC;
BEGIN
    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id FOR UPDATE;
    IF v_bundle.id IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;
    IF v_bundle.awarded_at IS NOT NULL THEN
        RETURN;
    END IF;

    SELECT COALESCE(SUM(requested_volume), 0) INTO v_gesamt
      FROM bundle_participations
     WHERE bundle_id = p_bundle_id AND COALESCE(status,'PENDING') <> 'CANCELLED';

    CREATE TEMP TABLE IF NOT EXISTS t_plan (
        participation_id UUID, supplier_company_id UUID, bid_id UUID
    ) ON COMMIT DROP;
    DELETE FROM t_plan;
    INSERT INTO t_plan SELECT * FROM bundle_zuteilen(p_bundle_id);

    -- Das beste Gebot, das allein das ganze Bündel könnte.
    SELECT b.* INTO v_solo
      FROM supplier_bids b
     WHERE b.bundle_id = p_bundle_id
       AND b.anteil_pct + b.puffer_pct >= 100
       AND NOT EXISTS (SELECT 1 FROM kapazitaet_pruefen(b.supplier_company_id, p_bundle_id))
     ORDER BY b.customer_price_net ASC, b.created_at ASC
     LIMIT 1;

    SELECT COUNT(DISTINCT t.supplier_company_id) INTO v_werke FROM t_plan t;

    -- Kosten der Aufteilung, gemessen am Bestellerpreis je Baustelle.
    SELECT COALESCE(SUM(p.requested_volume * b.customer_price_net), 0) INTO v_kosten
      FROM t_plan t
      JOIN bundle_participations p ON p.id = t.participation_id
      JOIN supplier_bids b ON b.id = t.bid_id;

    -- Der Alleinanbieter kommt zum Zug, wenn es keine Aufteilung gibt —
    -- oder wenn die Aufteilung ihn um höchstens den Komplett-Vorsprung
    -- unterbietet. Ein einzelnes Werk ist für die Besteller objektiv
    -- besser: ein Ansprechpartner, eine Rechnung, eine Rezeptur.
    v_schwelle := einstellung_zahl('komplett_vorsprung_pct', 1)
                  / 100 * COALESCE(v_bundle.kbob_reference_price, 0) * v_gesamt;

    IF v_solo.id IS NOT NULL
       AND (v_werke = 0 OR (v_werke > 1
            AND (v_solo.customer_price_net * v_gesamt) - v_kosten <= v_schwelle)) THEN
        DELETE FROM t_plan;
        INSERT INTO t_plan
        SELECT p.id, v_solo.supplier_company_id, v_solo.id
          FROM bundle_participations p
         WHERE p.bundle_id = p_bundle_id
           AND COALESCE(p.status,'PENDING') <> 'CANCELLED';
        v_werke  := 1;
        v_kosten := v_solo.customer_price_net * v_gesamt;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM t_plan) THEN
        UPDATE bundles
           SET status = 'FAILED',
               failed_reason = CASE
                   WHEN NOT EXISTS (SELECT 1 FROM supplier_bids WHERE bundle_id = p_bundle_id)
                   THEN 'Kein Baustoffwerk hat ein Angebot abgegeben.'
                   ELSE 'Die Gebote decken das Bündel nicht vollständig ab.' END
         WHERE id = p_bundle_id;
        DELETE FROM kapazitaets_bindung WHERE bundle_id = p_bundle_id;
        RETURN;
    END IF;

    -- Festschreiben, je Baustelle.
    DELETE FROM zuteilungen WHERE bundle_id = p_bundle_id;
    INSERT INTO zuteilungen (bundle_id, participation_id, supplier_company_id,
                             menge, bestellerpreis, lieferantenpreis, provision_chf)
    SELECT p_bundle_id, t.participation_id, t.supplier_company_id,
           p.requested_volume, b.customer_price_net, b.lieferantenpreis_net,
           ROUND(COALESCE(v_bundle.kbob_reference_price, 0) * p.requested_volume
                 * b.platform_fee_percent / 100, 2)
      FROM t_plan t
      JOIN bundle_participations p ON p.id = t.participation_id
      JOIN supplier_bids b ON b.id = t.bid_id;

    UPDATE supplier_bids SET is_winning_bid = FALSE WHERE bundle_id = p_bundle_id;
    UPDATE supplier_bids SET is_winning_bid = TRUE
     WHERE bundle_id = p_bundle_id
       AND supplier_company_id IN (SELECT DISTINCT supplier_company_id FROM t_plan);

    SELECT SUM(provision_chf) INTO v_prov FROM zuteilungen WHERE bundle_id = p_bundle_id;
    v_schnitt := ROUND(v_kosten / NULLIF(v_gesamt, 0), 2);

    UPDATE bundles
       SET status               = 'AWARDED',
           awarded_at           = NOW(),
           awarded_volume       = v_gesamt,
           -- Bei einer Aufteilung gibt es KEINEN einzelnen Zuschlagsnehmer.
           -- Dann bleibt das Feld leer und `zuteilungen` sagt, wer was hat;
           -- eine willkürlich gewählte Firma hier wäre eine Unwahrheit.
           awarded_supplier_id  = CASE WHEN v_werke = 1
                                       THEN (SELECT DISTINCT supplier_company_id FROM t_plan)
                                       ELSE NULL END,
           awarded_price        = v_schnitt,
           awarded_supplier_price = ROUND(
               v_schnitt - COALESCE(kbob_reference_price, 0)
                           * einstellung_zahl('provision_buendel_pct', 2.25) / 100, 2),
           awarded_discount_pct = CASE
               WHEN COALESCE(kbob_reference_price, 0) > 0
               THEN ROUND(((kbob_reference_price - v_schnitt) / kbob_reference_price) * 100, 2)
               ELSE COALESCE(current_discount_pct, 0) END,
           provision_pct        = einstellung_zahl('provision_buendel_pct', 2.25),
           provision_chf        = v_prov
     WHERE id = p_bundle_id;

    -- Kapazität: nur die zugeteilte Menge bleibt gebucht, der Rest fällt weg.
    DELETE FROM kapazitaets_bindung WHERE bundle_id = p_bundle_id;
    INSERT INTO kapazitaets_bindung (company_id, bundle_id, material_category, monat, menge, zustand)
    SELECT z.supplier_company_id, p_bundle_id, v_bundle.material_category, k.monat,
           SUM(k.menge), 'GEBUCHT'
      FROM zuteilungen z
      CROSS JOIN LATERAL baustelle_kurve(z.participation_id) k
     WHERE z.bundle_id = p_bundle_id
     GROUP BY z.supplier_company_id, k.monat;

    -- Ein Vertrag je Baustelle, mit IHREM Werk und IHREM Preis.
    INSERT INTO sia_contracts (
        bundle_id, buyer_company_id, supplier_company_id,
        contract_number, total_contract_volume, final_unit_price_net
    )
    SELECT p_bundle_id, p.buyer_company_id, z.supplier_company_id,
           'OBT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
               UPPER(SUBSTRING(REPLACE(p.id::TEXT, '-', '') FROM 1 FOR 6)),
           z.menge, z.bestellerpreis
      FROM zuteilungen z
      JOIN bundle_participations p ON p.id = z.participation_id
     WHERE z.bundle_id = p_bundle_id
       AND NOT EXISTS (
             SELECT 1 FROM sia_contracts c
              WHERE c.bundle_id = p_bundle_id AND c.buyer_company_id = p.buyer_company_id);
END;
$$;

-- ------------------------------------------------------------
-- 7) Die Lieferantensichten lesen aus `zuteilungen`
--
-- Sie hingen an `bundles.awarded_supplier_id`. Bei einer Aufteilung ist
-- das Feld leer — dann sähe kein einziges der beteiligten Werke seinen
-- eigenen Zuschlag. Die Wahrheit steht jetzt je Baustelle in
-- `zuteilungen`, und dort wird sie auch gelesen.
-- ------------------------------------------------------------
-- Die Spaltenliste ändert sich (`geteilt` kommt dazu), deshalb erst weg.
DROP FUNCTION IF EXISTS meine_zuschlaege();
CREATE OR REPLACE FUNCTION meine_zuschlaege()
RETURNS TABLE (
    bundle_id UUID, titel TEXT, region TEXT, einheit TEXT,
    menge NUMERIC, mein_preis NUMERIC, bestellerpreis NUMERIC,
    provision_pct NUMERIC, provision_chf NUMERIC,
    liefer_von DATE, liefer_bis DATE,
    zugeschlagen_am TIMESTAMPTZ, abgeschlossen_am TIMESTAMPTZ,
    baustellen INT, geteilt BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.id, COALESCE(b.material_label, b.title), b.region, b.unit,
           -- Die EIGENE Menge, nicht die des Bündels.
           SUM(z.menge),
           MAX(z.lieferantenpreis),
           MAX(z.bestellerpreis),
           b.provision_pct,
           SUM(z.provision_chf),
           MIN(p.liefer_von), MAX(p.liefer_bis),
           b.awarded_at, b.completed_at,
           COUNT(*)::INT,
           -- Teilt sich dieses Bündel auf mehrere Werke auf? Das gehört
           -- dem Werk gesagt: es fährt dann nicht das ganze Bündel.
           (SELECT COUNT(DISTINCT z2.supplier_company_id) FROM zuteilungen z2
             WHERE z2.bundle_id = b.id) > 1
      FROM zuteilungen z
      JOIN bundles b ON b.id = z.bundle_id
      JOIN bundle_participations p ON p.id = z.participation_id
     WHERE z.supplier_company_id = current_company_id()
     GROUP BY b.id, b.material_label, b.title, b.region, b.unit,
              b.provision_pct, b.awarded_at, b.completed_at
     ORDER BY b.awarded_at DESC
$$;

REVOKE ALL ON FUNCTION meine_zuschlaege() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_zuschlaege() TO authenticated;

CREATE OR REPLACE FUNCTION zuschlag_baustellen(p_bundle_id UUID)
RETURNS TABLE (
    baustelle TEXT, firma TEXT, strasse TEXT, plz TEXT, ort TEXT, kanton TEXT,
    menge NUMERIC, liefer_von DATE, liefer_bis DATE, kontakt TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT pr.name, c.company_name, pr.street, pr.zip, pr.city, pr.canton,
           z.menge, p.liefer_von, p.liefer_bis,
           COALESCE(c.email, c.phone)
      FROM zuteilungen z
      JOIN bundle_participations p ON p.id = z.participation_id
      JOIN projects  pr ON pr.id = p.project_id
      JOIN companies c  ON c.id  = p.buyer_company_id
     WHERE z.bundle_id = p_bundle_id
       -- Nur die eigenen Baustellen. Wer bei einer Aufteilung zwei von
       -- fünf beliefert, sieht auch nur diese zwei Adressen.
       AND z.supplier_company_id = current_company_id()
     ORDER BY pr.name
$$;

REVOKE ALL ON FUNCTION zuschlag_baustellen(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION zuschlag_baustellen(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION meine_abrechnung()
RETURNS TABLE (
    bundle_id UUID, titel TEXT, menge NUMERIC, einheit TEXT,
    provision_pct NUMERIC, provision_chf NUMERIC,
    faellig_am DATE, bezahlt_am DATE, offen BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.id, COALESCE(b.material_label, b.title), SUM(z.menge), b.unit,
           b.provision_pct, SUM(z.provision_chf),
           (COALESCE(MIN(p.liefer_von), b.awarded_at::DATE) + 30),
           b.provision_bezahlt_am,
           b.provision_bezahlt_am IS NULL
      FROM zuteilungen z
      JOIN bundles b ON b.id = z.bundle_id
      JOIN bundle_participations p ON p.id = z.participation_id
     WHERE z.supplier_company_id = current_company_id()
     GROUP BY b.id, b.material_label, b.title, b.unit, b.provision_pct,
              b.provision_bezahlt_am, b.awarded_at
    HAVING SUM(z.provision_chf) > 0
     ORDER BY (COALESCE(MIN(p.liefer_von), b.awarded_at::DATE) + 30) ASC
$$;

REVOKE ALL ON FUNCTION meine_abrechnung() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_abrechnung() TO authenticated;
