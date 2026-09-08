-- ============================================================
-- Obtanet — Demo-Daten zum Anschauen
--
-- Legt an: zehn Beispiel-Firmen, Verbindungen zu deiner eigenen Firma
-- (angenommene und offene Anfragen), vier Bündel in verschiedenen
-- Zuständen samt Teilnahmen, acht Feed-Beiträge (einer davon mit Bild)
-- und einen Nachrichtenverlauf mit einem Verhandlungsangebot.
--
-- ANWENDUNG
--   1. Melde dich einmal normal auf obtanet.com an und lege dein
--      Firmenprofil über das Onboarding an. Ohne das gibt es kein „Du",
--      an dem die Verbindungen und Teilnahmen hängen können.
--   2. Dieses Skript im Supabase-SQL-Editor des Obtanet-Projekts
--      vollständig ausführen.
--
-- Das Skript findet deine Firma selbst: es nimmt die älteste Firma, deren
-- clerk_user_id nicht mit 'seed-' beginnt. Hast du mehrere eigene Profile
-- angelegt, trage deine UID unten in seed_me() von Hand ein.
--
-- Idempotent: mehrfaches Ausführen legt nichts doppelt an.
--
-- ZUM ENTFERNEN: ganz unten steht ein auskommentierter Block, der alle
-- Demo-Daten wieder löscht.
-- ============================================================

-- ------------------------------------------------------------
-- 0 · Wer bin ich?
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_me() RETURNS uuid
LANGUAGE sql STABLE AS $$
  -- Willst du eine bestimmte Firma, ersetze den Rumpf durch:
  --   SELECT id FROM companies WHERE uid_number = 'CHE-123.456.789'
  SELECT id FROM companies
  WHERE clerk_user_id NOT LIKE 'seed-%'
  ORDER BY created_at
  LIMIT 1
$$;

DO $$
BEGIN
  IF seed_me() IS NULL THEN
    RAISE EXCEPTION
      'Keine eigene Firma gefunden. Melde dich zuerst an und lege dein Firmenprofil an.';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 1 · Firmen
--
-- Erfundene Namen mit Platzhalter-UIDs. Bewusst KEINE echten Schweizer
-- Baufirmen: es sind Testdaten, und die dürfen niemandem in den Mund
-- gelegt werden. Die Koordinaten sind Ortsmittelpunkte, damit die Karte
-- etwas zeigt.
-- ------------------------------------------------------------
INSERT INTO companies (
  clerk_user_id, company_name, uid_number, role, canton, city, verified, bio,
  email, phone, address, website, lat, lng, geo_label
) VALUES
  ('seed-01', 'Muster Hochbau AG',        'CHE-101.234.567', 'BUYER',    'BE', 'Bern',        TRUE,
   'Hoch- und Tiefbau im Raum Bern. Wohnbauten und Sanierungen.',
   'kontakt@muster-hochbau.example', '+41 31 000 00 01', 'Musterweg 1, 3000 Bern',
   'https://muster-hochbau.example', 46.9480, 7.4474, 'Bern'),

  ('seed-02', 'Musterbau Innerschweiz AG','CHE-102.345.678', 'BUYER',    'LU', 'Luzern',      TRUE,
   'Generalunternehmung für Gewerbe- und Industriebauten.',
   'info@musterbau-iz.example', '+41 41 000 00 02', 'Beispielstrasse 8, 6003 Luzern',
   NULL, 47.0502, 8.3093, 'Luzern'),

  ('seed-03', 'Muster Baustoffe AG',      'CHE-103.456.789', 'SUPPLIER', 'ZH', 'Zürich',      TRUE,
   'Beton, Kies und Recyclingbaustoffe. Werke im Limmattal.',
   'verkauf@muster-baustoffe.example', '+41 44 000 00 03', 'Industriestrasse 12, 8005 Zürich',
   'https://muster-baustoffe.example', 47.3769, 8.5417, 'Zürich'),

  ('seed-04', 'Beispiel Beton Mittelland','CHE-104.567.890', 'SUPPLIER', 'BE', 'Bern',        TRUE,
   'Transportbeton nach SN EN 206 für die Region Mittelland.',
   'disposition@beispiel-beton.example', '+41 31 000 00 04', 'Werkstrasse 3, 3018 Bern',
   NULL, 46.9480, 7.4474, 'Bern'),

  ('seed-05', 'Beispiel Kies AG',         'CHE-105.678.901', 'SUPPLIER', 'SG', 'Wil',         FALSE,
   'Kies- und Hartschotterwerk. Lieferung in der Ostschweiz.',
   'werk@beispiel-kies.example', '+41 71 000 00 05', 'Grubenweg 5, 9500 Wil',
   NULL, 47.4625, 9.0450, 'Wil (SG)'),

  ('seed-06', 'Beispiel Bau 3 GmbH',      'CHE-106.789.012', 'BUYER',    'AG', 'Aarau',       FALSE,
   'Wohn- und Gewerbebau im Kanton Aargau.',
   'buero@beispiel-bau3.example', '+41 62 000 00 06', 'Baufeldweg 22, 5000 Aarau',
   NULL, 47.3925, 8.0442, 'Aarau'),

  ('seed-07', 'Musterwerk Nordwest AG',   'CHE-107.890.123', 'SUPPLIER', 'BS', 'Basel',       TRUE,
   'Zement und Bindemittel, Umschlag am Rheinhafen.',
   'verkauf@musterwerk-nw.example', '+41 61 000 00 07', 'Hafenstrasse 44, 4057 Basel',
   NULL, 47.5596, 7.5886, 'Basel'),

  ('seed-08', 'Beispiel Tiefbau Ost AG',  'CHE-108.901.234', 'BUYER',    'SG', 'St. Gallen',  TRUE,
   'Strassen- und Werkleitungsbau in der Ostschweiz.',
   'leitung@beispiel-tiefbau.example', '+41 71 000 00 08', 'Kanalweg 9, 9000 St. Gallen',
   NULL, 47.4245, 9.3767, 'St. Gallen'),

  ('seed-09', 'Musterstahl Winterthur AG','CHE-109.012.345', 'SUPPLIER', 'ZH', 'Winterthur',  TRUE,
   'Bewehrungsstahl, Matten und Zuschnitt ab Lager.',
   'stahl@musterstahl.example', '+41 52 000 00 09', 'Lagerplatz 2, 8400 Winterthur',
   NULL, 47.5001, 8.7386, 'Winterthur'),

  ('seed-10', 'Beispiel Bergbau Graubünden AG', 'CHE-110.123.456', 'BUYER', 'GR', 'Chur',     FALSE,
   'Bauunternehmung für alpine Infrastruktur.',
   'chur@beispiel-bergbau.example', '+41 81 000 00 10', 'Talstrasse 17, 7000 Chur',
   NULL, 46.8500, 9.5320, 'Chur')
ON CONFLICT (uid_number) DO NOTHING;

-- Lieferantenprofil (Materialien, Regionen, Radius) für die Suche
UPDATE companies SET
  supply_materials   = ARRAY['Beton','Kies, Aushub & Recycling'],
  supply_regions     = ARRAY['Zürich','Nordwestschweiz'],
  delivery_radius_km = 25,
  capacity_note      = 'Kurzfristige Mengen meist innert 48 Stunden disponierbar.'
WHERE uid_number = 'CHE-103.456.789';

UPDATE companies SET
  supply_materials   = ARRAY['Beton'],
  supply_regions     = ARRAY['Bern','Innerschweiz'],
  delivery_radius_km = 40
WHERE uid_number = 'CHE-104.567.890';

UPDATE companies SET
  supply_materials   = ARRAY['Bewehrung & Stahl'],
  supply_regions     = ARRAY['Zürich','Ostschweiz'],
  delivery_radius_km = 60
WHERE uid_number = 'CHE-109.012.345';

-- ------------------------------------------------------------
-- 2 · Verbindungen
--
-- Vier angenommene, zwei offene Anfragen AN dich (die zählt der Feed als
-- „Offene Anfragen") und eine von dir gestellte, auf die noch niemand
-- geantwortet hat.
-- ------------------------------------------------------------
INSERT INTO connections (company_id_a, company_id_b, status, requested_by)
SELECT seed_me(), c.id, v.status, CASE WHEN v.von_mir THEN seed_me() ELSE c.id END
FROM (VALUES
  ('CHE-103.456.789', 'CONNECTED', TRUE),
  ('CHE-104.567.890', 'CONNECTED', FALSE),
  ('CHE-101.234.567', 'CONNECTED', TRUE),
  ('CHE-109.012.345', 'CONNECTED', FALSE),
  ('CHE-106.789.012', 'PENDING',   FALSE),   -- Anfrage an dich
  ('CHE-108.901.234', 'PENDING',   FALSE),   -- Anfrage an dich
  ('CHE-107.890.123', 'PENDING',   TRUE)     -- von dir gestellt
) AS v(uid, status, von_mir)
JOIN companies c ON c.uid_number = v.uid
WHERE NOT EXISTS (
  SELECT 1 FROM connections x
  WHERE LEAST(x.company_id_a, x.company_id_b) = LEAST(seed_me(), c.id)
    AND GREATEST(x.company_id_a, x.company_id_b) = GREATEST(seed_me(), c.id)
);

-- ------------------------------------------------------------
-- 3 · Bündel
--
-- Vier Zustände, damit man den ganzen Ablauf sieht: Sammelphase kurz vor
-- Stufe 3, laufende verdeckte Ausschreibung, fast volle Sammelphase und
-- ein bereits vergebenes Bündel.
-- ------------------------------------------------------------
INSERT INTO bundles (
  title, material_id, material_label, material_category, sia_specification,
  region, unit, target_volume, current_volume,
  tier1_target, tier2_target, tier3_target,
  current_tier, current_discount_pct, participant_count,
  kbob_reference_price, min_participants_for_bidding,
  deadline, bid_deadline, status, awarded_price, awarded_supplier_id
)
SELECT * FROM (VALUES
  ('Beton C25/30 · Raum Zürich', 'beton-25', 'Beton C25/30', 'Beton',
   'SN EN 206 · C25/30 · Cl 0.20 · Dmax 32 · XC3', 'Zürich', 'm³',
   300::numeric, 230::numeric, 100::numeric, 200::numeric, 300::numeric,
   2, 12::numeric, 4, 156::numeric, 3,
   now() + interval '5 days', NULL::timestamptz, 'OPEN',
   NULL::numeric, NULL::uuid),

  ('Bewehrungsstahl B500B · Bern', 'stahl-b500b', 'Bewehrungsstahl B500B', 'Bewehrung & Stahl',
   'SIA 262 · B500B · Ring / Stäbe', 'Bern', 't',
   60::numeric, 48::numeric, 20::numeric, 40::numeric, 60::numeric,
   2, 12::numeric, 5, 1120::numeric, 3,
   now() + interval '18 hours', now() + interval '4 days', 'SEALED_BIDDING',
   NULL::numeric, NULL::uuid),

  ('Koffer-/Wandkies 0/45 · Nordwestschweiz', 'kies-045', 'Koffer-/Wandkies 0/45',
   'Kies, Aushub & Recycling', 'SN 670 · ungebrochen 0/45', 'Nordwestschweiz', 't',
   333::numeric, 320::numeric, 120::numeric, 220::numeric, 320::numeric,
   3, 20::numeric, 6, 39::numeric, 3,
   now() + interval '11 days', NULL::timestamptz, 'OPEN',
   NULL::numeric, NULL::uuid),

  ('Transportbeton C30/37 · Innerschweiz', 'beton-30', 'Beton C30/37', 'Beton',
   'SN EN 206 · C30/37 · Cl 0.20 · Dmax 32 · XC4', 'Innerschweiz', 'm³',
   150::numeric, 150::numeric, 60::numeric, 110::numeric, 150::numeric,
   3, 20::numeric, 4, 168::numeric, 3,
   now() - interval '2 days', now() - interval '12 hours', 'AWARDED',
   142.80::numeric, (SELECT id FROM companies WHERE uid_number = 'CHE-104.567.890'))
) AS v
WHERE NOT EXISTS (SELECT 1 FROM bundles b WHERE b.title = v.column1);

-- ------------------------------------------------------------
-- 4 · Teilnahmen
--
-- Du bist in zwei Bündeln (das zeigt der Feed als „Aktive Pools"), die
-- übrigen Plätze füllen andere Firmen — sonst passt participant_count
-- oben nicht zur Wirklichkeit.
-- ------------------------------------------------------------
INSERT INTO bundle_participations (bundle_id, buyer_company_id, requested_volume, status, joined_at)
SELECT b.id, m.company_id, v.vol, 'CONFIRMED', now() - (v.tage || ' days')::interval
FROM (VALUES
  ('Beton C25/30 · Raum Zürich',              'ICH',             60::numeric, 6),
  ('Beton C25/30 · Raum Zürich',              'CHE-101.234.567', 80::numeric, 5),
  ('Beton C25/30 · Raum Zürich',              'CHE-106.789.012', 50::numeric, 3),
  ('Beton C25/30 · Raum Zürich',              'CHE-102.345.678', 40::numeric, 1),
  ('Bewehrungsstahl B500B · Bern',            'ICH',             12::numeric, 8),
  ('Bewehrungsstahl B500B · Bern',            'CHE-101.234.567', 16::numeric, 7),
  ('Bewehrungsstahl B500B · Bern',            'CHE-102.345.678',  9::numeric, 5),
  ('Bewehrungsstahl B500B · Bern',            'CHE-106.789.012',  6::numeric, 4),
  ('Bewehrungsstahl B500B · Bern',            'CHE-110.123.456',  5::numeric, 2),
  ('Koffer-/Wandkies 0/45 · Nordwestschweiz', 'CHE-108.901.234',120::numeric, 9),
  ('Koffer-/Wandkies 0/45 · Nordwestschweiz', 'CHE-106.789.012', 90::numeric, 6),
  ('Koffer-/Wandkies 0/45 · Nordwestschweiz', 'CHE-110.123.456',110::numeric, 2),
  ('Transportbeton C30/37 · Innerschweiz',    'CHE-102.345.678', 90::numeric,14),
  ('Transportbeton C30/37 · Innerschweiz',    'CHE-101.234.567', 60::numeric,12)
) AS v(bundle_title, uid, vol, tage)
JOIN bundles b ON b.title = v.bundle_title
JOIN LATERAL (
  SELECT CASE WHEN v.uid = 'ICH' THEN seed_me()
              ELSE (SELECT id FROM companies WHERE uid_number = v.uid) END AS company_id
) m ON m.company_id IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1 FROM bundle_participations p
  WHERE p.bundle_id = b.id AND p.buyer_company_id = m.company_id
);

-- Kennzahlen von der Datenbank rechnen lassen statt von Hand setzen.
--
-- Volumen, Teilnehmerzahl, Stufe und Rabatt hängen an derselben Treppe,
-- die auch die Anwendung anzeigt (bundle_tier: 101 / 201 / 351 / 501).
-- Trüge man sie hier von Hand ein, stünde in einer Zeile „Stufe 2, 12 %"
-- und daneben „Stufe 4 bei 351" — zwei Zahlen aus zwei Quellen, die sich
-- widersprechen.
SELECT bundle_recalc(id) FROM bundles WHERE title IN (
  'Beton C25/30 · Raum Zürich',
  'Bewehrungsstahl B500B · Bern',
  'Koffer-/Wandkies 0/45 · Nordwestschweiz',
  'Transportbeton C30/37 · Innerschweiz'
);

-- ------------------------------------------------------------
-- 5 · Feed-Beiträge
--
-- Einer davon MIT BILD. Die Adresse zeigt auf eine Datei, die im Projekt
-- unter public/ liegt — kein fremder Server, kein Ablaufdatum. Willst du
-- ein eigenes Bild sehen, lade es über den Composer im Feed hoch; das
-- landet dann im Storage-Bucket post-media.
-- ------------------------------------------------------------
INSERT INTO network_posts (company_id, post_type, title, content, region, media_url, likes_count, created_at)
SELECT c.id, v.post_type, v.title, v.content, v.region, v.media_url, v.likes, now() - (v.stunden || ' hours')::interval
FROM (VALUES
  ('CHE-103.456.789', 'MATERIAL_OFFER', 'Freie Kapazität Beton C25/30 — Raum Zürich, Q4',
   'Wir haben kurzfristig rund 600 m³ Transportbeton C25/30 (Cl 0.20, Dmax 32) frei. Lieferradius Limmattal 25 km. Interessierte Bauunternehmen können einen Smart Pool starten — der aktuelle Stufenrabatt liegt bereits bei 12 %.',
   'Zürich', '/mat-lager.jpg', 34, 2),

  ('CHE-101.234.567', 'PROJECT', 'Neubau Wohnüberbauung Bern-West — Partner gesucht',
   'Baustart Frühling 2026, 42 Wohneinheiten. Wir bündeln Bewehrungsstahl B500B (rund 48 t) und suchen regionale Werke für die Sealed-Bid-Phase. Wer liefert im Raum Bern zuverlässig nach SN EN?',
   'Bern', NULL, 21, 6),

  ('CHE-105.678.901', 'ANNOUNCEMENT', 'Neue Aufbereitungslinie für RC-Kies in Betrieb',
   'Ab sofort liefern wir RC-Kies 0/32 aus eigener Aufbereitung. Erste Pools in der Ostschweiz laufen bereits.',
   'Ostschweiz', NULL, 47, 20),

  ('CHE-109.012.345', 'MATERIAL_OFFER', 'Bewehrungsstahl ab Lager Winterthur',
   'B500B in Ringen und Stäben, Baustahlmatten B500A. Zuschnitt und Biegung im Haus, Lieferung in der ganzen Deutschschweiz.',
   'Zürich', NULL, 12, 26),

  ('CHE-102.345.678', 'UPDATE', 'Rückblick auf ein starkes Quartal',
   'Über 1200 m³ Beton gebündelt, im Schnitt 13.8 % Ersparnis für die Poolteilnehmer. Danke an alle Partner in der Innerschweiz.',
   'Innerschweiz', NULL, 63, 30),

  ('CHE-108.901.234', 'QUESTION', 'Erfahrungen mit RC-Beton im Werkleitungsbau?',
   'Wir prüfen RC-Betongranulat 0/45 für Leitungsgräben. Wer hat damit gearbeitet und wie war die Verdichtbarkeit?',
   'Ostschweiz', NULL, 8, 44),

  ('CHE-107.890.123', 'MATERIAL_OFFER', 'Zement CEM II/A-LL 42.5 N — Umschlag Rheinhafen',
   'Silo- und Sackware, Abholung oder Lieferung. Für grössere Mengen lohnt sich ein Pool über die Region Nordwestschweiz.',
   'Nordwestschweiz', NULL, 19, 52),

  ('CHE-106.789.012', 'PROJECT', 'Erweiterung Gewerbehalle Aarau — Beton und Kies',
   'Fundation und Bodenplatte im Frühjahr. Wir treten dem offenen Kies-Bündel Nordwestschweiz bei und suchen noch Betonlieferanten.',
   'Nordwestschweiz', NULL, 15, 70)
) AS v(uid, post_type, title, content, region, media_url, likes, stunden)
JOIN companies c ON c.uid_number = v.uid
WHERE NOT EXISTS (SELECT 1 FROM network_posts p WHERE p.title = v.title);

-- ------------------------------------------------------------
-- 6 · Nachrichten
--
-- Ein Verlauf mit einem Werk, inklusive Verhandlungsangebot. Die zweite
-- Nachricht ist ungelesen, damit der Zähler im Kopf der Seite etwas zeigt.
-- ------------------------------------------------------------
INSERT INTO messages (sender_company_id, receiver_company_id, content,
                      is_negotiation_offer, offer_amount, read_at, created_at)
SELECT
  CASE WHEN v.von_mir THEN seed_me() ELSE c.id END,
  CASE WHEN v.von_mir THEN c.id ELSE seed_me() END,
  v.content, v.ist_angebot, v.betrag,
  CASE WHEN v.gelesen THEN now() - interval '1 hour' ELSE NULL END,
  now() - (v.minuten || ' minutes')::interval
FROM (VALUES
  (TRUE,  'Guten Tag, wir bündeln aktuell 230 m³ C25/30 im Raum Zürich. Habt ihr im Q4 noch Kapazität?', FALSE, NULL::numeric, TRUE, 260),
  (FALSE, 'Guten Tag. Ja, wir haben rund 600 m³ frei. Ab welcher Menge dürfen wir rechnen?',             FALSE, NULL::numeric, TRUE, 240),
  (TRUE,  'Stand jetzt 230 m³, bis zur Frist werden es vermutlich 300. Lieferung Limmattal.',            FALSE, NULL::numeric, TRUE, 225),
  (FALSE, 'Passt. Unser Vorschlag für 300 m³, ab Werk, exkl. MWST:',                                     TRUE,  142.50,        TRUE, 200),
  (TRUE,  'Danke. Der KBOB-Referenzpreis liegt bei 156.12 — das wären 8.7 % unter Referenz. Wir nehmen es in die Ausschreibung auf.', FALSE, NULL::numeric, TRUE, 150),
  (FALSE, 'Gerne. Sagt Bescheid, sobald die Sealed-Bid-Phase startet.',                                  FALSE, NULL::numeric, FALSE, 35)
) AS v(von_mir, content, ist_angebot, betrag, gelesen, minuten)
CROSS JOIN LATERAL (SELECT id FROM companies WHERE uid_number = 'CHE-103.456.789') c
WHERE NOT EXISTS (SELECT 1 FROM messages m WHERE m.content = v.content);

-- ------------------------------------------------------------
-- 7 · Aufräumen
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS seed_me();

-- ============================================================
-- ALLES WIEDER ENTFERNEN
-- Die folgenden Zeilen entkommentieren und ausführen. Deine eigene Firma
-- und deine echten Daten bleiben dabei stehen.
-- ============================================================
-- DELETE FROM messages
--   WHERE sender_company_id   IN (SELECT id FROM companies WHERE clerk_user_id LIKE 'seed-%')
--      OR receiver_company_id IN (SELECT id FROM companies WHERE clerk_user_id LIKE 'seed-%');
-- DELETE FROM network_posts
--   WHERE company_id IN (SELECT id FROM companies WHERE clerk_user_id LIKE 'seed-%');
-- DELETE FROM bundle_participations
--   WHERE bundle_id IN (SELECT id FROM bundles WHERE title IN (
--     'Beton C25/30 · Raum Zürich', 'Bewehrungsstahl B500B · Bern',
--     'Koffer-/Wandkies 0/45 · Nordwestschweiz', 'Transportbeton C30/37 · Innerschweiz'));
-- DELETE FROM bundles WHERE title IN (
--   'Beton C25/30 · Raum Zürich', 'Bewehrungsstahl B500B · Bern',
--   'Koffer-/Wandkies 0/45 · Nordwestschweiz', 'Transportbeton C30/37 · Innerschweiz');
-- DELETE FROM connections
--   WHERE company_id_a IN (SELECT id FROM companies WHERE clerk_user_id LIKE 'seed-%')
--      OR company_id_b IN (SELECT id FROM companies WHERE clerk_user_id LIKE 'seed-%');
-- DELETE FROM companies WHERE clerk_user_id LIKE 'seed-%';
