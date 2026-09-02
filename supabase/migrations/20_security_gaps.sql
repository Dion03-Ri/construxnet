-- ============================================================
-- Obtanet — Migration 20: Lücken aus dem vollständigen Sicherheits-Durchgang
--
-- Drei Befunde, alle mit realer Wirkung. Ohne diese Migration ist die
-- Datenbank an drei Stellen offen, unabhängig davon, was die Oberfläche
-- zulässt: PostgREST stellt jede Tabelle im Schema `public` direkt zur
-- Verfügung, und der öffentliche Schlüssel steckt im Browser-Bundle.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Zwei Tabellen ohne jeden Schutz
--
-- delivery_notes und gap_closer_alerts stammen aus dem ersten Schema und
-- bekamen nie RLS. Ohne RLS darf in Supabase jeder mit dem öffentlichen
-- Schlüssel lesen UND schreiben — also das ganze Internet.
--
-- delivery_notes trägt Liefermengen, Preise und Provisionsbeträge;
-- gap_closer_alerts verrät, welche Bündel kurz vor einer Schwelle stehen
-- und welche Lieferanten angesprochen wurden. Beides gehört niemandem
-- ausser den Beteiligten.
--
-- Die Oberfläche nutzt beide Tabellen noch nicht. Die Regeln sind trotzdem
-- so gesetzt, wie sie später gebraucht werden, statt alles zu sperren und
-- es beim Ausbau zu vergessen.
-- ------------------------------------------------------------
ALTER TABLE delivery_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_closer_alerts  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_notes_select_involved" ON delivery_notes;
CREATE POLICY "delivery_notes_select_involved" ON delivery_notes
    FOR SELECT USING (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    );

-- Erfassen darf der Lieferant (er liefert) oder der Besteller (er prüft
-- nach). Ändern nur, wer die Zeile angelegt hat — ein Lieferschein ist ein
-- Beleg, kein Verhandlungsgegenstand.
DROP POLICY IF EXISTS "delivery_notes_insert_involved" ON delivery_notes;
CREATE POLICY "delivery_notes_insert_involved" ON delivery_notes
    FOR INSERT WITH CHECK (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    );

DROP POLICY IF EXISTS "delivery_notes_update_involved" ON delivery_notes;
CREATE POLICY "delivery_notes_update_involved" ON delivery_notes
    FOR UPDATE USING (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    ) WITH CHECK (
        buyer_company_id = current_company_id()
        OR supplier_company_id = current_company_id()
    );

-- gap_closer_alerts ist ein internes Betriebswerkzeug. Niemand aus der
-- Oberfläche hat etwas davon zu sehen oder zu schreiben; RLS ohne Regeln
-- sperrt vollständig, die Service-Rolle bleibt unberührt.
-- (Bewusst keine Policy — das ist die Regel, nicht deren Fehlen.)

-- ------------------------------------------------------------
-- 2) Bilder-Speicher: jeder durfte hochladen und überschreiben
--
-- Die bisherigen Regeln prüften ausschliesslich den Bucket-Namen. Ohne
-- Rollenangabe gilt eine Policy auch für nicht angemeldete Besucher —
-- jeder konnte also beliebige Dateien in den Bucket legen und fremde
-- Bilder überschreiben. Ein öffentlich erreichbarer Ablageort, den
-- Fremde befüllen, wird früher oder später für anderes benutzt.
--
-- Neu: nur angemeldete Firmen, und nur im eigenen Ordner. Der Pfad ist
-- bereits `<firmen-id>/<zeitstempel>.<endung>`, die Regel greift also
-- ohne Änderung an der Oberfläche.
-- ------------------------------------------------------------
UPDATE storage.buckets
   SET file_size_limit = 5242880,  -- 5 MB
       allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
 WHERE id = 'post-media';

DROP POLICY IF EXISTS "post-media public read" ON storage.objects;
CREATE POLICY "post-media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "post-media write" ON storage.objects;
CREATE POLICY "post-media write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

DROP POLICY IF EXISTS "post-media update" ON storage.objects;
CREATE POLICY "post-media update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = current_company_id()::text
  )
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

DROP POLICY IF EXISTS "post-media delete" ON storage.objects;
CREATE POLICY "post-media delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = current_company_id()::text
  );

-- ------------------------------------------------------------
-- 3) Verbindungen: die eigene Anfrage selbst annehmen
--
-- Die Update-Regel erlaubte jeder beteiligten Firma, den Status zu
-- ändern — also auch dem Anfragenden, seine eigene Anfrage auf CONNECTED
-- zu setzen. Damit liess sich eine Verbindung erzwingen, die niemand
-- bestätigt hat, samt unbegrenztem Nachrichtenversand.
--
-- Neu darf auf CONNECTED nur setzen, wer die Anfrage nicht gestellt hat.
-- Zurückziehen bleibt jedem möglich (eigene Regel für DELETE).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "connections_update_involved" ON connections;
CREATE POLICY "connections_update_involved" ON connections
    FOR UPDATE USING (
        current_company_id() IN (company_id_a, company_id_b)
    ) WITH CHECK (
        current_company_id() IN (company_id_a, company_id_b)
        AND (status <> 'CONNECTED' OR requested_by <> current_company_id())
    );
