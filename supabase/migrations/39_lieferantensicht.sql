-- ============================================================
-- Obtanet — Migration 39: Was ein Werk sehen darf
--
-- Bis hierher konnte ein Werk bieten, aber nichts nachverfolgen: Es sah
-- weder, welche Baustellen zu einem gewonnenen Bündel gehören, noch was
-- es dafür an Vermittlung schuldet.
--
-- DER ZUSCHNITT IST GESTAFFELT, und das ist der ganze Punkt:
--
--   Während der Ausschreibung: je Baustelle nur die grobe Lage (PLZ und
--   Ort), Menge und Liefermonate. KEIN Firmenname, KEINE Strasse. Ein Werk
--   muss die Fahrt rechnen können — es geht ihn aber nichts an, WER da
--   baut, solange er nicht gewonnen hat.
--
--   Nach dem Zuschlag: volle Adresse und Firma — aber nur für die
--   Baustellen des Bündels, das er gewonnen hat.
--
-- Gebaut als eigene Funktionen, NICHT indem `projects_select_own`
-- aufgeweicht wird. Eine gelockerte Zeilenregel gilt überall; eine
-- Funktion gilt genau hier.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Während der Ausschreibung — anonymisiert
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION ausschreibung_baustellen(p_bundle_id UUID)
RETURNS TABLE (lage TEXT, menge NUMERIC, liefer_von DATE, liefer_bis DATE)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT COALESCE(NULLIF(btrim(COALESCE(pr.zip, '') || ' ' || COALESCE(pr.city, '')), ''),
                    COALESCE(pr.canton, b.region)),
           bp.requested_volume,
           bp.liefer_von,
           bp.liefer_bis
      FROM bundle_participations bp
      JOIN bundles  b  ON b.id  = bp.bundle_id
      JOIN projects pr ON pr.id = bp.project_id
     WHERE bp.bundle_id = p_bundle_id
       AND COALESCE(bp.status, 'PENDING') <> 'CANCELLED'
       AND b.status IN ('SEALED_BIDDING', 'AWARDED')
       -- Nur wer bieten darf, sieht die Aufteilung. Sonst wäre sie ein
       -- offenes Fenster in die Auftragslage der Region.
       AND (SELECT ok FROM bietfaehig(current_company_id()))
     ORDER BY bp.requested_volume DESC
$$;

REVOKE ALL ON FUNCTION ausschreibung_baustellen(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ausschreibung_baustellen(UUID) TO authenticated;

COMMENT ON FUNCTION ausschreibung_baustellen(UUID) IS
    'Grobe Lage je Baustelle für Bietende. Ohne Firmennamen und ohne Strasse — die kommen erst mit dem Zuschlag.';

-- ------------------------------------------------------------
-- 2) Nach dem Zuschlag — vollständig, aber nur für den Gewinner
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION zuschlag_baustellen(p_bundle_id UUID)
RETURNS TABLE (
    baustelle TEXT, firma TEXT, strasse TEXT, plz TEXT, ort TEXT, kanton TEXT,
    menge NUMERIC, liefer_von DATE, liefer_bis DATE, kontakt TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT pr.name, c.company_name, pr.street, pr.zip, pr.city, pr.canton,
           bp.requested_volume, bp.liefer_von, bp.liefer_bis,
           COALESCE(c.email, c.phone)
      FROM bundle_participations bp
      JOIN bundles   b  ON b.id  = bp.bundle_id
      JOIN projects  pr ON pr.id = bp.project_id
      JOIN companies c  ON c.id  = bp.buyer_company_id
     WHERE bp.bundle_id = p_bundle_id
       AND COALESCE(bp.status, 'PENDING') <> 'CANCELLED'
       AND b.status = 'AWARDED'
       AND b.awarded_supplier_id = current_company_id()
     ORDER BY pr.name
$$;

REVOKE ALL ON FUNCTION zuschlag_baustellen(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION zuschlag_baustellen(UUID) TO authenticated;

-- ------------------------------------------------------------
-- 3) Die eigenen Zuschläge
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION meine_zuschlaege()
RETURNS TABLE (
    bundle_id UUID, titel TEXT, region TEXT, einheit TEXT,
    menge NUMERIC, mein_preis NUMERIC, bestellerpreis NUMERIC,
    provision_pct NUMERIC, provision_chf NUMERIC,
    liefer_von DATE, liefer_bis DATE,
    zugeschlagen_am TIMESTAMPTZ, abgeschlossen_am TIMESTAMPTZ,
    baustellen INT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.id, COALESCE(b.material_label, b.title), b.region, b.unit,
           b.awarded_volume, b.awarded_supplier_price, b.awarded_price,
           b.provision_pct, b.provision_chf,
           b.liefer_von, b.liefer_bis,
           b.awarded_at, b.completed_at,
           (SELECT COUNT(*)::INT FROM bundle_participations p
             WHERE p.bundle_id = b.id AND COALESCE(p.status,'PENDING') <> 'CANCELLED')
      FROM bundles b
     WHERE b.awarded_supplier_id = current_company_id()
       AND b.awarded_at IS NOT NULL
     ORDER BY b.awarded_at DESC
$$;

REVOKE ALL ON FUNCTION meine_zuschlaege() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_zuschlaege() TO authenticated;

-- ------------------------------------------------------------
-- 4) Abrechnung
--
-- Die Forderung entsteht mit dem Zuschlag, fällig ist sie 30 Tage nach
-- LIEFERBEGINN — der Anspruch steht fest, das Werk hat Luft. Ohne
-- Lieferbeginn (alte Bündel) wird vom Zuschlag aus gerechnet.
-- ------------------------------------------------------------
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS provision_bezahlt_am DATE;

COMMENT ON COLUMN bundles.provision_bezahlt_am IS
    'Wann die Vermittlungsgebühr eingegangen ist. Setzt heute niemand automatisch.';

CREATE OR REPLACE FUNCTION meine_abrechnung()
RETURNS TABLE (
    bundle_id UUID, titel TEXT, menge NUMERIC, einheit TEXT,
    provision_pct NUMERIC, provision_chf NUMERIC,
    faellig_am DATE, bezahlt_am DATE, offen BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.id, COALESCE(b.material_label, b.title), b.awarded_volume, b.unit,
           b.provision_pct, b.provision_chf,
           (COALESCE(b.liefer_von, b.awarded_at::DATE) + 30) AS faellig_am,
           b.provision_bezahlt_am,
           b.provision_bezahlt_am IS NULL
      FROM bundles b
     WHERE b.awarded_supplier_id = current_company_id()
       AND b.awarded_at IS NOT NULL
       AND COALESCE(b.provision_chf, 0) > 0
     ORDER BY (COALESCE(b.liefer_von, b.awarded_at::DATE) + 30) ASC
$$;

REVOKE ALL ON FUNCTION meine_abrechnung() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION meine_abrechnung() TO authenticated;

-- ------------------------------------------------------------
-- 5) Das eigene Lieferprofil in einem Rutsch setzen
--
-- Monat für Monat einzeln zu schreiben wäre über die Zeilenregel möglich,
-- aber mühsam und fehleranfällig. Diese Funktion setzt einen Zeitraum auf
-- einen Wert — und weigert sich, unter das zu gehen, was bereits GEBUCHT
-- ist. Sonst erklärte ein Werk sich klein und stünde mit Verpflichtungen
-- da, die seine eigene Erklärung übersteigen.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION kapazitaet_setzen(
    p_kategorie TEXT,
    p_von       DATE,
    p_bis       DATE,
    p_menge     NUMERIC,
    p_einheit   TEXT DEFAULT NULL
) RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_ich   UUID := current_company_id();
    v_monat DATE;
    v_zu    NUMERIC;
    v_n     INT := 0;
BEGIN
    IF v_ich IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;
    IF p_menge IS NULL OR p_menge < 0 THEN
        RAISE EXCEPTION 'Die Menge kann nicht negativ sein.';
    END IF;
    IF p_bis < p_von THEN
        RAISE EXCEPTION 'Der Zeitraum endet vor seinem Anfang.';
    END IF;

    FOR v_monat IN
        SELECT generate_series(date_trunc('month', p_von),
                               date_trunc('month', p_bis), INTERVAL '1 month')::DATE
    LOOP
        SELECT COALESCE(SUM(menge), 0) INTO v_zu
          FROM kapazitaets_bindung
         WHERE company_id = v_ich AND material_category = p_kategorie
           AND monat = v_monat AND zustand = 'GEBUCHT';

        IF p_menge < v_zu THEN
            RAISE EXCEPTION
                'Im % sind bereits % zugeschlagen. Weniger als das kannst du nicht erklären — zugesagt ist zugesagt.',
                to_char(v_monat, 'Mon YYYY'), v_zu;
        END IF;

        INSERT INTO lieferant_kapazitaet (company_id, material_category, monat, menge, einheit)
        VALUES (v_ich, p_kategorie, v_monat, p_menge, p_einheit)
        ON CONFLICT (company_id, material_category, monat)
        DO UPDATE SET menge = EXCLUDED.menge,
                      einheit = COALESCE(EXCLUDED.einheit, lieferant_kapazitaet.einheit),
                      erklaert_am = NOW();
        v_n := v_n + 1;
    END LOOP;

    RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION kapazitaet_setzen(TEXT, DATE, DATE, NUMERIC, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION kapazitaet_setzen(TEXT, DATE, DATE, NUMERIC, TEXT) TO authenticated;
