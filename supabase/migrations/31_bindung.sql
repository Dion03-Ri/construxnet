-- ============================================================
-- Obtanet — Migration 31: Wer drin ist, bleibt drin
--
-- Entscheid des Auftraggebers: Ein Bündel ist verbindlich. Wer mitmacht,
-- kann nicht mitten im Verfahren aussteigen, und schon gar nicht, indem
-- er sein Konto schliesst. Sobald gebündelt ist, gibt es kein Zurück.
--
-- Beim Einbauen kam heraus, dass genau das bisher nicht galt:
--
--   `withdraw_demand()` setzte die Teilnahme auf CANCELLED — ohne den
--   Zustand des Bündels auch nur anzusehen. Man konnte also austreten,
--   während die Werke bereits verdeckt boten, und sogar nachdem der
--   Zuschlag erteilt war. Das Volumen, auf das ein Werk seinen Preis
--   gerechnet hat, wäre einfach kleiner geworden.
--
-- Diese Migration zieht drei Dinge nach:
--
--   1. Austritt nur, solange gesammelt wird — und nur vor der Frist
--   2. `laufende_bindung()` sagt, woran eine Firma noch hängt
--   3. Konto schliessen ist gesperrt, solange sie irgendwo hängt
--
-- Im Supabase SQL-Editor ausführen. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 0) Wann ist ein Bündel fertig?
--
-- Der Lebenslauf kannte bisher kein Ende: OPEN → SEALED_BIDDING →
-- AWARDED, und AWARDED blieb für immer stehen. Ohne einen Schlusspunkt
-- wäre jede Firma, die je an einem Bündel teilgenommen hat, auf ewig
-- gebunden — und könnte ihr Konto nie schliessen.
--
-- `completed_at` ist dieser Schlusspunkt: gesetzt, wenn geliefert und
-- abgerechnet ist. Heute von Hand; sobald der Lieferschein-Abgleich
-- steht (#22), setzt der ihn.
-- ------------------------------------------------------------
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- ------------------------------------------------------------
-- 1) Austritt nur während der Sammelphase
--
-- Solange gesammelt wird, ist eine Teilnahme eine Absichtserklärung —
-- da darf man zurück. Mit der Frist wird daraus eine Menge, auf die ein
-- Werk seinen Preis rechnet. Ab dann nicht mehr.
--
-- `SET search_path` fehlte hier. Bei SECURITY DEFINER ist das keine
-- Formalie: ohne feste Suchreihenfolge kann ein Aufrufer eigene Objekte
-- vorschieben und den Rumpf auf sie umlenken.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION withdraw_demand(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company UUID;
    v_status  TEXT;
    v_frist   TIMESTAMP WITH TIME ZONE;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    SELECT status, deadline INTO v_status, v_frist FROM bundles WHERE id = p_bundle_id;
    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;

    IF v_status <> 'OPEN' THEN
        RAISE EXCEPTION 'Das Bündel ist nicht mehr in der Sammelphase (%). Ein Austritt ist ab der Ausschreibung nicht mehr möglich.', v_status;
    END IF;

    IF v_frist IS NOT NULL AND NOW() >= v_frist THEN
        RAISE EXCEPTION 'Die Frist ist abgelaufen. Ein Austritt ist nicht mehr möglich.';
    END IF;

    UPDATE bundle_participations
       SET status = 'CANCELLED'
     WHERE bundle_id = p_bundle_id
       AND buyer_company_id = v_company
       AND status <> 'CANCELLED';

    PERFORM bundle_recalc(p_bundle_id);
END;
$$;

-- ------------------------------------------------------------
-- 2) Woran hängt eine Firma noch?
--
-- Gebunden ist, wer in einem laufenden Bündel steht — als Besteller mit
-- einer Teilnahme, die nicht abgesagt ist, oder als Werk, das den
-- Zuschlag hat. Laufend heisst: OPEN, SEALED_BIDDING oder AWARDED und
-- noch kein Schlusspunkt. Gescheiterte und abgesagte Bündel binden
-- niemanden.
--
-- Gibt Zeilen zurück statt eines Ja/Nein, damit die Fehlermeldung sagen
-- kann, woran es liegt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION laufende_bindung(p_company UUID)
RETURNS TABLE (bundle_id UUID, titel TEXT, bundle_status TEXT, rolle TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.id, b.title, b.status, 'Besteller'::TEXT
      FROM bundle_participations p
      JOIN bundles b ON b.id = p.bundle_id
     WHERE p.buyer_company_id = p_company
       AND COALESCE(p.status, 'PENDING') <> 'CANCELLED'
       AND b.status IN ('OPEN', 'SEALED_BIDDING', 'AWARDED')
       AND b.completed_at IS NULL
    UNION
    SELECT b.id, b.title, b.status, 'Zuschlag'::TEXT
      FROM bundles b
     WHERE b.awarded_supplier_id = p_company
       AND b.status = 'AWARDED'
       AND b.completed_at IS NULL
$$;

REVOKE ALL ON FUNCTION laufende_bindung(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION laufende_bindung(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------
-- 3) Konto schliessen: nicht, solange etwas läuft
--
-- Der Rumpf ist derselbe wie in Migration 30, davor steht die Sperre.
-- Sie gilt auch für den Support-Weg: ein Löschbegehren hebt einen
-- laufenden Vertrag nicht auf. Wer aussteigen will, tut das während der
-- Sammelphase — danach erst liefern, dann schliessen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION konto_schliessen_intern(p_company UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_ziel   UUID := p_company;
    v_anzahl INT;
    v_erstes TEXT;
BEGIN
    IF v_ziel IS NULL THEN
        RAISE EXCEPTION 'Keine Firma angegeben.';
    END IF;

    IF EXISTS (SELECT 1 FROM companies WHERE id = v_ziel AND closed_at IS NOT NULL) THEN
        RETURN v_ziel;                      -- schon geschlossen, nichts zu tun
    END IF;

    SELECT count(*), min(titel) INTO v_anzahl, v_erstes FROM laufende_bindung(v_ziel);
    IF v_anzahl > 0 THEN
        RAISE EXCEPTION
            'Konto gebunden: % laufende(s) Bündel, darunter „%". Ein Bündel ist verbindlich — erst liefern, dann schliessen.',
            v_anzahl, v_erstes
            USING HINT = 'Woran es hängt: SELECT * FROM laufende_bindung(''' || v_ziel || ''');';
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
