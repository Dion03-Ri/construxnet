-- ============================================================
-- Obtanet — Migration 03: Firmen-Directory
--
-- Für die LinkedIn-artige Vernetzung müssen Firmenprofile im Netzwerk
-- auffindbar sein (Directory /network + Auflösung der Post-Autoren im Feed).
-- Die WEKO-/Pool-Anonymität bleibt davon unberührt — sie sitzt auf
-- bundle_participations (Käufer sehen nur eigene Teilnahmen), nicht auf
-- den öffentlichen Firmenprofilen.
--
-- Ergänzt eine permissive SELECT-Policy (wird mit der bestehenden
-- "Own company row only" per OR verknüpft). Idempotent.
-- ============================================================

DROP POLICY IF EXISTS "companies_select_public" ON companies;
CREATE POLICY "companies_select_public" ON companies
    FOR SELECT USING (true);
