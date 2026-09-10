-- ============================================================
-- Obtanet — Migration 29: Gespräche laden, ohne alles zu laden
--
-- Der Chat holte bisher in EINER Abfrage sämtliche Nachrichten, die die
-- eigene Firma je gesendet oder empfangen hat — ohne Grenze, ohne
-- Blättern — nur um daraus die Liste der Gesprächspartner und die Zahl
-- der ungelesenen Nachrichten abzuleiten. Bei zwanzig Nachrichten fällt
-- das nicht auf, bei zwanzigtausend schon.
--
-- Schlimmer als langsam war die Sortierung: `ORDER BY created_at ASC`.
-- Greift auf dem Server je eine Zeilengrenze (PostgREST kennt dafür
-- db-max-rows), schneidet sie am Ende ab — also die NEUESTEN Nachrichten
-- weg. Der Verlauf hätte irgendwann aufgehört zu wachsen, ohne dass es
-- eine Fehlermeldung gegeben hätte.
--
-- Diese Migration bringt drei Funktionen und eine Tabelle:
--   chat_threads()   — eine Zeile je Gesprächspartner, fertig gerechnet
--   chat_history()   — ein Fenster von N Nachrichten eines Gesprächs
--   chat_archive()   — ein Gespräch für die eigene Seite weglegen
--
-- Gelöscht wird weiterhin nichts. Ein Verlauf enthält Angebote, auf die
-- sich beide Seiten berufen — wer ihn löschen könnte, könnte den Beleg
-- der Gegenseite vernichten. Wegzulegen ist etwas anderes als zu löschen.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Der Archiv-Vermerk. Je Seite eigen.
--
-- Nicht "gelöscht", sondern "weggelegt am". Der Zeitpunkt ist der Trick:
-- ein Gespräch gilt nur so lange als weggelegt, wie seine letzte
-- Nachricht ÄLTER ist als der Vermerk. Schreibt die Gegenseite wieder,
-- taucht es von selbst auf — ohne Trigger, ohne Aufräumjob.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_thread_prefs (
    owner_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    other_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    archived_at      TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (owner_company_id, other_company_id),
    CHECK (owner_company_id <> other_company_id)
);

ALTER TABLE chat_thread_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prefs_own_select" ON chat_thread_prefs;
CREATE POLICY "prefs_own_select" ON chat_thread_prefs
    FOR SELECT USING (owner_company_id = current_company_id());

DROP POLICY IF EXISTS "prefs_own_insert" ON chat_thread_prefs;
CREATE POLICY "prefs_own_insert" ON chat_thread_prefs
    FOR INSERT WITH CHECK (owner_company_id = current_company_id());

DROP POLICY IF EXISTS "prefs_own_update" ON chat_thread_prefs;
CREATE POLICY "prefs_own_update" ON chat_thread_prefs
    FOR UPDATE USING (owner_company_id = current_company_id())
             WITH CHECK (owner_company_id = current_company_id());

DROP POLICY IF EXISTS "prefs_own_delete" ON chat_thread_prefs;
CREATE POLICY "prefs_own_delete" ON chat_thread_prefs
    FOR DELETE USING (owner_company_id = current_company_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON chat_thread_prefs TO authenticated;

-- ------------------------------------------------------------
-- 2) Die Liste der Gespräche
--
-- Eine Zeile je Gegenüber: letzte Nachricht, ob sie von mir war, wie
-- viele ungelesen sind, das letzte Angebot für den Kontext-Chip, und ob
-- das Gespräch weggelegt ist.
--
-- Enthalten sind bestätigte Verbindungen OHNE Nachrichten ebenso wie
-- Firmen, mit denen es Nachrichten gibt, aber (noch) keine Verbindung —
-- eine Direktanfrage nach Migration 09 ist genau dieser Fall.
--
-- SECURITY DEFINER, also gelten die Zeilenrechte hier nicht. Deshalb
-- steht die eigene Firmen-Kennung in jeder Bedingung: gelesen wird
-- ausschliesslich, woran man selbst beteiligt ist.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION chat_threads()
RETURNS TABLE (
    other_company_id   UUID,
    last_message_at    TIMESTAMP WITH TIME ZONE,
    last_content       TEXT,
    last_is_offer      BOOLEAN,
    last_from_me       BOOLEAN,
    unread_count       INTEGER,
    last_offer_content TEXT,
    archived           BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
WITH me AS (
    SELECT current_company_id() AS id
),
gegen AS (
    SELECT CASE WHEN c.company_id_a = me.id THEN c.company_id_b ELSE c.company_id_a END AS other
      FROM connections c, me
     WHERE me.id IS NOT NULL
       AND c.status = 'CONNECTED'
       AND me.id IN (c.company_id_a, c.company_id_b)
    UNION
    SELECT CASE WHEN m.sender_company_id = me.id THEN m.receiver_company_id ELSE m.sender_company_id END
      FROM messages m, me
     WHERE me.id IS NOT NULL
       AND me.id IN (m.sender_company_id, m.receiver_company_id)
)
SELECT
    g.other,
    MAX(m.created_at),
    (ARRAY_AGG(m.content ORDER BY m.created_at DESC))[1],
    COALESCE((ARRAY_AGG(m.is_negotiation_offer ORDER BY m.created_at DESC))[1], FALSE),
    COALESCE((ARRAY_AGG(m.sender_company_id ORDER BY m.created_at DESC))[1] = me.id, FALSE),
    COUNT(m.id) FILTER (WHERE m.receiver_company_id = me.id AND m.read_at IS NULL)::INTEGER,
    (ARRAY_AGG(m.content ORDER BY m.created_at DESC) FILTER (WHERE m.is_negotiation_offer))[1],
    COALESCE(p.archived_at >= MAX(m.created_at), p.archived_at IS NOT NULL, FALSE)
  FROM gegen g
 CROSS JOIN me
  LEFT JOIN messages m
         ON (m.sender_company_id   = me.id AND m.receiver_company_id = g.other)
         OR (m.receiver_company_id = me.id AND m.sender_company_id   = g.other)
  LEFT JOIN chat_thread_prefs p
         ON p.owner_company_id = me.id AND p.other_company_id = g.other
 WHERE g.other IS NOT NULL
   AND g.other <> me.id
 GROUP BY g.other, me.id, p.archived_at
$$;

REVOKE ALL ON FUNCTION chat_threads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION chat_threads() TO authenticated;

-- ------------------------------------------------------------
-- 3) Ein Fenster aus einem Gespräch
--
-- Neueste zuerst, höchstens 200 auf einmal. Wer weiter zurück will,
-- übergibt den Zeitpunkt der ältesten Nachricht, die er schon hat.
-- Die Reihenfolge ist absichtlich DESC: was abgeschnitten wird, sind
-- dann die ältesten Nachrichten und nicht die neuesten.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION chat_history(
    p_other  UUID,
    p_before TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_limit  INTEGER DEFAULT 50
)
RETURNS SETOF messages
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT m.*
      FROM messages m, (SELECT current_company_id() AS id) me
     WHERE me.id IS NOT NULL
       AND (   (m.sender_company_id   = me.id AND m.receiver_company_id = p_other)
            OR (m.receiver_company_id = me.id AND m.sender_company_id   = p_other))
       AND (p_before IS NULL OR m.created_at < p_before)
     ORDER BY m.created_at DESC
     LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200)
$$;

REVOKE ALL ON FUNCTION chat_history(UUID, TIMESTAMP WITH TIME ZONE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION chat_history(UUID, TIMESTAMP WITH TIME ZONE, INTEGER) TO authenticated;

-- ------------------------------------------------------------
-- 4) Weglegen und zurückholen
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION chat_archive(p_other UUID, p_on BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_me UUID;
BEGIN
    v_me := current_company_id();
    IF v_me IS NULL OR p_other IS NULL OR p_other = v_me THEN
        RETURN FALSE;
    END IF;

    INSERT INTO chat_thread_prefs (owner_company_id, other_company_id, archived_at)
    VALUES (v_me, p_other, CASE WHEN p_on THEN NOW() ELSE NULL END)
    ON CONFLICT (owner_company_id, other_company_id)
    DO UPDATE SET archived_at = EXCLUDED.archived_at;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION chat_archive(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION chat_archive(UUID, BOOLEAN) TO authenticated;

-- ------------------------------------------------------------
-- 5) Zwei Indizes für das Fenster
--
-- Vorhanden waren (receiver, created_at) und (sender, created_at). Für
-- „ein bestimmtes Gespräch, neueste zuerst" fehlt die Gegenseite im
-- Schlüssel; Postgres musste über beide Indizes und wieder filtern.
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS messages_pair_out_idx
    ON messages (sender_company_id, receiver_company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_pair_in_idx
    ON messages (receiver_company_id, sender_company_id, created_at DESC);
