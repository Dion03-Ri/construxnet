CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE ROLE anon;          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE service_role;  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('test.jwt', true), ''), '{}')::jsonb $$;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
-- Supabase-Realtime-Publikation, damit Migration 21 durchlaeuft
DO $$ BEGIN CREATE PUBLICATION supabase_realtime; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage: nur so viel, wie die Migrationen 06 und 20 anfassen.
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY, name TEXT, public BOOLEAN,
  file_size_limit BIGINT, allowed_mime_types TEXT[]);
CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT, name TEXT, owner UUID, metadata JSONB);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets, storage.objects TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION storage.foldername(name TEXT) RETURNS TEXT[]
  LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array(name, '/') $$;
CREATE OR REPLACE FUNCTION storage.filename(name TEXT) RETURNS TEXT
  LANGUAGE sql IMMUTABLE AS $$ SELECT split_part(name, '/', -1) $$;
CREATE OR REPLACE FUNCTION storage.extension(name TEXT) RETURNS TEXT
  LANGUAGE sql IMMUTABLE AS $$ SELECT split_part(name, '.', -1) $$;

-- ------------------------------------------------------------
-- Die Standardrechte, die Supabase mitbringt und ein nacktes Postgres nicht.
--
-- Supabase setzt beim Anlegen eines Projekts
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
-- Ohne das lief der Prüfstand in „permission denied for table connections",
-- wo in Supabase längst RLS entscheidet — der Test hätte also einen Fehler
-- gemeldet, den es dort nicht gibt, und schlimmer: er hätte einen echten
-- Rechtefehler nicht von diesem Rauschen unterscheiden können.
--
-- Wichtig: Was danach WIRKLICH gilt, entscheidet weiterhin die Zeilenregel
-- (RLS). Diese Freigabe ist nur die Tür; ob jemand durchdarf, sagt die
-- Regel dahinter. Migrationen, die absichtlich REVOKEn (etwa Migration 32),
-- laufen NACH dieser Datei und behalten deshalb das letzte Wort.
-- ------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
