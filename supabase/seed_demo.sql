-- ============================================================
-- ConstruxNet — Demo-Seed für Tests
--
-- Legt einige verifizierte Beispiel-Firmen (Bauunternehmen + Baustoffwerke)
-- und ein paar Feed-Beiträge an, damit Netzwerk/Feed nicht leer sind.
--
-- Diese Firmen sind NICHT an einen Login gebunden (Platzhalter-clerk_user_id).
-- Du selbst legst dein eigenes Profil (z. B. "Richner Bau AG") beim normalen
-- Login über das Onboarding an — danach kannst du dich mit diesen Demo-Firmen
-- vernetzen und ihnen schreiben.
--
-- Im Supabase SQL-Editor des ConstruxNet-Projekts ausführen. Idempotent
-- (ON CONFLICT / NOT EXISTS) — mehrfaches Ausführen ist unschädlich.
-- ============================================================

-- --- Demo-Firmen ---
INSERT INTO companies (clerk_user_id, company_name, uid_number, role, canton, city, verified, bio)
VALUES
  ('seed-gebr-meier',   'Gebr. Meier Hochbau AG', 'CHE-101.234.567', 'BUYER',    'BE', 'Bern',    TRUE,
   'Hoch- und Tiefbau im Raum Bern. Spezialisiert auf Wohnbauten und Sanierungen.'),
  ('seed-rhomberg',     'Rhomberg Bau AG',        'CHE-102.345.678', 'BUYER',    'LU', 'Luzern',  TRUE,
   'Generalunternehmung für Gewerbe- und Industriebauten in der Innerschweiz.'),
  ('seed-kibag',        'KIBAG Baustoffe',        'CHE-103.456.789', 'SUPPLIER', 'ZH', 'Zürich',  TRUE,
   'Beton, Kies und Recyclingbaustoffe. Werke im Raum Zürich / Limmattal.'),
  ('seed-vigier',       'Vigier Beton Mittelland','CHE-104.567.890', 'SUPPLIER', 'BE', 'Bern',    TRUE,
   'Transportbeton nach SN EN 206 für die Region Mittelland.'),
  ('seed-toggenburger', 'Toggenburger Kies AG',   'CHE-105.678.901', 'SUPPLIER', 'SG', 'Wil',     FALSE,
   'Kies- und Hartschotterwerk. Lieferung in der Ostschweiz.')
ON CONFLICT (uid_number) DO NOTHING;

-- --- Demo-Beiträge (nur einfügen, wenn die Firma noch keine hat) ---
INSERT INTO network_posts (company_id, post_type, title, content, region)
SELECT c.id, v.post_type, v.title, v.content, v.region
FROM (VALUES
  ('CHE-103.456.789', 'MATERIAL_OFFER', 'Freie Kapazität Beton C25/30',
   'Kurzfristig freie Liefermengen Beton C25/30 im Raum Zürich für Q4. Interessierte Bauunternehmen gerne melden.', 'Zürich'),
  ('CHE-104.567.890', 'MATERIAL_OFFER', 'Transportbeton Region Mittelland',
   'Zuverlässige Belieferung mit Transportbeton nach SN EN 206. Aktuell gute Verfügbarkeit.', 'Bern'),
  ('CHE-101.234.567', 'PROJECT', 'Neubau Wohnüberbauung Bern-West',
   'Wir starten ein Wohnbauprojekt mit 42 Einheiten. Suchen regionale Partner für Beton und Armierungsstahl.', 'Bern'),
  ('CHE-102.345.678', 'UPDATE', 'Standort Innerschweiz ausgebaut',
   'Unser Team in Luzern wächst — wir freuen uns auf neue Kooperationen in der Innerschweiz.', 'Innerschweiz'),
  ('CHE-105.678.901', 'ANNOUNCEMENT', 'Neue Recycling-Linie in Betrieb',
   'Ab sofort liefern wir RC-Kies aus unserer neuen Aufbereitungsanlage.', 'Nordwestschweiz')
) AS v(uid, post_type, title, content, region)
JOIN companies c ON c.uid_number = v.uid
WHERE NOT EXISTS (SELECT 1 FROM network_posts p WHERE p.company_id = c.id);
