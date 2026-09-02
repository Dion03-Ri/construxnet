-- ============================================================
-- Obtanet — Migration 21: Chat in Echtzeit
--
-- Nachrichten landeten bereits in der Datenbank und der Empfänger durfte
-- sie lesen — aber erst nach einem Neuladen der Seite. Zwei Leute, die
-- gleichzeitig im Chat sitzen, sahen sich nicht. Ausserdem wurde nie
-- vermerkt, dass eine Nachricht gelesen wurde: der Zähler an der Glocke
-- stieg und ging nie wieder runter.
--
-- Realtime ist in allen Supabase-Plänen enthalten, auch im kostenlosen —
-- es kommt kein Abonnement dazu.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Nachrichten in die Realtime-Veröffentlichung aufnehmen
--
-- Erst dadurch schickt Postgres Änderungen an die verbundenen Clients.
-- Die Zeilenrechte gelten dabei weiter: jeder Client bekommt nur, was er
-- ohnehin lesen dürfte — hier also Sender und Empfänger.
-- ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END
$$;

-- REPLICA IDENTITY FULL, damit auch bei Änderungen (gelesen-Vermerk) die
-- vollständige Zeile mitkommt. Ohne das trägt ein UPDATE-Ereignis nur den
-- Primärschlüssel, und der Empfänger könnte den Haken nicht zuordnen.
ALTER TABLE messages REPLICA IDENTITY FULL;

-- ------------------------------------------------------------
-- 2) Gelesen-Vermerk
--
-- Als Funktion statt als direkter UPDATE: die Zeilenregel erlaubt dem
-- Empfänger, seine Zeile zu ändern — RLS kennt aber keine Spalten-Ebene,
-- er könnte also auch den Inhalt einer empfangenen Nachricht umschreiben.
-- Hier wird ausschliesslich read_at gesetzt, und nur auf Nachrichten, die
-- tatsächlich an einen selbst gerichtet sind.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_thread_read(p_other UUID) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_me    UUID;
    v_count INTEGER;
BEGIN
    v_me := current_company_id();
    IF v_me IS NULL THEN
        RETURN 0;
    END IF;

    UPDATE messages
       SET read_at = NOW()
     WHERE receiver_company_id = v_me
       AND sender_company_id   = p_other
       AND read_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Den Inhalt einer empfangenen Nachricht darf niemand nachträglich
-- ändern — auch der Empfänger nicht. Sonst liesse sich ein Verlauf
-- umschreiben, auf den sich beide Seiten berufen.
CREATE OR REPLACE FUNCTION messages_lock_content() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF NEW.content              IS DISTINCT FROM OLD.content
    OR NEW.sender_company_id    IS DISTINCT FROM OLD.sender_company_id
    OR NEW.receiver_company_id  IS DISTINCT FROM OLD.receiver_company_id
    OR NEW.is_negotiation_offer IS DISTINCT FROM OLD.is_negotiation_offer
    OR NEW.offer_amount         IS DISTINCT FROM OLD.offer_amount
    THEN
        RAISE EXCEPTION 'Eine gesendete Nachricht ist unveränderlich.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_lock ON messages;
CREATE TRIGGER messages_lock BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION messages_lock_content();

CREATE INDEX IF NOT EXISTS messages_unread_idx
    ON messages (receiver_company_id, sender_company_id)
    WHERE read_at IS NULL;
