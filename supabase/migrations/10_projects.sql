-- ============================================================
-- Obtanet — Migration 10: Projekte & Baustellen
--
-- Bisher war die Baustellen-Auswahl im Dashboard eine feste Liste im
-- Code. Damit liess sich nichts zuordnen: eine Bestellung wusste nicht,
-- für welche Baustelle sie war, und die Auswertung konnte nicht nach
-- Projekt aufschlüsseln.
--
-- Diese Migration legt echte Projekte an, die einer Firma gehören, und
-- hängt die Bündel-Teilnahmen daran. Jede Firma sieht und bearbeitet nur
-- ihre eigenen Projekte.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- projects: eine Baustelle bzw. ein Bauvorhaben einer Firma
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- Wo gebaut wird. Für die Karte und für Lieferwege relevant.
    street TEXT,
    zip TEXT,
    city TEXT,
    canton TEXT,
    -- Laufzeit. Beide Enden optional, weil zu Projektbeginn oft nur der
    -- Start feststeht.
    starts_on DATE,
    ends_on DATE,
    -- Geplantes Materialbudget in CHF, rein zur Orientierung.
    budget NUMERIC,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('PLANNED', 'ACTIVE', 'PAUSED', 'DONE')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_company_idx ON projects (company_id, status);

-- ------------------------------------------------------------
-- Zuordnung: für welche Baustelle wurde bestellt?
--
-- Nachträglich als Spalte, damit bestehende Teilnahmen erhalten bleiben.
-- ON DELETE SET NULL: wird ein Projekt gelöscht, bleibt die Bestellung
-- bestehen, sie ist dann nur keiner Baustelle mehr zugeordnet.
-- ------------------------------------------------------------
ALTER TABLE bundle_participations
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bundle_participations_project_idx
    ON bundle_participations (project_id);

-- ------------------------------------------------------------
-- Rechte: ein Projekt ist reine Firmensache. Niemand sonst sieht es —
-- auch nicht der Lieferant, der beliefert. Was er wissen muss, steht in
-- der Anfrage bzw. im Lieferschein.
-- ------------------------------------------------------------
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_own" ON projects;
CREATE POLICY "projects_select_own" ON projects
    FOR SELECT USING (company_id = current_company_id());

DROP POLICY IF EXISTS "projects_insert_own" ON projects;
CREATE POLICY "projects_insert_own" ON projects
    FOR INSERT WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "projects_update_own" ON projects;
CREATE POLICY "projects_update_own" ON projects
    FOR UPDATE USING (company_id = current_company_id())
    WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "projects_delete_own" ON projects;
CREATE POLICY "projects_delete_own" ON projects
    FOR DELETE USING (company_id = current_company_id());

-- updated_at mitführen, damit "zuletzt geändert" stimmt.
CREATE OR REPLACE FUNCTION projects_touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_touch ON projects;
CREATE TRIGGER projects_touch BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION projects_touch_updated_at();
