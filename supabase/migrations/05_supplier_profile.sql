-- ============================================================
-- 05 · Liefer-Profil für Baustoffwerke (Lieferanten)
-- Damit Smart Bündeln weiss, welche Lieferanten für einen Auftrag
-- überhaupt infrage kommen (Material, Region, Lieferradius, Kapazität).
-- Öffentlich lesbar (companies ist bereits per Migration 03 freigegeben).
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS about              TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS supply_materials   TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS supply_regions     TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS delivery_radius_km INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS capacity_note      TEXT;
