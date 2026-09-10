-- ============================================================
-- Obtanet — Kontrolle: sitzen die Schutzmassnahmen der Migrationen 29-31?
--
-- Im Supabase-SQL-Editor ausfuehren. Liest nur, aendert nichts.
-- Sechzehn Zeilen, alle muessen "ok" sagen. Steht irgendwo "FEHLT",
-- ist die zugehoerige Migration nicht (vollstaendig) eingespielt.
--
-- Die Abfrage selbst ist gegengeprueft: mit absichtlich entfernter
-- Funktion, geloeschter Spalte und auf CASCADE zurueckgedrehtem
-- Fremdschluessel meldet sie genau diese drei als FEHLT.
-- ============================================================

WITH schluessel AS (
  SELECT c.conrelid::regclass::text || '.' || a.attname AS was,
         CASE c.confdeltype WHEN 'r' THEN 'ok' ELSE 'FEHLT' END AS stand,
         'Fremdschlüssel steht auf RESTRICT' AS soll
    FROM pg_constraint c
    JOIN unnest(c.conkey) k ON TRUE
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k
   WHERE c.contype = 'f' AND c.confrelid = 'companies'::regclass
     AND c.conrelid::regclass::text IN ('messages','direct_requests','direct_offers')
),
funktionen AS (
  SELECT f.name AS was,
         CASE WHEN to_regprocedure(f.sig) IS NULL THEN 'FEHLT' ELSE 'ok' END AS stand,
         f.zweck AS soll
    FROM (VALUES
      ('chat_threads',              'chat_threads()',                                  'Gesprächsliste, Migration 29'),
      ('chat_history',              'chat_history(uuid,timestamptz,integer)',           'Verlauf in Fenstern, Migration 29'),
      ('chat_archive',              'chat_archive(uuid,boolean)',                       'Gespräch weglegen, Migration 29'),
      ('konto_schliessen_intern',   'konto_schliessen_intern(uuid)',                    'Konto anonymisieren, Migration 30'),
      ('close_own_company_account', 'close_own_company_account()',                      'eigenes Konto schliessen, Migration 30'),
      ('hat_geschaeft_mit',         'hat_geschaeft_mit(uuid)',                          'Sichtbarkeit geschlossener Firmen, Migration 30'),
      ('laufende_bindung',          'laufende_bindung(uuid)',                           'woran eine Firma hängt, Migration 31'),
      ('meine_bindung',             'meine_bindung()',                                  'die eigene Bindung, Migration 32'),
      ('einstellung_zahl',          'einstellung_zahl(text,numeric)',                   'Sätze aus app_settings, Migration 35'),
      ('mindestgebot',              'mindestgebot(uuid)',                               'Mindestgebot je Bündel, Migration 35'),
      ('mengenkurve',               'mengenkurve(uuid)',                                'Menge über die Monate, Migration 36'),
      ('submit_demand',             'submit_demand(text,text,text,text,text,text,numeric,numeric,uuid,date,date,integer)', 'Bedarf mit Baustelle und Zeitraum, Migration 36')
    ) AS f(name, sig, zweck)
),
spalten AS (
  SELECT 'companies.closed_at' AS was,
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_name='companies' AND column_name='closed_at')
              THEN 'ok' ELSE 'FEHLT' END AS stand,
         'Merkmal für geschlossene Konten, Migration 30' AS soll
  UNION ALL
  SELECT 'bundles.completed_at',
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_name='bundles' AND column_name='completed_at')
              THEN 'ok' ELSE 'FEHLT' END,
         'Schlusspunkt eines Bündels, Migration 31'
  UNION ALL
  SELECT 'chat_thread_prefs',
         CASE WHEN to_regclass('public.chat_thread_prefs') IS NULL THEN 'FEHLT' ELSE 'ok' END,
         'Archiv-Vermerke, Migration 29'
  UNION ALL
  SELECT 'bundles.provision_chf',
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_name='bundles' AND column_name='provision_chf')
              THEN 'ok' ELSE 'FEHLT' END,
         'Provision beim Zuschlag eingefroren, Migration 35'
  UNION ALL
  SELECT 'bundle_participations.liefer_von',
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_name='bundle_participations'
                              AND column_name='liefer_von' AND is_nullable='NO')
              THEN 'ok' ELSE 'FEHLT' END,
         'Lieferzeitraum je Teilnahme, Migration 36'
  UNION ALL
  SELECT 'bundle_participations.project_id',
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_name='bundle_participations'
                              AND column_name='project_id' AND is_nullable='NO')
              THEN 'ok' ELSE 'FEHLT' END,
         'Baustelle ist Pflicht, Migration 36'
),
austritt AS (
  SELECT 'withdraw_demand: Phasenprüfung' AS was,
         CASE WHEN pg_get_functiondef('withdraw_demand(uuid)'::regprocedure) LIKE '%Sammelphase%'
              THEN 'ok' ELSE 'FEHLT' END AS stand,
         'Austritt nur in der Sammelphase, Migration 31' AS soll
),
rechte AS (
  SELECT 'laufende_bindung: nicht für den Browser' AS was,
         CASE WHEN to_regprocedure('laufende_bindung(uuid)') IS NULL THEN 'FEHLT'
              WHEN has_function_privilege('authenticated', 'laufende_bindung(uuid)', 'EXECUTE')
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'fremde Firmen nicht abfragbar, Migration 32' AS soll
)
SELECT stand, was, soll FROM schluessel
UNION ALL SELECT stand, was, soll FROM funktionen
UNION ALL SELECT stand, was, soll FROM spalten
UNION ALL SELECT stand, was, soll FROM austritt
UNION ALL SELECT stand, was, soll FROM rechte
ORDER BY stand DESC, was;
