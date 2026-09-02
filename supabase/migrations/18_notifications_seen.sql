-- ============================================================
-- Obtanet — Migration 18: „Alle als gelesen"
--
-- Benachrichtigungen werden nicht gespeichert, sondern aus dem
-- abgeleitet, was ohnehin in der Datenbank steht: offene
-- Verbindungsanfragen, eingegangene Angebote, Zustandswechsel der eigenen
-- Bündel, ungelesene Nachrichten.
--
-- Das ist Absicht. Eine eigene Tabelle müsste bei jedem dieser Vorgänge
-- mitgeschrieben werden und würde früher oder später auseinanderlaufen —
-- eine Benachrichtigung über ein Bündel, das es nicht mehr gibt, ist
-- schlimmer als gar keine.
--
-- Gespeichert wird deshalb nur ein einziger Zeitpunkt: wann zuletzt
-- alles gelesen wurde. Was danach passiert ist, gilt als ungelesen.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS notifications_seen_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN companies.notifications_seen_at IS
    'Zeitpunkt des letzten "alles gelesen". Alles Neuere gilt als ungelesen.';

-- Gesetzt wird der Wert über eine Funktion, weil companies bewusst keine
-- allgemeine Update-Regel hat: eine solche liesse eine Firma auch
-- `verified` oder `role` an sich selbst schreiben.
CREATE OR REPLACE FUNCTION mark_notifications_seen() RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE companies
       SET notifications_seen_at = NOW()
     WHERE clerk_user_id = auth.jwt() ->> 'sub';
END;
$$;
