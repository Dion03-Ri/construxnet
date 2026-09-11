-- ============================================================
-- Obtanet — Testkonten
--
-- Sechs UID-Nummern zum Anmelden: drei für Bauunternehmen, drei für
-- Baustoffwerke. Sie sind RECHNERISCH GÜLTIG — die Prüfziffer stimmt,
-- `pruefeUid()` in lib/uid.ts lässt sie durch, das Onboarding nimmt sie
-- an.
--
-- WAS SIE NICHT SIND: echte Nummern aus dem UID-Register des Bundes. Sie
-- liegen am oberen Ende des Nummernraums, wo das Register praktisch nicht
-- vergibt. Einen Abgleich gegen das Register gibt es bei uns nicht
-- (`registerLookupPending = true`), deshalb kommen sie durch — und
-- deshalb sind sie AUSSCHLIESSLICH zum Testen. Vor dem Livegang löschen.
--
--   BAUUNTERNEHMEN (Rolle „Bauunternehmen" im Onboarding wählen)
--     CHE-999.000.108
--     CHE-999.000.172
--     CHE-999.000.249
--
--   BAUSTOFFWERKE (Rolle „Baustoffwerk" im Onboarding wählen)
--     CHE-999.000.315
--     CHE-999.000.456
--     CHE-999.000.522
--
-- Firmennamen frei wählbar, aber bitte erkennbar erfunden (Muster, Test,
-- Beispiel) — kein Name einer echten Firma an einer erfundenen Nummer.
--
-- Jede Nummer nur EINMAL: `companies.uid_number` ist eindeutig. Sechs
-- Nummern heissen sechs Clerk-Konten, also sechs verschiedene
-- E-Mail-Adressen.
-- ============================================================


-- ------------------------------------------------------------
-- 1) Ein Baustoffwerk zum Bieten freischalten
--
-- Die Rolle „Baustoffwerk" allein genügt nicht. Bieten darf nur, wer ein
-- ZUGELASSENES Lieferantenkonto hat (Migration 37) — die Rolle wählt man
-- selbst, die Zulassung nicht. Im Testbetrieb gibt es keine Prüfstelle,
-- also entscheidest du hier von Hand.
--
-- Nimmt alle Testfirmen mit einer CHE-999er-Nummer, die im Onboarding die
-- Rolle „Baustoffwerk" gewählt haben. Einmal ausführen, nachdem die Konten
-- angelegt sind — auch später nochmal, wenn ein Werk dazukommt.
-- ------------------------------------------------------------
DO $$
DECLARE
    v_firma RECORD;
    v_zahl  INT := 0;
BEGIN
    FOR v_firma IN
        SELECT id, uid_number, company_name
          FROM companies
         WHERE uid_number LIKE 'CHE-999.%'
           AND role = 'SUPPLIER'
           AND closed_at IS NULL
    LOOP
        -- Antrag anlegen, falls das Werk noch keinen gestellt hat. Ohne
        -- Zeile liefe die Zulassung ins Leere: `lieferantenkonto_entscheiden`
        -- macht ein UPDATE, und ein UPDATE ohne Treffer meldet keinen Fehler.
        INSERT INTO lieferantenkonten (company_id, status, nachweis_text)
        VALUES (v_firma.id, 'BEANTRAGT', 'Testkonto — kein echter Nachweis eingereicht.')
        ON CONFLICT (company_id) DO NOTHING;

        PERFORM lieferantenkonto_entscheiden(
            v_firma.id,
            'ZUGELASSEN',
            'Testbetrieb',
            'Testkonto. Keine Prüfung von Konformitätsbescheinigung oder Bewilligung.'
        );

        v_zahl := v_zahl + 1;
        RAISE NOTICE 'Zugelassen: % — %', v_firma.uid_number, v_firma.company_name;
    END LOOP;

    IF v_zahl = 0 THEN
        RAISE EXCEPTION 'Kein Baustoffwerk mit einer CHE-999er-Nummer gefunden. Zuerst im Onboarding anlegen — und dort die Rolle „Baustoffwerk" wählen.';
    END IF;
END $$;


-- ------------------------------------------------------------
-- 2) Nachsehen, ob es gereicht hat
--
-- `bietfaehig()` ist die Rechnung, nicht das Häkchen: zugelassen UND
-- Konto nicht abgelaufen UND Firma offen. Sie gibt den Grund zurück,
-- wenn etwas fehlt.
-- ------------------------------------------------------------
SELECT c.company_name,
       c.uid_number,
       c.role,
       k.status,
       k.frei_bis,
       (bietfaehig(c.id)).*
  FROM companies c
  LEFT JOIN lieferantenkonten k ON k.company_id = c.id
 WHERE c.uid_number LIKE 'CHE-999.%'
 ORDER BY c.role, c.uid_number;


-- ------------------------------------------------------------
-- 3) Aufräumen — alle Testfirmen wieder entfernen
--
-- Bewusst auskommentiert. Löscht die Firma samt allem, was per
-- ON DELETE CASCADE daranhängt; Fremdschlüssel auf RESTRICT (Nachrichten,
-- Anfragen, Angebote) blockieren den Versuch, solange dort noch etwas
-- steht — dann dort zuerst aufräumen.
--
-- Die Clerk-Konten löscht das NICHT. Die gehören ins Clerk-Dashboard.
-- ------------------------------------------------------------
-- DELETE FROM companies WHERE uid_number LIKE 'CHE-999.%';
