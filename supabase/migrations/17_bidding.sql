-- ============================================================
-- Obtanet — Migration 17: Ausschreibung, Gebote, Zuschlag
--
-- Die Sammelphase lief, danach kam nichts: kein Übergang zur
-- Ausschreibung, keine Gebote, kein Zuschlag, und ein Bündel mit
-- abgelaufener Frist blieb einfach stehen.
--
-- Diese Migration schliesst den Kreis.
--
-- Zum Weiterschalten ohne Zeitgeber: es gibt keinen Scheduler in dieser
-- Umgebung. Statt einen vorzutäuschen, schalten fällige Bündel beim
-- Lesen weiter — advance_due_bundles() wird beim Laden der Pool-Seite
-- aufgerufen. Das ist ehrlich und ausreichend: ein Bündel, das niemand
-- ansieht, muss auch nicht sofort weiterlaufen. Sobald pg_cron oder ein
-- externer Zeitgeber verfügbar ist, ruft der dieselbe Funktion.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE bundles ADD COLUMN IF NOT EXISTS bid_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS awarded_price NUMERIC;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS awarded_supplier_id UUID REFERENCES companies(id);
-- Warum ein Bündel gescheitert ist. Wer nichts erfährt, versucht es nicht
-- noch einmal.
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS failed_reason TEXT;

CREATE INDEX IF NOT EXISTS bundles_due_idx ON bundles (status, deadline, bid_deadline);
CREATE INDEX IF NOT EXISTS supplier_bids_bundle_idx ON supplier_bids (bundle_id);

-- ------------------------------------------------------------
-- Gebot abgeben
--
-- Verdeckt: ein Lieferant sieht nur sein eigenes Gebot, nie fremde. Das
-- ist der Kern des Verfahrens — wer die Konkurrenz sieht, bietet knapp
-- darunter statt seinen besten Preis.
--
-- Bewertet wird gegen den KBOB-Referenzpreis des Bündels, nicht gegen den
-- selbst deklarierten Listenpreis. Sonst könnte ein Werk seinen
-- Listenpreis hochsetzen und mit einem grossen Rabatt gewinnen, ohne
-- billiger zu sein.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_bid(
    p_bundle_id      UUID,
    p_list_price     NUMERIC,
    p_customer_price NUMERIC
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_company UUID;
    v_bundle  bundles%ROWTYPE;
    v_fee     NUMERIC := 2.25;
    v_bid     UUID;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_company AND role = 'SUPPLIER') THEN
        RAISE EXCEPTION 'Nur Baustoffwerke können Gebote abgeben.';
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
    IF p_customer_price IS NULL OR p_customer_price <= 0 THEN
        RAISE EXCEPTION 'Preis muss grösser als null sein.';
    END IF;

    -- Ein Werk hat ein Gebot. Nachbessern ersetzt das eigene, statt ein
    -- zweites danebenzulegen.
    DELETE FROM supplier_bids
     WHERE bundle_id = p_bundle_id AND supplier_company_id = v_company;

    INSERT INTO supplier_bids (
        bundle_id, supplier_company_id,
        list_price_net, offered_discount_percent, customer_price_net,
        platform_fee_percent, price_vs_kbob_index
    ) VALUES (
        p_bundle_id, v_company,
        COALESCE(NULLIF(p_list_price, 0), p_customer_price),
        CASE WHEN COALESCE(NULLIF(p_list_price, 0), 0) > 0
             THEN ROUND(((p_list_price - p_customer_price) / p_list_price) * 100, 2)
             ELSE 0 END,
        p_customer_price,
        v_fee,
        p_customer_price - COALESCE(v_bundle.kbob_reference_price, p_customer_price)
    )
    RETURNING id INTO v_bid;

    RETURN v_bid;
END;
$$;

-- ------------------------------------------------------------
-- Zuschlag: bestes Gebot gewinnt
--
-- Gemessen am Abstand zum KBOB-Referenzpreis. Bei Gleichstand gewinnt das
-- früher eingegangene Gebot — wer sich früh festlegt, soll nicht
-- schlechter dastehen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION award_bundle(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_bid supplier_bids%ROWTYPE;
BEGIN
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

    UPDATE bundles
       SET status              = 'AWARDED',
           awarded_price       = v_bid.customer_price_net,
           awarded_supplier_id = v_bid.supplier_company_id
     WHERE id = p_bundle_id;

    -- Verträge je Teilnehmer. Erst hier werden Firmendaten für den
    -- gewinnenden Lieferanten sichtbar — vorher geht ihn nicht an, wer
    -- im Bündel steckt.
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

-- ------------------------------------------------------------
-- Fällige Bündel weiterschalten
--
-- Sammelphase abgelaufen:
--   genug Teilnehmer  → Ausschreibung, sieben Tage Angebotsfrist
--   zu wenige         → aufgelöst, ohne Verpflichtung für irgendwen
-- Angebotsfrist abgelaufen:
--   Gebote vorhanden  → Zuschlag ans beste
--   keine             → aufgelöst
--
-- Wird beim Laden der Pool-Seite aufgerufen, weil es keinen Zeitgeber
-- gibt. Idempotent und billig — schaltet nur, was tatsächlich fällig ist.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION advance_due_bundles() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_row     RECORD;
    v_changed INTEGER := 0;
BEGIN
    FOR v_row IN
        SELECT id, participant_count, min_participants_for_bidding
          FROM bundles
         WHERE status = 'OPEN' AND deadline < NOW()
    LOOP
        IF v_row.participant_count >= v_row.min_participants_for_bidding THEN
            UPDATE bundles
               SET status = 'SEALED_BIDDING',
                   bid_deadline = NOW() + INTERVAL '7 days'
             WHERE id = v_row.id;
        ELSE
            UPDATE bundles
               SET status = 'FAILED',
                   failed_reason = 'Zu wenige Teilnehmer bis zum Fristende — '
                       || v_row.participant_count || ' von '
                       || v_row.min_participants_for_bidding || ' nötig.'
             WHERE id = v_row.id;
        END IF;
        v_changed := v_changed + 1;
    END LOOP;

    FOR v_row IN
        SELECT id FROM bundles
         WHERE status = 'SEALED_BIDDING'
           AND bid_deadline IS NOT NULL
           AND bid_deadline < NOW()
    LOOP
        PERFORM award_bundle(v_row.id);
        v_changed := v_changed + 1;
    END LOOP;

    RETURN v_changed;
END;
$$;

-- ------------------------------------------------------------
-- Rechte
--
-- Gebote schreibt niemand direkt — nur über place_bid(), damit
-- Bewertungsgrundlage und Frist nicht umgangen werden können.
-- Die bestehende Select-Regel bleibt: ein Werk sieht nur sein Gebot.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "supplier_bids_no_direct_insert" ON supplier_bids;
