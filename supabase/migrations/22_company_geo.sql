-- ============================================================
-- Obtanet — Migration 22: echte Koordinaten für die Karte
--
-- Bisher wurde ein Kartenpunkt aus einer Ortsliste im Code geraten: stand
-- die Stadt nicht darin, landete die Firma auf dem Kantonsmittelpunkt oder
-- gar nicht auf der Karte. Damit ist es kein Standort, sondern eine
-- Schätzung.
--
-- Neu wird die Adresse einmal beim Zustimmen über die amtliche Suche von
-- swisstopo (api3.geo.admin.ch, kostenlos, kein Schlüssel) in Koordinaten
-- übersetzt und hier abgelegt. Die Karte zeigt dann den echten Punkt.
--
-- Datenschutz: die Koordinaten stehen NUR in der Zeile, solange
-- show_on_map wahr ist. Wird die Zustimmung zurückgezogen, löscht die
-- Anwendung sie wieder — companies ist für angemeldete Nutzer lesbar,
-- also darf dort nichts liegen, dem nicht zugestimmt wurde.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS lat       DOUBLE PRECISION;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS lng       DOUBLE PRECISION;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS geo_label TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS geo_query TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS geo_at    TIMESTAMPTZ;

COMMENT ON COLUMN companies.lat IS
    'Breitengrad (WGS84) des Firmenstandorts. Nur gesetzt, solange show_on_map wahr ist.';
COMMENT ON COLUMN companies.lng IS
    'Längengrad (WGS84) des Firmenstandorts. Nur gesetzt, solange show_on_map wahr ist.';
COMMENT ON COLUMN companies.geo_label IS
    'Adresse, die swisstopo zu diesen Koordinaten gefunden hat — damit die Firma sieht, worauf sie steht.';
COMMENT ON COLUMN companies.geo_query IS
    'Suchtext, mit dem die Koordinaten ermittelt wurden.';
COMMENT ON COLUMN companies.geo_at IS
    'Zeitpunkt der letzten Ermittlung.';

-- Kartenabfrage: nur zugestimmte Firmen mit Koordinaten.
CREATE INDEX IF NOT EXISTS companies_map_points_idx
    ON companies (show_on_map)
    WHERE show_on_map AND lat IS NOT NULL;

-- Sicherheitsnetz: ohne Zustimmung dürfen keine Koordinaten in der Zeile
-- stehen — auch dann nicht, wenn irgendwo im Code das Löschen vergessen
-- geht. Der Trigger räumt sie beim Zurückziehen selbst weg.
CREATE OR REPLACE FUNCTION companies_clear_geo_without_consent()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.show_on_map IS NOT TRUE THEN
        NEW.lat := NULL;
        NEW.lng := NULL;
        NEW.geo_label := NULL;
        NEW.geo_query := NULL;
        NEW.geo_at := NULL;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS companies_geo_consent ON companies;
CREATE TRIGGER companies_geo_consent
    BEFORE INSERT OR UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION companies_clear_geo_without_consent();
