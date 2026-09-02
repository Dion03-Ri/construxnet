-- ============================================================
-- Obtanet — Migration 11: Angebots-Flow auf Direktanfragen
--
-- Bisher war eine Direktanfrage nur eine Nachricht im Chat. Der
-- Lieferant konnte darauf antworten, aber nichts davon war auswertbar:
-- kein Preis, keine Frist, kein Vergleich, kein Status. Wer drei
-- Lieferanten angefragt hatte, musste die Antworten von Hand
-- gegeneinanderhalten.
--
-- Neu ist die Anfrage ein eigener Datensatz, auf den der Lieferant ein
-- verbindliches Angebot legt: Einheitspreis, Liefertermin, Gültigkeit.
-- Der Besteller sieht alle Angebote nebeneinander, mit dem Abstand zum
-- KBOB-Referenzpreis.
--
-- Der Chat bleibt daneben bestehen — dort wird verhandelt, hier steht
-- das Ergebnis.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- direct_requests: eine Materialanfrage an genau einen Lieferanten
--
-- Wer bei mehreren anfragt, legt mehrere Anfragen an. Das ist Absicht:
-- so bleibt jede Antwort einzeln nachvollziehbar, und der Vergleich
-- entsteht in der Oberfläche über die gemeinsame Materialangabe.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS direct_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,

    material_key   TEXT NOT NULL,
    material_label TEXT NOT NULL,
    spec           TEXT,
    unit           TEXT NOT NULL,
    quantity       NUMERIC NOT NULL CHECK (quantity > 0),

    -- KBOB-Referenz zum Zeitpunkt der Anfrage. Festgehalten, damit der
    -- Vergleich später nicht durch einen zwischenzeitlich geänderten
    -- Index verfälscht wird.
    kbob_reference_price NUMERIC,

    delivery_window TEXT,
    note            TEXT,
    -- Bis wann der Lieferant antworten soll.
    respond_by      DATE,

    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'OFFERED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CHECK (buyer_company_id <> supplier_company_id)
);

CREATE INDEX IF NOT EXISTS direct_requests_buyer_idx
    ON direct_requests (buyer_company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS direct_requests_supplier_idx
    ON direct_requests (supplier_company_id, status, created_at DESC);

-- ------------------------------------------------------------
-- direct_offers: die Antwort des Lieferanten
--
-- Mehrere Angebote pro Anfrage sind erlaubt — ein nachgebessertes
-- Angebot ersetzt das vorige nicht, sondern kommt dazu. So bleibt
-- nachvollziehbar, wie verhandelt wurde.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS direct_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id          UUID NOT NULL REFERENCES direct_requests(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    unit_price NUMERIC NOT NULL CHECK (unit_price > 0),
    -- Zusagen des Lieferanten im Klartext.
    delivery_promise TEXT,
    valid_until      DATE,
    note             TEXT,

    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'ACCEPTED', 'DECLINED', 'WITHDRAWN')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS direct_offers_request_idx
    ON direct_offers (request_id, created_at DESC);

-- ------------------------------------------------------------
-- Rechte
--
-- Eine Anfrage geht genau zwei Parteien etwas an: den Besteller und den
-- angefragten Lieferanten. Sonst niemanden — auch keinem anderen
-- Lieferanten, der dasselbe Material führt.
-- ------------------------------------------------------------
ALTER TABLE direct_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_offers   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "direct_requests_select_involved" ON direct_requests;
CREATE POLICY "direct_requests_select_involved" ON direct_requests
    FOR SELECT USING (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    );

-- Anlegen darf nur der Besteller, und nur in eigenem Namen.
DROP POLICY IF EXISTS "direct_requests_insert_buyer" ON direct_requests;
CREATE POLICY "direct_requests_insert_buyer" ON direct_requests
    FOR INSERT WITH CHECK (buyer_company_id = current_company_id());

-- Ändern dürfen beide Seiten: der Besteller nimmt an oder zieht zurück,
-- der Lieferant lehnt ab oder setzt auf "Angebot liegt vor".
DROP POLICY IF EXISTS "direct_requests_update_involved" ON direct_requests;
CREATE POLICY "direct_requests_update_involved" ON direct_requests
    FOR UPDATE USING (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    ) WITH CHECK (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    );

DROP POLICY IF EXISTS "direct_offers_select_involved" ON direct_offers;
CREATE POLICY "direct_offers_select_involved" ON direct_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM direct_requests r
            WHERE r.id = request_id
              AND (r.buyer_company_id = current_company_id()
                   OR r.supplier_company_id = current_company_id())
        )
    );

-- Ein Angebot legt nur der Lieferant, an den die Anfrage gerichtet ist.
DROP POLICY IF EXISTS "direct_offers_insert_supplier" ON direct_offers;
CREATE POLICY "direct_offers_insert_supplier" ON direct_offers
    FOR INSERT WITH CHECK (
        supplier_company_id = current_company_id()
        AND EXISTS (
            SELECT 1 FROM direct_requests r
            WHERE r.id = request_id
              AND r.supplier_company_id = current_company_id()
        )
    );

-- Annehmen/Ablehnen betrifft beide Seiten, deshalb dieselbe Regel wie
-- bei der Anfrage.
DROP POLICY IF EXISTS "direct_offers_update_involved" ON direct_offers;
CREATE POLICY "direct_offers_update_involved" ON direct_offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM direct_requests r
            WHERE r.id = request_id
              AND (r.buyer_company_id = current_company_id()
                   OR r.supplier_company_id = current_company_id())
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM direct_requests r
            WHERE r.id = request_id
              AND (r.buyer_company_id = current_company_id()
                   OR r.supplier_company_id = current_company_id())
        )
    );

-- ------------------------------------------------------------
-- updated_at mitführen
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS direct_requests_touch ON direct_requests;
CREATE TRIGGER direct_requests_touch BEFORE UPDATE ON direct_requests
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS direct_offers_touch ON direct_offers;
CREATE TRIGGER direct_offers_touch BEFORE UPDATE ON direct_offers
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Sobald ein Angebot eintrifft, wandert die Anfrage von "OPEN" auf
-- "OFFERED" — der Besteller sieht ohne Zusatzabfrage, wo etwas liegt.
CREATE OR REPLACE FUNCTION direct_request_mark_offered() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE direct_requests
       SET status = 'OFFERED'
     WHERE id = NEW.request_id
       AND status = 'OPEN';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS direct_offers_mark_offered ON direct_offers;
CREATE TRIGGER direct_offers_mark_offered AFTER INSERT ON direct_offers
    FOR EACH ROW EXECUTE FUNCTION direct_request_mark_offered();
