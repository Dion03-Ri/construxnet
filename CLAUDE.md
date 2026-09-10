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
- **Den PR immer selbst mergen** (ausdrücklicher Wunsch des Nutzers). Ein
  Push allein bringt nichts: obtanet.com wird von `main` deployed, der
  Arbeits-Branch ist unsichtbar. Ein Thema gilt erst als geliefert, wenn es
  auf `main` liegt — nicht, wenn es gepusht ist. Nach dem Merge den
  Commit auf `origin/main` prüfen und dem Nutzer melden.
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
  ausschliesslich `PREVIEW_PASSWORD` (Env). Ist die Variable nicht gesetzt,
  gibt es **keinen** Team-Zugang — auch nicht mit leerer Eingabe. Der frühere
  feste Standardwert im Code ist entfernt; er steht noch in der Git-Historie
  und darf nie wieder verwendet werden.
- Migrationen sind manuell auszuführen (Supabase SQL): `04`–`07`
  (Kontakt, Lieferanten-Profil, Post-Media-Bucket, `waitlist`).

## Migrationen prüfen, BEVOR sie in Supabase gehen

```
bash supabase/pruefung/aufsetzen.sh
```

Baut eine Wegwerf-Datenbank und spielt alle Migrationen der Reihe nach
ein. Bricht beim ersten Fehler ab und nennt die Datei. Details:
`supabase/pruefung/README.md`.

**Keine nachgebauten Schemata.** Migration 30 ging beim Auftraggeber nicht
durch, weil sie einen Fremdschlüssel an `direct_offers.buyer_company_id`
hängte — eine Spalte, die es nicht gibt: der Besteller steht auf
`direct_requests`, nicht auf dem Angebot. Geprüft war sie vorher trotzdem,
nur gegen ein von Hand geschriebenes Testschema, in dem diese Spalte
erfunden war. Der Test lief gegen eine Fiktion und konnte den Fehler nicht
finden. Wer eine Tabelle anfasst, liest ihre Migration — oder fragt die
Prüfdatenbank.

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

## Sicherheit — was gilt
- **Jede Tabelle im Schema `public` braucht RLS.** PostgREST stellt sie
  direkt bereit, und der öffentliche Schlüssel steckt im Browser-Bundle;
  ohne RLS ist eine Tabelle für das ganze Internet les- und schreibbar.
  `delivery_notes` und `gap_closer_alerts` waren genau so offen (Mig. 20).
- **Jede `SECURITY DEFINER`-Funktion braucht `SET search_path`** (Mig. 19).
- **Storage-Policies ohne `TO authenticated` gelten auch für Nicht-Angemeldete.**
  Der Bilder-Bucket war so offen; jetzt nur eigener Ordner, 5 MB, nur Bilder.
- **RLS kennt keine Spalten-Ebene.** Wo einzelne Felder unveränderlich sein
  müssen (Referenzpreis, Menge, Gebotspreis), braucht es einen Trigger.
- **Schreibende Vorgänge mit Regeln laufen über SECURITY-DEFINER-Funktionen**,
  nicht über Insert-Policies: `submit_demand`, `place_bid`, `award_bundle`,
  `next_material_id`. Wer selbst schreiben darf, kann auch Rabattstufen und
  Bewertungsgrundlagen schreiben.
- **Offen und bewusst so:** Firmenverzeichnis samt Kontaktdaten ist
  öffentlich (das ist der Zweck), Bündel sind für alle sichtbar (nur
  Summen, nie wer beiträgt).
- Vorschau-Passwort: kein Standardwert mehr im Code, nur `PREVIEW_PASSWORD`.
  Fehlt sie, ist zu — bewusst so, eine Sperre die bei fehlender
  Konfiguration jeden durchlässt ist keine.
- Ratenbegrenzung (`lib/rateLimit.ts`) auf Passworteingabe und Warteliste.
  **Im Arbeitsspeicher, also pro Instanz** — stoppt naives Durchprobieren,
  nicht einen verteilten Angriff. Für dauerhaften Schutz braucht es einen
  gemeinsamen Speicher (Upstash, Vercel KV oder eine Supabase-Tabelle).

## Chat
- Läuft über **Supabase Realtime** (in allen Plänen enthalten, auch im
  kostenlosen — kein zusätzliches Abo). `messages` ist in der Publikation
  `supabase_realtime`, RLS gilt weiter: jeder bekommt nur, was er ohnehin
  lesen dürfte.
- Gelesen-Vermerk über `mark_thread_read()` statt direktem UPDATE. Grund:
  die Zeilenregel erlaubt dem Empfänger, seine Zeile zu ändern, und RLS
  kennt keine Spalten-Ebene — er könnte sonst den Inhalt einer empfangenen
  Nachricht umschreiben. Ein Trigger sperrt Inhalt und Beteiligte zusätzlich.
- Tippanzeige und Online-Status laufen über Broadcast bzw. Presence auf
  einem Kanal je Gesprächspaar. Nichts davon wird gespeichert.
- **Geladen wird in Fenstern, nicht auf einmal** (Migration 29).
  `chat_threads()` liefert eine Zeile je Gespräch — letzte Nachricht, Zahl
  der ungelesenen, letztes Angebot, weggelegt ja/nein —, `chat_history()`
  ein Fenster von 50 Nachrichten. Vorher holte der Chat bei jedem Öffnen
  **sämtliche** Nachrichten der Firma, sortiert `ASC`: eine Zeilengrenze
  hätte die NEUESTEN abgeschnitten, lautlos.
- **Weglegen statt löschen** (`chat_archive()`). Gilt nur für die eigene
  Seite, ist umkehrbar, und ein weggelegtes Gespräch kommt von selbst
  zurück, sobald die Gegenseite schreibt — die Datenbank vergleicht dafür
  den Zeitpunkt des Vermerks mit der letzten Nachricht.
  **Ein „Chat leeren" gibt es bewusst nicht:** im Verlauf stehen Angebote,
  auf die sich beide Seiten berufen. Wer löschen könnte, könnte den Beleg
  der Gegenseite vernichten. Aus demselben Grund sperrt Migration 21 den
  Inhalt gesendeter Nachrichten.
- Die Rechenteile stehen in `lib/chat.ts`, ausserhalb des Bauteils, mit
  Prüfungen in `lib/__pruefungen/chat.mts` (`npx tsx …`). Grund: was man
  nicht einzeln aufrufen kann, prüft man auch nicht einzeln — genau dort
  sass der Fehler oben.
- **Vor dem Launch, nicht jetzt:** Benachrichtigung, wenn jemand nicht auf
  der Seite ist.
  - **Web-Push** — Service-Worker plus VAPID-Schlüsselpaar, keine laufenden
    Kosten, kein Dienst nötig. Vorrang.
  - **E-Mail** („neue Nachricht") — braucht einen Versanddienst (z. B.
    Resend). Später, ausdrücklich nach Web-Push.

## Video auf der Startseite
- **Videos gehören nicht ins Repository**, sondern in den **Vercel Blob
  Store**. Die Adresse steht in `data/media.ts`; ist sie leer, rendert
  `ProcessVideo` gar nichts. Hochladen:
  `npx vercel blob put ./ablauf.mp4 --pathname video/ablauf.mp4 --access public`
- Das Video läuft **nie von selbst** — `controls`, kein `autoplay`,
  `preload="metadata"`. Ein Video, das auf einer Geschäftsseite von selbst
  losläuft, ist Störung und kostet mobil fremde Daten.
- **Keine Fotohintergründe auf den Startseiten-Karten.** Die Karten
  „Aktive Smart Pools" und „Firmen im Netzwerk" bleiben schlichte helle
  Karten. Ein Versuch mit Bildern darunter (PR #115/#116) wurde auf Wunsch
  wieder entfernt — die Zahlen darauf lasen sich schlechter, und die Seite
  verlor ihre ruhige Linie. Bitte nicht erneut einbauen.
- Sollten doch einmal Bilder nötig sein: nur mit Lizenz, und vorher
  verkleinern (1800 px, mozjpeg) — Rohbilder mit 13 MB gehören nicht auf
  eine Startseite.

## Nach jedem Merge: Branch auf main zurücksetzen
Pull Requests werden **squash**-gemerged. Dabei entsteht auf `main` ein neuer
Commit; der alte Commit bleibt auf dem Arbeits-Branch liegen. Beim nächsten
Pull Request meldet GitHub dann `merge conflicts`, obwohl inhaltlich nichts
kollidiert — es sind schlicht zwei Historien derselben Änderung.

Darum direkt nach jedem Merge:

    git fetch origin main
    git checkout -B claude/construxnet-platform-rebuild-jll7j9 origin/main

Wer es vergisst, holt es nach: `git checkout -B <branch> origin/main` und den
eigenen Commit mit `git cherry-pick <sha>` darauf setzen. Niemals stattdessen
einen Merge-Commit von `main` in den Branch ziehen — das schleppt die
doppelte Historie mit.

## Design-Fundament — EIN dunkles Register
Es gab einmal zwei Gestaltungssprachen: dunkel im Marketing, hell in der App.
Das las sich wie zwei Websites in einer und wurde verworfen. **Die ganze
Seite ist dunkel** — Startseite wie eingeloggter Bereich. Vorbild ist
Robinhood, wo Marketing und Anwendung dieselbe Sprache sprechen.

### Flächen — genau drei Stufen
Alle in `lib/ui.ts`. Wer eine vierte braucht, hat zu tief verschachtelt.
- `GROUND` `#060B12` — der Seitengrund. Sitzt auf dem `<body>` in
  `app/layout.tsx`, nicht in den einzelnen Seiten. So bleibt nirgends eine
  helle Lücke, wenn eine neue Seite dazukommt.
- `PANEL` `#0B1522` mit `border-white/[0.08]` — Karten auf dem Grund.
- `ROW` `bg-white/[0.03]` — Zeilen und Felder **innerhalb** eines Panels.

### Text — genau drei Stufen
`T_HI` weiss · `T_MID` `white/60` · `T_LOW` `white/40`. Mehr franst aus.

### Was nicht mehr vorkommt
- **Helle Flächen.** Kein `bg-white`, kein `bg-slate-50`, kein
  `text-slate-900`. `CARD`/`CARD_HOVER` sind nur noch Altlasten und zeigen
  auf die dunklen Werte; neuer Code nimmt `PANEL`/`PANEL_HOVER`.
- **Pastellkästen** (`bg-amber-50` und Verwandte). Ein Hinweis ist auf
  dunklem Grund ein leuchtender Rand auf durchscheinender Fläche, kein
  hellgelbes Rechteck.
- **Icons in abgerundeten Kacheln.**
- **Umrandete Karten nebeneinander.** Wo zwei oder drei gleichartige Blöcke
  nebeneinander stehen — Preisstufen, zwei Listen, mehrere Kennzahlen —
  gehören sie auf **dieselbe Fläche**, getrennt allein durch eine senkrechte
  Haarlinie (`lg:border-l lg:border-white/[0.08]`). So macht es Linear auf
  der Preisseite. Jede Gruppe in ein eigenes gerundetes Rechteck zu setzen,
  ist das Erkennungszeichen generierter Entwürfe.
  Ein Rahmen bleibt richtig, wo etwas wirklich ein eigenes Objekt ist: die
  zwei grossen Produktkarten in „Zwei Wege" und die Aufnahme aus der
  Anwendung. Alles andere trägt die Linie.

### Trennung ohne Farbe
Auf einer durchweg dunklen Seite trennt nicht mehr Hell gegen Dunkel,
sondern **Raum und Haarlinie**. Ein Abschnitt setzt sich ab durch
`border-t border-white/[0.08]`, einen leicht anderen Grundton
(`#040810` gegen `#060B12`) und den weitesten Abstand — nicht durch eine
weisse Fläche.

### Bilder auf schwarzem Grund
`art-buendel.jpg` und `art-direkt.jpg` liegen auf **echtem** `rgb(0,0,0)`.
Die Karten in „Zwei Wege" sind deshalb `bg-black` — so ist die Bildkante
unsichtbar.

**Vor dem Ablegen den Schwarzpunkt prüfen.** Der Hintergrund von
art-direkt lag ursprünglich bei `rgb(27,19,7)`; auf der schwarzen Karte
stand das Bild dadurch als heller Kasten. Kein Rand-, sondern ein
Schwarzpunkt-Problem — nachgemessen an den Rohdaten der Randstreifen, dann
pro Kanal gestreckt, bis der Grund auf 0 fällt. Weder eine Maske noch ein
Verlauf hilft dagegen; beide verdecken nur.

**Kein Schimmer hinter so ein Bild legen:** das deckend schwarze Bild
stanzt ihn aus, und der Rest bleibt als heller Rahmen stehen.

## Formensprache — weiche Ecken, dünne Ränder
- Vorbild ist der Aufbau grosser Produktkarten: sehr weiche Ecken
  (`rounded-2xl` für Karten, `rounded-[28px]`/`[32px]` für grosse Panels),
  hauchdünne Ränder (`border-white/[0.09]` auf dunklem, `border-slate-200`
  auf hellem Grund), Knöpfe und Badges als **Pillen** (`rounded-full`).
- Die alten scharfen 8px-Kanten überall wirkten wie von der Stange. Zentral
  geändert in `lib/ui.ts` (`CARD`, `CARD_HOVER`, `INPUT`, `badge`,
  `SEGMENT_GROUP`, `segment`) — dort anpassen, nicht in einzelnen Dateien.

## Startseite: keine Scroll-Erzählung
- Der Abschnitt „Smart Pools" ist eine **stille** Sektion: Text links,
  Bündelungs-Grafik rechts. Fertig.
- Es gab einen Versuch mit einer scroll-getriebenen Erzählung
  (`components/home/BundleScroll.tsx`, PR #113/#114) — auf Wunsch wieder
  entfernt. Bitte nicht erneut einbauen.
- Falls doch je wieder Scroll-Bewegung gefragt ist: **nicht** mit
  framer-motion. `useTransform` verhielt sich hier unzuverlässig — Werte
  liefen jenseits des Eingabebereichs zurück statt zu begrenzen. Ein
  `requestAnimationFrame`-gedrosselter Hörer, der genau EINE CSS-Variable
  setzt, und `clamp()` in CSS war die Lösung, die trug.

## Rechtsseiten
- `data/legal.ts` hält alle rechtlichen Eckdaten an einer Stelle. Werte mit
  `[[…]]` sind noch offen und werden auf der Seite golden markiert statt
  stillschweigend ausgegeben.
- Grundlagen: Impressum nach **Art. 3 Abs. 1 lit. s UWG** (E-Mail ist Pflicht,
  ein Formular genügt nicht); Datenschutz nach **Art. 19 DSG** (revidiertes
  DSG seit 1.9.2023) samt Bekanntgabe ins Ausland nach **Art. 16 DSG**
  (USA seit 15.9.2024 in Anhang 1 DSV, aber nur für nach dem
  Swiss-U.S. Data Privacy Framework zertifizierte Firmen); AGB als
  **B2B**-Vertrag — die Inhaltskontrolle nach Art. 8 UWG greift nur gegenüber
  Konsumenten, die Gerichtsstandsabrede ist nach **Art. 17 ZPO** zulässig.
- Die drei Seiten sind in `middleware.ts` öffentlich UND von der
  Vorstart-Sperre ausgenommen. Beim Anpassen der Sperre daran denken.

## Kontaktdaten — nur für Verbindungen
- E-Mail, Telefon, Adresse und Website sind **nicht** Teil der allgemeinen
  Firmen-Freigabe. Sie kommen über `company_contact(p_company)` — eine
  SECURITY-DEFINER-Funktion, die prüft, ob die Firma man selbst ist oder eine
  **bestätigte** Verbindung besteht. Ohne Argument liefert sie alle erlaubten
  Kontakte (Chat), mit Argument einen (Firmenprofil).
- Migration 23 setzt dafür die Freigabe auf `companies` spaltenweise neu.
  **Postgres-Eigenheit:** ein `REVOKE` einzelner Spalten greift nicht, solange
  eine Freigabe auf Tabellenebene besteht — deshalb wird sie zuerst ganz
  entzogen und dann als Liste neu erteilt. Aus demselben Grund wirkt der
  Entzug von `clerk_user_id` aus Migration 19 erst jetzt wirklich.
- **Folge fürs Weiterbauen:** eine NEUE Spalte auf `companies` ist für
  angemeldete Nutzer erst lesbar, wenn sie in Migration 23 in die Liste
  aufgenommen wird. Privat als Vorgabe — aber daran denken.
- Nicht freigegeben: `clerk_user_id`, `email`, `phone`, `address`, `website`,
  `geo_query`, `geo_at`. Die Service-Rolle sieht weiterhin alles.

## Profil bearbeiten (`/profile/edit`)
- Ein Formular für Firma, Standort, Kontakt, Beschreibung und (nur
  Baustoffwerke) das Liefer-Profil. Erreichbar über Profilmenü, den Knopf auf
  dem eigenen Firmenprofil und den Reiter Einstellungen im Dashboard.
- Geschrieben wird über die Service-Role mit einer **festen Feldliste**.
  `role`, `verified`, `id`, `clerk_user_id` und `show_on_map` sind bewusst
  nicht dabei — sonst könnte sich jede Firma selbst verifizieren oder zum
  Lieferanten machen. Die Zeile kommt über die Clerk-ID aus `auth()`, nie
  über eine ID aus dem Formular.
- Ändert sich die Adresse und steht die Karten-Zustimmung, wird der
  Kartenpunkt beim Speichern gleich neu ermittelt.
- Logo geht in den Bucket `post-media` unter `<Firmen-ID>/logo-…` — genau
  der Ordner, den die Speicher-Regel aus Migration 20 erlaubt. Endung aus
  dem Dateityp, nicht aus dem Dateinamen.
- Kontaktdaten sind für **alle angemeldeten Firmen** sichtbar, nicht nur für
  Verbindungen. Wenn das enger werden soll, ist das eine eigene Änderung.

## Karte (`/map`) — echte Standorte
- Wer `show_on_map` einschaltet, wird **im selben Vorgang** über die amtliche
  Adresssuche von **swisstopo** (`api3.geo.admin.ch`, kostenlos, kein
  Schlüssel) verortet; `lat`/`lng`/`geo_label` landen in `companies`.
- Fällt die Suche aus oder ist die Adresse zu dünn, bleibt es bei der groben
  Einordnung nach Ort bzw. Kanton aus `data/chMap.ts` — solche Punkte sind
  blass und im Popup als „ungefähr" gekennzeichnet. Nie so tun, als wäre eine
  Schätzung eine Adresse.
- **Datenschutz:** Koordinaten stehen nur in der Zeile, solange die
  Zustimmung steht. Zieht jemand sie zurück, löscht die Anwendung sie — und
  ein Trigger (Migration 22) räumt zusätzlich auf, falls das im Code je
  vergessen geht.
- Die Karte zeigt **alle** zugestimmten Firmen, nicht nur Baustoffwerke;
  Gold = Baustoffwerk, Navy = Bauunternehmen, grosse Punkte = verifiziert.
- Der Kartenbehälter braucht `isolate`: Leaflet zeichnet mit z-index 400+ und
  legt seine Nadeln sonst über die feste Handy-Navigation.

## Netzwerk vs. Feed — die Rollentrennung
- **Feed** (`/feed`) = *was passiert*: Beiträge, laufende Bündel, Aktivität.
  Zeitachse.
- **Netzwerk** (`/network`) = *mit wem du arbeitest*: Verbindungen verwalten,
  erhaltene Anfragen beantworten, gesendete Einladungen zurückziehen. Drei
  Reiter, echte Listen — kein zweiter Feed.

### Logo (ENTSCHIEDEN)
Wortmarke „obtanet" — „obta" in Navy `#1B3A5C` bzw. Weiss, „net" in Gold
`#D99000`. Kein Bauhelm, kein Symbolkästchen, kein Verlauf.

**Das „o" steht nirgends allein.** Es gab kurz ein Zeichen aus dem
einzelnen Buchstaben — im Kopf des Handys, auf der Onboarding-Seite und
als Favicon. Ein heller Ring bei 28 px sieht aus wie ein Ladekreis.
Überall auf der Seite steht die ganze Wortmarke.

**Das Favicon trägt „on", freigestellt, ohne Kachel — und es gibt zwei
davon.** Der ganze Schriftzug war dort bei 32 px nur noch ein Schimmer;
ein Favicon ist 16 bis 32 px gross, ein Wort aus sieben Buchstaben passt
da nicht hinein. „on" sind die Anfangsbuchstaben der zwei Hälften
(**o**bta / **n**et).

Zwei Fassungen, weil keine Farbe auf beiden Tab-Leisten sitzt (gemessene
Kontraste):

| | Weiss | Chrome hell | Chrome dunkel | Safari dunkel |
|---|---|---|---|---|
| Navy `#1B3A5C` | 11,6 | 10,4 | **1,4** | **1,2** |
| Weiss | **1,0** | **1,1** | 16,1 | 13,9 |
| Gold `#D99000` | 2,6 | 2,4 | 6,1 | 5,3 |

- `public/icon-hell.png` — „o" Navy, „n" Gold → `prefers-color-scheme: light`
- `public/icon-dunkel.png` — „o" Weiss, „n" Gold → `prefers-color-scheme: dark`

Beide stehen in `metadata.icons` in `app/layout.tsx`, die helle zuerst:
wer `media` nicht auswertet, nimmt sie, und eine helle Tab-Leiste ist der
häufigere Fall. **Es darf kein `app/icon.png` geben** — die
Dateikonvention von Next würde eine dritte Verknüpfung ohne `media`
erzeugen und die Auswahl kaputtmachen.

`app/apple-icon.png` bleibt **deckend** (Navy-Kachel, „o" weiss, „n"
gold): iOS legt den Startbildschirm-Knopf auf keinen durchsichtigen
Grund, sondern macht daraus Schwarz.

Die zwei Buchstaben sind **aus der Wortmarke geschnitten, nicht
nachgezeichnet** — „o" liegt in `logo-hell.png` auf den Spalten 0–217,
„n" auf 771–940. Der Zwischenraum von 34 px ist ebenfalls abgeleitet:
o→b sind dort 41 px, n→e 26 px; rund gefolgt von gerade liegt dazwischen.
Ändert sich die Wortmarke, müssen diese Spalten neu bestimmt werden.

Es gibt genau zwei Dateien:
- `public/logo-hell.png` — Weiss + Gold, für dunklen Grund
- `public/logo-dunkel.png` — Navy + Gold, für hellen Grund
- `public/icon-hell.png` / `icon-dunkel.png` — „on", freigestellt
- `app/apple-icon.png` — Navy-Kachel mit „on" (iOS braucht deckend)

**Nirgends den Namen als Text setzen.** `Obta<span>net</span>` stand im
Fuss, auf der Zugangsseite und in Coming-Soon. Im Fuss lief dabei das
`gap-2` des Flex-Kastens zwischen „Obta" und „net" — sichtbar als
Leerzeichen mitten im Namen, weil Flex Textknoten und `span` als zwei
Kinder behandelt. Immer `logo-hell.png` bzw. `logo-dunkel.png`.

Die Vorlagen liegen unter `design/logo/` als JPEG. Die Dateien in
`public/` sind daraus freigestellt und **auf die CI-Werte umgefärbt** —
die Farbe wird pro Bildpunkt neu gesetzt, nicht aus dem JPEG übernommen.
Deshalb sind sie exakt `#D99000` und `#1B3A5C`, egal was die Kompression
aus der Vorlage gemacht hat. Das Skript dafür steht in der
Commit-Beschreibung; ändert sich die Vorlage, muss es neu laufen.

**Offen:** es gibt noch kein SVG. Für Druck, Fahrzeugbeschriftung und
sehr grosse Darstellung braucht es eins — die PNGs reichen für den
Bildschirm (1254 px breit, also rund 9-fach über der Kopfgrösse).

### Die Kopfleiste trägt Wörter, keine Symbole
Fünf Symbole mit je einem Wort darunter, in Kästen fester Breite — das
ist das Erkennungszeichen jeder erzeugten Verwaltungsoberfläche, und ein
Haus für „Feed" sagt nichts, was das Wort nicht schon sagt. Die
Kopfleiste hat nur Wörter, mit Luft dazwischen; die aktive Seite bekommt
einen goldenen Strich auf der Unterkante der Leiste — dieselbe Markierung
wie bei den Reitern im Feed.

Die Symbole bleiben in der **unteren Leiste des Handys**: dort trägt eine
Reihe aus fünf Wörtern nicht.

### Der Rand ist überall 72 px
`SHELL`, `SHELL_NARROW` und `SHELL_WORK` haben dieselbe Geometrie:
`max-w-[1760px]`, `lg:px-[72px]`. Es gibt keine schmalere Hülle mehr.
`SHELL_NARROW` war einmal 980 px — dadurch begann der Text auf
Rechtsseiten, Formularen und Listen rund dreihundert Pixel von der
Fensterkante, auf allen anderen zweiundsiebzig.

Begrenzt wird stattdessen die **Inhaltsspalte**: `COLUMN`
(`max-w-[860px]`, links am Rand, nicht zentriert). Kopf über die volle
Breite, Inhalt in einer lesbaren Spalte darunter. Angewandt auf
`/termine`, `/network/requests`, `/delivery-notes`, `/profile/edit`,
`/admin-control`, `/notifications`, `/company/[id]` und die Rechtsseiten.

Nachgemessen (Playwright, 1440 px): jede Seite beginnt bei 72 px.

### Aufbau der Feed-Seite (ENTSCHIEDEN)
**Der Rand ist überall derselbe: 72 px** (`SHELL_WORK` ist `SHELL`). Eine
zentrierte, schmalere Hülle war der erste Versuch und war falsch — dann
sitzt der Feed sichtbar enger als der Rest der Seite.

Begrenzt werden nicht die Hülle, sondern **die Spalten**: Beiträge
höchstens 820 px (920 ab `2xl`), Schiene 340 px, die eine links, die
andere rechts am Rand. Was auf breiten Schirmen dazwischen übrigbleibt,
ist Zwischenraum und keine gestreckte Zeile. Über die volle Breite
gestreckt wären Zeilenlisten Streifen — eine Haarlinie von 1600 px mit
einem Firmennamen links und einem Wort rechts — und ein quadratisches Foto
so gross wie der halbe Bildschirm.

Von oben nach unten:
1. **Kopfband** — links vier Zahlen (Verbindungen, Aktive Pools, Offene
   Anfragen, Nächste Frist) in 34 px; rechts die **Wolke**: Nachrichten ·
   Fristen · Beschaffungspartner finden · Empfangene Anfragen ·
   Gespeicherte Pools. Verschiedene Schriftgrade und Höhenversätze, aber
   eine Schrift, eine Farbe, ein Verhalten — ohne diese Einschränkung wird
   aus „durcheinander" sofort „unordentlich". Der Versatz gilt erst ab
   `lg`; umgebrochen laufen versetzte Zeilen ineinander.
2. **Bündel-Chancen** (`wide`) — das Einzige über die ganze Breite. Drei
   Zeilen, die man im Vorbeigehen liest.
3. **News + Schiene** — `NetworkFeed` links, daneben rechts am Rand eine
   Schiene mit `KbobTile` und `RecommendedPartners`. Die Schiene ist
   `sticky`; auf dem Handy steht sie mit `order-first` VOR dem Strom.

Drei Regeln, die den Aufbau festlegen:
- **Die News stehen zuletzt** und alles Begleitende neben ihnen. Sie laden
  beim Scrollen endlos nach; was darunter stünde, erreicht nie jemand —
  auch auf dem Handy nicht, daher `order-first` für die Schiene.
- **Höchstens 820 px für einen Beitrag.** Das ist die Lesebreite.
- **Ein Beitragsbild wird verkleinert, nie beschnitten.**
  `max-h-[420px] w-auto max-w-full object-contain` — das Seitenverhältnis
  bleibt, begrenzt wird die längere Seite. Ein Quadrat erscheint als
  420 × 420, ein Breitformat wird von der Spalte begrenzt, ein Hochformat
  von der Höhe. Ein Ausschnitt (`object-cover`) wäre hier falsch: ein
  Lieferschein oder ein Werkfoto ohne seine Ränder ist oft wertlos.
- **Der Balken in einer Bündel-Zeile hat eine feste Länge (20rem).** Liesse
  man ihn mitwachsen, wäre er bei 1760 px ein Meter Strich mit drei Wörtern
  daneben. Region, Füllstand und Rabatt hängen rechts am Rand, mit festen
  Zellenbreiten, damit die Zahlen der drei Zeilen untereinander stehen.
- **Keine eigene Profilkarte im Feed.** Logo, Firmenname, Rolle und Ort
  gehören ins Dashboard.

Gelöscht und nicht wiederherstellen: `FeedBundleHero` („Was brauchst du
auf der Baustelle?" — kostete die Höhe eines halben Beitrags und sagte
nichts, was die Melde-Zeile nicht in vier Wörtern sagt), `ProfileRail`,
`BundleOpportunities`. „Verbindungen" ist als *Verweis* gestrichen — es
führte an dieselbe Stelle wie „Beschaffungspartner finden"; als *Zahl*
bleibt es. Die Region ist ein Auswahlfeld und keine Chip-Reihe:
sechsundzwanzig Kantone gehören nicht als Wörterband auf die Seite.

- **Entdecken** (`/network/entdecken`) = die grosse Liste aller Firmen mit
  Suche, Kanton-, Rollen- und Verifiziert-Filter, Sortierung und
  „Weitere anzeigen". Ziel jedes „Passende Firmen finden"-Knopfs.
- „Passend zuerst" sortiert nach **nachvollziehbaren** Merkmalen: gleicher
  Kanton, ergänzende Rolle, verifiziert. Keine erfundenen Trefferquoten.
- Gemeinsamer Unterbau: `lib/network.ts` (`useNetwork()` — Firmen,
  Verbindungen, connect/accept/remove) und `components/network/CompanyCard.tsx`
  (auf dem Handy kompakte Zeile, ab `sm` Karte).

## Handy-Ansicht — was gilt
- Inhalt zuerst: Seitenspalten sind auf dem Handy entweder ausgeblendet
  (`hidden lg:block`) oder per `order` nach hinten sortiert. Das Dashboard
  ersetzt die Seitenspalte durch eine waagrechte Tab-Leiste (`no-scrollbar`).
- Lange Erklärtexte haben auf dem Handy eine Kurzfassung (`sm:hidden`) und
  ab `sm` den vollen Absatz.
- Feste Höhen mit `100dvh` statt `100vh` und immer minus der unteren
  Navigation (`pb-safe-nav`, Safe-Area des iPhone-Home-Indikators).
- Jede Tabelle steckt in einem `overflow-x-auto`-Behälter.

## OFFEN / als Nächstes
- Branding einheitlich auf Obtanet umgestellt.
- **Kästchen-Abbau: abgeschlossen.** Alle Seiten und alle Bausteine sind
  auf Haarlinien statt Rahmen umgestellt. `PANEL` steht nur noch an
  EINER Stelle: um die Karte in `components/map/SupplierMap.tsx`. Die
  ist ein eigenes Objekt und braucht einen Rahmen, damit die Kacheln an
  den weichen Ecken beschnitten werden. Wer eine neue Seite baut, fängt
  gar nicht erst mit `PANEL` an.
- **`TILE` — der schwarze Anker.** Der Seitengrund ist `#060B12`, also
  fast, aber nicht ganz schwarz. Eine Fläche in echtem Schwarz tritt
  darauf hervor, ohne dass ein Rahmen nötig wäre. Für die eine Zahl, die
  auf einer Seite zählt: Marktstand im Feed, Kennzahlen auf
  Referenzpreise, Überblick im Netzwerk. **Höchstens einer je
  Bildschirm** — zwei heben sich gegenseitig auf.
- **Gold ist die knappste Ressource.** Höchstens EIN gefüllter
  Gold-Knopf pro Bildschirm. In Listen und Tabellen trägt der Knopf
  Goldschrift auf einem Goldrand und füllt sich erst beim Zeigen —
  vierundzwanzig „Vernetzen" untereinander waren sonst eine Goldwand.
- **`text-accent` nie auf dunklem Grund.** `accent` ist `#1B3A5C` — ein
  Navy für helle Flächen. Auf `#060B12` ist es praktisch unsichtbar; die
  Verifizierungshaken im Feed waren so lange schlicht nicht zu sehen.
  Überall durch `text-brand` ersetzt. Dasselbe gilt für `text-brand-700`
  (`#9A6A00`).
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
- Migrationen `08`–`29` sind eingespielt. **`30_konto_schliessen.sql` und
  `31_bindung.sql` sind neu und noch NICHT eingespielt.**

## Vor dem Launch — Pflicht
Diese Punkte müssen erledigt sein, bevor echte Firmen darauf arbeiten:
0. **Preismodell bestätigen.** Der Abschnitt steht auf `/` und ist gebaut
   (`components/home/Pricing.tsx`), aber **die Zahlen 0 / 79 / 189 sind
   Platzhalter** — ausdrücklich als Testwerte vereinbart, um den Aufbau zu
   sehen. Sie dürfen NICHT in Werbung, AGB oder Verträge übernommen werden,
   bevor Folgendes entschieden ist:
   · Was kostet Pro pro Monat (und pro Jahr, falls es das gibt)?
   · Was ist in der Gratisstufe enthalten, was nur in Pro?
   · Gibt es eine Stufe für Lieferanten/Baustoffwerke, und wenn ja welche?
   · Läuft die Vermittlungsgebühr getrennt vom Abo oder ist sie darin?
   Sobald die Zahlen stehen: Abschnitt zwischen „Der Unterschied in Zahlen"
   und den Pools-/Netzwerk-Karten, drei Säulen im dunklen Register, die
   mittlere golden hervorgehoben.
1. **Rabattstufen festlegen** (#27). Die aktuellen sind nachweislich nicht
   haltbar — siehe oben. Ohne belastbare Zahlen darf keine Garantie raus.
2. **KBOB-Referenz aus einer belegbaren Quelle.** Die Kurve ist heute eine
   nachgebildete Reihe. Eine Garantie „X % unter KBOB" gegen einen
   selbstgebauten Index ist angreifbar.
3. **Vorstart-Sperre entfernen** (`COMING_SOON`, `PREVIEW_PASSWORD` in
   Vercel löschen).
4. **Web-Push** für Nachrichten (siehe Chat).
5. ~~Ratenbegrenzung über einen gemeinsamen Speicher~~ — **erledigt**,
   Migration 25 (Tabelle `rate_limits`).
5b. **PLAN-GRENZEN SCHARF SCHALTEN.** Migration 26 ist eingespielt, der
   Wächter steht, aber der Schalter ist auf `off` — heute darf jede Firma
   beliebig viele Bündel. Am Starttag, wenn die Zahlung läuft, im
   Supabase-SQL-Editor ausführen:

   ```sql
   UPDATE app_settings SET value = 'on' WHERE key = 'plan_limits';
   ```

   Danach erlaubt die Gratis-Stufe genau **ein** laufendes Bündel
   gleichzeitig; der Versuch, einem zweiten beizutreten, wird mit einem
   Hinweis auf `/konto` abgewiesen. Zurück geht es jederzeit mit `'off'`,
   ohne neue Auslieferung.

   **Der Nutzer speichert diesen Befehl NICHT selbst — er ist beim
   Startgespräch von hier vorzulesen.** Vorher nicht einschalten: er hat
   selbst nur die Gratis-Stufe und käme beim Testen nicht mehr über ein
   Bündel hinaus.
6. **Impressum, AGB, Datenschutz** — Seiten stehen (`/impressum`, `/agb`,
   `/datenschutz`), verlinkt im Fussbereich und in der Anwendung, öffentlich
   auch hinter der Vorstart-Sperre. **Offen:** die Werte in `data/legal.ts`
   (alles mit `[[…]]`) und eine anwaltliche Durchsicht. Offene Stellen werden
   auf der Seite golden hervorgehoben, damit sie nicht unbemerkt live gehen.
   Der Abschnitt zum Mindestvorteil in den AGB darf erst scharf gehen, wenn
   Punkt 1 und 2 dieser Liste geklärt sind.
7. **Lieferschein-Abgleich** (#22). Schliesst den Kreis: die Preisgarantie
   ist nur eine Zusage, solange niemand prüft, ob das Werk sie auf der
   Rechnung angewendet hat. `delivery_notes` steht im Schema
   (`discrepancy_flag`, `platform_commission_amount`), die Seite ist ein
   ehrlicher Platzhalter.
   - **Erster Schritt bewusst klein:** Foto hochladen, Werte von Hand
     eintragen, gegen den SIA-Vertrag prüfen. Das bringt den ganzen Nutzen
     ausser der Bequemlichkeit — und zeigt, ob Poliere den Ablauf
     überhaupt leben. Ein Ablauf, der drei Klicks zu lang ist, wird auf der
     Baustelle nicht gemacht.
   - **Automatisches Auslesen danach:** Sprachmodell mit Bildverständnis
     (Claude Haiku 4.5 reicht, deutlich unter 5 Rappen je Lieferschein),
     nicht Tesseract — auf zerknitterten Fotos mit je Werk anderem Formular
     ist die Trefferquote zu schlecht, um Rechnungen darauf zu prüfen.
     Braucht denselben ANTHROPIC_API_KEY wie der Materialabgleich.
   - **Der eigentliche Aufwand ist der Abweichungs-Ablauf**, nicht die
     Texterkennung: wer wird benachrichtigt, kann der Lieferant
     widersprechen, was gilt bei Patt.
   - Sinnvoll erst, wenn echte Bündel zu echten Verträgen geführt haben —
     sonst rät man, wie die Lieferscheine der echten Werke aussehen.
8. **Aufbewahrung und Löschung — Text und Wirklichkeit zusammenbringen.**
   `/datenschutz` verspricht heute, Nachrichten und Anfragen würden
   aufbewahrt, „solange sie für die Abwicklung und den Nachweis eines
   Geschäfts nötig sind", und **danach gelöscht oder anonymisiert**. Es gibt
   nichts, was dieses „danach" je auslöst: keinen Aufräumjob, keinen
   Löschweg, keine Frist. Solange niemand echt darauf arbeitet, schadet das
   niemandem — mit der ersten echten Firma ist es ein öffentliches
   Versprechen ohne Deckung.

   Drei getrennte Entscheide, unterschiedlich dringend:

   a) **Welche Frist?** Ein Verlauf, der zu einem Vertrag geführt hat, ist
      buchhaltungsnah (Art. 958f OR, zehn Jahre). Ein Verlauf, aus dem
      nichts wurde, ist es nicht. Ohne diese Unterscheidung ist jede
      Automatik falsch. **Kann nach dem Start entschieden werden**, solange
      der Text auf `/datenschutz` nicht mehr behauptet als das, was gilt.

   b) **Ein Löschweg auf Verlangen — ERLEDIGT** (Migration 30). Kommt ein
      Begehren per Mail, im Supabase-SQL-Editor:

      ```sql
      SELECT konto_schliessen_intern('<firmen-uuid>');
      ```

      Das anonymisiert die Firma und räumt ihr Profil ab. Fristgerecht
      heisst nach DSG: ohne unnötigen Verzug ab dem Verlangen, nicht ab
      dem Tag, an dem man Zeit hat.

      **Der Knopf steht** — `/konto`, unter dem Abo
      (`components/account/KontoSchliessen.tsx`, Migration 32). Er
      entscheidet nichts selbst: ob geschlossen werden darf, sagt
      `close_own_company_account()`. Die Liste der laufenden Bündel steht
      dort nur, damit die Absage einen Grund nennt. Statt „Sind Sie
      sicher?" verlangt er den Firmennamen — ein Ja-Nein-Fenster klickt
      man weg, ohne es gelesen zu haben.

      Der frühere Vorbehalt („erst mit Stripe") war keiner: es fliesst
      heute kein Geld, jede kostenpflichtige Stufe steht auf
      `PENDING_PAYMENT`, und `konto_schliessen_intern()` räumt die Zeile
      in `subscriptions` mit ab. **Wenn Stripe kommt, gehört an genau
      diese Stelle die Kündigung beim Zahlungsdienst** — vor dem Löschen
      der Zeile, sonst läuft das Abo dort weiter, während das Konto hier
      weg ist. Eine Sperre („erst kündigen, dann schliessen") wäre der
      falsche Weg: eine gekündigte Stufe bleibt bis `current_period_end`
      auf ACTIVE, und ein Löschbegehren nach DSG darf nicht bis zum
      Laufzeitende warten.

      **Migration 32 zieht dabei eine Lücke aus Migration 31 nach.**
      `laufende_bindung(uuid)` war an `authenticated` freigegeben und
      prüfte im Rumpf nicht, wessen Firma abgefragt wird — mit einer
      beliebigen Firmen-ID kam zurück, an welchen Bündeln sie teilnimmt,
      samt Titel. Die IDs sind kein Geheimnis (das Verzeichnis ist offen),
      die Teilnahme schon: sie ist verdeckt, damit kein Werk die Mengen
      zurückrechnet. Jetzt behält die Fassung mit Parameter nur der
      Dienstschlüssel, und der Browser bekommt `meine_bindung()` ohne
      Parameter. Derselbe Zuschnitt wie beim Kontoschliessen in
      Migration 30, aus demselben Grund: was schützt, ist der fehlende
      Zugriff, nicht eine Prüfung im Rumpf — `current_user` ist dort der
      Eigentümer, nicht der Aufrufer.

      Die HINT-Zeile der Fehlermeldung nennt weiterhin
      `laufende_bindung(...)`. Das ist Absicht: sie richtet sich an den
      Support-Weg im SQL-Editor, und dort gilt die Freigabe noch.

   c) **Was beim Löschen eines Kontos passiert — ERLEDIGT** (Migration 30).
      Vorher hingen `messages` und `direct_offers` mit `ON DELETE CASCADE`
      an `companies`: wer eine Firmenzeile löschte, löschte den Verlauf bei
      BEIDEN Seiten. Jetzt steht dort `RESTRICT` — ein Löschversuch schlägt
      laut fehl, statt still zwei Verläufe zu vernichten.

      Der Weg ist stattdessen der von LinkedIn: **anonymisieren**. Das
      Profil verschwindet (Name, UID, Kontakt, Logo, Standort, Beiträge,
      Kommentare, Verbindungen, Projekte, eigene Materialien, Abo), die
      Belege bleiben (Nachrichten, Angebote, Teilnahmen, Gebote, Verträge,
      Lieferscheine). In den Belegen steht „Ehemaliges Mitglied".

      Eine geschlossene Firma ist nur noch für die sichtbar, die wirklich
      mit ihr zu tun hatten — das steht in der Zeilenregel auf `companies`
      (`hat_geschaeft_mit()`) und **nicht** in den Abfragen: `companies`
      wird an vierundzwanzig Stellen gelesen, und die fünfundzwanzigste
      vergisst den Filter.

      `clerk_user_id` und `uid_number` werden nicht geleert, sondern auf
      einen toten Wert gesetzt — beide sind NOT NULL UNIQUE. Das schliesst
      den Login aus und gibt die echte UID wieder frei, falls dieselbe
      Firma später neu beitritt.

      **Laufende Bündel sperren das Schliessen — ENTSCHIEDEN**
      (Migration 31). Ein Bündel ist verbindlich: wer mitmacht, bringt eine
      Menge ein, auf die ein Werk seinen Preis rechnet. `laufende_bindung()`
      sagt, woran eine Firma hängt; `konto_schliessen_intern()` weist ab,
      solange etwas läuft — auch auf dem Support-Weg, denn ein Löschbegehren
      hebt keinen Vertrag auf.

      Dabei kam heraus, dass **`withdraw_demand()` bisher zu jedem Zeitpunkt
      austreten liess** — auch während die Werke verdeckt boten und sogar
      nach dem Zuschlag. Jetzt nur noch in der Sammelphase und vor der
      Frist. In `/pools` erscheint „zurückziehen" nur dort; danach steht
      „verbindlich", und eine abgelehnte Absage wird sichtbar gemeldet
      statt still verschluckt.

      Neu ist `bundles.completed_at` — der Lebenslauf kannte kein Ende, und
      ohne Schlusspunkt wäre jede Firma auf ewig gebunden. **Setzt heute
      niemand automatisch.** Was noch offen ist, zeigt
      `supabase/pruefung/offene_buendel.sql`; abgeschlossen wird mit
      `UPDATE bundles SET completed_at = NOW() WHERE id = '<uuid>';`.
      Künftig durch den Lieferschein-Abgleich (#22).

      Ein Knopf dafür im Control Center wäre der bequemere Weg — dort ist
      aber heute nur eine leere Hülle, und eine ADMIN-Rolle wird nirgends
      durchgesetzt. Das wäre erst eine Rechteschranke, dann eine Funktion,
      dann eine Oberfläche. Lohnt sich, sobald es echte Bündel gibt.

      **Offen:** die Kündigung beim Zahlungsdienst — und die
      Verbindlichkeit gehört in die AGB, nicht nur in die Datenbank.
      Anwaltsliste.

   Was bleibt, ist Punkt a) — die Frist — und die anwaltliche Durchsicht
   gemeinsam mit den `[[…]]`-Stellen in `data/legal.ts` (Punkt 6). Der
   Abschnitt „6a. Wenn du dein Konto schliesst" auf `/datenschutz`
   beschreibt jetzt, was tatsächlich passiert.


---

# Master-Kontext & Entwicklungs-Fahrplan (Briefing des Nutzers)

Vom Nutzer als Gesamtbild übergeben. **Noch nichts davon ist gebaut** — das
hier ist die Absichtserklärung, gegen die künftige Arbeit läuft, kein
Zustandsbericht. Wo das Briefing dem widerspricht, was heute in dieser Datei
steht, ist der Widerspruch unten ausdrücklich benannt statt still aufgelöst.

## Identität
- **Obtanet ist zweierlei in einem:** Beschaffungsmarkt *und* Netzwerk.
  Weder ein reines Ausschreibungsportal noch ein Branchen-LinkedIn.
- Leitsatz für die Ausbreitung: **„Global Umbrella, Local Trust"** — ein
  Dach über allem, aber Vertrauen entsteht regional. Praktisch heisst das:
  ein Konto, ein Regelwerk, aber Bündel, Preise und Normen richten sich nach
  dem Ort.

## Gestaltung — Terminal-Stil
Bloomberg-Terminal und Robinhood als Vorbild: Dichte, Tabellenziffern,
Zahlen als Hauptdarsteller, edge-to-edge über die volle Breite, scharfe
Kanten.

**Drei Konflikte mit dem, was heute gilt — der Nutzer entscheidet:**

1. **Palette — ENTSCHIEDEN, es bleibt bei der CI.** Der Nutzer hat die
   bestehenden Farben bestätigt: `#060B12` / `#0B1522` / `#D99000`. Das
   Champagner-Gold `#E5C158` aus dem Briefing wird NICHT übernommen.
   (Ursprüngliche Fassung zur Nachvollziehbarkeit:) Das Briefing nennt `#070C18` (Grund), `#0B132B` (Panel) und
   `#E5C158` (Champagner-Gold). Gebaut und als CI festgeschrieben ist
   `#060B12` / `#0B1522` / `#D99000`. Die Gründe sind unterschiedlich viel
   wert: die beiden Dunkeltöne unterscheiden sich um wenige Prozent
   Helligkeit — dort ist der Wechsel eine Zeile in `lib/ui.ts` und kostet
   nichts. Das Gold ist der eigentliche Punkt: `#E5C158` ist heller und
   blasser als `#D99000` und würde das Logo, die Knöpfe und jede
   Prozentangabe der Seite mitverändern. Solange die CI „nur Gold `#D99000`"
   sagt, gilt `#D99000`.
2. **Scharfe Kanten.** Das Briefing will sie, die Formensprache dieser Datei
   hat sie ausdrücklich abgeschafft („die alten scharfen 8px-Kanten wirkten
   wie von der Stange"). Beides zugleich geht nicht. Mein Vorschlag: der
   Kompromiss steckt schon in der Arbeit der letzten Runden — es geht nicht
   um den Radius, sondern darum, dass Flächen überhaupt verschwinden. Eine
   Tabelle mit Haarlinien hat weder scharfe noch weiche Ecken, weil sie
   keine Ecken hat. Wo doch eine Fläche nötig ist (Knöpfe, Eingabefelder),
   würde ich bei den weichen Kanten bleiben.
3. **Edge-to-edge — ENTSCHIEDEN, nicht volle Breite.** Der Nutzer will
   „etwas mehr als jetzt", nicht randlos. Umgesetzt über `SHELL`
   (1280 px) und `SHELL_NARROW` (880 px) in `lib/ui.ts`. Diese beiden
   Werte sind die einzigen erlaubten Seitenbreiten — wer eine neue Seite
   baut, nimmt eines der beiden Token und schreibt kein eigenes
   `max-w-*` mehr.

## Technik — was das Briefing verlangt
- **Supabase Realtime für 1:1-Chat.** Migration `21_realtime_chat.sql` liegt
  bereits, der Chat ist gebaut — hier ist eher zu prüfen, was noch fehlt,
  als neu zu bauen.
- **Anonymisiertes Bündeln.** Ist im Kern da (Sealed-Bid, Mindestzahl
  Teilnehmer, damit kein Werk zurückrechnen kann). Offen bleibt, ob die
  Anonymität auch nach dem Zuschlag hält.
- **Geofencing** — Bündel und Vorschläge nach Umkreis statt nach Kantonsname.
  Die Grundlage steht (`lat`/`lng`/`delivery_radius_km` in `companies`,
  Karte unter `/map`), die Bündel selbst filtern aber noch nach
  Regionsnamen. Das ist der erste ehrliche Schritt Richtung Ausland.
- **Dynamischer Kontextwechsel** — CHF/USD, metrisch/imperial, SIA/EN gegen
  ASTM. **Der grösste ungebaute Brocken.** Preise, Einheiten und
  Normbezüge stecken heute an hunderten Stellen fest im Text (`m³`, `CHF`,
  `SIA 118`, KBOB). Das lässt sich nicht nachträglich überall ersetzen — es
  braucht früh eine Schicht (Einheit, Währung, Normwerk am Nutzer bzw. an
  der Firma), sonst wird es später zur Neuentwicklung. **Empfehlung: diese
  Schicht anlegen, bevor weitere Seiten gebaut werden, auch wenn sie
  vorerst überall „CH" zurückgibt.**
- **KYB-Prüfung** — UID (Schweiz) und DUNS (international). Heute wird die
  CHE-Nummer nur auf Form geprüft, nicht gegen ein Register. Für echtes
  Vertrauen braucht es einen Abgleich gegen das UID-Register des Bundes.
- **Stripe Connect mit Treuhandkonto (Escrow).** Bisher ist gar keine
  Zahlung angebunden. Achtung: Escrow ist in der Schweiz aufsichtsrechtlich
  heikel — fremde Gelder halten ist reguliert. Vor dem Bau juristisch
  klären, nicht danach. Hängt mit Punkt 0 der Launch-Liste zusammen
  (Vermittlungsgebühr im Abo oder daneben).

## Fahrplan in vier Phasen
Reihenfolge vom Nutzer vorgegeben; meine Einschätzung jeweils dahinter.

1. **Fundament** — Terminal-Stil durchziehen, Chat, anonymes Bündeln.
   *Grösstenteils da. Was fehlt, ist der Kästchen-Abbau auf den restlichen
   Seiten (Liste oben unter „OFFEN") und die Entscheidung zu den drei
   Design-Konflikten.*
2. **Vertrauen** — KYB, Stripe Connect, Escrow.
   *Reihenfolge innerhalb der Phase: KYB zuerst. Es ist billiger, klar
   abgrenzbar und der Escrow braucht ohnehin geprüfte Firmen.*
3. **Skalierung** — Geofencing, Kontextwechsel, zweiter Markt.
   *Der Kontextwechsel gehört technisch nach vorn, siehe oben. Sonst wird
   Phase 3 zum Umbau von allem, was in Phase 1 und 2 entstanden ist.*
4. **Ausbau** — offen.

## Oberstes Ziel des Nutzers
> „das es nicht so stark nach ki generiert aussieht — das ist mir am
> wichtigsten."

Das schlägt im Zweifel jede andere Gestaltungsregel. Woran man es
festmacht, steht unter „Was nicht mehr vorkommt" und in der
SHELL-Erklärung: gleiche Breiten überall, keine Rahmen um Gruppen,
keine erzeugten Motive, keine Dreiwort-Überschriften mit Punkten, kein
Sparkle-Symbol, keine Emoji in Beispieltexten, keine Hashtags.

**Die Liste der Muster, die raus sind — und raus bleiben:**
- **Kapsel-Knöpfe** (`rounded-full` mit Fläche und Text). Der Radius ist
  jetzt `rounded-xl`, zentral in `BTN_BASE`. Runde Formen nur noch für
  das, was wirklich rund ist: Zähler, Punkte, Rundbilder.
- **Pfeile in gefüllten Knöpfen.** „Kostenlos registrieren →" ist die
  Kombination, die der Nutzer als erzeugt erkannt hat. Ein Knopf, auf
  dem steht was er tut, braucht keinen Pfeil. In Textlinks („Alle →")
  ist der Pfeil in Ordnung.
- **Ovale Status-Etiketten** (`badge()`). Die Funktion ist gelöscht.
  Status steht als Wort in Grossbuchstaben, gesperrt, ohne Fläche.
- **Millimeterpapier-Raster** hinter Panels. An vier Stellen entfernt,
  `GRID_TEXTURE` und beide lokalen Kopien sind weg.
- **Farbverläufe als Fläche** — die Logo-Kachel `from-brand to-brand-600`
  mit Goldschatten, das Navy-Verlaufsband im Profil. Flächen sind flach.
  Verläufe bleiben nur als Bildschleier über einem Foto.
- **Farbnebel** (`blur-2xl`/`blur-3xl` in einer Ecke). Alle weg.

**Überschriften.** Die Hero-Zeile hiess einmal „Vernetzen. Bündeln.
Sparen." — drei abstrakte Verben, jedes auf einer Zeile, das letzte in
Gold. Das ist das meistkopierte Überschriftenmuster überhaupt. Eine
Überschrift sagt einen Satz, der etwas behauptet, und die Farbe steckt
in der Zeile darüber und im Knopf darunter, nicht im letzten Wort.

**Jeder Abschnitt der Startseite hat eine EIGENE Form.** Es gab einmal
vier Abschnitte hintereinander mit demselben Raster — Vertrauensanker,
Smart Pools, Ablauf und Preisstufen, alle als gleichbreite Spalten mit
Haarlinie oben, alle mit `SECTION` als Abstand. Genau das meinte der
Nutzer mit „gleiche Kästchen, gleiche Abstände". Jetzt:
- Hero: Foto, Text links
- Vertrauensanker: flacher Streifen, `py-8`
- Zwei Wege: zwei hohe Karten mit randlosem Bild
- Smart Pools: asymmetrisch, grosse Überschrift links, Belege rechts
- Ablauf: gestaffelte Treppe, jeder Schritt rückt ein
- Pools/Netzwerk: weisser Abschnitt, zwei Spalten mit Foto
- Preise: drei Spalten (eine Preistabelle darf eine sein)
- Abschluss: Navyfläche

Und die Abstände wechseln: `SECTION_TIGHT`, `SECTION`, `SECTION_WIDE`
je nach Gewicht. Wer einen Abschnitt hinzufügt, gibt ihm eine Form, die
noch keiner hat.

**Schriftgrössen-Hierarchie der Startseite:** `D_LG` nur für die
Hero-Zeile, `D_MD` für alle Abschnittsüberschriften. Zwei Stufen, mehr
nicht — wenn drei Überschriften gleich gross sind, gibt es keine
Rangfolge mehr.

## Zahlen immer über `lib/format.ts`
`Intl.NumberFormat("de-CH")` liefert nicht überall dasselbe Zeichen als
Tausendertrenner: Node schreibt `'`, Chrome `’`. Eine serverseitig
gerenderte Zahl führt damit zu einem Hydration-Fehler — auf
`/beschaffung` trat er bei jedem Aufruf auf („1'120" gegen „1’120").
`lib/format.ts` schreibt den Trenner fest. Sechs Bausteine hatten je
eine eigene Kopie der Funktion; wer eine siebte braucht, nimmt die
geteilte. **Nie wieder `Intl.NumberFormat` direkt in einem Baustein.**

---

# DIE OBTANET-MISCHUNG (verbindlich)

Der Nutzer: „Robinhood als Vorbild, mit Revolut gemischt und bisschen
Linear — am Ende ein Mischmasch, aber halt immer das best passende. So
entsteht mein Obtanet-Design."

Jede Entscheidung hier stammt aus einer der drei Spezifikationen, mit
Begründung warum diese und nicht die andere. **Wer etwas ändert, ändert
es hier und nirgends sonst.**

| Element | Von | Wert | Warum |
|---|---|---|---|
| Grund | Robinhood/Revolut | reines `#000000` | Ein schwarzer Anker (`TILE`) tritt nur auf reinem Schwarz nicht hervor — deshalb liegen Bänder auf `#0a0a0a`, der Grund auf Schwarz |
| Fläche | Revolut | `#16181a`, Radius 20 px, 32 px innen | Linear ist mit vier Stufen feiner, aber wir haben nicht genug Verschachtelung dafür |
| Haarlinie | Linear | 12 % Weiss | Unsere alten 8 % waren zu schwach zum Trennen |
| Text | Revolut | `#fff` / `.72` / `.56` | Linear ist mit `#8a8f98` dunkler; unser Fliesstext war ohnehin zu flau |
| Display | Robinhood/Revolut | Gewicht 500, Laufweite −0.01em | Linears −3 px ist für eine Baubranche zu modisch eng |
| Fliesstext | Revolut | 18 px / 1.56 | |
| Knopf | **Mischung** | 48 px hoch, 16 px/600 (Revolut-Mass), Radius 12 px (nicht Pille) | Revoluts Pillen hat der Nutzer ausdrücklich abgelehnt |
| Abstände | Revolut | 88 px Abschnitt, 120 px Band | |
| Container | Revolut | 1200 px | |
| Schatten, Verläufe, Leuchten | alle drei | **keine** | Keines der drei Vorbilder benutzt sie. Tiefe kommt aus Fläche und Haarlinie |

**Nicht überprüfbar:** robinhood.com ist vom Netzwerk dieser Umgebung
gesperrt (403 am Proxy), und eine veröffentlichte Robinhood-Spezifikation
gibt es nicht. Was von Robinhood kommt, stammt aus den Referenzbildern,
die der Nutzer selbst geschickt hat — nicht aus einer Messung. Linear und
Revolut sind gemessen.

## Was ich davon nicht ohne Zuruf anfasse
- Die CI-Farben. Sie stehen als „STRIKT" in dieser Datei.
- Die Formensprache (weiche Ecken).
- Alles mit Geld: Preise, Gebühren, Escrow.
Diese drei brauchen eine ausdrückliche Ansage, sonst bleibt es beim
heutigen Stand.

---

## Beitraege und Firmen: der Embed braucht einen Hinweis

`network_posts` und `companies` haengen seit Migration 27/28 nicht mehr
nur direkt zusammen: `post_likes`, `post_comments` und `post_reports`
tragen je einen Fremdschluessel auf beide. PostgREST liest darin
Verbindungstabellen und findet dadurch mehrere Wege von einem Beitrag zu
einer Firma — und lehnt eine Abfrage ohne Angabe ab:

> Could not embed because more than one relationship was found for
> 'network_posts' and 'companies'

Richtig ist deshalb ueberall

    companies!network_posts_company_id_fkey(company_name, …)

Das gilt fuer jede neue Abfrage, die von einem Beitrag auf die Firma
zeigt. Umgekehrt (von `post_comments` auf `companies`) braucht es den
Hinweis nicht — dort gibt es nur einen Weg.

---

## Rabattstufen: Video und Produkt sagen noch Verschiedenes

Der Videoauftrag (`design/video-prompt-smart-pools.md`) zeigt das Modell so,
wie der Nutzer es beschrieben hat: **der Prozentsatz haengt an der Menge,
die eine Firma selbst einbringt.** Vier Firmen im selben Buendel bekommen
9 / 12 / 16 / 20 %.

**Das Produkt rechnet heute anders.** `bundles.current_discount_pct` ist
EIN Wert je Buendel — alle Teilnehmer bekommen denselben Satz. Die Stufe
haengt am Gesamtvolumen, nicht am eigenen Anteil.

Beides zusammen geht nicht. Vor dem Start muss entschieden werden:

1. **Produkt zieht nach** — je Teilnahme ein eigener Satz, abgeleitet aus
   `bundle_participations.requested_volume`. Aendert `bundle_recalc()`, die
   Anzeige in OpenPools, die Zusammenfassung in der Beschaffung und den
   Mindestvorteil. Der ehrlichere Weg, und der, den das Video zeigt.
2. **Video zieht nach** — ein Satz fuer alle, der Unterschied entsteht nur
   in Franken. Einfacher, aber weniger ueberzeugend, und nicht das, was der
   Nutzer erklaeren will.

Dazu offen (Launch-Liste): die Schwellen der Leiter 5/9/12/16/20 % sind
weiterhin unbestaetigt.

---

# OFFENE AUFTRÄGE DES NUTZERS (Stand: siehe letzten Commit)

Vom Nutzer ausdrücklich auf die Todo-Liste gegeben. Nichts davon ist
gebaut. Reihenfolge ist keine Rangfolge — sie ist die, in der er sie
genannt hat.

## 1. Abos — GEBAUT BIS ZUR ZAHLUNG
Der ganze Ablauf steht: wählen, wechseln, kündigen, Kündigung
zurücknehmen, Laufzeit ablaufen lassen. Was fehlt, ist genau ein
Schritt — die Zahlungsmethode (Punkt 2).

**Migration `24_subscriptions.sql`** (muss noch eingespielt werden):
Tabelle `subscriptions`, eine Zeile je Firma, plus die Funktionen
`subscription_mine`, `subscription_choose`, `subscription_cancel`,
`subscription_resume`, `advance_due_subscriptions`.

**Die Sicherheitsregel, die man nicht brechen darf:** der Client hat auf
`subscriptions` nur SELECT, kein UPDATE. Könnte er schreiben, setzte
sich jeder in einer Zeile auf ENTERPRISE/ACTIVE. Alle Änderungen laufen
über die SECURITY-DEFINER-Funktionen, und die setzen eine
kostenpflichtige Stufe **ausschliesslich** auf `PENDING_PAYMENT`. Auf
`ACTIVE` stellt es später nur der Webhook des Zahlungsanbieters mit dem
Dienstschlüssel.

Zwei Regeln, die im Ablauf stecken:
- **Herunterstufen nimmt nichts sofort weg.** Wer kündigt, behält die
  bezahlte Stufe bis `current_period_end`. Bezahlt ist bezahlt.
- **Hochstufen gilt nicht sofort.** Es wird in `pending_plan`
  vorgemerkt, der Zustand ist `PENDING_PAYMENT`, und die Seite sagt
  das auch so. Ein Ablauf, der so tut, als wäre gebucht, ist schlimmer
  als gar keiner.

Seite: `/konto`, verlinkt im Kontomenü. `data/plans.ts` ist die einzige
Quelle für Stufen, Preise und Grenzen — der Preisabschnitt auf `/` liest
daraus, nicht aus einer zweiten Liste.

**Preise stehen** (0 / 129 / 489 CHF pro Monat, vom Nutzer am
09.09.2026 festgelegt). Sie stehen in `data/plans.ts` und nirgends
sonst. Weiterhin offen sind die **Rabattstufen** der Buendelung
(5/9/12/16/20 %) — die sind nicht dasselbe wie der Abopreis.

**Die Grenzen sind gebaut, aber AUSGESCHALTET** (Migration 26). Geprüft
wird in einem Trigger auf `bundle_participations`, nicht in der
Anwendung: eine Grenze, die der Browser durchsetzt, ist keine — der
Aufruf lässt sich nachbauen. Der Trigger deckt ausserdem jeden Weg ab,
auf dem eine Teilnahme entsteht.

Einschalten mit einer Zeile, ohne neue Auslieferung:
```sql
UPDATE app_settings SET value = 'on' WHERE key = 'plan_limits';
```
Vor dem Start würde die Grenze die eigene Erprobung blockieren.

Gezählt werden nur **laufende** Bündel (`OPEN`/`SEALED_BIDDING`) — sonst
wäre die Gratis-Stufe nach dem ersten abgeschlossenen Geschäft für immer
voll. Die Zahlen stehen an zwei Stellen: `plan_limits` (setzt durch) und
`data/plans.ts` (zeigt an). Wer eine ändert, muss die andere mitändern.

## 2. Zahlungsmethoden und Zahlungssysteme einbauen
Bisher ist gar keine Zahlung angebunden. Aus dem Master-Briefing:
Stripe Connect mit Treuhandkonto. Zwei getrennte Dinge, die nicht
verwechselt werden dürfen:
- **Abo-Zahlung** (Punkt 1) — einfach, monatlich, an Obtanet.
- **Vermittlungsgebühr / Escrow auf abgeschlossene Bündel** — fremde
  Gelder halten ist in der Schweiz aufsichtsrechtlich reguliert. Das
  ist vor dem Bau juristisch zu klären, nicht danach.

## 3. E-Mails kommen noch von „construxnet"
**Im Code ist nichts mehr zu tun.** Nachgeprüft: „construxnet" kommt im
ganzen Quelltext nicht mehr vor (die letzte Stelle war eine
Kommentarzeile in `01_schema.sql`), `package.json` heisst `obtanet`, und
die Clerk-Oberfläche ist in `lib/clerk.ts` bereits auf „Obtanet"
lokalisiert („Anmelden bei Obtanet", „Obtanet-Konto erstellen").

Die Mails verschickt **Clerk**, und was darin steht, kommt aus dem
Clerk-Dashboard — nicht aus diesem Verzeichnis. Zu ändern sind dort:

1. **Der Anwendungsname.** Das ist mit grosser Wahrscheinlichkeit die
   Ursache: Clerk setzt den Namen als `{{app.name}}` in Betreff und Text
   *jeder* Vorlage ein und benutzt ihn als Absender-Anzeigename. Heisst
   die Anwendung dort noch „ConstruXnet", steht das in jeder Mail.
2. **Die E-Mail-Vorlagen** einzeln durchgehen (Bestätigungscode,
   Passwort zurücksetzen, Adresse ändern, Einladung). Falls jemand dort
   den Namen von Hand eingetippt hat, hilft Punkt 1 allein nicht.
3. **Das Logo und die Farben** der von Clerk gehosteten Seiten und
   Mail-Köpfe.
4. **Absenderadresse.** Voreingestellt verschickt Clerk von einer
   eigenen Domain. Für `@obtanet.com` als Absender braucht es eine
   verifizierte Domain samt DNS-Einträgen (DKIM/SPF/Return-Path).

**Voraussetzung für Punkt 4:** eine **Produktions-Instanz** in Clerk.
Entwicklungs-Instanzen (`pk_test_…`/`sk_test_…`) können keine eigene
Absenderdomain und markieren Mails als Entwicklungsversand. Vor dem Start
also prüfen, ob in Vercel `pk_live_…`/`sk_live_…` gesetzt sind — und
daran denken, dass eine Produktions-Instanz **eigene** Nutzerkonten hat:
in der Entwicklungs-Instanz angelegte Konten wandern nicht mit.

Ebenfalls kurz prüfen: der Projektname in Supabase und in Vercel. Der
taucht in deren Systemmails an dich auf, nicht in Mails an Nutzer.

*Die genauen Menüpunkte im Clerk-Dashboard ändern sich von Zeit zu Zeit;
oben steht deshalb, WAS zu ändern ist, nicht wo es diese Woche liegt.*

## 4. Das KI-Oval um Aktivitäts- und Statuszeichen — ERLEDIGT
`badge()` ist aus `lib/ui.ts` entfernt und hat keine Aufrufer mehr. Der
Status steht überall als Wort in Grossbuchstaben in der Kennzeile, ohne
Fläche und ohne Rand.

Übrig geblieben sind nur runde Zähler mit einer **Zahl** darin
(ungelesene Nachrichten, Warenkorb) — das ist die richtige Form dafür
und kein Oval um Wörter.

Beim Nachziehen kam die eigentliche Ursache heraus: nicht das Oval,
sondern der **goldene Symbolkasten im Seitenkopf** — ein gerundetes
Farbquadrat mit einem Piktogramm, das wiederholt, was die Überschrift
danebensagt. Der stand auf `/termine`, `/network/requests`,
`/delivery-notes` und `/admin-control`, dazu im Kopf der
Bündel-Rechnung, im Handels-Banner des Chats und im Abschlussbild der
Beschaffung. Alle sieben sind weg; die vier Seitenköpfe tragen jetzt
dieselbe Form wie `/pools`: Zeile, Überschrift, Satz, Haarlinie.

## 5. Farben: mehr Weiss und Schwarz, dazu Gold und Navy
**Register verteilt — die Seiten stehen jetzt dort, wo die Regel sie
hinstellt.**

Auf Papier (Blatt mit farbigem Kopfband, `components/ui/SheetPage.tsx`):
Beschaffung · Profil bearbeiten · Firmenprofil · Rechtsseiten ·
Nachrichten · Fristen · Empfangene Anfragen · Benachrichtigungen ·
Lieferscheine · Onboarding.

Dunkel bleiben die Seiten, auf denen Zahlen und Markt stehen: Feed,
Smart Pools, KBOB, Karte, Netzwerk, Dashboard, Startseite und
„So funktioniert es".

**Das Abo gehoert dazu — auf Ansage des Nutzers.** Es stand kurz auf
Papier; er wollte die schwarze Fassung zurueck. Die Regel traegt das:
auf `/konto` stehen Preise, Stufen und Laufzeiten nebeneinander, das
ist eine Vergleichstabelle und keine Korrespondenz. Der schwarze Anker
(`TILE`) unter „Deine Stufe" bleibt entsprechend auch.

Das Kopfband wechselt zwischen Navy und Schwarz — belegt in der
Kopfnotiz von `SheetPage.tsx`. Wer eine Seite ergaenzt, nimmt die Farbe,
die die Nachbarseite nicht hat. **Gold als Textfarbe traegt auf Weiss nur
2.6:1**; auf Papier steht deshalb `brand-700` (#9A6A00, 4.7:1), volles
Gold bleibt Flaeche und Symbol. Auf goldenem Grund steht Navy, nie
Weiss — das galt auch im dunklen Register schon.

Der Nutzer will „eine perfekte Kombi", keine der beiden reinen
Lesarten. Ausgangspunkt war seine Beobachtung: „die Nachrichten-Seite
ist besser, wenn der Hintergrund weiss ist." Daraus die Regel, die in
`lib/ui.ts` unter REGISTER B steht:

> Wo gelesen und geschrieben wird, ist Papier.
> Wo Zahlen und Markt stehen, ist es dunkel.

Der Nutzer will ausserdem einen **Rhythmus** — „mal blau auf hell, dann
wieder hell mit blau", aber so, dass es sich durch die ganze Seite
zieht. Daraus wird ein drittes Register: Navy als Fläche, nicht nur als
Linie. Es trägt Kopfbänder auf hellen Seiten (`/beschaffung`, gebaut),
die eigenen Nachrichtenblasen und einzelne Abschnitte, die etwas
behaupten. Wichtig: `accent-600` `#1B3A5C`, nicht `navy-900` `#08111E`.

**Die Kopfbänder wechseln ab — das ist der Kern des Rhythmus.**
Beschaffung Navy, Profil bearbeiten Schwarz, Firmenprofil Navy,
Rechtsseiten Schwarz. Schwarz und Weiss dürfen überall vorkommen, Navy
ist die zweite Möglichkeit. Wer eine neue Papierseite baut, nimmt das
Band, das die vorige NICHT hat. Eine Schablone, die auf jeder Seite
gleich aussieht, ist genau das, was eine Oberfläche erzeugt wirken
lässt.

Was daraus folgt:
- **Papier (`SHEET`), gebaut:** Nachrichten, Beschaffung, Profil
  bearbeiten, Firmenprofil, Impressum/AGB/Datenschutz.
- **Bleibt dunkel:** Termine (Fristen sind Daten), Benachrichtigungen.
- **Startseite:** schwarz mit zwei Ausnahmen — der Abschnitt „Aktive
  Smart Pools / Firmen im Netzwerk" ist weiss, der Abschluss-CTA Navy.
  Sechstausend Pixel ohne Wechsel sind nicht ruhig, sondern
  gleichförmig.
- **Dunkel:** Feed, Smart Pools, Referenzpreise, Netzwerk, Karte,
  Startseite.
- Der Rahmen bleibt immer dunkel — Kopfzeile, Fussbereich, der Grund
  hinter allem. Das Blatt liegt darauf, es ersetzt ihn nicht.
- **Navy wird endlich eine Fläche.** `accent-600` `#1B3A5C` trägt im
  Blatt die eigenen Nachrichtenblasen und den Annehmen-Knopf. Achtung:
  `navy-900` ist `#08111E`, also fast Schwarz — nicht das CI-Navy. Das
  CI-Navy liegt in der `accent`-Skala.
- Gold bleibt in beiden Registern der einzige Akzent, und zwar für das,
  was zählt: Angebote, Preise, der Abschluss.

Frühere Fassung dieses Punktes, zur Nachvollziehbarkeit:
Zwei mögliche Lesarten, und sie führen zu völlig verschiedenen Seiten:

- **(a) Mehr Kontrast im dunklen Register.** Echtes Schwarz statt
  `#060B12`, echtes Weiss statt `white/70` im Fliesstext, Navy als
  Fläche statt nur als Linie. Das schärft, ohne die Entscheidung „EIN
  dunkles Register" zu kippen — ein Tag Arbeit, zentral in `lib/ui.ts`.
- **(b) Helle Flächen kommen zurück.** Ganze Abschnitte oder Seiten auf
  Weiss, Schwarz als Gegenstück. Das ist die Rückkehr zum
  Zwei-Register-Modell, das schon einmal verworfen wurde, weil es sich
  wie zwei Websites in einer las — und betrifft jede Datei.

Ohne Antwort wird hier nichts angefasst.

## 6. „Profil bearbeiten" — typische KI-Kästchen — ERLEDIGT
Die Seite ist beim Umbau auf das Register B (Papier) mitgezogen worden:
echte Formularfelder auf weissem Grund, Navy-Kopfband, keine gerundeten
Farbkästen mehr. Die goldenen Symbole vor „Firma", „Standort" und
„Kontakt" sind flache Icons ohne Fläche und bleiben.

## 7. Logo ersetzen — ERLEDIGT
Die Wortmarke des Nutzers ist eingebaut, freigestellt und auf die
CI-Werte umgefärbt. Einzelheiten stehen oben im Abschnitt „Logo". Der
Bauhelm ist weg, der Name wird nirgends mehr als Text gesetzt, das
Favicon trägt „on" in zwei Fassungen.

**Noch offen dazu:** ein SVG für Druck und Beschriftung.

## 8. Grafik bei Smart Pools — RECHTE HÄLFTE IST FREI
Der Abschnitt hatte links die Aussage und rechts drei nummerierte Belege.
Die Belege stehen jetzt unter dem Text auf derselben Seite; **die rechte
Hälfte ist leer und bleibt es**, bis das Video da ist.

Der Nutzer: das Video wird über die volle Breite laufen und rechts aus
dem Bild fliessen, während der Text links stehen bleibt. Was jetzt dort
stünde, müsste dann wieder weg — und ein Platzhalter, der so tut als wäre
er Inhalt, ist schlimmer als eine leere Fläche.

**Offen:** ob das Video hierher gehört oder in den Ablauf-Abschnitt.
`components/home/ProcessVideo.tsx` steht schon und macht genau diese Form
(links die Kapitel, rechts das Video mit weichem linkem Rand). Beim
Einbauen entscheiden — zwei Videos in derselben Form auf einer Seite
wären eins zu viel.

## 8b. Frühere Fassung dieses Punktes
Der Abschnitt „Mengenrabatte, die alleine niemand bekommt" auf `/`
zeigt rechts `components/home/OfferSheet.tsx` — den Zuschlag als
weisses Blatt. Was stattdessen dort stehen soll, ist noch offen.
**Keine selbst erzeugte Grafik.** Kommt ein Bild, dann Stockfoto, und
das ist vorher zu sagen.

## 9. Regionaler Kontext: Sprache, Währung, Einheit, Reichweite
**Vom Nutzer ausdrücklich auf die Liste gegeben. Grosser Umbau, wird
später angefasst — erst auf seine Ansage.**

Seine Formulierung: wer in Dallas ist, soll die Seite automatisch auf
Englisch bekommen und **nur Firmen aus der eigenen Region** sehen. „Es
macht keinen Sinn, einen Bauunternehmer in Zürich mit einem aus Dallas
oder Tokio zu vernetzen."

Das sind vier Dinge, die zusammengehören und einzeln nichts taugen:

1. **Sprache** — heute ist jede Zeichenkette deutsch und steht fest im
   Text. Es gibt keine Übersetzungsschicht. Das ist der grösste Teil der
   Arbeit: jede Seite, jede Komponente, jede Fehlermeldung.
2. **Währung und Einheit** — `CHF`, `m³`, `t` stehen an hunderten
   Stellen fest. Siehe „Dynamischer Kontextwechsel" weiter oben.
3. **Normwerk** — SIA 118 / SN EN 206 gilt in der Schweiz. In Texas ist
   es ASTM, in Japan JIS. Materialbezeichnungen wie „Beton C25/30" sind
   europäische Norm und anderswo schlicht falsch.
4. **Reichweite** — Netzwerk, Feed und Bündel müssen an einen Markt
   gebunden sein. Die Grundlage steht (`lat`/`lng`,
   `delivery_radius_km`), aber gefiltert wird heute nach Regionsnamen wie
   „Zürich", nicht nach Umkreis. Ein zweiter Markt braucht ein
   Markt-Objekt, an dem Sprache, Währung, Einheit, Normwerk und
   Umkreisgrenze hängen.

**Die Reihenfolge ist nicht frei.** Punkt 4 (Markt-Objekt) und die
Kontextschicht aus Punkt 2 gehören zuerst — sie sind die Schicht, an der
alles andere hängt. Die Übersetzung kommt danach, sonst übersetzt man
Texte, die gleich wieder umgebaut werden.

**Empfehlung zum Zeitpunkt:** die Schicht anlegen, solange die Seite
klein ist, auch wenn sie vorerst überall „CH / de / CHF / metrisch / SIA"
zurückgibt. Jede Seite, die vorher gebaut wird, muss nachher angefasst
werden.

## Was schon vorher offen war (nicht vergessen)
Steht ausführlich weiter oben in dieser Datei:
- **Preismodell bestätigen** (Launch-Liste Punkt 0) — blockiert Punkt 1.
- **Rabattstufen festlegen** und **KBOB-Referenz aus belegbarer Quelle**
  — ohne beides darf keine Garantie raus.
- `data/legal.ts`: alle `[[…]]` füllen, anwaltliche Durchsicht.
- Vorstart-Sperre entfernen, Web-Push, Lieferschein-Abgleich.
- **Ratenbegrenzung — erledigt** (Migration 25). Zwei Stufen: der alte
  Zähler im Arbeitsspeicher fängt den Ansturm auf derselben Instanz ab,
  darunter die Tabelle `rate_limits` in Supabase über alle Instanzen
  hinweg. Kein Redis: das kostete ein weiteres Konto, weitere Zugangsdaten
  und eine weitere Sache, die ausfallen kann. Fällt die Datenbank aus,
  bleibt Stufe 1 stehen — eine Anmeldeseite, die bei einer Störung
  niemanden mehr durchlässt, wäre schlimmer.
- KI-Materialabgleich Stufe 3 — wartet auf `ANTHROPIC_API_KEY`.
- Kästchen-Abbau: erledigt auf `/termine`, `/profile/edit`,
  `/network/requests`, `/delivery-notes`, `/admin-control`,
  `/notifications`, `/pools/saved`. Noch anzusehen: `/map`,
  `/network/entdecken`, `/company/[id]`.
- **KYB-Prüfung — halb gebaut.** Die CHE-Nummer trägt eine Prüfziffer
  (Gewichte 5-4-3-2-7-6-5-4, Modulo 11); die wird jetzt beim Onboarding
  *und* beim Profil-Bearbeiten nachgerechnet (`lib/uid.ts`). Damit kommen
  Tippfehler und erfundene Nummern nicht mehr durch. **Was fehlt: der
  Abgleich gegen das UID-Register des Bundes** (`uid.admin.ch`) — der
  sagt erst, ob die Firma existiert. Erst wenn der läuft, darf
  `companies.verified` gesetzt werden; heute setzt es niemand, und das
  ist richtig so. Der Haken bedeutet sonst nichts.
  *Hinweis: `uid.admin.ch` ist aus der Entwicklungsumgebung nicht
  erreichbar (Egress-Sperre) — der Registerabgleich muss auf Vercel
  gebaut und geprüft werden.*
- Aus dem Master-Briefing: DUNS (international), Geofencing,
  dynamischer Kontextwechsel (Währung/Einheit/Normwerk) — letzterer
  gehört technisch früh, sonst wird er später zum Umbau von allem.
