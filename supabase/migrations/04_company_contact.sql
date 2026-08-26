-- ============================================================
-- 04 · Kontaktdaten für Firmenprofile
-- Ermöglicht deal-ready Kontaktübersicht im Messenger:
-- E-Mail, Telefon, Adresse und Website je Firma.
-- Öffentlich lesbar (companies ist bereits per Migration 03
-- für alle authentifizierten Nutzer SELECT-freigegeben).
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS email   TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone   TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
