-- ============================================================
-- Obtanet — Migration 02: B2B-Netzwerk
-- Erweitert companies und ergänzt network_posts, messages, connections.
-- Auth-Mapping wie in 01_schema.sql: companies.clerk_user_id = auth.jwt()->>'sub'
--
-- Idempotent gehalten (IF NOT EXISTS / DROP POLICY IF EXISTS), damit ein
-- erneutes Ausführen im Supabase SQL-Editor keine Fehler wirft.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- Helper: aktuelle Firma des eingeloggten Clerk-Users
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_company_id() RETURNS UUID
LANGUAGE sql STABLE AS $$
  SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub'
$$;

-- ------------------------------------------------------------
-- companies: Profil-Felder ergänzen
-- ------------------------------------------------------------
ALTER TABLE companies ADD COLUMN IF NOT EXISTS canton   TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city     TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bio      TEXT;

-- ------------------------------------------------------------
-- network_posts: B2B-Aktivitätsstream
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS network_posts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    post_type    TEXT NOT NULL DEFAULT 'UPDATE'
                 CHECK (post_type IN ('UPDATE','JOB','MATERIAL_OFFER','PROJECT','ANNOUNCEMENT')),
    title        TEXT,
    content      TEXT NOT NULL,
    region       TEXT,
    media_url    TEXT,
    likes_count  INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS network_posts_created_idx ON network_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS network_posts_region_idx  ON network_posts (region);
CREATE INDEX IF NOT EXISTS network_posts_company_idx ON network_posts (company_id);

-- ------------------------------------------------------------
-- connections: Firma-zu-Firma-Verbindungen
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS connections (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id_a  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    company_id_b  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONNECTED')),
    requested_by  UUID REFERENCES companies(id), -- wer die Anfrage gestellt hat
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (company_id_a <> company_id_b)
);

-- Ein Paar (A,B) = (B,A): ungeordnete Eindeutigkeit erzwingen
CREATE UNIQUE INDEX IF NOT EXISTS connections_unique_pair
    ON connections (LEAST(company_id_a, company_id_b), GREATEST(company_id_a, company_id_b));
CREATE INDEX IF NOT EXISTS connections_a_idx ON connections (company_id_a);
CREATE INDEX IF NOT EXISTS connections_b_idx ON connections (company_id_b);

-- ------------------------------------------------------------
-- messages: Direktnachrichten & Verhandlungsangebote
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    receiver_company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    content               TEXT NOT NULL,
    is_negotiation_offer  BOOLEAN NOT NULL DEFAULT FALSE,
    offer_amount          NUMERIC, -- gesetzt, wenn is_negotiation_offer = TRUE
    read_at               TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (sender_company_id <> receiver_company_id)
);

CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages (receiver_company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx   ON messages (sender_company_id, created_at DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE network_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- ---- network_posts: öffentlich lesbar, schreiben nur eigene Firma ----
DROP POLICY IF EXISTS "network_posts_select_public" ON network_posts;
CREATE POLICY "network_posts_select_public" ON network_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "network_posts_insert_own" ON network_posts;
CREATE POLICY "network_posts_insert_own" ON network_posts
    FOR INSERT WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "network_posts_update_own" ON network_posts;
CREATE POLICY "network_posts_update_own" ON network_posts
    FOR UPDATE USING (company_id = current_company_id())
    WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "network_posts_delete_own" ON network_posts;
CREATE POLICY "network_posts_delete_own" ON network_posts
    FOR DELETE USING (company_id = current_company_id());

-- ---- connections: nur beteiligte Firmen sehen/verwalten ----
DROP POLICY IF EXISTS "connections_select_involved" ON connections;
CREATE POLICY "connections_select_involved" ON connections
    FOR SELECT USING (
        current_company_id() IN (company_id_a, company_id_b)
    );

DROP POLICY IF EXISTS "connections_insert_own_request" ON connections;
CREATE POLICY "connections_insert_own_request" ON connections
    FOR INSERT WITH CHECK (
        requested_by = current_company_id()
        AND current_company_id() IN (company_id_a, company_id_b)
    );

-- Annehmen/Aktualisieren (PENDING -> CONNECTED) durch eine beteiligte Firma
DROP POLICY IF EXISTS "connections_update_involved" ON connections;
CREATE POLICY "connections_update_involved" ON connections
    FOR UPDATE USING (current_company_id() IN (company_id_a, company_id_b))
    WITH CHECK (current_company_id() IN (company_id_a, company_id_b));

DROP POLICY IF EXISTS "connections_delete_involved" ON connections;
CREATE POLICY "connections_delete_involved" ON connections
    FOR DELETE USING (current_company_id() IN (company_id_a, company_id_b));

-- ---- messages: nur Sender/Empfänger, senden nur zwischen CONNECTED Firmen ----
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
CREATE POLICY "messages_select_participant" ON messages
    FOR SELECT USING (
        current_company_id() IN (sender_company_id, receiver_company_id)
    );

DROP POLICY IF EXISTS "messages_insert_connected" ON messages;
CREATE POLICY "messages_insert_connected" ON messages
    FOR INSERT WITH CHECK (
        sender_company_id = current_company_id()
        AND EXISTS (
            SELECT 1 FROM connections c
            WHERE c.status = 'CONNECTED'
              AND (
                    (c.company_id_a = sender_company_id AND c.company_id_b = receiver_company_id)
                 OR (c.company_id_a = receiver_company_id AND c.company_id_b = sender_company_id)
              )
        )
    );

-- Empfänger darf read_at setzen
DROP POLICY IF EXISTS "messages_update_receiver" ON messages;
CREATE POLICY "messages_update_receiver" ON messages
    FOR UPDATE USING (receiver_company_id = current_company_id())
    WITH CHECK (receiver_company_id = current_company_id());
