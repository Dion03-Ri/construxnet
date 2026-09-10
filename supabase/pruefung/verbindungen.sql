-- Verbindungsanfragen nachsehen. Liest nur, ändert nichts.
-- Im Supabase-SQL-Editor ausführen (der läuft als Eigentümer, sieht also
-- alles — anders als der Browser, für den die Zeilenregeln gelten).

-- 1) Welche Firmen gibt es überhaupt, und seit wann?
SELECT company_name, role, canton, city, uid_number,
       closed_at IS NOT NULL AS geschlossen,
       created_at
  FROM companies
 ORDER BY created_at DESC
 LIMIT 20;

-- 2) Alle Anfragen und Verbindungen im Klartext.
--    „von" hat die Anfrage gestellt, „an" muss sie annehmen.
SELECT c.status,
       v.company_name AS von,
       n.company_name AS an,
       c.created_at
  FROM connections c
  JOIN companies v ON v.id = c.requested_by
  JOIN companies n ON n.id = CASE WHEN c.company_id_a = c.requested_by
                                  THEN c.company_id_b ELSE c.company_id_a END
 ORDER BY c.created_at DESC
 LIMIT 30;

-- 3) Steht die Tabelle in der Realtime-Publikation? (Migration 33)
--    Ohne diese beiden Zeilen kommt nichts live an.
SELECT tablename AS live_tabelle
  FROM pg_publication_tables
 WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
 ORDER BY tablename;
