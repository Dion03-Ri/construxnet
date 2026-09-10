-- ============================================================
-- Obtanet — Migration 33: Verbindungsanfragen kommen live an
--
-- Der Auftraggeber hat von einem Konto aus eine Anfrage gestellt und beim
-- anderen kam nichts an — kein Zeichen, keine Meldung. Ein Teil davon lag
-- in der Oberfläche (die Anfrage fiel aus der Liste, wenn die anfragende
-- Firma nicht im geladenen Verzeichnis stand). Der andere Teil liegt hier:
-- in der Realtime-Publikation stand bisher NUR `messages`. Der Chat kam
-- also live an, alles andere erst nach einem Neuladen der Seite.
--
-- Aufgenommen werden:
--
--   connections — damit eine Anfrage, eine Annahme und eine Verbindung
--                 sofort auf der Gegenseite erscheinen.
--
--   companies   — damit eine Firma, die sich gerade erst angemeldet hat,
--                 sofort im Verzeichnis auftaucht. Das Verzeichnis ist
--                 bewusst offen; hier wird nichts sichtbar, was nicht
--                 ohnehin für alle lesbar wäre.
--
-- Die Zeilenregeln gelten weiter: Supabase prüft jedes Ereignis gegen die
-- Regel des Zuhörers. Bei `connections` heisst das, dass nur die beiden
-- beteiligten Firmen etwas bekommen.
--
-- KEIN `REPLICA IDENTITY FULL` auf `connections`, und das ist Absicht.
-- Für gelöschte Zeilen prüft Supabase keine Zeilenregel — ein DELETE geht
-- an jeden Zuhörer. Mit voller Replica-Identität stünden darin beide
-- Firmen-IDs, und damit wüsste jeder Mitlesende, wer sich von wem getrennt
-- hat. So trägt ein DELETE nur den Primärschlüssel und sagt niemandem
-- etwas. Die Oberfläche hört deshalb nur auf INSERT und UPDATE und holt
-- den Stand zusätzlich, wenn der Tab zurückgeholt wird.
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = 'connections'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE connections;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = 'companies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE companies;
    END IF;
END
$$;
