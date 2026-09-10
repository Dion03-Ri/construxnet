-- ============================================================
-- Obtanet — Migration 34: Der Rest kommt auch live an
--
-- Migration 33 hat `connections` und `companies` in die Publikation
-- genommen. Der Auftraggeber hat danach klargestellt, was er meint:
-- Anfragen, Standorte, Nachrichten — alles soll ankommen, ohne dass
-- jemand die Seite neu lädt. Also kommen die übrigen Tabellen dazu, aus
-- denen die Glocke ihre Meldungen zieht:
--
--   direct_requests, direct_offers   — Materialanfrage und Angebot
--   bundle_participations            — wer einem Bündel beitritt
--   bundles                          — Frist, Zuschlag, Schlusspunkt
--
-- `companies` deckt die Standorte bereits ab: die Zustimmung zur Karte
-- und die Koordinaten sind ein UPDATE auf dieser Tabelle.
--
-- Es gilt dasselbe wie in Migration 33, und aus demselben Grund:
--
--   KEIN `REPLICA IDENTITY FULL`. Für gelöschte Zeilen prüft Supabase
--   keine Zeilenregel — ein DELETE-Ereignis geht an jeden Zuhörer. Ohne
--   volle Replica-Identität trägt es nur den Primärschlüssel und verrät
--   nichts. Die Oberfläche hört deshalb nur auf INSERT und UPDATE
--   (`lib/live.ts`) und holt den Stand zusätzlich, wenn der Tab
--   zurückgeholt wird.
--
--   Die Zeilenregeln gelten weiter. Supabase prüft jedes Ereignis gegen
--   die Regel des Zuhörers — bei `direct_offers` heisst das, dass ein
--   verdecktes Gebot verdeckt bleibt.
-- ============================================================

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['direct_requests', 'direct_offers', 'bundle_participations', 'bundles']
    LOOP
        IF to_regclass('public.' || t) IS NULL THEN
            CONTINUE;                       -- Tabelle gibt es (noch) nicht
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
             WHERE pubname = 'supabase_realtime'
               AND schemaname = 'public'
               AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        END IF;
    END LOOP;
END
$$;
