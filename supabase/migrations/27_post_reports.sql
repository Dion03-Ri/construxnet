-- ============================================================
-- MELDUNGEN ZU BEITRAEGEN
--
-- Im Menue am Beitrag steht „Beitrag melden". Damit das keine Attrappe
-- ist, muss die Meldung irgendwo landen — hier.
--
-- Was diese Tabelle bewusst NICHT tut: sie loescht nichts, sie blendet
-- nichts aus und sie zaehlt nicht automatisch bis zu einer Schwelle, ab
-- der ein Beitrag verschwindet. Eine automatische Loeschung waere ein
-- Werkzeug gegen unliebsame Mitbewerber: drei Konten, drei Meldungen,
-- Beitrag weg. Entschieden wird von Hand.
--
-- Angesehen werden die Meldungen vorerst im Supabase-Editor. Eine
-- Ansicht in der Anwendung lohnt sich, sobald es regelmaessig welche
-- gibt; bis dahin waere sie eine leere Seite mehr.
-- ============================================================

CREATE TABLE IF NOT EXISTS post_reports (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id              UUID NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
    reporter_company_id  UUID NOT NULL REFERENCES companies(id)     ON DELETE CASCADE,
    -- Feste Auswahl statt Freitext: vier Gruende, die man auswerten kann.
    reason               TEXT NOT NULL CHECK (reason IN ('SPAM', 'FALSCH', 'BELEIDIGEND', 'ANDERES')),
    status               TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'GEPRUEFT', 'VERWORFEN')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Eine Firma meldet einen Beitrag einmal. Ohne diese Regel liesse
    -- sich derselbe Beitrag hundertmal melden und die Zahl waere wertlos.
    UNIQUE (post_id, reporter_company_id)
);

CREATE INDEX IF NOT EXISTS post_reports_offen_idx
    ON post_reports (status, created_at DESC);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- Einfuegen nur im eigenen Namen — und nicht den eigenen Beitrag: wer
-- seinen Beitrag nicht mehr will, loescht ihn.
DROP POLICY IF EXISTS "post_reports_insert_own" ON post_reports;
CREATE POLICY "post_reports_insert_own" ON post_reports
    FOR INSERT WITH CHECK (
        reporter_company_id = current_company_id()
        AND NOT EXISTS (
            SELECT 1 FROM network_posts p
            WHERE p.id = post_id AND p.company_id = current_company_id()
        )
    );

-- Lesen nur die eigenen Meldungen. Wer wen gemeldet hat, geht sonst
-- niemanden etwas an — schon gar nicht die gemeldete Firma.
DROP POLICY IF EXISTS "post_reports_select_own" ON post_reports;
CREATE POLICY "post_reports_select_own" ON post_reports
    FOR SELECT USING (reporter_company_id = current_company_id());

-- Kein UPDATE, kein DELETE fuer den Client: eine abgegebene Meldung
-- nimmt man nicht selbst zurueck, und den Zustand setzt der Betrieb.
GRANT SELECT, INSERT ON post_reports TO authenticated;
