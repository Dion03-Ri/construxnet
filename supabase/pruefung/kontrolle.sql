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
      ('submit_demand',             'submit_demand(text,text,text,text,text,text,numeric,numeric,uuid,date,date,integer)', 'Bedarf mit Baustelle und Zeitraum, Migration 36'),
      ('bietfaehig',                'bietfaehig(uuid)',                                 'Bietfähigkeit als Rechnung, Migration 37'),
      ('meine_bietfaehigkeit',      'meine_bietfaehigkeit()',                           'die eigene Bietfähigkeit, Migration 37'),
      ('lieferantenkonto_beantragen','lieferantenkonto_beantragen(text,text[],text)',   'Zulassung beantragen, Migration 37'),
      ('kapazitaet_pruefen',        'kapazitaet_pruefen(uuid,uuid)',                    'Kapazität je Monat, Migration 38'),
      ('kapazitaet_setzen',         'kapazitaet_setzen(text,date,date,numeric,text)',   'Lieferprofil setzen, Migration 39'),
      ('meine_zuschlaege',          'meine_zuschlaege()',                               'gewonnene Bündel, Migration 39'),
      ('zuschlag_baustellen',       'zuschlag_baustellen(uuid)',                        'Adressen nur für den Gewinner, Migration 39'),
      ('withdraw_demand je Baustelle','withdraw_demand(uuid,uuid)',                     'Austritt je Baustelle, Migration 40'),
      ('bundle_zuteilen',           'bundle_zuteilen(uuid)',                            'Zuteilung ganzer Baustellen, Migration 42'),
      ('baustelle_kurve',           'baustelle_kurve(uuid)',                            'Menge einer Baustelle je Monat, Migration 42')
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
  -- `'zuteilungen'::regclass` wirft, wenn die Tabelle fehlt — und zwar
  -- BEVOR das CASE greift: PostgreSQL wertet den Cast beim Planen aus.
  -- Genau daran ist die Abfrage beim Auftraggeber abgebrochen, solange
  -- Migration 42 noch nicht eingespielt war. Eine Kontrollabfrage, die
  -- bei einer fehlenden Migration abstürzt statt FEHLT zu melden, ist
  -- genau dann nutzlos, wenn man sie braucht. Deshalb über den Katalog
  -- statt über den Cast.
  SELECT 'zuteilungen: eine Baustelle, ein Werk',
         CASE WHEN EXISTS (
                SELECT 1 FROM pg_constraint c
                  JOIN pg_class t ON t.oid = c.conrelid
                  JOIN pg_namespace n ON n.oid = t.relnamespace
                 WHERE n.nspname = 'public' AND t.relname = 'zuteilungen'
                   AND c.contype = 'u')
              THEN 'ok' ELSE 'FEHLT' END,
         'eine Baustelle kann nicht zwei Werke bekommen, Migration 42'
  UNION ALL
  SELECT 'bundle_participations.project_id',
         CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_name='bundle_participations'
                              AND column_name='project_id' AND is_nullable='NO')
              THEN 'ok' ELSE 'FEHLT' END,
         'Baustelle ist Pflicht, Migration 36'
),
austritt AS (
  -- `::regprocedure` wirft bei fehlender Funktion, statt NULL zu liefern.
  -- `to_regprocedure` gibt NULL zurück — und nur wenn dabei etwas
  -- herauskommt, wird der Rumpf überhaupt geholt.
  SELECT 'withdraw_demand: Phasenprüfung' AS was,
         CASE WHEN to_regprocedure('withdraw_demand(uuid,uuid)') IS NULL THEN 'FEHLT'
              WHEN pg_get_functiondef(to_regprocedure('withdraw_demand(uuid,uuid)'))
                   LIKE '%Sammelphase%'
              THEN 'ok' ELSE 'FEHLT' END AS stand,
         'Austritt nur in der Sammelphase, Migration 31' AS soll
),
rechte AS (
  -- Die vier Regeln aus Migration 01 lasen `companies.clerk_user_id`, das
  -- seit Migration 19 gesperrt ist. Sie schlugen mit „permission denied"
  -- fehl, statt keine Zeilen zu liefern. Migration 41 hat sie ersetzt;
  -- diese Prüfung sorgt dafür, dass sie nicht zurückkommen.
  SELECT 'Zeilenregeln ohne clerk_user_id' AS was,
         CASE WHEN EXISTS (
                SELECT 1 FROM pg_policies
                 WHERE schemaname = 'public'
                   AND tablename IN ('bundle_participations','sia_contracts',
                                     'subscriptions','supplier_bids')
                   AND COALESCE(qual, '') LIKE '%clerk_user_id%')
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'eigene Zeilen wieder lesbar, Migration 41' AS soll
  UNION ALL
  SELECT 'lieferantenkonto_entscheiden: nur Dienstweg' AS was,
         CASE WHEN to_regprocedure('lieferantenkonto_entscheiden(uuid,text,text,text)') IS NULL THEN 'FEHLT'
              WHEN has_function_privilege('authenticated',
                     to_regprocedure('lieferantenkonto_entscheiden(uuid,text,text,text)'),
                     'EXECUTE')
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'niemand lässt sich selbst zu, Migration 37' AS soll
  UNION ALL
  -- Auch hier: `has_table_privilege` wirft bei fehlender Tabelle. Das
  -- CASE schützt davor NICHT, weil beide Zweige geplant werden. Über den
  -- Katalog gehen und den Rechtetest nur dann stellen.
  SELECT 'lieferantenkonten: kein Schreibrecht',
         CASE WHEN to_regclass('public.lieferantenkonten') IS NULL THEN 'FEHLT'
              WHEN has_table_privilege('authenticated',
                     COALESCE(to_regclass('public.lieferantenkonten'),
                              'app_settings'::regclass), 'UPDATE')
              THEN 'FEHLT' ELSE 'ok' END,
         'Status nur über Funktionen, Migration 37'
  UNION ALL
  SELECT 'laufende_bindung: nicht für den Browser' AS was,
         CASE WHEN to_regprocedure('laufende_bindung(uuid)') IS NULL THEN 'FEHLT'
              WHEN has_function_privilege('authenticated',
                     to_regprocedure('laufende_bindung(uuid)'), 'EXECUTE')
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'fremde Firmen nicht abfragbar, Migration 32' AS soll
),

-- ---------------------------------------------------------------------------
-- Die Rabattstaffel (Migration 43)
--
-- Sie stand bis zuletzt an drei Stellen im Quelltext und einmal in der
-- Datenbank, alle vier mit anderen Zahlen. Jetzt gibt es nur noch die
-- Tabelle. Die Prüfungen hier fragen deshalb nicht „stimmen die Zahlen",
-- sondern: ist die Tabelle da, ist sie lesbar, ist sie schreibgeschützt,
-- und rechnen die Funktionen darauf.
-- ---------------------------------------------------------------------------
staffel AS (
  SELECT 'rabattstufen: Tabelle vorhanden' AS was,
         CASE WHEN to_regclass('public.rabattstufen') IS NULL
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'einzige Quelle der Staffel, Migration 43' AS soll
  UNION ALL
  SELECT 'rabattstufen: öffentlich lesbar' AS was,
         CASE WHEN to_regclass('public.rabattstufen') IS NULL THEN 'FEHLT'
              WHEN has_table_privilege('anon',
                     COALESCE(to_regclass('public.rabattstufen'),
                              'app_settings'::regclass), 'SELECT')
              THEN 'ok' ELSE 'FEHLT' END AS stand,
         'eine Garantie, die man nicht nachschlagen kann, ist keine' AS soll
  UNION ALL
  SELECT 'rabattstufen: kein Schreibrecht' AS was,
         CASE WHEN to_regclass('public.rabattstufen') IS NULL THEN 'FEHLT'
              WHEN has_table_privilege('authenticated',
                     COALESCE(to_regclass('public.rabattstufen'),
                              'app_settings'::regclass), 'UPDATE')
                OR has_table_privilege('authenticated',
                     COALESCE(to_regclass('public.rabattstufen'),
                              'app_settings'::regclass), 'INSERT')
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'niemand staffelt sich seinen eigenen Rabatt' AS soll
  UNION ALL
  -- Ohne Zeilen kann keine Kategorie gebündelt werden. Eine leere Tabelle
  -- wäre technisch heil und fachlich tot.
  SELECT 'rabattstufen: Staffel befüllt' AS was,
         CASE WHEN to_regclass('public.rabattstufen') IS NULL THEN 'FEHLT'
              WHEN (SELECT count(*) FROM rabattstufen) = 0 THEN 'FEHLT'
              ELSE 'ok' END AS stand,
         'mindestens eine bündelbare Kategorie' AS soll
  UNION ALL
  -- Kein Auffangeintrag ohne Kategorie: eine Kategorie ohne eigene Zeilen
  -- darf NICHT stillschweigend einen Rabatt erben.
  SELECT 'rabattstufen: kein blinder Auffangwert' AS was,
         CASE WHEN to_regclass('public.rabattstufen') IS NULL THEN 'FEHLT'
              WHEN EXISTS (SELECT 1 FROM rabattstufen
                            WHERE material_category IS NULL
                               OR btrim(material_category) = '')
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'nicht gestaffelt heisst nicht bündelbar' AS soll
  UNION ALL
  SELECT 'mein_mindestrabatt vorhanden' AS was,
         CASE WHEN to_regprocedure('mein_mindestrabatt(text,numeric)') IS NULL
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'Garantie je Firma und Kategorie, Migration 43' AS soll
  UNION ALL
  SELECT 'kategorie_buendelbar vorhanden' AS was,
         CASE WHEN to_regprocedure('kategorie_buendelbar(text)') IS NULL
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'Bedarf ohne Staffel wird abgewiesen, Migration 43' AS soll
  UNION ALL
  SELECT 'bundle_mindestrabatt vorhanden' AS was,
         CASE WHEN to_regprocedure('bundle_mindestrabatt(uuid)') IS NULL
              THEN 'FEHLT' ELSE 'ok' END AS stand,
         'Schwelle = höchster individueller Anspruch, Migration 43' AS soll
)
SELECT stand, was, soll FROM schluessel
UNION ALL SELECT stand, was, soll FROM funktionen
UNION ALL SELECT stand, was, soll FROM spalten
UNION ALL SELECT stand, was, soll FROM austritt
UNION ALL SELECT stand, was, soll FROM rechte
UNION ALL SELECT stand, was, soll FROM staffel
ORDER BY stand DESC, was;
