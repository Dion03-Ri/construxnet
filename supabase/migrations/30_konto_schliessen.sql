-- ============================================================
-- Obtanet — Migration 30: Ein Konto schliessen heisst anonymisieren
--
-- Bisher hing alles mit ON DELETE CASCADE an `companies`. Wer eine
-- Firmenzeile löschte — im Supabase-Editor ein Klick —, löschte damit den
-- Nachrichtenverlauf bei BEIDEN Seiten. Die Gegenseite verlor den Beleg
-- einer Verhandlung, die sie selbst geführt hat, und merkte es nicht.
--
-- Das widerspricht Migration 21, die den Inhalt gesendeter Nachrichten
-- ausdrücklich unveränderlich macht, und der Aufbewahrungspflicht nach
-- Art. 958f OR gleichermassen.
--
-- Der richtige Weg ist der, den LinkedIn geht: das Profil verschwindet,
-- die Nachrichten bleiben beim Empfänger stehen — nur ohne Namen. Diese
-- Migration macht daraus drei Dinge:
--
--   1. ein Sicherheitsnetz: Nachrichten und Angebote lassen sich nicht
--      mehr durch das Löschen einer Firmenzeile mitreissen
--   2. `close_company_account()` — anonymisieren statt löschen
--   3. eine geschlossene Firma ist nur noch für die sichtbar, die
--      tatsächlich mit ihr zu tun hatten
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

-- ------------------------------------------------------------
-- 1) Sicherheitsnetz
--
-- Nachrichten und Direktangebote sind Belege eines Geschäfts und gehören
-- beiden Seiten. RESTRICT heisst: ein Löschversuch auf der Firmenzeile
-- schlägt laut fehl, statt still zwei Verläufe zu vernichten. Der Weg
-- über close_company_account() bleibt offen — er löscht die Zeile nicht.
--
-- Alles andere bleibt bei CASCADE, und das ist richtig: Beiträge,
-- Kommentare, Verbindungen, eigene Projekte und Materialien sind das
-- Profil, nicht der Beleg. Sie verschwinden mit dem Konto — auch das
-- macht LinkedIn so.
-- ------------------------------------------------------------
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_company_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_company_id_fkey
    FOREIGN KEY (sender_company_id) REFERENCES companies(id) ON DELETE RESTRICT;

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_company_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_receiver_company_id_fkey
    FOREIGN KEY (receiver_company_id) REFERENCES companies(id) ON DELETE RESTRICT;

ALTER TABLE direct_offers DROP CONSTRAINT IF EXISTS direct_offers_buyer_company_id_fkey;
ALTER TABLE direct_offers ADD CONSTRAINT direct_offers_buyer_company_id_fkey
    FOREIGN KEY (buyer_company_id) REFERENCES companies(id) ON DELETE RESTRICT;

ALTER TABLE direct_offers DROP CONSTRAINT IF EXISTS direct_offers_supplier_company_id_fkey;
ALTER TABLE direct_offers ADD CONSTRAINT direct_offers_supplier_company_id_fkey
    FOREIGN KEY (supplier_company_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- ------------------------------------------------------------
-- 2) Wer eine geschlossene Firma noch sehen darf
--
-- Ein geschlossenes Konto steht in keinem Verzeichnis, keiner Suche und
-- keiner Empfehlung mehr. Wer aber einen Verlauf oder ein Angebot mit ihm
-- hat, muss weiter sehen, mit wem — sonst stünde in seinem Postfach ein
-- Gespräch ohne Gegenüber.
--
-- Das steht bewusst in der Zeilenregel und nicht in den Abfragen der
-- Anwendung: `companies` wird an vierundzwanzig Stellen gelesen, und die
-- fünfundzwanzigste vergisst den Filter.
--
-- SECURITY DEFINER, weil die Regel sonst über `messages` läuft, das
-- seinerseits eine Zeilenregel hat.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION hat_geschaeft_mit(p_company UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT EXISTS (
        SELECT 1 FROM messages m, (SELECT current_company_id() AS id) me
         WHERE me.id IS NOT NULL
           AND (   (m.sender_company_id   = p_company AND m.receiver_company_id = me.id)
                OR (m.receiver_company_id = p_company AND m.sender_company_id   = me.id))
    ) OR EXISTS (
        SELECT 1 FROM direct_offers d, (SELECT current_company_id() AS id) me
         WHERE me.id IS NOT NULL
           AND (   (d.buyer_company_id    = p_company AND d.supplier_company_id = me.id)
                OR (d.supplier_company_id = p_company AND d.buyer_company_id    = me.id))
    )
$$;

REVOKE ALL ON FUNCTION hat_geschaeft_mit(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hat_geschaeft_mit(UUID) TO authenticated, anon;

DROP POLICY IF EXISTS "companies_select_public" ON companies;
CREATE POLICY "companies_select_public" ON companies
    FOR SELECT USING (
        closed_at IS NULL
        OR id = current_company_id()
        OR hat_geschaeft_mit(id)
    );

-- ------------------------------------------------------------
-- 3) Konto schliessen
--
-- Was verschwindet: Name, Kennnummer, Anschrift, Kontakt, Logo, Text,
-- Standort, Liefergebiete — und alles, was Profil ist: Beiträge samt
-- Reaktionen und Kommentaren, Meldungen, Verbindungen, eigene Projekte
-- und Materialien, das Abo, die Chat-Vermerke.
--
-- Was bleibt: Nachrichten, Direktangebote und -anfragen, Teilnahmen an
-- Bündeln, Gebote, Verträge, Lieferscheine. Das sind Belege, sie gehören
-- nicht nur einer Seite, und ein Teil davon fällt unter die Zehnjahresfrist.
--
-- `clerk_user_id` und `uid_number` sind NOT NULL UNIQUE. Sie werden nicht
-- geleert, sondern auf einen toten Wert gesetzt: das schliesst den Login
-- aus und gibt zugleich die echte UID wieder frei, falls dieselbe Firma
-- später neu beitritt.
--
-- Aufrufen darf das jede Firma für sich selbst. Für den Support (ein
-- Löschbegehren per Mail) geht es über die Dienstrolle, dann ist auch
-- eine fremde Kennung erlaubt.
-- ------------------------------------------------------------
-- Zwei Funktionen statt einer, und der Grund ist ein Fallstrick:
-- innerhalb einer SECURITY-DEFINER-Funktion ist `current_user` der
-- EIGENTÜMER der Funktion, nicht der Aufrufer. Eine Prüfung wie
-- `current_user <> 'service_role'` sieht also immer dasselbe und schützt
-- gar nichts. Deshalb entscheidet hier die Rechtevergabe:
--
--   konto_schliessen_intern()   — macht die Arbeit, niemand darf sie
--                                 aufrufen ausser Eigentümer und Support
--   close_own_company_account() — die eigene Firma, für jeden angemeldeten
--
-- Der Support (ein Löschbegehren per Mail) ruft die interne Funktion im
-- SQL-Editor auf:  SELECT konto_schliessen_intern('<firmen-uuid>');
CREATE OR REPLACE FUNCTION konto_schliessen_intern(p_company UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_ziel UUID := p_company;
BEGIN
    IF v_ziel IS NULL THEN
        RAISE EXCEPTION 'Keine Firma angegeben.';
    END IF;

    IF EXISTS (SELECT 1 FROM companies WHERE id = v_ziel AND closed_at IS NOT NULL) THEN
        RETURN v_ziel;                      -- schon geschlossen, nichts zu tun
    END IF;

    -- Profilinhalte. network_posts nimmt Reaktionen und Kommentare mit.
    DELETE FROM network_posts     WHERE company_id = v_ziel;
    DELETE FROM post_likes        WHERE company_id = v_ziel;
    DELETE FROM post_comments     WHERE company_id = v_ziel;
    DELETE FROM post_reports      WHERE reporter_company_id = v_ziel;
    DELETE FROM connections       WHERE company_id_a = v_ziel OR company_id_b = v_ziel;
    DELETE FROM projects          WHERE company_id = v_ziel;
    DELETE FROM custom_materials  WHERE company_id = v_ziel;
    DELETE FROM subscriptions     WHERE company_id = v_ziel;
    DELETE FROM chat_thread_prefs WHERE owner_company_id = v_ziel OR other_company_id = v_ziel;

    UPDATE companies SET
        clerk_user_id       = 'geschlossen:' || v_ziel::text,
        uid_number          = 'GESCHLOSSEN-' || v_ziel::text,
        company_name        = 'Ehemaliges Mitglied',
        verified            = FALSE,
        logo_url            = NULL,
        city                = NULL,
        canton              = NULL,
        address             = NULL,
        phone               = NULL,
        email               = NULL,
        website             = NULL,
        bio                 = NULL,
        about               = NULL,
        lat                 = NULL,
        lng                 = NULL,
        geo_at              = NULL,
        geo_label           = NULL,
        geo_query           = NULL,
        supply_materials    = NULL,
        supply_regions      = NULL,
        capacity_note       = NULL,
        delivery_radius_km  = NULL,
        closed_at           = NOW()
     WHERE id = v_ziel;

    RETURN v_ziel;
END;
$$;

REVOKE ALL ON FUNCTION konto_schliessen_intern(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION konto_schliessen_intern(UUID) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION close_own_company_account()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_ich UUID := current_company_id();
BEGIN
    IF v_ich IS NULL THEN
        RAISE EXCEPTION 'Kein Konto.';
    END IF;
    RETURN konto_schliessen_intern(v_ich);
END;
$$;

REVOKE ALL ON FUNCTION close_own_company_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION close_own_company_account() TO authenticated;

-- Eine frühere Fassung dieser Migration hatte eine Funktion mit Parameter
-- und einer Rollen-Prüfung im Rumpf. Sie wird entfernt, damit sie nicht
-- als zweiter, schwächerer Weg stehenbleibt.
DROP FUNCTION IF EXISTS close_company_account(UUID);

-- ------------------------------------------------------------
-- OFFEN, bewusst nicht hier entschieden:
--
-- · Was mit einer laufenden Bündelteilnahme geschieht, wenn jemand
--   mitten darin schliesst. Heute bleibt sie stehen und zählt weiter —
--   das ist für den Beleg richtig und für den Betrieb fraglich.
-- · Die Kündigung beim Zahlungsdienst. Die Abo-Zeile fällt hier weg,
--   das laufende Abo bei Stripe nicht. Solange Stripe nicht angebunden
--   ist, gibt es dort auch nichts zu kündigen.
-- ------------------------------------------------------------
