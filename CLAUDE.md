# Projekt-Kontext (für Claude — beim Start automatisch gelesen)

## Was ist das
**Obtanet** — B2B-Netzwerk der Schweizer Baubranche. Branding ist final: im
Code/UI nirgends mehr "ConstruxNet" (Repo- und Branch-Name bleiben technisch
unverändert, sind aber nicht user-sichtbar).
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
- Nur **Gold `#D99000`** (brand) + **Navy/Corporate Blue** (`#1B3A5C`, `#254D7A` = accent).
- **KEIN Grün** (kein emerald/green/teal), kein Orange. Slate = neutral, Rose = Fehler.
- **Light Mode ist Standard** (Stand: Startseite + Dashboard): Weiss/Slate-50
  als Grundfläche, Navy/Blau als Haupt-Akzent (Buttons, Links, aktive Zustände),
  Gold gezielt als Sekundär-Akzent (Badges, Beispiel-Highlights) — NICHT die
  ganze Fläche/den Hintergrund in Navy tauchen. Keine „KI-Klischees" (keine
  Sparkles-Deko, keine erfundenen Zahlen/Claims).

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

## Materialnummern (OB-BET-001) — wofür sie da sind
- Schema `OB-<Kategoriekürzel>-<laufende Nummer>`, definiert in
  `data/procurement.ts` (`CATEGORY_CODE`, Feld `id`). Vorbild: SourceOn
  `SO-BET-001`.
- **Sie sind in erster Linie Infrastruktur, keine Beschriftung.** Zweck ist der
  gemeinsame Fixpunkt, auf den unterschiedliche Eingaben zusammenlaufen:
  „Beton C25/30", „Transportbeton 25/30", „C25/30 Ortbeton XC3" und
  „Beton 25er" sind vier Schreibweisen und ein Material — die KI ordnet sie
  alle `OB-BET-001` zu.
- **Daran hängt das Bündeln.** Ohne gemeinsamen Schlüssel liegen vier Firmen mit
  demselben Bedarf in vier getrennten Töpfen und niemand erreicht eine
  Rabattstufe. Der Abgleich ist die Voraussetzung, nicht ein Zusatz.
- Deshalb: In der Oberfläche zurückhaltend zeigen — dort, wo ein Mensch sie
  wirklich braucht (Bestell-PDF, Bestellübersicht, Anfrage an den Lieferanten).
  Nicht als Deko unter jeder Bezeichnung.
- Einmal vergeben = nie wieder ändern. Katalogpositionen nur hinten anhängen,
  nie umsortieren; genommene Nummern bleiben belegt.
- Selbst erfasste Materialien bekommen sofort eine echte Kategorienummer aus
  der Datenbank (`next_material_id`), keinen eigenen Namensraum. Grund: die
  Nummer darf sich nie ändern — ein späterer Wechsel von `OB-EIG-001` auf
  `OB-BET-100` hätte jede alte Bestellung ins Leere zeigen lassen.
  Nummernkreis: 001–099 gehört dem Katalog in `data/procurement.ts`,
  ab 100 vergibt die Datenbank.

## Bündeln — Stand
- Bedarf aus dem Beschaffungsformular geht über `submit_demand()` in echte
  Bündel (`bundles` + `bundle_participations`). Zusammengeführt wird auf
  Materialnummer + Region; die Datenbank entscheidet, weil zwei gleichzeitige
  Einreichungen sonst zwei Töpfe erzeugen.
- Rabattstufen stehen an **zwei** Stellen: `PROC_TIERS` in
  `data/procurement.ts` und `bundle_tier()` in der Datenbank. Ändert sich
  eine, muss die andere mit.
- **#27 offen — die aktuellen Stufen (5/9/12/16/20 %) sind NICHT belastbar.**
  Zwei Gründe, beide gerechnet: die Schwellen zählen Stückzahlen statt Werte,
  wodurch dieselbe Stufe zwischen CHF 12'000 (Dämmung) und CHF 561'000
  (Bewehrungsstahl) bedeutet — Faktor 47. Und 20 % sind in keiner
  Materialgruppe erreichbar; indexnahe Güter wie Stahl und Zement geben nur
  wenige Prozent her. Solange das so steht, darf keine Garantie live gehen.
  Der Nutzer recherchiert die realen Werte bei Werken. Die Frage dafür:
  „Wenn ich Ihnen für ein Quartal garantierte X Einheiten im Umkreis von
  20 km bringe, mit fixer Disposition und einem Ansprechpartner — wie viel
  liegt netto unter dem, was ein mittelgrosses Bauunternehmen heute zahlt?"
- Zwei Punkte, die bei der Festlegung mitentschieden werden müssen: die
  Plattformgebühr (2,25 %) geht vom garantierten Vorteil ab, das Werk muss
  also Stufe + Gebühr unter Referenz bieten. Und die Garantie misst gegen
  den KBOB-Index, der bei uns derzeit eine nachgebildete Reihe ist — eine
  Garantie gegen einen selbstgebauten Index ist angreifbar.
- Teilnehmerzahl liegt auf dem Bündel (`participant_count`), weil die
  Teilnahmen per RLS verdeckt sind — sichtbar ist die Menge, nie wer sie
  beisteuert.
- Ausschreibung, Gebote und Zuschlag laufen (`place_bid()`, `award_bundle()`).
  Bewertet wird gegen den KBOB-Referenzpreis des Bündels, nicht gegen den
  selbst deklarierten Listenpreis — sonst gewinnt, wer seinen Listenpreis
  hochsetzt.
- **Kein Zeitgeber:** `advance_due_bundles()` schaltet fällige Bündel weiter
  und wird beim Laden der Bündel-Liste aufgerufen (`lib/bundles.ts`). Sobald
  pg_cron oder ein externer Zeitgeber verfügbar ist, ruft der dieselbe
  Funktion — die Logik muss dafür nicht angefasst werden.
- **Noch offen:** Vertrags-PDF aus `sia_contracts`, Lieferscheine,
  Koppelung von Bündeln, Early-Bird-Priorität. Die Tabellen dafür stehen,
  die Oberfläche fehlt.

## Benachrichtigungen & Fristen
- **Keine eigene Tabelle.** Beides wird aus dem abgeleitet, was ohnehin
  dasteht: offene Verbindungsanfragen, eingegangene Angebote,
  Zustandswechsel der eigenen Bündel, ungelesene Nachrichten, Bündelfristen.
  Eine Melde-Tabelle müsste bei jedem Vorgang mitgeschrieben werden und liefe
  auseinander — eine Meldung über ein Bündel, das es nicht mehr gibt, ist
  schlimmer als gar keine.
- Gespeichert wird nur `companies.notifications_seen_at`; alles Neuere gilt
  als ungelesen. Gesetzt über `mark_notifications_seen()`, weil `companies`
  bewusst keine allgemeine Update-Regel hat.

## OFFEN / als Nächstes
- Startseite + Dashboard (`/dashboard`) sind auf Light Mode umgestellt. Andere
  Seiten (z.B. Coming-Soon, Netzwerk) sind noch dunkel — bei Bedarf einzeln
  nachziehen, nicht automatisch annehmen, dass alles schon hell ist.
- Branding einheitlich auf Obtanet umgestellt.
- **Materialabgleich Stufe 3 — KI (OFFEN, braucht API-Schlüssel).**
  Stufe 1 (Alias-Nachschlag) und Stufe 2 (deterministisch, `lib/materialMatch.ts`)
  sind gebaut und decken den Grossteil ab. Für den Rest fehlt ein Sprachmodell:
  - `ANTHROPIC_API_KEY` in Vercel setzen (der Nutzer hat noch keinen).
  - `npm i @anthropic-ai/sdk zod` — beim Bau bewusst wieder entfernt, damit
    keine ungenutzte Abhängigkeit im Baum liegt.
  - Route `app/api/material-match/route.ts`: Modell `claude-opus-5`,
    strukturierte Ausgabe über `output_config.format` mit `zodOutputFormat`,
    Eingabe = Freitext + Katalogliste, Ausgabe = `{ material_id, confidence,
    reason }`. Nur aufrufen, wenn Stufe 1 und 2 nichts Sicheres liefern —
    jeder Aufruf kostet.
  - Einhängen in `lib/useMaterialResolve.ts`, dort ist die Stelle markiert.
    Ein KI-Treffer wird als Alias mit `source: 'AI'` gemerkt, damit er beim
    zweiten Mal gratis ist.
  - Danach: hochgeladene Leistungsverzeichnisse (#25) über dieselbe Route.
- Migrationen `08`–`17` sind eingespielt; `18_notifications_seen.sql` ist neu.
