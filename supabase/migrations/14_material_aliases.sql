-- ============================================================
-- Obtanet — Migration 14: Materialaliasse
--
-- Gebündelt wird auf der Materialnummer. Solange „Beton C25/30",
-- „Transportbeton 25/30" und „Beton 25er" als drei verschiedene Dinge im
-- System liegen, verteilen sich drei Firmen mit demselben Bedarf auf drei
-- Töpfe und niemand erreicht eine Rabattstufe. Der Abgleich ist damit
-- keine Zusatzfunktion, sondern die Voraussetzung.
--
-- Diese Tabelle ist das Gedächtnis dafür: jede einmal bestätigte
-- Zuordnung von Freitext auf eine Nummer bleibt erhalten. Beim nächsten
-- Mal ist weder Rechnen noch ein KI-Aufruf nötig, und das System wird mit
-- jeder Eingabe besser, statt jedes Mal von vorn zu raten.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS material_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Der Suchbegriff in normalisierter Form: klein, ohne Umlaute, ohne
    -- Satzzeichen. Normalisiert wird in lib/materialMatch.ts; beide Seiten
    -- müssen dieselbe Form verwenden, sonst greift der Nachschlag nicht.
    alias_norm TEXT NOT NULL,
    -- Wie es tatsächlich eingetippt wurde. Nur zur Anzeige und um später
    -- nachvollziehen zu können, was Leute wirklich schreiben.
    alias_raw  TEXT NOT NULL,

    -- Ziel: die Obtanet-Materialnummer, z. B. OB-BET-001.
    material_id TEXT NOT NULL,

    -- Woher die Zuordnung kommt. 'USER' = jemand hat sie bestätigt und
    -- wiegt am schwersten; 'MATCH' = der deterministische Abgleich war
    -- sicher genug; 'AI' = später, wenn der Abgleich um ein Sprachmodell
    -- ergänzt wird.
    source TEXT NOT NULL DEFAULT 'USER'
        CHECK (source IN ('USER', 'MATCH', 'AI')),

    -- Wer sie angelegt hat. Für Nachvollziehbarkeit; die Zuordnung selbst
    -- gilt firmenübergreifend, denn ein gemeinsamer Katalog nützt nur,
    -- wenn alle davon profitieren.
    created_by_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Wie oft der Alias schon getroffen hat. Häufige Aliasse sind die
    -- verlässlichen; seltene mit widersprüchlichem Ziel lassen sich damit
    -- später aussortieren.
    hits INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ein Begriff zeigt auf genau eine Nummer. Wer denselben Text auf ein
-- anderes Material zuordnen will, überschreibt bewusst statt still eine
-- zweite Wahrheit anzulegen.
CREATE UNIQUE INDEX IF NOT EXISTS material_aliases_norm_key
    ON material_aliases (alias_norm);

CREATE INDEX IF NOT EXISTS material_aliases_material_idx
    ON material_aliases (material_id);

-- ------------------------------------------------------------
-- Rechte
--
-- Lesen dürfen alle: ein gemeinsamer Katalog ist nur dann einer, wenn die
-- Zuordnungen allen zugutekommen. Schreiben darf jede angemeldete Firma,
-- korrigieren und löschen nur, wer den Alias angelegt hat — sonst könnte
-- eine Firma die Zuordnungen aller anderen umbiegen.
-- ------------------------------------------------------------
ALTER TABLE material_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "material_aliases_select_all" ON material_aliases;
CREATE POLICY "material_aliases_select_all" ON material_aliases
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "material_aliases_insert_own" ON material_aliases;
CREATE POLICY "material_aliases_insert_own" ON material_aliases
    FOR INSERT WITH CHECK (created_by_company_id = current_company_id());

DROP POLICY IF EXISTS "material_aliases_update_own" ON material_aliases;
CREATE POLICY "material_aliases_update_own" ON material_aliases
    FOR UPDATE USING (created_by_company_id = current_company_id())
    WITH CHECK (created_by_company_id = current_company_id());

DROP POLICY IF EXISTS "material_aliases_delete_own" ON material_aliases;
CREATE POLICY "material_aliases_delete_own" ON material_aliases
    FOR DELETE USING (created_by_company_id = current_company_id());

-- ------------------------------------------------------------
-- Treffer zählen, ohne dass der Aufrufer erst lesen und dann schreiben
-- muss. SECURITY DEFINER, weil der Zähler auch bei fremden Aliassen
-- hochgehen soll — er sagt nichts über die Firma aus, nur über den
-- Begriff.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION material_alias_hit(p_alias_norm TEXT) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE material_aliases
       SET hits = hits + 1, updated_at = NOW()
     WHERE alias_norm = p_alias_norm;
END;
$$;

DROP TRIGGER IF EXISTS material_aliases_touch ON material_aliases;
CREATE TRIGGER material_aliases_touch BEFORE UPDATE ON material_aliases
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
