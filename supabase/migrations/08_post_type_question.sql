-- ============================================================
-- Obtanet — Migration 08: Beitragsart „Frage"
--
-- Der Composer im Feed bietet Update / Projekt / Frage an. 'QUESTION'
-- fehlte bisher in der CHECK-Beschränkung von network_posts.post_type,
-- wodurch das Speichern einer Frage fehlschlug.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE public.network_posts
  DROP CONSTRAINT IF EXISTS network_posts_post_type_check;

ALTER TABLE public.network_posts
  ADD CONSTRAINT network_posts_post_type_check
  CHECK (post_type IN ('UPDATE', 'JOB', 'MATERIAL_OFFER', 'PROJECT', 'ANNOUNCEMENT', 'QUESTION'));
