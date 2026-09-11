-- ============================================================
-- Obtanet — Migration 43: Die Rabattstufen
--
-- ENTSCHEID DES AUFTRAGGEBERS, 11.09.2026. Er ersetzt die Staffel aus
-- Migration 16 (5/9/12/16/20 % nach Stückzahl), die nie belastbar war.
--
-- ES GIBT NUR EINE STAFFEL: die individuelle Garantie je Firma, aus ihrem
-- EIGENEN Bestellwert. Sie ist bewusst klein — eine Schwelle, die jedem
-- etwas sichert, kein Versprechen.
--
-- DAS BÜNDEL HAT KEINE EIGENE STAFFEL. Sein Mindestgebot ist der HÖCHSTE
-- individuelle Mindestrabatt unter seinen Teilnehmern, plus Provision,
-- aufgerundet auf 0.25 %. Damit bekommt jede Firma garantiert mindestens
-- ihre eigene Schwelle — es gibt ja nur einen Preis für alle.
--
-- Darauf baut die verdeckte Ausschreibung auf und unterbietet. DER ECHTE
-- VORTEIL KOMMT AUS DEM WETTBEWERB, NICHT AUS DER GARANTIE. Deshalb darf
-- die Schwelle niedrig sein: sie muss erfüllbar bleiben, sonst gibt es
-- kein Gebot und das Bündel platzt. Ein Bündel, das bei 9 % schliesst, ist
-- besser als eines, das bei 15 % scheitert.
--
-- Die Schwelle ist immer erfüllbar: ein Bündel ist nie kleiner als sein
-- grösster Teilnehmer.
--
-- WARUM JE MATERIALKATEGORIE: Die Margen sind zu verschieden. Beton, Kies
-- und Zement tragen 15–25 % Bruttomarge; Betonstahl beim Produzenten rund
-- 7 %, Servicecenter im niedrigen einstelligen Nettobereich. Eine Staffel
-- über alles wäre für die einen zu zaghaft und für die anderen unmöglich.
--
-- KEINE VORGABEZEILE FÜR ALLES. Eine Kategorie ohne Staffel kann nicht
-- gebündelt werden — ausdrücklich so. Eine NULL-Zeile, die für alles gilt,
-- gäbe einem neu dazukommenden Material stillschweigend die Zahlen von
-- Beton, und niemand merkte es.
-- ============================================================

CREATE TABLE IF NOT EXISTS rabattstufen (
    material_category TEXT    NOT NULL,
    ab_chf            NUMERIC NOT NULL CHECK (ab_chf >= 0),
    rabatt_pct        NUMERIC NOT NULL CHECK (rabatt_pct >= 0 AND rabatt_pct < 100),
    PRIMARY KEY (material_category, ab_chf)
);

ALTER TABLE rabattstufen ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE rabattstufen IS
    'Garantierter Mindestrabatt je Materialkategorie und eigenem Bestellwert. Einzige Quelle — nicht im Quelltext spiegeln.';

-- Jeder darf sie lesen: eine Garantie, die man nicht nachschlagen kann,
-- ist keine. Schreiben nur über den Dienstschlüssel.
DROP POLICY IF EXISTS "rabattstufen_select_alle" ON rabattstufen;
CREATE POLICY "rabattstufen_select_alle" ON rabattstufen FOR SELECT USING (TRUE);
REVOKE INSERT, UPDATE, DELETE ON rabattstufen FROM anon, authenticated;
GRANT SELECT ON rabattstufen TO anon, authenticated;

-- ------------------------------------------------------------
-- Die Staffel
--
-- SIE BEGINNT ERST BEI CHF 5'000 — und das ist Absicht.
--
-- Eine erste Fassung startete bei CHF 100 mit 1 %. Der Auftraggeber hat
-- sie zu Recht verworfen: „garantierter Mindestrabatt 1 %" lässt jeden
-- sofort wieder gehen. Eine Zahl, die niemanden überzeugt, ist schlimmer
-- als gar keine — sie macht das Angebot klein, statt es zu erklären.
--
-- Der Ausweg ist NICHT, kleine Bestellungen höher zu garantieren: dort ist
-- ein Rabatt am wenigsten erreichbar (kleine Mengen tragen normalerweise
-- ZUschläge, keine Abschläge). Der Ausweg ist die Einstiegsschwelle. Wer
-- darunter liegt, bekommt keine eigene Garantie — darf aber mitbündeln und
-- bekommt dann die Schwelle des Bündels. Für ihn ist das der grösste
-- Gewinn überhaupt, und niemand muss ihm 1 % versprechen.
--
-- Die oberste Stufe ist die unsicherste. 10 % steht auf der Annahme, dass
-- planbares Volumen besser rechnet als Tagesgeschäft — plausibel, weil
-- Material rund 56 % der Herstellkosten ausmacht und die Fixkosten ohnehin
-- laufen, aber nicht belegt. Eine Zeile UPDATE, kein Umbau.
--
-- BEWEHRUNG & STAHL FEHLT ABSICHTLICH. Bei ~7 % Bruttomarge beim
-- Produzenten wäre selbst die unterste Stufe plus 2.25 Punkte Provision
-- zu viel. Dafür braucht es eigene Zahlen von einem Händler.
-- ------------------------------------------------------------
INSERT INTO rabattstufen (material_category, ab_chf, rabatt_pct)
SELECT k.kat, s.ab_chf, s.pct
  FROM (VALUES
        ('Beton'), ('Kies, Aushub & Recycling'), ('Zement & Bindemittel'),
        ('Mauerwerk'), ('Dämmung')
       ) AS k(kat)
  CROSS JOIN (VALUES
        (     5000::NUMERIC,  4.0::NUMERIC),
        (    25000,           5.0),
        (    50000,           6.0),
        (   100000,           7.0),
        (   250000,           8.0),
        (   500000,           9.0),
        (  1000000,          10.0)
       ) AS s(ab_chf, pct)
ON CONFLICT (material_category, ab_chf) DO NOTHING;

-- ------------------------------------------------------------
-- Was EINER Firma bei diesem Bestellwert garantiert ist
--
-- Die Zahl, die beim Eintippen erscheint: „10 m³ Beton → dir allein
-- garantiert 2 %". Gibt NULL zurück, wenn die Kategorie keine Staffel hat
-- — dann gibt es kein Bündel, und das muss der Aufrufer unterscheiden
-- können von „null Prozent".
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mein_mindestrabatt(p_kategorie TEXT, p_wert NUMERIC)
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT r.rabatt_pct
      FROM rabattstufen r
     WHERE r.material_category = p_kategorie
       AND r.ab_chf <= COALESCE(p_wert, 0)
     ORDER BY r.ab_chf DESC
     LIMIT 1
$$;

REVOKE ALL ON FUNCTION mein_mindestrabatt(TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mein_mindestrabatt(TEXT, NUMERIC) TO authenticated, anon, service_role;

/** Hat diese Kategorie überhaupt eine Staffel? Ohne sie kein Bündel. */
CREATE OR REPLACE FUNCTION kategorie_buendelbar(p_kategorie TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT EXISTS (SELECT 1 FROM rabattstufen WHERE material_category = p_kategorie)
$$;

REVOKE ALL ON FUNCTION kategorie_buendelbar(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION kategorie_buendelbar(TEXT) TO authenticated, anon, service_role;

-- ------------------------------------------------------------
-- Der Mindestrabatt eines Bündels
--
-- Der HÖCHSTE individuelle Mindestrabatt seiner Teilnehmer. Es gibt einen
-- Preis für alle — also muss er die anspruchsvollste Garantie erfüllen,
-- dann sind alle anderen automatisch mit erfüllt.
--
-- Der Wert je Teilnahme ist Menge × Referenzpreis. Ist kein Referenzpreis
-- hinterlegt, lässt sich kein Wert bilden und die Staffel greift nicht —
-- dann steht hier 0, und `place_bid` weist ohnehin ab, weil ihm der Anker
-- fehlt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bundle_mindestrabatt(p_bundle_id UUID)
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT COALESCE(
             -- Der höchste individuelle Anspruch im Bündel …
             (SELECT MAX(mein_mindestrabatt(
                         b.material_category,
                         p.requested_volume * COALESCE(b.kbob_reference_price, 0)))
                FROM bundle_participations p
                JOIN bundles b ON b.id = p.bundle_id
               WHERE p.bundle_id = p_bundle_id
                 AND COALESCE(p.status, 'PENDING') <> 'CANCELLED'),
             -- … und wenn niemand die Einstiegsschwelle erreicht, gilt der
             -- SOCKEL: die unterste Stufe der Kategorie. Sonst hätte ein
             -- Bündel aus lauter Kleinbestellungen gar keine Schwelle, und
             -- jedes Gebot käme durch — die Garantie wäre keine.
             --
             -- Das Bündel als Ganzes ist ja der Besteller; es soll
             -- mindestens das bekommen, was der kleinste Einstieg wert ist.
             (SELECT MIN(r.rabatt_pct)
                FROM rabattstufen r
                JOIN bundles b2 ON b2.id = p_bundle_id
               WHERE r.material_category = b2.material_category),
             0)
$$;

REVOKE ALL ON FUNCTION bundle_mindestrabatt(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bundle_mindestrabatt(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------
-- `bundle_recalc` schreibt den neuen Mindestrabatt
--
-- `bundle_tier()` mit seinen Stückzahlen wird nicht mehr gerufen. Die
-- Funktion bleibt bestehen, damit nichts anderes bricht, was sie noch
-- kennt — aber `current_tier` ist ab hier bedeutungslos und wird auf 0
-- gesetzt, statt eine Stufe vorzutäuschen, die es nicht mehr gibt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION bundle_recalc(p_bundle_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_volume NUMERIC;
    v_count  INTEGER;
    v_von    DATE;
    v_bis    DATE;
BEGIN
    SELECT COALESCE(SUM(requested_volume), 0), COUNT(DISTINCT buyer_company_id),
           MIN(liefer_von), MAX(liefer_bis)
      INTO v_volume, v_count, v_von, v_bis
      FROM bundle_participations
     WHERE bundle_id = p_bundle_id
       AND status <> 'CANCELLED';

    UPDATE bundles
       SET current_volume       = v_volume,
           participant_count    = v_count,
           current_tier         = 0,
           current_discount_pct = bundle_mindestrabatt(p_bundle_id),
           liefer_von           = v_von,
           liefer_bis           = v_bis
     WHERE id = p_bundle_id;
END;
$$;

-- ------------------------------------------------------------
-- Aufrunden auf 0.25 %, nie ab
--
-- Bei ganzen Prozenten fällt es nicht auf. Sobald aber eine Stufe auf
-- 1.5 % oder 2.5 % steht, entscheidet die Rundung darüber, ob die
-- Garantie beim Besteller wirklich ankommt. Abgerundet käme sie um ein
-- Hundertstel zu kurz — und eine Garantie, die knapp verfehlt wird, ist
-- schlimmer als eine niedrigere, die hält.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION mindestgebot(p_bundle_id UUID)
RETURNS TABLE (
    kbob                 NUMERIC,
    mindestrabatt_pct    NUMERIC,
    provision_pct        NUMERIC,
    gesamtrabatt_pct     NUMERIC,
    max_lieferantenpreis NUMERIC,
    bestellerpreis       NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
    SELECT b.kbob_reference_price,
           COALESCE(b.current_discount_pct, 0),
           einstellung_zahl('provision_buendel_pct', 2.25),
           CEIL((COALESCE(b.current_discount_pct, 0)
                 + einstellung_zahl('provision_buendel_pct', 2.25)) * 4) / 4,
           ROUND(b.kbob_reference_price
                 * (1 - (CEIL((COALESCE(b.current_discount_pct, 0)
                               + einstellung_zahl('provision_buendel_pct', 2.25)) * 4) / 4) / 100), 2),
           ROUND(b.kbob_reference_price
                 * (1 - COALESCE(b.current_discount_pct, 0) / 100), 2)
      FROM bundles b
     WHERE b.id = p_bundle_id
       AND b.kbob_reference_price IS NOT NULL
$$;

REVOKE ALL ON FUNCTION mindestgebot(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mindestgebot(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------
-- `submit_demand` weist Materialien ohne Staffel ab
--
-- Wortgleich zu Migration 40, ergänzt um eine Prüfung. Ein Bedarf in einer
-- Kategorie ohne Rabattstaffel würde ein Bündel erzeugen, dessen
-- Mindestrabatt null wäre — jedes Gebot käme durch, und die Garantie wäre
-- keine. Lieber vorne abweisen und sagen warum.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_demand(
    p_material_id    TEXT,
    p_material_label TEXT,
    p_sia            TEXT,
    p_unit           TEXT,
    p_category       TEXT,
    p_region         TEXT,
    p_volume         NUMERIC,
    p_kbob_price     NUMERIC,
    p_project_id     UUID,
    p_liefer_von     DATE,
    p_liefer_bis     DATE,
    p_days_open      INT DEFAULT 14
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
    v_company     UUID;
    v_bundle      UUID;
    v_von         DATE := date_trunc('month', p_liefer_von)::DATE;
    v_bis         DATE := date_trunc('month', p_liefer_bis)::DATE;
    v_spanne      INT  := einstellung_zahl('buendel_spannweite_monate', 3)::INT;
BEGIN
    v_company := current_company_id();
    IF v_company IS NULL THEN
        RAISE EXCEPTION 'Keine Firma für diesen Benutzer.';
    END IF;
    IF p_volume IS NULL OR p_volume <= 0 THEN
        RAISE EXCEPTION 'Menge muss grösser als null sein.';
    END IF;
    IF NOT kategorie_buendelbar(p_category) THEN
        RAISE EXCEPTION
            'Für % ist keine Rabattstaffel hinterlegt — dieses Material lässt sich noch nicht bündeln. Ohne Staffel gäbe es keine Schwelle, die ein Werk erfüllen müsste.',
            p_category;
    END IF;

    IF p_project_id IS NULL THEN
        RAISE EXCEPTION 'Ohne Baustelle geht es nicht — es muss feststehen, wohin geliefert wird.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND company_id = v_company) THEN
        RAISE EXCEPTION 'Diese Baustelle gehört nicht zu deiner Firma.';
    END IF;
    IF v_von IS NULL OR v_bis IS NULL THEN
        RAISE EXCEPTION 'Der Lieferzeitraum fehlt. Ohne ihn kann kein Werk seinen Aufwand rechnen.';
    END IF;
    IF v_bis < v_von THEN
        RAISE EXCEPTION 'Der Lieferzeitraum endet vor seinem Anfang.';
    END IF;
    IF (EXTRACT(YEAR FROM age(v_bis, v_von)) * 12 + EXTRACT(MONTH FROM age(v_bis, v_von))) >= v_spanne THEN
        RAISE EXCEPTION
            'Der Lieferzeitraum umfasst mehr als % Monate. Reiche die Etappen einzeln ein — ein Bündel über ein halbes Jahr kann kein Werk seriös preisen.',
            v_spanne;
    END IF;

    -- Offenes Bündel für dieselbe Nummer und Region suchen, das den
    -- Zeitraum verträgt. FOR UPDATE, damit zwei gleichzeitige
    -- Einreichungen nicht zwei Töpfe erzeugen, wo einer entstehen sollte.
    SELECT id INTO v_bundle
      FROM bundles
     WHERE material_id = p_material_id
       AND region      = p_region
       AND status      = 'OPEN'
       AND deadline    > NOW()
       AND (EXTRACT(YEAR  FROM age(GREATEST(liefer_bis, v_bis), LEAST(liefer_von, v_von))) * 12
          + EXTRACT(MONTH FROM age(GREATEST(liefer_bis, v_bis), LEAST(liefer_von, v_von)))) < v_spanne
     ORDER BY deadline ASC
     LIMIT 1
       FOR UPDATE;

    IF v_bundle IS NULL THEN
        INSERT INTO bundles (
            title, material_id, material_label, material_category,
            sia_specification, region, unit,
            target_volume, tier1_target, tier2_target, tier3_target,
            tier1_discount_pct, tier2_discount_pct, tier3_discount_pct,
            kbob_reference_price, deadline, status,
            liefer_von, liefer_bis
        ) VALUES (
            p_material_label || ' · ' || p_region,
            p_material_id, p_material_label, p_category,
            COALESCE(p_sia, ''), p_region, p_unit,
            -- Zielmenge ist die nächste erreichbare Stufe, nicht die
            -- höchste: ein Ziel, das niemand erreicht, entmutigt nur.
            201, 101, 201, 351,
            9, 12, 16,
            p_kbob_price, NOW() + (p_days_open || ' days')::INTERVAL, 'OPEN',
            v_von, v_bis
        )
        RETURNING id INTO v_bundle;
    END IF;

    -- EINE ZEILE JE BAUSTELLE, nicht je Firma.
    --
    -- Vorher wurde alles einer Firma in einer Teilnahme zusammengezogen.
    -- Das ging, solange niemand wissen musste, wohin geliefert wird — mit
    -- der Zuteilung ganzer Baustellen an mehrere Werke geht es nicht mehr:
    -- eine Firma mit zwei Baustellen im selben Bündel hätte eine davon
    -- verloren, und mit ihr deren Adresse und Zeitraum.
    --
    -- Derselbe Bedarf für dieselbe Baustelle stockt weiterhin auf, und der
    -- Zeitraum wächst dabei auf die Hülle beider Angaben.
    UPDATE bundle_participations
       SET requested_volume = requested_volume + p_volume,
           liefer_von       = LEAST(liefer_von, v_von),
           liefer_bis       = GREATEST(liefer_bis, v_bis)
     WHERE bundle_id        = v_bundle
       AND buyer_company_id = v_company
       AND project_id       = p_project_id
       AND status <> 'CANCELLED';

    IF NOT FOUND THEN
        INSERT INTO bundle_participations (
            bundle_id, buyer_company_id, requested_volume, project_id, status,
            liefer_von, liefer_bis
        ) VALUES (v_bundle, v_company, p_volume, p_project_id, 'PENDING', v_von, v_bis);
    END IF;

    PERFORM bundle_recalc(v_bundle);
    RETURN v_bundle;
END;
$$;

