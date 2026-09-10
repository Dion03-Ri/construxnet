-- ============================================================
-- Obtanet — Migration 37: Das Lieferantenkonto
--
-- „Das Lieferantenkonto kann man nicht kaufen. Man wird dazu zugelassen."
-- (Entscheid des Auftraggebers, CLAUDE.md Abschnitt 1d.)
--
-- Bisher genügte `companies.role = 'SUPPLIER'`, um zu bieten — und die
-- Rolle wählt man bei der Anmeldung selbst. Jeder konnte sich also zum
-- Werk erklären und auf Bündel bieten, die er nicht liefern kann. Die
-- gebundenen Besteller sässen dann ohne Material fest.
--
-- DIE REIHENFOLGE: nachweisen → zugelassen werden → ab Jahr zwei zahlen.
-- Nie umgekehrt. Läge das Bieten hinter einer Zahlung, kaufte sich
-- irgendwann ein Bauunternehmen hinein und das ganze Verfahren hinge an
-- einer Kreditkarte.
--
-- Deshalb steht der Zahlungszustand in einer eigenen Spalte und wird
-- NIRGENDS mit der Zulassung vermischt. Wenn später ein Zahlungs-Webhook
-- dazukommt, darf er `bezahlt_bis` setzen und sonst gar nichts.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Das Konto
--
-- Eine Zeile je Firma, angelegt beim Antrag. Keine Zeile heisst: kein
-- Antrag gestellt.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lieferantenkonten (
    company_id     UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
    status         TEXT NOT NULL DEFAULT 'BEANTRAGT'
                        CHECK (status IN ('BEANTRAGT', 'ZUGELASSEN', 'ABGELEHNT', 'GESPERRT')),
    -- Was der Antragsteller eingereicht hat. Bewusst als Freitext plus
    -- Dateiliste: die genauen Dokumentnamen (Konformitätsbescheinigung
    -- nach SN EN 206, Abbaubewilligung) sind NOCH NICHT VERIFIZIERT, und
    -- ein zu enges Schema müsste beim ersten echten Antrag geändert werden.
    nachweis_text  TEXT,
    nachweis_dateien TEXT[],
    noga_code      TEXT,
    -- Wer hat entschieden, wann, und warum. Eine Zulassung ohne
    -- Begründung ist später nicht mehr nachvollziehbar.
    entschieden_von TEXT,
    entschieden_am  TIMESTAMPTZ,
    begruendung     TEXT,
    -- Geld. Getrennt von der Zulassung, siehe Kopf.
    frei_bis       DATE,
    bezahlt_bis    DATE,
    beantragt_am   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lieferantenkonten ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE lieferantenkonten IS
    'Die Lizenz zum Bieten. Wird zugelassen, nicht gekauft — bezahlt_bis darf die Zulassung nie ersetzen.';
COMMENT ON COLUMN lieferantenkonten.frei_bis IS
    'Bis dahin kostenlos. Vorbelegt aus app_settings.lieferant_frei_monate, einzeln verlängerbar.';

-- Jede Firma sieht ihr eigenes Konto. Fremde gehen sie nichts an —
-- schon gar nicht, wer abgelehnt wurde.
DROP POLICY IF EXISTS "lieferantenkonten_select_own" ON lieferantenkonten;
CREATE POLICY "lieferantenkonten_select_own" ON lieferantenkonten
    FOR SELECT USING (company_id = current_company_id());

-- Schreiben darf der Browser NICHT. Der Antrag läuft über eine Funktion,
-- die Zulassung über den Dienstschlüssel. Könnte der Client schreiben,
-- setzte sich jeder auf ZUGELASSEN.
REVOKE INSERT, UPDATE, DELETE ON lieferantenkonten FROM anon, authenticated;
GRANT SELECT ON lieferantenkonten TO authenticated;

-- ------------------------------------------------------------
-- 2) Antrag stellen
--
-- Legt die Zeile an oder aktualisiert einen laufenden Antrag. Wer schon
-- zugelassen ist, stellt keinen neuen — und wer gesperrt ist, kommt über
-- diesen Weg nicht zurück.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION lieferantenkonto_beantragen(
    p_nachweis_text TEXT,
    p_dateien       TEXT[] DEFAULT NULL,
    p_noga          TEXT   DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_ich    UUID := current_company_id();
    v_status TEXT;
BEGIN
    IF v_ich IS NULL THEN
        RAISE EXCEPTION 'Kein Konto.';
    END IF;
    IF EXISTS (SELECT 1 FROM companies WHERE id = v_ich AND closed_at IS NOT NULL) THEN
        RAISE EXCEPTION 'Dieses Konto ist geschlossen.';
    END IF;

    SELECT status INTO v_status FROM lieferantenkonten WHERE company_id = v_ich;

    IF v_status = 'ZUGELASSEN' THEN
        RETURN 'ZUGELASSEN';                       -- nichts zu tun
    END IF;
    IF v_status = 'GESPERRT' THEN
        RAISE EXCEPTION 'Dieses Lieferantenkonto ist gesperrt. Wende dich an Obtanet.';
    END IF;

    INSERT INTO lieferantenkonten (company_id, status, nachweis_text, nachweis_dateien, noga_code)
    VALUES (v_ich, 'BEANTRAGT', p_nachweis_text, p_dateien, p_noga)
    ON CONFLICT (company_id) DO UPDATE
       SET status           = 'BEANTRAGT',
           nachweis_text    = EXCLUDED.nachweis_text,
           nachweis_dateien = EXCLUDED.nachweis_dateien,
           noga_code        = EXCLUDED.noga_code,
           beantragt_am     = NOW(),
           entschieden_von  = NULL,
           entschieden_am   = NULL,
           begruendung      = NULL;

    RETURN 'BEANTRAGT';
END;
$$;

REVOKE ALL ON FUNCTION lieferantenkonto_beantragen(TEXT, TEXT[], TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lieferantenkonto_beantragen(TEXT, TEXT[], TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 3) Zulassen — nur über den Dienstschlüssel
--
-- KEIN GRANT an `authenticated`. Das ist die ganze Sicherheit dieser
-- Funktion: eine Rollenprüfung im Rumpf wäre wertlos, weil `current_user`
-- in einer SECURITY-DEFINER-Funktion der Eigentümer ist und nicht der
-- Aufrufer. Das haben wir bei Migration 30 gelernt.
--
-- Heute läuft die Zulassung im SQL-Editor. Sobald es ein Control Center
-- mit einer echten Rechteschranke gibt, ruft das diese Funktion auf.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION lieferantenkonto_entscheiden(
    p_company     UUID,
    p_status      TEXT,
    p_wer         TEXT,
    p_begruendung TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_monate INT := einstellung_zahl('lieferant_frei_monate', 12)::INT;
BEGIN
    IF p_status NOT IN ('ZUGELASSEN', 'ABGELEHNT', 'GESPERRT') THEN
        RAISE EXCEPTION 'Unbekannter Zustand: %', p_status;
    END IF;
    IF COALESCE(btrim(p_wer), '') = '' THEN
        RAISE EXCEPTION 'Wer entscheidet? Ohne Namen ist die Zulassung später nicht nachvollziehbar.';
    END IF;

    UPDATE lieferantenkonten
       SET status          = p_status,
           entschieden_von = p_wer,
           entschieden_am  = NOW(),
           begruendung     = p_begruendung,
           -- Die Freifrist beginnt mit der ZULASSUNG, nicht mit dem
           -- Antrag. Wer drei Monate auf die Prüfung wartet, soll dafür
           -- nicht mit drei Monaten seiner Freifrist bezahlen.
           frei_bis = CASE
               WHEN p_status = 'ZUGELASSEN' AND frei_bis IS NULL
               THEN (NOW() + (v_monate || ' months')::INTERVAL)::DATE
               ELSE frei_bis END
     WHERE company_id = p_company;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Für diese Firma liegt kein Antrag vor.';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION lieferantenkonto_entscheiden(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION lieferantenkonto_entscheiden(UUID, TEXT, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION lieferantenkonto_entscheiden(UUID, TEXT, TEXT, TEXT) TO service_role;

-- ------------------------------------------------------------
-- 4) Bietfähigkeit ist eine Rechnung, kein Häkchen
--
--     zugelassen ∧ Konto nicht abgelaufen ∧ Firma offen
--
-- Kapazität und Leistungssperre kommen dazu, sobald sie gebaut sind —
-- deshalb gibt die Funktion einen GRUND zurück und nicht nur ja/nein. Eine
-- Absage, die nicht sagt woran es liegt, erzeugt eine Support-Anfrage.
--
-- „Konto nicht abgelaufen" heisst: entweder läuft die Freifrist noch, oder
-- es ist bezahlt. Beides fehlt → das Bieten ruht, die Zulassung bleibt.
-- Ein Werk verliert seine Prüfung nicht, weil eine Rechnung offen ist.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bietfaehig(p_company UUID)
RETURNS TABLE (ok BOOLEAN, grund TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT CASE
             WHEN c.id IS NULL                    THEN FALSE
             WHEN c.closed_at IS NOT NULL         THEN FALSE
             WHEN k.company_id IS NULL            THEN FALSE
             WHEN k.status = 'BEANTRAGT'          THEN FALSE
             WHEN k.status = 'ABGELEHNT'          THEN FALSE
             WHEN k.status = 'GESPERRT'           THEN FALSE
             WHEN COALESCE(k.frei_bis, DATE '0001-01-01') < CURRENT_DATE
              AND COALESCE(k.bezahlt_bis, DATE '0001-01-01') < CURRENT_DATE
                                                  THEN FALSE
             ELSE TRUE
           END,
           CASE
             WHEN c.id IS NULL            THEN 'Keine Firma.'
             WHEN c.closed_at IS NOT NULL THEN 'Dieses Konto ist geschlossen.'
             WHEN k.company_id IS NULL    THEN 'Für dein Konto ist kein Lieferantenkonto beantragt. Bieten setzt eine Zulassung voraus.'
             WHEN k.status = 'BEANTRAGT'  THEN 'Dein Antrag wird geprüft. Sobald er zugelassen ist, kannst du bieten.'
             WHEN k.status = 'ABGELEHNT'  THEN COALESCE(k.begruendung, 'Der Antrag wurde abgelehnt.')
             WHEN k.status = 'GESPERRT'   THEN COALESCE(k.begruendung, 'Das Lieferantenkonto ist gesperrt.')
             WHEN COALESCE(k.frei_bis, DATE '0001-01-01') < CURRENT_DATE
              AND COALESCE(k.bezahlt_bis, DATE '0001-01-01') < CURRENT_DATE
                                          THEN 'Das Lieferantenkonto ist abgelaufen. Die Zulassung bleibt bestehen.'
             ELSE 'Bietfähig.'
           END
      FROM (SELECT p_company AS id) x
      LEFT JOIN companies c ON c.id = x.id
      LEFT JOIN lieferantenkonten k ON k.company_id = x.id
$$;

REVOKE ALL ON FUNCTION bietfaehig(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bietfaehig(UUID) TO service_role;

-- Für den Browser: die eigene Bietfähigkeit, ohne Parameter. Derselbe
-- Zuschnitt wie bei `meine_bindung()` in Migration 32 — mit Parameter
-- könnte jeder jede Firma abfragen und sähe, wer abgelehnt wurde.
CREATE OR REPLACE FUNCTION meine_bietfaehigkeit()
RETURNS TABLE (ok BOOLEAN, grund TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT * FROM bietfaehig(current_company_id())
$$;

REVOKE ALL ON FUNCTION meine_bietfaehigkeit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_bietfaehigkeit() TO authenticated;

-- ------------------------------------------------------------
-- 5) `place_bid` prüft ab jetzt die Bietfähigkeit
--
-- Die Rollenprüfung `role = 'SUPPLIER'` verschwindet. Sie war eine
-- Selbstauskunft und hat nichts geschützt.
--
-- Gesperrt wird nicht die Rolle, verlangt wird der Beweis: ein
-- Bauunternehmen, das tatsächlich ein eigenes Betonwerk betreibt, erbringt
-- die Nachweise und darf dann auch bieten. Wer nach Rolle sperrt,
-- schliesst legitime Teilnehmer aus und wird trotzdem umgangen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_bid(
    p_bundle_id         UUID,
    p_lieferantenpreis  NUMERIC,
    p_list_price        NUMERIC DEFAULT 0,
    p_anteil_pct        NUMERIC DEFAULT 100,
    p_puffer_pct        NUMERIC DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company    UUID;
    v_bundle     bundles%ROWTYPE;
    v_min        RECORD;
    v_darf       RECORD;
    v_rabatt     NUMERIC;
    v_kunde      NUMERIC;
    v_bid        UUID;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;

    SELECT * INTO v_darf FROM bietfaehig(v_company);
    IF NOT v_darf.ok THEN
        RAISE EXCEPTION '%', v_darf.grund;
    END IF;

    SELECT * INTO v_bundle FROM bundles WHERE id = p_bundle_id FOR UPDATE;
    IF v_bundle.id IS NULL THEN
        RAISE EXCEPTION 'Bündel nicht gefunden.';
    END IF;
    IF v_bundle.status <> 'SEALED_BIDDING' THEN
        RAISE EXCEPTION 'Für dieses Bündel läuft gerade keine Ausschreibung.';
    END IF;
    IF v_bundle.bid_deadline IS NOT NULL AND v_bundle.bid_deadline < NOW() THEN
        RAISE EXCEPTION 'Die Angebotsfrist ist abgelaufen.';
    END IF;
    IF p_lieferantenpreis IS NULL OR p_lieferantenpreis <= 0 THEN
        RAISE EXCEPTION 'Preis muss grösser als null sein.';
    END IF;
    IF COALESCE(p_anteil_pct, 100) <> 100 OR COALESCE(p_puffer_pct, 0) <> 0 THEN
        RAISE EXCEPTION 'Teilgebote sind noch nicht freigeschaltet. Bitte auf die ganze Menge bieten.';
    END IF;

    SELECT * INTO v_min FROM mindestgebot(p_bundle_id);
    IF v_min.kbob IS NULL THEN
        RAISE EXCEPTION 'Für dieses Bündel fehlt der Referenzpreis. Ohne ihn ist kein Gebot bewertbar.';
    END IF;

    v_rabatt := ROUND(((v_min.kbob - p_lieferantenpreis) / v_min.kbob) * 100, 2);

    IF p_lieferantenpreis > v_min.max_lieferantenpreis THEN
        RAISE EXCEPTION
            'Gebot zu hoch: % je Einheit sind % %% unter KBOB. Verlangt sind % %% (davon % %% für die Besteller und % %% Vermittlung) — also höchstens % je Einheit.',
            ROUND(p_lieferantenpreis, 2), v_rabatt,
            v_min.gesamtrabatt_pct, v_min.mindestrabatt_pct, v_min.provision_pct,
            v_min.max_lieferantenpreis;
    END IF;

    v_kunde := ROUND(p_lieferantenpreis + v_min.kbob * v_min.provision_pct / 100, 2);

    DELETE FROM supplier_bids
     WHERE bundle_id = p_bundle_id AND supplier_company_id = v_company;

    INSERT INTO supplier_bids (
        bundle_id, supplier_company_id,
        list_price_net, lieferantenpreis_net, offered_discount_percent,
        customer_price_net, platform_fee_percent, price_vs_kbob_index
    ) VALUES (
        p_bundle_id, v_company,
        COALESCE(NULLIF(p_list_price, 0), v_min.kbob),
        p_lieferantenpreis,
        v_rabatt,
        v_kunde,
        v_min.provision_pct,
        v_kunde - v_min.kbob
    )
    RETURNING id INTO v_bid;

    RETURN v_bid;
END;
$$;
