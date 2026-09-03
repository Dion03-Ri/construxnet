-- ============================================================
-- Obtanet — Migration 23: Kontaktdaten nur für Verbundene
--
-- E-Mail, Telefon, Adresse und Website standen bisher jeder angemeldeten
-- Firma offen — sie liegen in `companies`, und `companies` ist für alle
-- Angemeldeten lesbar. Sie im Frontend auszublenden hätte nichts gebracht:
-- ein Aufruf der API hätte sie weiter geliefert.
--
-- Darum wird die Freigabe auf Spaltenebene neu gesetzt und der Zugriff auf
-- die Kontaktfelder läuft über eine Funktion, die prüft, ob eine bestätigte
-- Verbindung besteht.
--
-- WICHTIG (Postgres-Eigenheit): eine Freigabe auf Tabellenebene lässt sich
-- nicht durch REVOKE einzelner Spalten einschränken — der Entzug ginge ins
-- Leere. Deshalb wird die Tabellen-Freigabe zuerst ganz entzogen und dann
-- spaltenweise neu erteilt. Aus demselben Grund greift auch der Entzug von
-- `clerk_user_id` aus Migration 19 erst mit dieser Migration wirklich.
--
-- Folge fürs Weiterbauen: eine NEUE Spalte auf `companies` ist erst lesbar,
-- wenn sie unten in die Liste aufgenommen wird. Das ist Absicht — privat als
-- Vorgabe —, muss man aber wissen.
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- 1) Freigabe neu setzen: nur noch das, was jede Firma sehen darf.
REVOKE SELECT ON companies FROM anon;
REVOKE SELECT ON companies FROM authenticated;

GRANT SELECT (
    id,
    company_name,
    uid_number,
    role,
    created_at,
    canton,
    city,
    verified,
    logo_url,
    bio,
    about,
    supply_materials,
    supply_regions,
    delivery_radius_km,
    capacity_note,
    show_on_map,
    lat,
    lng,
    geo_label,
    notifications_seen_at
) ON companies TO authenticated;

-- Nicht freigegeben und damit nur noch über die Service-Rolle bzw. die
-- Funktion unten erreichbar: clerk_user_id, email, phone, address, website,
-- geo_query, geo_at.

-- 2) Kontaktdaten über eine geprüfte Funktion.
--
-- Ohne Argument liefert sie die Kontakte aller bestätigten Verbindungen
-- (für die Kontaktspalte im Chat), mit Argument den einen Datensatz (für
-- das Firmenprofil). Die eigene Firma ist immer dabei.
CREATE OR REPLACE FUNCTION company_contact(p_company UUID DEFAULT NULL)
RETURNS TABLE (
    company_id UUID,
    email      TEXT,
    phone      TEXT,
    address    TEXT,
    website    TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT c.id, c.email, c.phone, c.address, c.website
    FROM companies c
    WHERE (p_company IS NULL OR c.id = p_company)
      AND current_company_id() IS NOT NULL
      AND (
          c.id = current_company_id()
          OR EXISTS (
              SELECT 1
              FROM connections k
              WHERE k.status = 'CONNECTED'
                AND (
                    (k.company_id_a = current_company_id() AND k.company_id_b = c.id)
                 OR (k.company_id_b = current_company_id() AND k.company_id_a = c.id)
                )
          )
      );
$$;

COMMENT ON FUNCTION company_contact(UUID) IS
    'Kontaktdaten einer Firma — nur für die Firma selbst und für bestätigte Verbindungen.';

REVOKE ALL ON FUNCTION company_contact(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION company_contact(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION company_contact(UUID) TO authenticated;

-- ------------------------------------------------------------
-- Rückgängig machen (falls nötig, im SQL-Editor):
--
--   DROP FUNCTION IF EXISTS company_contact(UUID);
--   GRANT SELECT ON companies TO authenticated;
--
-- Damit ist der alte Zustand wieder hergestellt.
-- ------------------------------------------------------------
