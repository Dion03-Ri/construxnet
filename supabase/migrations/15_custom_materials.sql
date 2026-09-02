-- ============================================================
-- Obtanet — Migration 15: Eigene Materialien im gemeinsamen Katalog
--
-- Selbst erfasste Materialien lebten bisher nur im Formular und waren
-- beim Neuladen weg. Damit war jede Erfassung eine Sackgasse: nicht
-- wiederverwendbar, für andere unsichtbar, und vor allem nicht
-- bündelbar. Genau die Positionen, die der Katalog nicht führt, sind
-- aber die, bei denen Bündeln am meisten brächte.
--
-- Diese Migration macht daraus echte Katalogeinträge.
--
-- Zur Nummernvergabe: bisher bekamen eigene Materialien OB-EIG-<n>.
-- Das verstösst gegen die wichtigste Regel — eine Nummer ändert sich
-- nie. Ein Material, das später in den gemeinsamen Katalog wandert,
-- hätte von OB-EIG-001 auf OB-BET-100 wechseln müssen, und jede alte
-- Bestellung zeigte ins Leere. Deshalb bekommt jedes Material sofort
-- seine endgültige Kategorienummer; "freigegeben" ist ein Zustand
-- daneben, kein anderer Namensraum.
--
-- Nummern 001–099 gehören dem fest verdrahteten Katalog in
-- data/procurement.ts, ab 100 vergibt die Datenbank. So können beide
-- wachsen, ohne sich je zu überschneiden.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- Nummernkreis je Kategoriekürzel
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_number_seq (
    category_code TEXT PRIMARY KEY,
    -- Startet bei 99, die erste vergebene Nummer ist also 100.
    last_number   INTEGER NOT NULL DEFAULT 99
);

ALTER TABLE material_number_seq ENABLE ROW LEVEL SECURITY;

-- Der Zähler wird ausschliesslich über die Funktion unten angefasst.
-- Direktes Schreiben ist niemandem erlaubt; Lesen ist unnötig.
DROP POLICY IF EXISTS "material_number_seq_none" ON material_number_seq;

/**
 * Nächste freie Materialnummer für ein Kategoriekürzel.
 *
 * SECURITY DEFINER, weil der Zähler allen gehört und keiner Firma.
 * Der UPDATE ... RETURNING sperrt die Zeile, zwei gleichzeitige
 * Erfassungen können also nicht dieselbe Nummer bekommen.
 */
CREATE OR REPLACE FUNCTION next_material_id(p_code TEXT) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_next INTEGER;
BEGIN
    IF p_code !~ '^[A-Z]{3}$' THEN
        RAISE EXCEPTION 'Ungültiges Kategoriekürzel: %', p_code;
    END IF;

    INSERT INTO material_number_seq (category_code, last_number)
         VALUES (p_code, 100)
    ON CONFLICT (category_code)
      DO UPDATE SET last_number = material_number_seq.last_number + 1
      RETURNING last_number INTO v_next;

    RETURN 'OB-' || p_code || '-' || LPAD(v_next::TEXT, 3, '0');
END;
$$;

-- ------------------------------------------------------------
-- custom_materials: was Firmen selbst erfassen
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Endgültige Materialnummer, vergeben über next_material_id().
    material_id TEXT NOT NULL UNIQUE,

    label    TEXT NOT NULL,
    sia      TEXT,
    unit     TEXT NOT NULL,
    category TEXT NOT NULL,
    -- Richtpreis der erfassenden Firma. Kein Referenzpreis — als solcher
    -- taugt er nicht, weil ihn niemand geprüft hat.
    price    NUMERIC,

    -- PRIVATE  = nur die eigene Firma sieht und nutzt es
    -- SHARED   = für alle sichtbar, damit darauf gebündelt werden kann
    -- MERGED   = als Dublette erkannt, zeigt auf merged_into
    status TEXT NOT NULL DEFAULT 'PRIVATE'
        CHECK (status IN ('PRIVATE', 'SHARED', 'MERGED')),

    -- Bei MERGED: auf welche Nummer dieses Material aufgegangen ist.
    merged_into TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CHECK (status <> 'MERGED' OR merged_into IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS custom_materials_company_idx
    ON custom_materials (company_id, status);
CREATE INDEX IF NOT EXISTS custom_materials_shared_idx
    ON custom_materials (status) WHERE status = 'SHARED';

-- ------------------------------------------------------------
-- Rechte
--
-- Sichtbar ist das Eigene plus alles Freigegebene — anders liesse sich
-- über firmenübergreifende Positionen nicht bündeln. Ändern und löschen
-- darf ausschliesslich die Firma, die es erfasst hat: ein freigegebenes
-- Material ist für andere lesbar, nicht bearbeitbar.
-- ------------------------------------------------------------
ALTER TABLE custom_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_materials_select_own_or_shared" ON custom_materials;
CREATE POLICY "custom_materials_select_own_or_shared" ON custom_materials
    FOR SELECT USING (
        company_id = current_company_id() OR status = 'SHARED'
    );

DROP POLICY IF EXISTS "custom_materials_insert_own" ON custom_materials;
CREATE POLICY "custom_materials_insert_own" ON custom_materials
    FOR INSERT WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "custom_materials_update_own" ON custom_materials;
CREATE POLICY "custom_materials_update_own" ON custom_materials
    FOR UPDATE USING (company_id = current_company_id())
    WITH CHECK (company_id = current_company_id());

DROP POLICY IF EXISTS "custom_materials_delete_own" ON custom_materials;
CREATE POLICY "custom_materials_delete_own" ON custom_materials
    FOR DELETE USING (company_id = current_company_id());

DROP TRIGGER IF EXISTS custom_materials_touch ON custom_materials;
CREATE TRIGGER custom_materials_touch BEFORE UPDATE ON custom_materials
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
