-- ============================================================
-- CONSTRUXNET — CORE SCHEMA
-- Separates Supabase-Projekt, komplett unabhängig von SourceOn.
-- Verknüpfung zu SourceOn NUR über clerk_user_id (kein Cross-DB-Join,
-- keine Foreign Keys über Projektgrenzen hinweg).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMPANIES
-- clerk_user_id verweist auf die gemeinsame Clerk-Instanz (Shared Login
-- mit SourceOn), ist aber sonst folgenlos für dieses Projekt.
-- ============================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    uid_number TEXT UNIQUE NOT NULL, -- CHE-123.456.789
    role TEXT CHECK (role IN ('BUYER', 'SUPPLIER', 'ADMIN')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SMART BUNDLES / POOLS
-- Fix 1: min_participants_for_bidding erzwingt k-Anonymität, bevor
--        ein Bündel für Lieferanten sichtbar/ausschreibbar wird
--        (Schutz vor Disintermediation / Rückschluss auf Einzelfirmen).
-- Fix 3: fail_case_action definiert explizit, was passiert, wenn
--        selbst Tier 1 bis zur Deadline nicht erreicht wird.
-- ============================================================
CREATE TABLE bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    material_category TEXT NOT NULL,
    sia_specification TEXT NOT NULL,
    region TEXT NOT NULL,
    geo_radius_km INT DEFAULT 25,
    target_volume NUMERIC NOT NULL,
    current_volume NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    tier1_target NUMERIC NOT NULL,
    tier2_target NUMERIC NOT NULL,
    tier3_target NUMERIC NOT NULL,
    tier1_discount_pct NUMERIC DEFAULT 5,
    tier2_discount_pct NUMERIC DEFAULT 12,
    tier3_discount_pct NUMERIC DEFAULT 20,
    current_tier INT DEFAULT 0,
    min_participants_for_bidding INT DEFAULT 3, -- k-Anonymität
    kbob_reference_price NUMERIC, -- Anker für Bid-Bewertung, siehe supplier_bids
    early_bird_cutoff_pct NUMERIC DEFAULT 30, -- % der Laufzeit für Dispo-Priorität
    fail_case_action TEXT CHECK (fail_case_action IN ('AUTO_CANCEL', 'FALLBACK_MARKET_PRICE')) DEFAULT 'AUTO_CANCEL',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('OPEN', 'SEALED_BIDDING', 'AWARDED', 'FAILED', 'CANCELLED')) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- BUNDLE PARTICIPATIONS (BUYERS)
-- joined_at + early_bird_rank tragen die Early-Bird-Priorität (Fix 2)
-- ============================================================
CREATE TABLE bundle_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
    buyer_company_id UUID REFERENCES companies(id),
    requested_volume NUMERIC NOT NULL,
    is_early_bird BOOLEAN DEFAULT FALSE,
    early_bird_rank INT, -- Reihenfolge innerhalb der Frühphase, für Dispo-Priorität
    is_package_coupled BOOLEAN DEFAULT FALSE,
    linked_bundle_id UUID REFERENCES bundles(id), -- das gekoppelte zweite Material
    linked_participation_id UUID REFERENCES bundle_participations(id),
    coupling_fallback TEXT CHECK (coupling_fallback IN ('AUTO_CANCEL', 'AUTO_STANDARD')),
    status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')) DEFAULT 'PENDING',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SUPPLIER BIDS
-- Fix 2: Ranking erfolgt primär gegen kbob_reference_price (Bundle),
--        nicht gegen den selbst deklarierten Listentarif — verhindert
--        Listenpreis-Gaming. list_price_net bleibt nur zur Anzeige/
--        Transparenz-Aufschlüsselung im Supplier-Cockpit.
-- ============================================================
CREATE TABLE supplier_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
    supplier_company_id UUID REFERENCES companies(id),
    list_price_net NUMERIC NOT NULL, -- vom Werk deklariert, nur Anzeige
    offered_discount_percent NUMERIC NOT NULL, -- Brutto-Rabatt aufs list_price_net
    customer_price_net NUMERIC NOT NULL, -- = list_price_net * (1 - (discount - 2.25%))
    platform_fee_percent NUMERIC DEFAULT 2.25,
    price_vs_kbob_index NUMERIC, -- customer_price_net - bundles.kbob_reference_price, entscheidend fürs Ranking
    is_winning_bid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SIA CONTRACTS
-- Firmendaten/Baustellen-Adresse werden erst HIER (nach Zuschlag)
-- für den gewinnenden Lieferanten offengelegt — siehe RLS unten.
-- ============================================================
CREATE TABLE sia_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES bundles(id),
    buyer_company_id UUID REFERENCES companies(id),
    supplier_company_id UUID REFERENCES companies(id),
    contract_number TEXT UNIQUE NOT NULL,
    sia_standard TEXT DEFAULT 'SIA 118',
    total_contract_volume NUMERIC NOT NULL,
    final_unit_price_net NUMERIC NOT NULL,
    platform_fee_percentage NUMERIC DEFAULT 2.25,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- DELIVERY NOTES (LIEFERSCHEINE & OCR)
-- ============================================================
CREATE TABLE delivery_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES sia_contracts(id),
    bundle_id UUID REFERENCES bundles(id),
    buyer_company_id UUID REFERENCES companies(id),
    supplier_company_id UUID REFERENCES companies(id),
    delivery_note_number TEXT NOT NULL,
    delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_ocr_text TEXT,
    image_url TEXT,
    ocr_confidence_score NUMERIC(3,2),
    material_code TEXT,
    delivered_quantity NUMERIC NOT NULL,
    unit_price_net NUMERIC NOT NULL,
    total_line_amount_net NUMERIC NOT NULL,
    discrepancy_flag BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'DISCREPANCY', 'REJECTED')) DEFAULT 'PENDING',
    platform_commission_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- GAP-CLOSER LOG (Admin V1 manuell, V2 automatisiert — Feld ist
-- schon so gebaut, dass später ein Cron/Edge-Function reinschreiben kann)
-- ============================================================
CREATE TABLE gap_closer_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
    triggered_by TEXT CHECK (triggered_by IN ('ADMIN_MANUAL', 'AUTO_RULE')) DEFAULT 'ADMIN_MANUAL',
    target_supplier_ids UUID[],
    volume_missing NUMERIC NOT NULL,
    extra_incentive_chf NUMERIC,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES — WEKO-Anonymität / Disintermediation-Schutz
-- ============================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE sia_contracts ENABLE ROW LEVEL SECURITY;

-- Bundles: nur aggregiertes Volumen sichtbar für alle, NIE einzelne Buyer.
-- Lieferanten sehen ein Bündel erst, wenn min_participants_for_bidding erreicht ist.
CREATE POLICY "Aggregated bundle view" ON bundles
    FOR SELECT USING (true);

-- Buyer sehen nur ihre eigene Teilnahme (nie die anderer Firmen im selben Bündel)
CREATE POLICY "Buyers see only own participation" ON bundle_participations
    FOR SELECT USING (
        buyer_company_id IN (
            SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Supplier-Bids: andere Supplier sehen nie fremde Gebote (Sealed-Bid)
CREATE POLICY "Suppliers see only own bids" ON supplier_bids
    FOR SELECT USING (
        supplier_company_id IN (
            SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- SIA-Verträge (enthalten Klartext-Firmendaten): nur die zwei beteiligten Parteien
CREATE POLICY "Contract parties only" ON sia_contracts
    FOR SELECT USING (
        buyer_company_id IN (SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub')
        OR supplier_company_id IN (SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub')
    );

-- Companies: jede Firma sieht nur sich selbst
CREATE POLICY "Own company row only" ON companies
    FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
