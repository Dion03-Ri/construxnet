-- ============================================================
-- Obtanet — Migration 32: Woran ICH hänge, nicht woran andere hängen
--
-- Migration 31 hat `laufende_bindung(uuid)` eingeführt und sie an
-- `authenticated` freigegeben. Das war zu weit. Die Funktion läuft als
-- SECURITY DEFINER und prüft im Rumpf nicht, wessen Firma da abgefragt
-- wird — jeder Angemeldete konnte also eine beliebige Firmen-ID einsetzen
-- und bekam zurück, an welchen Bündeln sie teilnimmt, samt Titel.
--
-- Die IDs sind kein Geheimnis: das Firmenverzeichnis ist bewusst offen.
-- Die Teilnahme dagegen schon — sie ist verdeckt, damit kein Werk aus der
-- Teilnehmerliste die Mengen zurückrechnen kann. Genau das wäre hier
-- Zeile für Zeile abfragbar gewesen.
--
-- Der Zuschnitt ist deshalb derselbe wie bei Migration 30 beim
-- Kontoschliessen: die Funktion mit Parameter behält niemand ausser dem
-- Dienstschlüssel und den Funktionen, die intern damit rechnen; für den
-- Browser gibt es eine parameterlose Fassung, die ihre Firma selbst
-- bestimmt. Eine Rollen- oder Eigentumsprüfung IM Rumpf wäre der falsche
-- Weg gewesen — `current_user` ist dort der Eigentümer, nicht der
-- Aufrufer. Was schützt, ist der fehlende Zugriff, nicht die Abfrage.
--
-- `konto_schliessen_intern()` ruft `laufende_bindung()` weiterhin auf und
-- ist davon nicht betroffen: SECURITY-DEFINER-Funktionen rufen mit den
-- Rechten ihres Eigentümers.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Die Fassung mit Parameter aus der Hand des Browsers nehmen
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION laufende_bindung(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION laufende_bindung(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION laufende_bindung(UUID) TO service_role;

-- ------------------------------------------------------------
-- 2) Die eigene Bindung — ohne Parameter, also ohne fremde Firma
--
-- Ohne Konto kommt eine leere Menge zurück, keine Ausnahme: die Frage
-- „hänge ich noch irgendwo?" ist dann korrekt mit „nein" beantwortet.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION meine_bindung()
RETURNS TABLE (bundle_id UUID, titel TEXT, bundle_status TEXT, rolle TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT * FROM laufende_bindung(current_company_id())
     WHERE current_company_id() IS NOT NULL
$$;

REVOKE ALL ON FUNCTION meine_bindung() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_bindung() TO authenticated;

COMMENT ON FUNCTION meine_bindung() IS
    'Laufende Bündel der eigenen Firma. Für /konto, damit dort steht, warum das Schliessen gesperrt ist.';
