-- ============================================================
-- REAKTIONEN UND KOMMENTARE
--
-- Bis hierher waren beide eine Attrappe: „Gefaellt mir" zaehlte im
-- Browser hoch und war nach dem Neuladen wieder weg, „Kommentieren" tat
-- nichts, und die Zahl unter dem Beitrag kam aus der Beispieldatei.
--
-- Zwei Tabellen, und die Zaehler auf `network_posts` werden von
-- Ausloesern gepflegt — nicht von der Anwendung. Ein Zaehler, den der
-- Browser hochsetzt, ist keine Zahl, sondern ein Vorschlag.
-- ============================================================

ALTER TABLE network_posts ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

-- ------------------------------------------------------------
-- Reaktionen: eine Firma, ein Beitrag, ein Mal
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_likes (
    post_id    UUID NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id)     ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, company_id)
);

CREATE INDEX IF NOT EXISTS post_likes_company_idx ON post_likes (company_id);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Wer reagiert hat, ist offen — das ist der Sinn einer Reaktion.
DROP POLICY IF EXISTS "post_likes_select_public" ON post_likes;
CREATE POLICY "post_likes_select_public" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "post_likes_insert_own" ON post_likes;
CREATE POLICY "post_likes_insert_own" ON post_likes
    FOR INSERT WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "post_likes_delete_own" ON post_likes;
CREATE POLICY "post_likes_delete_own" ON post_likes
    FOR DELETE USING (company_id = current_company_id());

-- ------------------------------------------------------------
-- Kommentare
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id)     ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_comments_post_idx ON post_comments (post_id, created_at);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_comments_select_public" ON post_comments;
CREATE POLICY "post_comments_select_public" ON post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "post_comments_insert_own" ON post_comments;
CREATE POLICY "post_comments_insert_own" ON post_comments
    FOR INSERT WITH CHECK (company_id = current_company_id());

-- Loeschen darf, wer den Kommentar geschrieben hat — und wer den Beitrag
-- geschrieben hat. Auf der eigenen Pinnwand raeumt man selber auf.
DROP POLICY IF EXISTS "post_comments_delete_own_or_post" ON post_comments;
CREATE POLICY "post_comments_delete_own_or_post" ON post_comments
    FOR DELETE USING (
        company_id = current_company_id()
        OR EXISTS (
            SELECT 1 FROM network_posts p
            WHERE p.id = post_id AND p.company_id = current_company_id()
        )
    );

-- Kein UPDATE: ein nachtraeglich geaenderter Kommentar unter einer
-- Antwort, die sich darauf bezieht, richtet mehr Schaden an als er nuetzt.

-- ------------------------------------------------------------
-- Die Zaehler
--
-- SECURITY DEFINER, weil die Regel auf `network_posts` nur der eigenen
-- Firma das Schreiben erlaubt — die Reaktion einer anderen Firma muss
-- den Zaehler aber trotzdem bewegen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bump_likes_count() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE network_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSE
        UPDATE network_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS post_likes_count_trg ON post_likes;
CREATE TRIGGER post_likes_count_trg
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION bump_likes_count();

CREATE OR REPLACE FUNCTION bump_comments_count() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE network_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSE
        UPDATE network_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS post_comments_count_trg ON post_comments;
CREATE TRIGGER post_comments_count_trg
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION bump_comments_count();

-- ------------------------------------------------------------
-- Die Zaehler gehoeren nicht dem Client
--
-- Bisher durfte die eigene Firma jede Spalte ihres Beitrags aendern —
-- auch `likes_count`. Damit liesse sich die eigene Zahl auf tausend
-- setzen. Ab hier darf der Client nur noch die Felder aendern, die er
-- auch geschrieben hat.
-- ------------------------------------------------------------
REVOKE UPDATE ON network_posts FROM authenticated;
GRANT UPDATE (post_type, title, content, region, media_url) ON network_posts TO authenticated;

GRANT SELECT, INSERT, DELETE ON post_likes    TO authenticated;
GRANT SELECT, INSERT, DELETE ON post_comments TO authenticated;
GRANT SELECT ON post_likes, post_comments TO anon;
