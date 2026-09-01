# Projekt-Kontext (für Claude — beim Start automatisch gelesen)

## Was ist das
**Obtanet** (intern noch „ConstruxNet") — B2B-Netzwerk der Schweizer Baubranche.
Leitidee: **„Vernetzen fürs Beschaffen"** — Firmen vernetzen sich, bündeln
Materialbedarf zu **Smart Pools** und beschaffen günstiger.

**Smart-Pool-Mechanik (wichtig, korrekt halten):** Mehrere Firmen bündeln Bedarf
zu grösserem Volumen → Lieferanten geben **verdeckte Angebote (Sealed-Bid)** auf
das Volumen ab → das beste Angebot ggü. dem **KBOB-Referenzpreis** erhält den
Zuschlag. Kunden erhalten einen **garantierten Mindestvorteil** (NICHT „alle
denselben fixen Rabatt"). Quelle: SourceOn `tiers.js` (netto/brutto-Staffel).

## Stack
Next.js 15 (App Router), React 19, TypeScript, Tailwind, Clerk (Auth),
Supabase (server + browser client, `supabaseAdmin` service-role), Leaflet/OSM
(Karte), Recharts (Charts).

## Design / Corporate Identity — STRIKT
- Nur **Gold `#D99000`** (brand) + **Navy** (`#1B3A5C`, `#254D7A` = accent).
- **KEIN Grün** (kein emerald/green/teal), kein Orange. Slate = neutral, Rose = Fehler.
- Angestrebt: dunkle, seriöse, einheitliche B2B-Linie. Keine „KI-Klischees"
  (keine Sparkles-Deko, keine erfundenen Zahlen/Claims).

## Git-Workflow
- Arbeits-Branch: `claude/construxnet-platform-rebuild-jll7j9`.
- Ablauf: committen → PR → **squash-merge** nach `main` → Branch neu von main
  (`git fetch origin main && git checkout -B <branch> origin/main`).
- Push: `git push --force-with-lease=<branch>:<remote-sha> -u origin <branch>`.

## Build-Check (Dummy-Envs)
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k`
`CLERK_SECRET_KEY=sk_test_dummy` `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`
`NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy.anon.key` `SUPABASE_SERVICE_ROLE_KEY=dummy.service.key`
→ `npx tsc --noEmit` und `npx next build`.

## Pre-Launch-Sperre (aktiv)
- `COMING_SOON=1` (Env) → Öffentlichkeit sieht nur `/coming-soon` (Warteliste),
  alle anderen Routen → `/`.
- **Team-Zugang:** Passwort-Feld direkt auf der Coming-Soon-Seite. Passwort =
  `PREVIEW_PASSWORD` (Env) **oder** Standard `View_obtanet@Previewsite003!!`.
- Migrationen sind manuell auszuführen (Supabase SQL): `04`–`07`
  (Kontakt, Lieferanten-Profil, Post-Media-Bucket, `waitlist`).

## Token-Sparen (Nutzer-Wunsch)
- Immer nur die **wirklich nötigen** Dateien lesen (gezielt via grep), nicht den
  ganzen Baum. Für einfache Edits Modell **Sonnet**, Opus nur für schwere Arbeit.

## OFFEN / als Nächstes
- **Startseite (`app/page.tsx`) Redesign**: dunkler Mockup ist erstellt und vom
  Nutzer noch NICHT final freigegeben → erst nach OK 1:1 in `app/page.tsx`
  übernehmen. Offene Detailfrage: Branding **Obtanet vs. ConstruxNet**.
