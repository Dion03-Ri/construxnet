-- ============================================================
-- Obtanet — Migration 12: Einwilligung für die Karte
--
-- Die Lieferantenkarte zeigte bisher jede registrierte Firma mit
-- Standort — ungefragt. Wer sich anmeldet, um zu beschaffen, landet
-- damit ohne Zutun auf einer öffentlich einsehbaren Karte. Das ist keine
-- Entscheidung, die wir für jemanden treffen sollten.
--
-- Neu ist der Karteneintrag eine bewusste Zusage: standardmässig aus,
-- einschaltbar im Dashboard unter Einstellungen. Wer zustimmt, erscheint
-- ab dem nächsten Laden automatisch an seinem Standort.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN companies.show_on_map IS
    'Einwilligung, mit Standort auf der öffentlichen Lieferantenkarte zu erscheinen. Opt-in.';

-- Nur der Karteneintrag ist neu; gelesen wird über die bestehende
-- Verzeichnis-Regel companies_select_public. Geändert werden darf er
-- ausschliesslich von der Firma selbst — dafür sorgt die bestehende
-- Update-Regel auf companies.
CREATE INDEX IF NOT EXISTS companies_map_idx
    ON companies (show_on_map, role)
    WHERE show_on_map;
