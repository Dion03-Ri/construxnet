-- ============================================================
-- Obtanet — Migration 35: Provision und Mindestgebot
--
-- Entschieden am 10.09.2026, festgeschrieben in CLAUDE.md unter
-- „DAS GESCHÄFTSMODELL". Diese Migration bringt zwei Dinge in die
-- Datenbank, die bisher nur Absicht waren:
--
--   1. Die Sätze stehen an EINER Stelle statt an vier.
--   2. Ein Gebot unter Mindestrabatt + Provision wird ABGEWIESEN.
--      Bisher prüfte `place_bid()` gar nichts: jeder Preis über null ging
--      durch, und die 2.25 wurden nur danebengeschrieben.
--
-- Die Rechnung, an der sich alles ausrichtet — 500 m³, KBOB 160.00/m³:
--
--   Referenzwert            500 × 160.00  = CHF 80'000
--   Mindestrabatt Stufe            15 %   → Besteller 136.00/m³ = 68'000
--   Der Lieferant bietet        17.25 %   → er sieht  132.40/m³ = 66'200
--   Obtanet                2.25 % von 80'000            = CHF  1'800
--
--   Probe: 68'000 − 66'200 = 1'800.
--
-- Der Lieferant gibt SEINEN Preis ein, nicht den des Bestellers. So denkt
-- er auch: „ich gebe 17.25 % ab". Den Bestellerpreis rechnet die Datenbank
-- daraus, indem sie die Provision aufschlägt. Andersherum müsste jedes
-- Werk im Kopf eine Gebühr abziehen, und irgendwann rechnet einer falsch.
--
-- Überschuss gehört den Bestellern: Bietet ein Werk 20 % statt 17.25 %,
-- bleibt Obtanet bei 2.25 Punkten und die Besteller bekommen 17.75 %. Das
-- ergibt sich hier von selbst, weil die Provision ein fester Aufschlag auf
-- den Referenzwert ist und nicht ein Anteil am Gebot.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Die Sätze — eine Quelle
--
-- Heute steht die 2.25 an vier Stellen fest verdrahtet: als DEFAULT auf
-- `supplier_bids`, auf den Verträgen, auf den Lieferscheinen, und als
-- `v_fee` im Rumpf von `place_bid()`. Vier Stellen laufen auseinander,
-- und dann stimmt eine Rechnung nicht mehr mit einem Vertrag überein.
--
-- Die DEFAULTs bleiben stehen (sie schaden nicht, solange niemand von
-- Hand einfügt), aber gerechnet wird ab jetzt ausschliesslich mit dem
-- Wert aus `app_settings`.
-- ------------------------------------------------------------
INSERT INTO app_settings (key, value) VALUES
    ('provision_buendel_pct', '2.25'),
    -- Direktgeschäfte: die Mechanik steht, der Satz ist null. Bewusst so.
    -- Eine Gebühr, die man mit einem Telefonat umgeht, beschädigt die
    -- Regeln, die halten — und sie wäre ein Anreiz, das Geschäft gar
    -- nicht erst zu erfassen. Dann fehlten Gebühr UND Daten. Wieder
    -- einschalten ist eine Zeile SQL, keine Auslieferung.
    ('provision_direkt_pct',  '0'),
    ('komplett_vorsprung_pct','1'),
    ('lieferant_frei_monate', '12'),
    ('grundgebuehr_chf',      '1200')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 2) Einen Satz lesen
--
-- STRICT wäre falsch: fehlt der Schlüssel, soll der Vorgabewert greifen
-- und nicht die ganze Ausschreibung stehenbleiben.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION einstellung_zahl(p_key TEXT, p_vorgabe NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v TEXT;
BEGIN
    SELECT value INTO v FROM app_settings WHERE key = p_key;
    IF v IS NULL OR btrim(v) = '' THEN
        RETURN p_vorgabe;
    END IF;
    RETURN v::NUMERIC;
EXCEPTION WHEN OTHERS THEN
    -- Ein vertippter Wert in den Einstellungen darf kein Bündel sprengen.
    RETURN p_vorgabe;
END;
$$;

REVOKE ALL ON FUNCTION einstellung_zahl(TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION einstellung_zahl(TEXT, NUMERIC) TO authenticated, service_role;

-- ------------------------------------------------------------
-- 3) Was ein Werk mindestens bieten muss
--
-- Gibt Zeilen statt einer Zahl zurück, damit die Oberfläche dem Werk
-- zeigen kann, WORAUS sich sein Mindestgebot zusammensetzt. „17.25 %"
-- ohne die Herkunft wäre eine Zahl, der man glauben muss.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mindestgebot(p_bundle_id UUID)
RETURNS TABLE (
    kbob                 NUMERIC,   -- Referenzpreis je Einheit
    mindestrabatt_pct    NUMERIC,   -- was die Besteller bekommen
    provision_pct        NUMERIC,   -- was Obtanet nimmt
    gesamtrabatt_pct     NUMERIC,   -- was das Werk abgeben muss
    max_lieferantenpreis NUMERIC,   -- der höchste zulässige Gebotspreis
    bestellerpreis       NUMERIC    -- was die Besteller dann zahlen
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.kbob_reference_price,
           COALESCE(b.current_discount_pct, 0),
           einstellung_zahl('provision_buendel_pct', 2.25),
           COALESCE(b.current_discount_pct, 0) + einstellung_zahl('provision_buendel_pct', 2.25),
           ROUND(b.kbob_reference_price
                 * (1 - (COALESCE(b.current_discount_pct, 0)
                         + einstellung_zahl('provision_buendel_pct', 2.25)) / 100), 2),
           ROUND(b.kbob_reference_price
                 * (1 - COALESCE(b.current_discount_pct, 0) / 100), 2)
      FROM bundles b
     WHERE b.id = p_bundle_id
       AND b.kbob_reference_price IS NOT NULL
$$;

REVOKE ALL ON FUNCTION mindestgebot(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mindestgebot(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------
-- 4) Gebot abgeben — mit Prüfung
--
-- Die alte Fassung nahm den BESTELLERPREIS entgegen und prüfte nur, dass
-- er grösser als null ist. Sie wird ersetzt, nicht ergänzt: zwei Wege ins
-- selbe Gebot wären ein zweiter, schwächerer Eingang.
--
-- Neu gibt das Werk SEINEN Preis je Einheit an. Der Bestellerpreis
-- entsteht daraus durch den Aufschlag der Provision.
--
-- `p_anteil_pct` und `p_puffer_pct` stehen schon in der Signatur, damit
-- Teilgebote später ohne einen zweiten Umbau dazukommen. Alles unter
-- 100 % wird bis dahin ABGEWIESEN — die Zuteilung ganzer Baustellen ist
-- noch nicht gebaut, und ein Teilgebot, das versehentlich das ganze
-- Bündel gewinnt, wäre schlimmer als keines.
-- ------------------------------------------------------------
-- Der Preis des WERKS gehört ans Gebot. Bisher stand dort nur der
-- Bestellerpreis; wer sein Gebot nachbessern wollte, bekam ihn ins
-- Eingabefeld zurückgeschrieben und hätte die Provision im Kopf abziehen
-- müssen. Zweimal dieselbe Zahl aus zwei Blickwinkeln ist eine zu viel.
ALTER TABLE supplier_bids ADD COLUMN IF NOT EXISTS lieferantenpreis_net NUMERIC;

COMMENT ON COLUMN supplier_bids.lieferantenpreis_net IS
    'Was das Werk je Einheit erhält. customer_price_net ist derselbe Preis plus Provision.';

DROP FUNCTION IF EXISTS place_bid(UUID, NUMERIC, NUMERIC);

CREATE OR REPLACE FUNCTION place_bid(
    p_bundle_id         UUID,
    p_lieferantenpreis  NUMERIC,          -- was das Werk je Einheit erhalten will
    p_list_price        NUMERIC DEFAULT 0,-- eigener Listenpreis, nur zur Anzeige
    p_anteil_pct        NUMERIC DEFAULT 100,
    p_puffer_pct        NUMERIC DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company    UUID;
    v_bundle     bundles%ROWTYPE;
    v_min        RECORD;
    v_rabatt     NUMERIC;
    v_kunde      NUMERIC;
    v_bid        UUID;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    -- Die Rolle ist eine Selbstauskunft und bleibt vorerst die Schranke.
    -- Sobald die Lieferantenprüfung steht (CLAUDE.md, Abschnitt 8), tritt
    -- hier die Bietfähigkeit an ihre Stelle: geprüft ∧ Register aktiv ∧
    -- Lieferantenkonto aktiv ∧ freie Kapazität ∧ keine Leistungssperre.
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_company AND role = 'SUPPLIER') THEN
        RAISE EXCEPTION 'Nur Baustoffwerke können Gebote abgeben.';
    END IF;

    IF EXISTS (SELECT 1 FROM companies WHERE id = v_company AND closed_at IS NOT NULL) THEN
        RAISE EXCEPTION 'Dieses Konto ist geschlossen.';
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

    SELECT * INTO v_min FROM mindestgebot(p_bundle_id);
    IF v_min.kbob IS NULL THEN
        RAISE EXCEPTION 'Für dieses Bündel fehlt der Referenzpreis. Ohne ihn ist kein Gebot bewertbar.';
    END IF;

    -- Der abgegebene Rabatt, gemessen am Referenzpreis. Bewusst NICHT am
    -- Listenpreis des Werks: sonst setzt eines seinen Listenpreis hoch und
    -- gewinnt mit grossem Rabatt, ohne billiger zu sein.
    v_rabatt := ROUND(((v_min.kbob - p_lieferantenpreis) / v_min.kbob) * 100, 2);

    IF p_lieferantenpreis > v_min.max_lieferantenpreis THEN
        RAISE EXCEPTION
            'Gebot zu hoch: % je Einheit sind % %% unter KBOB. Verlangt sind % %% (davon % %% für die Besteller und % %% Vermittlung) — also höchstens % je Einheit.',
            ROUND(p_lieferantenpreis, 2), v_rabatt,
            v_min.gesamtrabatt_pct, v_min.mindestrabatt_pct, v_min.provision_pct,
            v_min.max_lieferantenpreis;
    END IF;

    -- Was die Besteller zahlen: der Preis des Werks plus die Provision,
    -- gerechnet auf den Referenzwert. Bietet das Werk besser als verlangt,
    -- kommt der Überschuss hier automatisch bei den Bestellern an.
    v_kunde := ROUND(p_lieferantenpreis + v_min.kbob * v_min.provision_pct / 100, 2);

    -- Ein Werk hat ein Gebot. Nachbessern ersetzt das eigene.
    DELETE FROM supplier_bids
     WHERE bundle_id = p_bundle_id AND supplier_company_id = v_company;

    INSERT INTO supplier_bids (
        bundle_id, supplier_company_id,
        list_price_net, lieferantenpreis_net, offered_discount_percent,
        customer_price_net, platform_fee_percent, price_vs_kbob_index
    ) VALUES (
        p_bundle_id, v_company,
        COALESCE(NULLIF(p_list_price, 0), v_min.kbob),
        p_lieferantenpreis,
        v_rabatt,
        v_kunde,
        v_min.provision_pct,
        v_kunde - v_min.kbob
    )
    RETURNING id INTO v_bid;

    RETURN v_bid;
END;
$$;

REVOKE ALL ON FUNCTION place_bid(UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_bid(UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC) TO authenticated;

-- ------------------------------------------------------------
-- 5) Beim Zuschlag friert alles ein
--
-- Ohne diese Spalten stünde nach dem Zuschlag nur der Preis fest. Menge,
-- Stufe und Provision würden weiter aus `bundles.current_*` gelesen — und
-- damit aus Feldern, die für die Sammelphase gedacht sind. Ändert sich
-- dort je etwas, änderte sich rückwirkend die Grundlage eines
-- geschlossenen Vertrags.
--
-- Heute kann das nicht passieren: Beitreten und Zurückziehen gehen nur,
-- solange `status = 'OPEN'`. Aber ein Vertrag darf nicht davon abhängen,
-- dass eine Regel woanders nicht verletzt wird. Was gilt, wird
-- aufgeschrieben.
-- ------------------------------------------------------------
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS awarded_at             TIMESTAMPTZ;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS awarded_volume         NUMERIC;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS awarded_discount_pct   NUMERIC;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS awarded_supplier_price NUMERIC;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS provision_pct          NUMERIC;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS provision_chf          NUMERIC;

COMMENT ON COLUMN bundles.awarded_volume IS
    'Die Menge, auf die zugeschlagen wurde. Grundlage der Provision — NICHT die später gefahrene Menge.';
COMMENT ON COLUMN bundles.awarded_discount_pct IS
    'Der Rabatt, den die Besteller tatsächlich bekommen haben — kann über dem Mindestrabatt der Stufe liegen, wenn ein Werk besser geboten hat.';
COMMENT ON COLUMN bundles.provision_chf IS
    'Forderung an den Lieferanten. Entsteht mit dem Zuschlag, fällig 30 Tage nach Lieferbeginn.';

CREATE OR REPLACE FUNCTION award_bundle(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_bid       supplier_bids%ROWTYPE;
    v_bundle    bundles%ROWTYPE;
    v_provision NUMERIC;
    v_menge     NUMERIC;
BEGIN
    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id;
    IF v_bundle.id IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;
    IF v_bundle.awarded_at IS NOT NULL THEN
        RETURN;                      -- schon zugeschlagen, nichts zu tun
    END IF;

    SELECT * INTO v_bid
      FROM supplier_bids
     WHERE bundle_id = p_bundle_id
     ORDER BY customer_price_net ASC, created_at ASC
     LIMIT 1;

    IF v_bid.id IS NULL THEN
        UPDATE bundles
           SET status = 'FAILED',
               failed_reason = 'Kein Baustoffwerk hat ein Angebot abgegeben.'
         WHERE id = p_bundle_id;
        RETURN;
    END IF;

    UPDATE supplier_bids SET is_winning_bid = FALSE WHERE bundle_id = p_bundle_id;
    UPDATE supplier_bids SET is_winning_bid = TRUE  WHERE id = v_bid.id;

    -- Die Menge, die tatsächlich in der Sammelphase zusammengekommen ist.
    v_menge := COALESCE(v_bundle.current_volume, 0);

    -- Provision auf den Referenzwert der zugeschlagenen Menge — nicht auf
    -- den Rechnungsbetrag. Sonst geht die Rechnung nicht auf: bei 500 m³,
    -- KBOB 160 und 2.25 % sind es CHF 1'800, und genau das ist die
    -- Differenz zwischen dem, was die Besteller zahlen (68'000), und dem,
    -- was das Werk behält (66'200).
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
           -- Was die Besteller WIRKLICH bekommen, nicht was die Stufe
           -- verlangt hätte. Bietet ein Werk besser als das Minimum, liegt
           -- der Überschuss bei ihnen — dann stünde hier sonst eine Zahl,
           -- die kleiner ist als der Rabatt auf ihrer eigenen Rechnung.
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

    -- Verträge je Teilnehmer. Erst hier werden Firmendaten für den
    -- gewinnenden Lieferanten sichtbar — vorher geht ihn nicht an, wer im
    -- Bündel steckt. Im Vertrag steht der BESTELLERPREIS; was Obtanet
    -- davon erhält, ist eine Sache zwischen Obtanet und dem Werk.
    INSERT INTO sia_contracts (
        bundle_id, buyer_company_id, supplier_company_id,
        contract_number, total_contract_volume, final_unit_price_net
    )
    SELECT p.bundle_id,
           p.buyer_company_id,
           v_bid.supplier_company_id,
           'OBT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
               UPPER(SUBSTRING(REPLACE(p.id::TEXT, '-', '') FROM 1 FOR 6)),
           p.requested_volume,
           v_bid.customer_price_net
      FROM bundle_participations p
     WHERE p.bundle_id = p_bundle_id
       AND p.status <> 'CANCELLED'
       AND NOT EXISTS (
             SELECT 1 FROM sia_contracts c
              WHERE c.bundle_id = p.bundle_id
                AND c.buyer_company_id = p.buyer_company_id
           );
END;
$$;
