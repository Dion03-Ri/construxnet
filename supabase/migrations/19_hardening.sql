-- ============================================================
-- Obtanet — Migration 19: Sicherheits-Durchgang
--
-- Vier Befunde aus einer Durchsicht des bestehenden Codes. Keine neuen
-- Funktionen, nur Absicherung dessen, was schon läuft.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1) search_path für alle SECURITY-DEFINER-Funktionen
--
-- Eine solche Funktion läuft mit den Rechten ihres Eigentümers. Ohne
-- festen search_path kann ein Aufrufer eigene Objekte in ein Schema
-- legen, das vor `public` durchsucht wird, und damit fremden Code unter
-- diesen erhöhten Rechten ausführen lassen. Das ist der klassische
-- Postgres-Angriffsweg; Supabase warnt in seiner eigenen Prüfung davor.
--
-- Als ALTER statt Neuanlage, damit die Funktionskörper unangetastet
-- bleiben — weniger Fläche für Fehler.
-- ------------------------------------------------------------
ALTER FUNCTION advance_due_bundles()            SET search_path = public, pg_temp;
ALTER FUNCTION award_bundle(UUID)               SET search_path = public, pg_temp;
ALTER FUNCTION bundle_recalc(UUID)              SET search_path = public, pg_temp;
ALTER FUNCTION direct_request_mark_offered()    SET search_path = public, pg_temp;
ALTER FUNCTION mark_notifications_seen()        SET search_path = public, pg_temp;
ALTER FUNCTION material_alias_hit(TEXT)         SET search_path = public, pg_temp;
ALTER FUNCTION next_material_id(TEXT)           SET search_path = public, pg_temp;
ALTER FUNCTION place_bid(UUID, NUMERIC, NUMERIC) SET search_path = public, pg_temp;
ALTER FUNCTION withdraw_demand(UUID)            SET search_path = public, pg_temp;
ALTER FUNCTION submit_demand(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, UUID, INT)
                                                SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 2) current_company_id() als SECURITY DEFINER
--
-- Die Funktion liest companies.clerk_user_id. Unter Punkt 4 wird der
-- Lesezugriff auf diese Spalte entzogen — die Funktion muss sie danach
-- trotzdem lesen können, sonst greift keine einzige RLS-Regel mehr.
--
-- Zusätzlich wird sie damit von der Oberfläche aufrufbar. Bisher suchte
-- jede Komponente ihre eigene Firma über `.eq("clerk_user_id", userId)`,
-- was nur funktionierte, solange die Spalte für alle lesbar war.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_company_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub'
$$;

-- ------------------------------------------------------------
-- 3) Bündel-Teilnahmen: die Schreibregeln aus Migration 16 zurücknehmen
--
-- Sie waren überflüssig und offen zugleich: submit_demand() ist
-- SECURITY DEFINER und umgeht RLS ohnehin. Die Regeln erlaubten aber
-- jedem Bauunternehmen, sich mit beliebiger Menge direkt in ein
-- beliebiges Bündel einzutragen und damit dessen Rabattstufe zu
-- verschieben — ohne dass die Kennzahlen neu gerechnet werden.
--
-- Geschrieben wird ab jetzt ausschliesslich über die Funktionen.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "bundle_participations_insert_own" ON bundle_participations;
DROP POLICY IF EXISTS "bundle_participations_update_own" ON bundle_participations;

-- ------------------------------------------------------------
-- 4) Direktanfragen: unveränderliche Felder sperren
--
-- Die Update-Regel erlaubt beiden Seiten, die Zeile zu ändern — nötig,
-- damit Besteller annehmen und Lieferant ablehnen kann. RLS kennt aber
-- keine Spalten-Ebene: damit konnte der Lieferant auch Menge und
-- KBOB-Referenzpreis überschreiben und sein eigenes Angebot im Nachhinein
-- besser aussehen lassen.
--
-- Der Referenzpreis wird genau deshalb bei der Anfrage festgehalten. Wenn
-- er sich nachträglich ändern lässt, ist der ganze Vergleich wertlos.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION direct_requests_lock_terms() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF NEW.buyer_company_id     IS DISTINCT FROM OLD.buyer_company_id
    OR NEW.supplier_company_id  IS DISTINCT FROM OLD.supplier_company_id
    OR NEW.material_id          IS DISTINCT FROM OLD.material_id
    OR NEW.material_key         IS DISTINCT FROM OLD.material_key
    OR NEW.quantity             IS DISTINCT FROM OLD.quantity
    OR NEW.unit                 IS DISTINCT FROM OLD.unit
    OR NEW.kbob_reference_price IS DISTINCT FROM OLD.kbob_reference_price
    THEN
        RAISE EXCEPTION 'Material, Menge und Referenzpreis einer Anfrage sind nach dem Absenden unveränderlich.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS direct_requests_lock ON direct_requests;
CREATE TRIGGER direct_requests_lock BEFORE UPDATE ON direct_requests
    FOR EACH ROW EXECUTE FUNCTION direct_requests_lock_terms();

-- Dasselbe für Gebote: angenommen/abgelehnt darf sich ändern, der Preis
-- nicht. Ein nachgebessertes Angebot ist ein neues, kein geändertes.
CREATE OR REPLACE FUNCTION direct_offers_lock_price() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF NEW.unit_price IS DISTINCT FROM OLD.unit_price
    OR NEW.request_id IS DISTINCT FROM OLD.request_id
    OR NEW.supplier_company_id IS DISTINCT FROM OLD.supplier_company_id
    THEN
        RAISE EXCEPTION 'Der Preis eines abgegebenen Angebots ist unveränderlich. Ein besseres Angebot wird neu abgegeben.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS direct_offers_lock ON direct_offers;
CREATE TRIGGER direct_offers_lock BEFORE UPDATE ON direct_offers
    FOR EACH ROW EXECUTE FUNCTION direct_offers_lock_price();

-- ------------------------------------------------------------
-- 5) clerk_user_id nicht mehr öffentlich lesbar
--
-- Das Firmenverzeichnis ist absichtlich offen — Name, Ort, Sortiment und
-- Kontaktdaten stehen dort, damit man Lieferanten findet. Die Clerk-ID
-- gehört nicht dazu: sie verknüpft eine Firma mit einem konkreten
-- Benutzerkonto und hat in der Oberfläche nichts zu suchen.
--
-- RLS kennt keine Spalten-Ebene, Rechte schon. Nach diesem Entzug findet
-- die Oberfläche ihre eigene Firma über current_company_id().
-- ------------------------------------------------------------
REVOKE SELECT (clerk_user_id) ON companies FROM anon, authenticated;

-- ------------------------------------------------------------
-- 6) Weiterschalten unter Sperre
--
-- advance_due_bundles() wird beim Laden aufgerufen — also potenziell von
-- mehreren Nutzern gleichzeitig. Ohne Sperre greifen zwei Aufrufe
-- dasselbe fällige Bündel und vergeben womöglich zweimal den Zuschlag.
--
-- FOR UPDATE SKIP LOCKED: wer zuerst da ist, macht es; die anderen gehen
-- weiter, statt zu warten. Das ist hier richtig, weil es keine Rolle
-- spielt, welcher Aufruf ein Bündel weiterschaltet — nur dass es genau
-- einmal geschieht.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION advance_due_bundles() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_row     RECORD;
    v_changed INTEGER := 0;
BEGIN
    FOR v_row IN
        SELECT id, participant_count, min_participants_for_bidding
          FROM bundles
         WHERE status = 'OPEN' AND deadline < NOW()
           FOR UPDATE SKIP LOCKED
    LOOP
        IF v_row.participant_count >= v_row.min_participants_for_bidding THEN
            UPDATE bundles
               SET status = 'SEALED_BIDDING',
                   bid_deadline = NOW() + INTERVAL '7 days'
             WHERE id = v_row.id;
        ELSE
            UPDATE bundles
               SET status = 'FAILED',
                   failed_reason = 'Zu wenige Teilnehmer bis zum Fristende — '
                       || v_row.participant_count || ' von '
                       || v_row.min_participants_for_bidding || ' nötig.'
             WHERE id = v_row.id;
        END IF;
        v_changed := v_changed + 1;
    END LOOP;

    FOR v_row IN
        SELECT id FROM bundles
         WHERE status = 'SEALED_BIDDING'
           AND bid_deadline IS NOT NULL
           AND bid_deadline < NOW()
           FOR UPDATE SKIP LOCKED
    LOOP
        PERFORM award_bundle(v_row.id);
        v_changed := v_changed + 1;
    END LOOP;

    RETURN v_changed;
END;
$$;
