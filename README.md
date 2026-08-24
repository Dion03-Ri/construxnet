# ConstruxNet

Smart-Bündelungs-Plattform für Schweizer Baumaterialien. Eigenständiges
Projekt — technisch und markenmäßig getrennt von SourceOn, mit einer
Ausnahme: **gemeinsamer Login** über dieselbe Clerk-Instanz.

## Architektur-Entscheidungen (siehe Chat-Verlauf für Details)

- **Login:** gleiche Clerk-Instanz wie SourceOn (Satellite-Domain-Setup),
  damit ein Firmenaccount für beide Produkte reicht.
- **Datenbank:** komplett eigenes Supabase-Projekt, keine Verbindung zu
  SourceOn's DB. Einziger gemeinsamer Bezugspunkt ist `clerk_user_id`.
- **Repo/Deployment:** eigenes GitHub-Repo, eigenes Vercel-Projekt.
- **Anonymität:** Bündel werden Lieferanten erst ab `min_participants_for_bidding`
  (Default 3) zur Ausschreibung freigegeben — k-Anonymität gegen Rückschluss
  auf Einzelfirmen. Firmendaten/Baustellen-Adressen werden erst mit dem
  SIA-118-Vertrag nach Zuschlag offengelegt.
- **Bid-Ranking:** primär gegen `kbob_reference_price` (KBOB-Index), nicht
  gegen den vom Werk selbst deklarierten Listentarif — verhindert
  Listenpreis-Gaming.
- **Fail-Case:** `bundles.fail_case_action` regelt explizit, was passiert,
  wenn Tier 1 bis zur Deadline nicht erreicht wird (Auto-Cancel oder
  Fallback auf Marktpreis).

## Setup

1. `npm install`
2. `.env.example` nach `.env.local` kopieren und ausfüllen:
   - Clerk-Keys: **dieselben wie im SourceOn-Projekt** (Vercel Env Vars
     von SourceOn kopieren)
   - Supabase-Keys: von einem **neuen, separaten** Supabase-Projekt
3. SQL-Migration in Supabase ausführen: `supabase/migrations/01_schema.sql`
4. Im Clerk-Dashboard (SourceOn-Projekt) unter "Domains" die ConstruxNet-
   Vercel-URL als Satellite Domain eintragen
5. `npm run dev`

## Noch offen / nächste Schritte

- [ ] Neues GitHub-Repo anlegen und diesen Code pushen
- [ ] Neues Supabase-Projekt erstellen, Migration ausführen
- [ ] Neues Vercel-Projekt verbinden, Env-Vars setzen
- [ ] Clerk Satellite-Domain im SourceOn-Clerk-Dashboard eintragen
- [ ] KbobChart-Komponente bauen (`/components/KbobChart.tsx`)
- [ ] BundleEngine-Komponente bauen (`/components/BundleEngine.tsx`)
- [ ] Paket-Koppelung UI + Deadline-Staffelung-Logik
- [ ] 3 Dashboard-Views (Buyer / Supplier / Admin)
- [ ] Lieferschein-OCR-Workflow
- [ ] Early-Bird-Rangvergabe (Trigger/Edge Function bei `bundle_participations` Insert)
- [ ] Gap-Closer Admin-Alert-UI (V1 manuell)
