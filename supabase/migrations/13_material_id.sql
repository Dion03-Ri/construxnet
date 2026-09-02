-- ============================================================
-- Obtanet — Migration 13: Materialnummer auf Anfragen
--
-- Materialien haben ab sofort eine feste Nummer nach dem Muster
-- OB-<Kategorie>-<laufende Nummer>, also z. B. OB-BET-001 für Beton
-- C25/30. Sie ist die Kennung, die auf Anfragen, Angeboten und
-- Bestellungen steht — kurz genug fürs Telefon, eindeutig genug für die
-- Buchhaltung.
--
-- Bisher stand in der Anfrage nur der interne Schlüssel (material_key).
-- Der ist ein Implementierungsdetail und darf sich ändern; die Nummer
-- darf das nicht. Deshalb wird sie mitgeschrieben und nicht nachträglich
-- aus dem Katalog abgeleitet: eine alte Anfrage soll die Nummer zeigen,
-- die zum Zeitpunkt der Anfrage galt.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE direct_requests
    ADD COLUMN IF NOT EXISTS material_id TEXT;

COMMENT ON COLUMN direct_requests.material_id IS
    'Obtanet-Materialnummer zum Zeitpunkt der Anfrage, z. B. OB-BET-001.';

CREATE INDEX IF NOT EXISTS direct_requests_material_id_idx
    ON direct_requests (material_id);

-- Bestandsdaten: Anfragen von vor dieser Migration haben keine Nummer.
-- Sie bleiben leer statt geraten zu werden — eine falsch zugeordnete
-- Nummer wäre schlimmer als gar keine. Die Oberfläche zeigt dort den
-- Materialnamen allein.
