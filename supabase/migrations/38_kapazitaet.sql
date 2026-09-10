-- ============================================================
-- Obtanet — Migration 38: Kapazität
--
-- Kapazität ist eine RATE, kein Vorrat. „Die Kapazität schrumpft mit jedem
-- gewonnenen Bündel" stimmt nur für den Lieferzeitraum — danach ist sie
-- wieder da. Als schrumpfende Gesamtzahl gebaut, wäre ein Werk mit 200 m³
-- Tagesleistung nach zwei Bündeln „leer", obwohl es monatlich 4'000 fährt.
--
-- Das Werk erklärt also eine MENGE PRO MONAT je Materialart. Ein Bündel
-- belegt sie in den Monaten seines Lieferzeitraums (Migration 36 liefert
-- die Kurve). Frei = erklärt − belegt.
--
-- DIE DREI STUFEN DER PRÜFUNG, und warum nicht eine:
--
--   Beim Gebot wird gegen die BUCHUNGEN geprüft, nicht gegen die
--   Reservierungen. Ein Werk bietet bei verdeckter Ausschreibung auf
--   mehrere Bündel, ohne zu wissen, welches es gewinnt. Würde jedes Gebot
--   die volle Menge blockieren, könnte ein Werk mit 1'500 m³/Monat nur auf
--   1'500 m³ bieten — das erstickt den Wettbewerb, und ohne Wettbewerb
--   keine 17.25 %.
--
--   Beim ZUSCHLAG wird hart geprüft. Reicht es nicht, geht das Bündel ans
--   nächstbeste Gebot. Damit ist das Loch zu: wer auf fünf bietet und alle
--   gewinnen würde, verliert sie beim Zuschlag der Reihe nach.
--
--   Was dazwischen liegt — die offene Last aus laufenden Geboten — sieht
--   das Werk und entscheidet selbst. Informiert, nicht gefesselt.
--
-- Die Grenze, ehrlich: Was ein Werk ausserhalb von Obtanet verkauft, sieht
-- niemand. Wer 1'500 erklärt und 1'300 am Telefon verkauft, bietet mit
-- einer Zahl, die nicht stimmt. Dagegen hilft keine Software — dagegen
-- hilft, dass die Erklärung verbindlich ist und die Termintreue mitläuft.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Was ein Werk erklärt
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lieferant_kapazitaet (
    company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    material_category TEXT NOT NULL,
    monat             DATE NOT NULL,          -- immer der Monatserste
    menge             NUMERIC NOT NULL CHECK (menge >= 0),
    einheit           TEXT,
    erklaert_am       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (company_id, material_category, monat)
);

ALTER TABLE lieferant_kapazitaet ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE lieferant_kapazitaet IS
    'Erklärte Liefermenge je Material und Monat. Verbindlich — ein Gebot darauf ist ein Angebot.';

-- Nur die eigene Kapazität. Fremde geht niemanden etwas an: aus ihr liesse
-- sich die Auslastung eines Wettbewerbers ablesen.
DROP POLICY IF EXISTS "kapazitaet_select_own" ON lieferant_kapazitaet;
CREATE POLICY "kapazitaet_select_own" ON lieferant_kapazitaet
    FOR SELECT USING (company_id = current_company_id());
DROP POLICY IF EXISTS "kapazitaet_write_own" ON lieferant_kapazitaet;
CREATE POLICY "kapazitaet_write_own" ON lieferant_kapazitaet
    FOR ALL USING (company_id = current_company_id())
    WITH CHECK (company_id = current_company_id());

-- ------------------------------------------------------------
-- 2) Was belegt ist
--
-- Eine Zeile je Werk, Bündel und Monat. Der Zustand trägt den Lebenslauf:
--
--   RESERVIERT — ein Gebot liegt vor
--   GEBUCHT    — Zuschlag erteilt
--   ERLEDIGT   — geliefert oder Bündel abgeschlossen
--
-- Freigegeben wird durch Löschen, nicht durch einen vierten Zustand: eine
-- freigegebene Reservierung ist keine Information, sie ist Abwesenheit.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kapazitaets_bindung (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    bundle_id         UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    material_category TEXT NOT NULL,
    monat             DATE NOT NULL,
    menge             NUMERIC NOT NULL CHECK (menge >= 0),
    zustand           TEXT NOT NULL CHECK (zustand IN ('RESERVIERT', 'GEBUCHT', 'ERLEDIGT')),
    UNIQUE (company_id, bundle_id, monat)
);

ALTER TABLE kapazitaets_bindung ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS kapazitaets_bindung_frei_idx
    ON kapazitaets_bindung (company_id, material_category, monat, zustand);

DROP POLICY IF EXISTS "kapazitaets_bindung_select_own" ON kapazitaets_bindung;
CREATE POLICY "kapazitaets_bindung_select_own" ON kapazitaets_bindung
    FOR SELECT USING (company_id = current_company_id());

-- Schreiben nur über die Funktionen. Könnte der Browser schreiben, löschte
-- ein Werk seine Buchungen und böte weiter, als wäre nichts.
REVOKE INSERT, UPDATE, DELETE ON kapazitaets_bindung FROM anon, authenticated;
GRANT SELECT ON kapazitaets_bindung TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lieferant_kapazitaet TO authenticated;

-- ------------------------------------------------------------
-- 3) Freie Kapazität — zwei Sichten auf dieselbe Zahl
--
-- `frei_gebucht` zieht nur ab, was wirklich zugeschlagen ist. Dagegen wird
-- beim Gebot geprüft (siehe Kopf).
-- `frei_offen` zieht auch die Reservierungen ab. Das ist die Zahl, die dem
-- Werk gezeigt wird, damit es seine offene Last kennt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION kapazitaet_frei(
    p_company   UUID,
    p_kategorie TEXT,
    p_monat     DATE,
    p_ohne_buendel UUID DEFAULT NULL      -- eigenes Gebot nicht doppelt zählen
)
RETURNS TABLE (erklaert NUMERIC, gebucht NUMERIC, reserviert NUMERIC,
               frei_gebucht NUMERIC, frei_offen NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    WITH e AS (
        SELECT COALESCE(menge, 0) AS menge
          FROM lieferant_kapazitaet
         WHERE company_id = p_company
           AND material_category = p_kategorie
           AND monat = date_trunc('month', p_monat)::DATE
    ), b AS (
        SELECT
            COALESCE(SUM(menge) FILTER (WHERE zustand = 'GEBUCHT'), 0)    AS gebucht,
            COALESCE(SUM(menge) FILTER (WHERE zustand = 'RESERVIERT'), 0) AS reserviert
          FROM kapazitaets_bindung
         WHERE company_id = p_company
           AND material_category = p_kategorie
           AND monat = date_trunc('month', p_monat)::DATE
           AND (p_ohne_buendel IS NULL OR bundle_id <> p_ohne_buendel)
    )
    SELECT COALESCE((SELECT menge FROM e), 0),
           b.gebucht,
           b.reserviert,
           COALESCE((SELECT menge FROM e), 0) - b.gebucht,
           COALESCE((SELECT menge FROM e), 0) - b.gebucht - b.reserviert
      FROM b
$$;

REVOKE ALL ON FUNCTION kapazitaet_frei(UUID, TEXT, DATE, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION kapazitaet_frei(UUID, TEXT, DATE, UUID) TO service_role;

/**
 * Reicht die Kapazität dieses Werks für dieses Bündel?
 *
 * Geprüft wird gegen die BUCHUNGEN — also gegen das, was wirklich
 * zugeschlagen ist. Reservierungen aus anderen laufenden Geboten zählen
 * NICHT dagegen, und zwar an beiden Stellen.
 *
 * Beim Gebot ist das offensichtlich: Würde jedes offene Gebot die Menge
 * blockieren, könnte ein Werk mit 1'500 m³/Monat nur auf 1'500 m³ bieten,
 * obwohl es vielleicht eines von fünf Bündeln gewinnt.
 *
 * Beim ZUSCHLAG war es zuerst anders gebaut — streng, gegen Buchungen UND
 * eigene Reservierungen — und das war falsch. Nachgestellt: Ein Werk mit
 * 300 m³ bot auf zwei Bündel zu je 250. Beim Zuschlag des ERSTEN sah die
 * strenge Prüfung die Reservierung des zweiten und wies ab; das erste
 * Bündel scheiterte, obwohl das Werk es problemlos gefahren hätte. Die
 * anderen Gebote sind zu diesem Zeitpunkt eben noch nicht entschieden.
 *
 * Richtig ist die Reihenfolge: Jeder Zuschlag verbraucht Kapazität, und
 * der nächste sieht sie als belegt. Das zweite Bündel geht dann an das
 * nächstbeste Gebot — genau so soll es laufen.
 *
 * Gibt die Monate zurück, in denen es nicht reicht. Leer heisst: passt.
 */
CREATE OR REPLACE FUNCTION kapazitaet_pruefen(
    p_company   UUID,
    p_bundle_id UUID
)
RETURNS TABLE (monat DATE, gebraucht NUMERIC, frei NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT k.monat, k.menge, f.frei_gebucht
      FROM mengenkurve(p_bundle_id) k
      CROSS JOIN LATERAL kapazitaet_frei(
              p_company,
              (SELECT material_category FROM bundles WHERE id = p_bundle_id),
              k.monat,
              p_bundle_id) f
     WHERE k.menge > f.frei_gebucht
     ORDER BY k.monat
$$;

DROP FUNCTION IF EXISTS kapazitaet_pruefen(UUID, UUID, BOOLEAN);
REVOKE ALL ON FUNCTION kapazitaet_pruefen(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION kapazitaet_pruefen(UUID, UUID) TO service_role;

/** Die eigene Kapazitätslage für ein Bündel — für die Bietmaske. */
CREATE OR REPLACE FUNCTION meine_kapazitaet_fuer(p_bundle_id UUID)
RETURNS TABLE (monat DATE, gebraucht NUMERIC, erklaert NUMERIC,
               frei_gebucht NUMERIC, frei_offen NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT k.monat, k.menge, f.erklaert, f.frei_gebucht, f.frei_offen
      FROM mengenkurve(p_bundle_id) k
      CROSS JOIN LATERAL kapazitaet_frei(
              current_company_id(),
              (SELECT material_category FROM bundles WHERE id = p_bundle_id),
              k.monat,
              p_bundle_id) f
     WHERE current_company_id() IS NOT NULL
     ORDER BY k.monat
$$;

REVOKE ALL ON FUNCTION meine_kapazitaet_fuer(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_kapazitaet_fuer(UUID) TO authenticated;

-- ------------------------------------------------------------
-- 4) `place_bid` reserviert
--
-- Der Rumpf bleibt derselbe wie in Migration 37, es kommen zwei Stellen
-- dazu: die Kapazitätsprüfung vor dem Gebot, und die Reservierung danach.
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
    IF COALESCE(p_anteil_pct, 100) <> 100 OR COALESCE(p_puffer_pct, 0) <> 0 THEN
        RAISE EXCEPTION 'Teilgebote sind noch nicht freigeschaltet. Bitte auf die ganze Menge bieten.';
    END IF;

    -- Ohne erklärte Kapazität kein Gebot. Das ist keine Schikane: ein
    -- Gebot ohne Mengenzusage ist eine Absichtserklärung, und darauf
    -- rechnet ein Besteller seinen Preis.
    IF NOT EXISTS (
        SELECT 1 FROM lieferant_kapazitaet
         WHERE company_id = v_company
           AND material_category = v_bundle.material_category
    ) THEN
        RAISE EXCEPTION
            'Für % ist keine Kapazität hinterlegt. Trag im Lieferprofil ein, welche Menge du je Monat fahren kannst.',
            v_bundle.material_category;
    END IF;

    -- Locker geprüft: nur gegen das, was wirklich gebucht ist. Auf etwas zu
    -- bieten, das man als EINZIGEN Auftrag nicht schaffen würde, ist
    -- trotzdem unseriös — und genau das wird hier abgefangen.
    SELECT * INTO v_eng FROM kapazitaet_pruefen(v_company, p_bundle_id) LIMIT 1;
    IF v_eng.monat IS NOT NULL THEN
        RAISE EXCEPTION
            'Deine Kapazität reicht nicht: im % braucht dieses Bündel %, frei sind %. Auch als einziger Auftrag ginge das nicht.',
            to_char(v_eng.monat, 'Mon YYYY'), v_eng.gebraucht, v_eng.frei;
    END IF;

    SELECT * INTO v_min FROM mindestgebot(p_bundle_id);
    IF v_min.kbob IS NULL THEN
        RAISE EXCEPTION 'Für dieses Bündel fehlt der Referenzpreis. Ohne ihn ist kein Gebot bewertbar.';
    END IF;

    v_rabatt := ROUND(((v_min.kbob - p_lieferantenpreis) / v_min.kbob) * 100, 2);

    IF p_lieferantenpreis > v_min.max_lieferantenpreis THEN
        RAISE EXCEPTION
            'Gebot zu hoch: % je Einheit sind % %% unter KBOB. Verlangt sind % %% (davon % %% für die Besteller und % %% Vermittlung) — also höchstens % je Einheit.',
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
        customer_price_net, platform_fee_percent, price_vs_kbob_index
    ) VALUES (
        p_bundle_id, v_company,
        COALESCE(NULLIF(p_list_price, 0), v_min.kbob),
        p_lieferantenpreis, v_rabatt, v_kunde,
        v_min.provision_pct, v_kunde - v_min.kbob
    )
    RETURNING id INTO v_bid;

    -- Reservieren. Nachbessern ersetzt die eigene Reservierung, statt eine
    -- zweite danebenzulegen — sonst zählte ein nachgebessertes Gebot
    -- doppelt gegen die eigene Kapazität.
    DELETE FROM kapazitaets_bindung
     WHERE company_id = v_company AND bundle_id = p_bundle_id AND zustand = 'RESERVIERT';

    INSERT INTO kapazitaets_bindung (company_id, bundle_id, material_category, monat, menge, zustand)
    SELECT v_company, p_bundle_id, v_bundle.material_category, k.monat, k.menge, 'RESERVIERT'
      FROM mengenkurve(p_bundle_id) k;

    RETURN v_bid;
END;
$$;

/** Gebot zurückziehen — solange die Frist läuft. Gibt die Kapazität frei. */
CREATE OR REPLACE FUNCTION gebot_zurueckziehen(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company UUID := current_company_id();
    v_bundle  bundles%ROWTYPE;
BEGIN
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;
    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id FOR UPDATE;
    IF v_bundle.id IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;
    -- Dieselbe Regel wie beim Besteller: frei bis zur eigenen Frist,
    -- danach gebunden. Ein Rückzug nach dem Zuschlag ist kein Rückzug,
    -- sondern ein Vertragsbruch.
    IF v_bundle.status <> 'SEALED_BIDDING'
       OR (v_bundle.bid_deadline IS NOT NULL AND v_bundle.bid_deadline < NOW()) THEN
        RAISE EXCEPTION 'Die Angebotsfrist ist vorbei. Ab dem Zuschlag ist ein Gebot verbindlich.';
    END IF;

    DELETE FROM supplier_bids WHERE bundle_id = p_bundle_id AND supplier_company_id = v_company;
    DELETE FROM kapazitaets_bindung
     WHERE bundle_id = p_bundle_id AND company_id = v_company AND zustand = 'RESERVIERT';
END;
$$;

REVOKE ALL ON FUNCTION gebot_zurueckziehen(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION gebot_zurueckziehen(UUID) TO authenticated;

-- ------------------------------------------------------------
-- 5) Der Zuschlag prüft hart — und geht weiter, wenn es nicht reicht
--
-- Hier schliesst sich das Loch: Ein Werk bietet auf fünf Bündel und könnte
-- nur eines fahren. Beim Zuschlag wird streng gerechnet — gegen Buchungen
-- UND gegen die eigenen Reservierungen aus anderen Bündeln. Passt es
-- nicht, bekommt das nächstbeste Gebot den Zuschlag.
--
-- Es gibt bewusst KEINE zweite Chance für das übergangene Werk: sein Gebot
-- war eine Zusage, und wer eine Zusage nicht halten kann, bekommt sie
-- nicht auf Vorrat zurück. Der Vermerk bleibt am Gebot stehen.
-- ------------------------------------------------------------
ALTER TABLE supplier_bids ADD COLUMN IF NOT EXISTS uebergangen_grund TEXT;

COMMENT ON COLUMN supplier_bids.uebergangen_grund IS
    'Gesetzt, wenn ein günstigeres Gebot übergangen wurde — heute nur wegen fehlender Kapazität.';

CREATE OR REPLACE FUNCTION award_bundle(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_bundle    bundles%ROWTYPE;
    v_kandidat  supplier_bids%ROWTYPE;
    v_bid       supplier_bids%ROWTYPE;
    v_eng       RECORD;
    v_provision NUMERIC;
    v_menge     NUMERIC;
BEGIN
    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id FOR UPDATE;
    IF v_bundle.id IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;
    IF v_bundle.awarded_at IS NOT NULL THEN
        RETURN;
    END IF;

    -- Der Reihe nach, vom günstigsten Gebot an. Bei Gleichstand gewinnt
    -- das früher eingegangene — wer sich früh festlegt, soll nicht
    -- schlechter dastehen.
    FOR v_kandidat IN
        SELECT * FROM supplier_bids
         WHERE bundle_id = p_bundle_id
         ORDER BY customer_price_net ASC, created_at ASC
    LOOP
        SELECT * INTO v_eng
          FROM kapazitaet_pruefen(v_kandidat.supplier_company_id, p_bundle_id)
         LIMIT 1;

        IF v_eng.monat IS NULL THEN
            v_bid := v_kandidat;
            EXIT;
        END IF;

        UPDATE supplier_bids
           SET uebergangen_grund = format(
                   'Kapazität reicht nicht: im %s wären %s nötig, frei sind %s.',
                   to_char(v_eng.monat, 'Mon YYYY'), v_eng.gebraucht, v_eng.frei)
         WHERE id = v_kandidat.id;
    END LOOP;

    IF v_bid.id IS NULL THEN
        UPDATE bundles
           SET status = 'FAILED',
               failed_reason = CASE
                   WHEN EXISTS (SELECT 1 FROM supplier_bids WHERE bundle_id = p_bundle_id)
                   THEN 'Kein Werk konnte die Menge im Lieferzeitraum zusagen.'
                   ELSE 'Kein Baustoffwerk hat ein Angebot abgegeben.' END
         WHERE id = p_bundle_id;
        -- Kein Zuschlag, keine Bindung: alles freigeben.
        DELETE FROM kapazitaets_bindung WHERE bundle_id = p_bundle_id;
        RETURN;
    END IF;

    UPDATE supplier_bids SET is_winning_bid = FALSE WHERE bundle_id = p_bundle_id;
    UPDATE supplier_bids SET is_winning_bid = TRUE  WHERE id = v_bid.id;

    v_menge := COALESCE(v_bundle.current_volume, 0);

    v_provision := ROUND(
        COALESCE(v_bundle.kbob_reference_price, 0) * v_menge
        * COALESCE(v_bid.platform_fee_percent, einstellung_zahl('provision_buendel_pct', 2.25)) / 100,
    2);

    UPDATE bundles
       SET status                 = 'AWARDED',
           awarded_price          = v_bid.customer_price_net,
           awarded_supplier_id    = v_bid.supplier_company_id,
           awarded_at             = NOW(),
           awarded_volume         = v_menge,
           awarded_discount_pct   = CASE
               WHEN COALESCE(kbob_reference_price, 0) > 0
               THEN ROUND(((kbob_reference_price - v_bid.customer_price_net)
                           / kbob_reference_price) * 100, 2)
               ELSE COALESCE(current_discount_pct, 0) END,
           awarded_supplier_price = ROUND(
               v_bid.customer_price_net
               - COALESCE(kbob_reference_price, 0)
                 * COALESCE(v_bid.platform_fee_percent, einstellung_zahl('provision_buendel_pct', 2.25)) / 100,
           2),
           provision_pct          = COALESCE(v_bid.platform_fee_percent,
                                             einstellung_zahl('provision_buendel_pct', 2.25)),
           provision_chf          = v_provision
     WHERE id = p_bundle_id;

    -- Aus der Reservierung des Gewinners wird eine Buchung; alle anderen
    -- sind frei.
    UPDATE kapazitaets_bindung SET zustand = 'GEBUCHT'
     WHERE bundle_id = p_bundle_id AND company_id = v_bid.supplier_company_id;
    DELETE FROM kapazitaets_bindung
     WHERE bundle_id = p_bundle_id AND company_id <> v_bid.supplier_company_id;

    INSERT INTO sia_contracts (
        bundle_id, buyer_company_id, supplier_company_id,
        contract_number, total_contract_volume, final_unit_price_net
    )
    SELECT p.bundle_id, p.buyer_company_id, v_bid.supplier_company_id,
           'OBT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
               UPPER(SUBSTRING(REPLACE(p.id::TEXT, '-', '') FROM 1 FOR 6)),
           p.requested_volume, v_bid.customer_price_net
      FROM bundle_participations p
     WHERE p.bundle_id = p_bundle_id
       AND p.status <> 'CANCELLED'
       AND NOT EXISTS (
             SELECT 1 FROM sia_contracts c
              WHERE c.bundle_id = p.bundle_id AND c.buyer_company_id = p.buyer_company_id);
END;
$$;

-- ------------------------------------------------------------
-- 6) Abgeschlossen heisst frei
--
-- Ohne das bliebe die Kapazität eines gelieferten Bündels auf ewig belegt,
-- und ein Werk wäre nach einem Jahr rechnerisch voll, obwohl es längst
-- alles gefahren hat. Der Schlusspunkt eines Bündels (`completed_at`,
-- Migration 31) gibt sie frei.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION kapazitaet_bei_abschluss() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        UPDATE kapazitaets_bindung SET zustand = 'ERLEDIGT'
         WHERE bundle_id = NEW.id AND zustand = 'GEBUCHT';
    END IF;
    IF NEW.status IN ('FAILED', 'CANCELLED') AND OLD.status NOT IN ('FAILED', 'CANCELLED') THEN
        DELETE FROM kapazitaets_bindung WHERE bundle_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bundles_kapazitaet ON bundles;
CREATE TRIGGER bundles_kapazitaet
    AFTER UPDATE ON bundles
    FOR EACH ROW EXECUTE FUNCTION kapazitaet_bei_abschluss();
