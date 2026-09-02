-- ============================================================
-- Obtanet — Migration 09: Direktanfrage an noch nicht vernetzte Firmen
--
-- Bisher liess "messages_insert_connected" eine Nachricht nur zwischen
-- Firmen zu, die bereits CONNECTED sind. Für eine Direktanfrage an einen
-- Lieferanten bedeutete das einen Umweg: vernetzen, warten, dann anfragen.
--
-- Neu darf eine Nachricht auch dann geschrieben werden, wenn eine offene
-- Verbindungsanfrage vorliegt, die der Absender selbst gestellt hat. Der
-- Empfänger sieht dann Verbindungsanfrage und Materialanfrage zusammen und
-- entscheidet mit einem Klick — der Schutz vor unerwünschten Nachrichten
-- bleibt also erhalten, weil ohne eigene Anfrage niemand schreiben kann und
-- der Empfänger jederzeit ignorieren kann.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

DROP POLICY IF EXISTS "messages_insert_connected" ON messages;
DROP POLICY IF EXISTS "messages_insert_connected_or_request" ON messages;

CREATE POLICY "messages_insert_connected_or_request" ON messages
    FOR INSERT WITH CHECK (
        sender_company_id = current_company_id()
        AND EXISTS (
            SELECT 1 FROM connections c
            WHERE (
                    (c.company_id_a = sender_company_id AND c.company_id_b = receiver_company_id)
                 OR (c.company_id_a = receiver_company_id AND c.company_id_b = sender_company_id)
                  )
              AND (
                    -- bestehende Verbindung: uneingeschränkt
                    c.status = 'CONNECTED'
                    -- oder offene Anfrage, die der Absender selbst gestellt hat
                 OR (c.status = 'PENDING' AND c.requested_by = sender_company_id)
                  )
        )
    );
