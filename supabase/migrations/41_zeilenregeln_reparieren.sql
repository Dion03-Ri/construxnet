-- ============================================================
-- Obtanet — Migration 41: Vier Zeilenregeln, die niemand mehr erfüllen kann
--
-- BEIM DURCHSEHEN GEFUNDEN, und es ist ein Fehler in der laufenden Seite.
--
-- Vier Regeln aus Migration 01 prüfen die eigene Firma so:
--
--     buyer_company_id IN (SELECT id FROM companies
--                           WHERE clerk_user_id = auth.jwt() ->> 'sub')
--
-- Zeilenregeln werden mit den Rechten des AUFRUFERS ausgewertet. Migration
-- 19 hat `clerk_user_id` aus gutem Grund gesperrt (`REVOKE SELECT
-- (clerk_user_id)`), Migration 23 dann `companies` ganz und nur einzelne
-- Spalten wieder freigegeben. Seither kann diese Unterabfrage niemand mehr
-- ausführen — und die Regel schlägt nicht etwa auf „keine Zeilen" um,
-- sondern mit `permission denied for table companies` fehl.
--
-- Betroffen, nachgestellt als angemeldete Firma:
--
--     bundle_participations   permission denied
--     sia_contracts           permission denied
--     subscriptions           permission denied
--     supplier_bids           permission denied
--
-- Warum das nie jemandem aufgefallen ist: Die Anwendung liest das meiste
-- über SECURITY-DEFINER-Funktionen (`subscription_mine`, `chat_history`,
-- …), die davon nicht betroffen sind. Und wo sie doch direkt liest,
-- verschluckt sie den Fehler — `(data ?? [])` macht aus einer Absage eine
-- leere Liste. Auf `/pools` blieb deshalb „Meine" leer und die eigene
-- Menge unsichtbar, ohne dass irgendwo etwas rot wurde.
--
-- Die Reparatur ist überall dieselbe: `current_company_id()`. Die Funktion
-- ist SECURITY DEFINER, liest `clerk_user_id` mit den Rechten ihres
-- Eigentümers und braucht vom Aufrufer gar nichts. Genau dafür gibt es
-- sie — die vier Regeln hier sind nur nie mitgezogen worden.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Teilnahmen: nur die eigenen
--
-- Nie die anderer Firmen im selben Bündel — daran hängt die k-Anonymität,
-- die verhindert, dass ein Werk aus der Teilnehmerliste die Mengen
-- zurückrechnet.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Buyers see only own participation" ON bundle_participations;
DROP POLICY IF EXISTS "bundle_participations_select_own" ON bundle_participations;
CREATE POLICY "bundle_participations_select_own" ON bundle_participations
    FOR SELECT USING (buyer_company_id = current_company_id());

-- ------------------------------------------------------------
-- 2) Verträge: nur die beiden beteiligten Parteien
--
-- Sie enthalten Klartext-Firmendaten beider Seiten.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Contract parties only" ON sia_contracts;
DROP POLICY IF EXISTS "sia_contracts_select_parties" ON sia_contracts;
CREATE POLICY "sia_contracts_select_parties" ON sia_contracts
    FOR SELECT USING (
        current_company_id() IN (buyer_company_id, supplier_company_id)
    );

-- ------------------------------------------------------------
-- 3) Abo: das eigene
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Eigenes Abo lesen" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT USING (company_id = current_company_id());

-- ------------------------------------------------------------
-- 4) Gebote: nur die eigenen
--
-- Fremde Gebote sieht niemand, auch nach dem Zuschlag nicht. Ohne diese
-- Regel wäre die verdeckte Ausschreibung keine.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Suppliers see only own bids" ON supplier_bids;
DROP POLICY IF EXISTS "supplier_bids_select_own" ON supplier_bids;
CREATE POLICY "supplier_bids_select_own" ON supplier_bids
    FOR SELECT USING (supplier_company_id = current_company_id());

-- ------------------------------------------------------------
-- 5) Und die Regel auf `companies` gleich mit
--
-- Sie ist nicht kaputt, weil `companies_select_public` daneben steht und
-- Regeln geodert werden. Aber sie steht als zweite, tote Regel im Weg und
-- führt beim nächsten Umbau jemanden in die Irre.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Own company row only" ON companies;
