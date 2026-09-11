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
0. **Preismodell — die Zahlen stehen, der Zuschnitt nicht ganz.**
   0 / 129 / 489 CHF pro Monat, vom Auftraggeber am 09.09.2026 festgelegt
   und in `data/plans.ts` hinterlegt (die einzige Quelle; `/` liest daraus).
   Dieser Punkt hat vorher noch „0 / 79 / 189 sind Platzhalter" behauptet —
   das war überholt und ist am 10.09.2026 richtiggestellt worden.

   Offen bleiben die Fragen zum Zuschnitt, und sie gehören beantwortet,
   bevor Preise in Werbung, AGB oder Verträge gehen:
   · Was kostet Pro pro Monat (und pro Jahr, falls es das gibt)?
   · Was ist in der Gratisstufe enthalten, was nur in Pro?
   · Gibt es eine Stufe für Lieferanten/Baustoffwerke, und wenn ja welche?
   · Läuft die Vermittlungsgebühr getrennt vom Abo oder ist sie darin?
   Sobald die Zahlen stehen: Abschnitt zwischen „Der Unterschied in Zahlen"
   und den Pools-/Netzwerk-Karten, drei Säulen im dunklen Register, die
   mittlere golden hervorgehoben.
1. **RABATTSTUFEN — die SourceOn-Staffel ist geprüft und VERWORFEN
   (11.09.2026).**

   Im alten Stand gefunden (`tiers.js`, „Single Source of Truth"), gestaffelt
   nach Bestellwert in CHF statt nach Menge — das ist der bessere Zuschnitt,
   weil eine Franken-Staffel über alle Materialien gilt:

   | Bestellwert | Netto-Rabatt |
   |---|---|
   | ab 1'000'000 | 28 % |
   | 500'000–999'999 | 24 % |
   | 250'000–499'999 | 20 % |
   | 100'000–249'999 | 16 % |
   | 50'000–99'999 | 13 % |
   | 25'000–49'999 | 10 % |
   | 5'000–24'999 | 7 % |
   | 500–4'999 | 5 % |

   **Die Zahlen sind unmöglich.** Marktrecherche zur Transportbetonbranche:
   EBITDA-Marge unabhängiger Werke 3.5–6 %, bei grossen integrierten 6–9 %,
   Median-Nettomarge ~4.2 %, Bruttomarge 15–25 %, Materialkosten ~56 % der
   Herstellkosten. 28 % Rabatt ist mehr als die gesamte BRUTTOmarge; schon
   16 % frisst sie bei den meisten auf. Kein Werk kann das bieten.

   Dazu ein Schweizer Detail: **die publizierten Preislisten sind bereits
   Unternehmerpreise**, keine aufgeblasenen Endkundenlisten — bei Beton
   Baumeli steht ausdrücklich, dass Skonto und weitere Rabatte nicht möglich
   sind. Die frühere Notiz in diesem Dokument, Preislisten im Baustoffhandel
   seien mit 30–40 % Rabatt aufgeblasen, gilt für andere Branchen und ist
   hiermit zurückgenommen.

   **Woher die Ersparnis wirklich kommt** — nicht aus der Marge, sondern aus
   Kosten, die durch die Bündelung wegfallen: Kleinmengenzuschläge (real,
   z. B. CHF 50 pro Fuhre unter 1 m³), planbare Auslastung, weniger Fahrten
   je m³, vermiedene Winterzuschläge, ein Verkaufsvorgang statt fünf. Das ist
   belegbar und **einstellig**. Dort gehört die Staffel hin.

   **FOLGE FÜRS PROVISIONSMODELL, mitzudenken:** Bei einem Gesamtrabatt von
   17.25 % nimmt Obtanet 13 % des Zugeständnisses. Bei 7.25 % sind es 31 %.
   Werden die Stufen einstellig, ist eine feste Provision von 2.25 Punkten
   ein auffällig grosser Anteil — und Werk und Besteller reden hier
   miteinander.

   **Was fehlt und nicht recherchierbar ist:** die richtigen Zahlen. Sie
   stehen in keiner öffentlichen Quelle. Sie kommen aus einem Gespräch mit
   einem Betonwerk: „Wenn ich dir 500 m³ mit fester Terminplanung bringe
   statt fünf Einzelbestellungen — was ist dir das wert?" Die Antwort ist
   die Staffel, und sie ist belastbar, weil ein Werk sie gesagt hat.

   Die Margendaten sind international, nicht schweizspezifisch — die
   Grössenordnung stimmt, die Nachkommastelle nicht.

1b. **Der Zuschnitt der Staffel: nach Bestellwert, nicht nach Menge.**
   Heute stehen in `submit_demand` die Schwellen 101/201/351 als reine
   Stückzahlen mit 9/12/16 %. Über Materialien hinweg geht das nicht auf:
   351 m³ Beton sind ein anderes Geschäft als 351 Dämmplatten. Sobald echte
   Zahlen da sind, gehört die Staffel auf Franken umgestellt — der Wert
   liegt bereits vor (Menge × Referenzpreis).

   **Und an EINE Stelle.** SourceOn hatte die Staffel in zwei Dateien, beide
   mit dem Hinweis „MUSS synchron bleiben" — und sie waren es nicht:
   `tiers.js` rechnete `gross = (net + 0.0225) / 1.0225` (Provision auf den
   Bestellwert), `auto-bundle/index.ts` rechnete `net + 0.0225` (Provision
   auf den Referenzwert). Bei net 16 % ergab das 18 % gegen 18.25 %. Der
   Kalkulator zeigte dem Kunden also etwas anderes, als beim Bündeln
   ausgeschrieben wurde. Obtanet hat die zweite Variante geerbt — die vom
   Auftraggeber bestätigte.
2. **DER PREISANKER — nachgeschlagen am 10.09.2026, und es ist schlimmer
   als gedacht.**

   Die KBOB veröffentlicht **Materialpreisindizes**, publiziert monatlich
   vom BFS auf Basis des Produzenten- und Importpreisindex, Basis 100 (neu
   Dezember 2025 = 100), für Materialgruppen wie Beton, Zement, Kies,
   Betonstahl.

   **Es sind Indexwerte, keine Frankenbeträge.** Eine amtliche KBOB-Zahl
   „Beton C25/30 kostet in Zürich CHF 156 pro m³" gibt es nicht — nicht aus
   Zugangsgründen, sondern weil sie nicht publiziert wird. Wir haben also
   für **kein einziges** der 33 Katalogmaterialien einen belegbaren
   KBOB-Preis und können auch keinen bekommen. Die 33 Zahlen in
   `data/procurement.ts` sind Schätzungen im Quelltext; `data/kbobData.json`
   sagt in seinem eigenen Kopf, dass es eine nachgebildete Reihe ist.

   Das wiegt schwerer als vorher, weil Migration 35 den Mindestrabatt UND
   die Provision am `kbob_reference_price` misst. Mindestgebot,
   Vermittlungsgebühr und Preisgarantie stehen alle auf derselben
   unbelegten Zahl.

   **SourceOn hatte es richtig gelöst** (im alten Stand nachgesehen):
   `bd_market_price: "Regulärer Marktpreis (Richtwert)"` — Richtwert, nicht
   Index. Dazu `"SourceOn-Provision (2.25%)"` und `"Provision im
   Mindestrabatt bereits einkalkuliert"`: dasselbe Modell wie heute.

   **DER MEDIAN AUS WERKS-PREISLISTEN IST VERWORFEN.** Er stand hier
   kurz als Vorschlag und ist aus zwei Gründen schlecht:

   - **Zirkulär.** Die Werke, deren Preislisten den Median bilden, bieten
     selbst gegen diesen Median. Auf die Frage „woher kommt die Zahl?"
     wäre die Antwort „von unseren eigenen Kunden". Der Auftraggeber hat
     das zu Recht als unseriös zurückgewiesen.
   - **Preislisten sind aufgeblasen.** Werke geben routinemässig 30–40 %
     Rabatt auf Liste. Ein Median daraus läge weit über den echten
     Abschlusspreisen — „15 % unter Liste" wäre der normale Preis mit
     einem Etikett drauf, und der erste Einkäufer, der das durchschaut,
     erzählt es weiter.

   **DER WEG: BFS-Einheitspreise über die CRB.**

   Das BFS publiziert *Kostenkennwerte für Berechnungselemente*:
   regionalisierte durchschnittliche **Einheitspreise in Franken** für über
   100 NPK-Positionen, netto ohne MWST, für die ganze Schweiz und sieben
   Grossregionen, zweimal jährlich (Juni/Dezember). Zugänglich über
   `werk-material.online`, betrieben von der CRB zusammen mit dem BFS —
   über 400 Teilpositionen aus 40+ NPK-Kapiteln.

   | | |
   |---|---|
   | Unabhängig | vom Bund erhoben, nicht von den eigenen Kunden |
   | In Franken | Einheitspreise, nicht Indexpunkte |
   | Regional | sieben Grossregionen, passt zu den Bündelregionen |
   | Zitierbar | „Einheitspreis BFS/CRB, Grossregion Zürich, Stand Juni 2026" |

   **Zwei Fragen, die der Auftraggeber mit der CRB klären muss, bevor
   irgendetwas darauf gebaut wird:**

   1. **Passen die Positionen?** NPK-Positionen sind Bauleistungen, oft
      inklusive Einbringen und Arbeit — nicht zwingend der reine
      Materialpreis ab Werk. Ob es „Beton C25/30 ab Werk" gibt oder nur
      „liefern und einbringen", steht im Katalog.
   2. **Darf man die Zahlen verwenden?** `werk-material.online` ist ein
      kostenpflichtiges Produkt der CRB. Sie in einem eigenen kommerziellen
      Produkt anzuzeigen und zur Grundlage einer Preisgarantie zu machen,
      braucht sehr wahrscheinlich eine Lizenz. **Diese Frage entscheidet,
      ob der Weg offen ist.**

   Der KBOB-Materialpreisindex bleibt nützlich — aber nur für die
   Veränderung zwischen zwei Erhebungen, nicht für die Höhe.

   **Kartellrechtlich**, falls je eigene Zahlen aggregiert werden: nur
   veröffentlichte Listen, nie ein einzelnes Werk zeigen, Mindestzahl an
   Quellen, und **niemals Gebote von der Plattform einfliessen lassen** —
   vertrauliche Gebote von Wettbewerbern zu einer öffentlichen Zahl zu
   verarbeiten wäre der schwerste Fehler. Die frühere Notiz, der eigene
   Abschluss-Median sei später der stärkste Anker, ist damit
   zurückgenommen: nicht ohne anwaltliche Prüfung, Verzögerung und
   Aggregation. Anwaltsliste.

   **Noch am Original zu prüfen:** die genaue Liste der Materialgruppen.
   `kbob.admin.ch` ist aus der Arbeitsumgebung gesperrt; die Angaben oben
   stützen sich auf die BFS-Tabellen und das KBOB-Faktenblatt.
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

## Verbindungsanfragen — vier Fehler, gefunden am 10.09.2026

Der Auftraggeber stellte von einem Konto aus eine Anfrage; beim anderen kam
nichts an, „keine Anzeichen", und die neue Firma war nicht einmal in der
Suche zu finden. Die Datenbank war unschuldig — gegen den Prüfstand aus den
echten Migrationen sieht der Empfänger die Zeile und die Firma. Es waren
vier Fehler in der Oberfläche und einer in der Publikation:

1. **Anfragen fielen lautlos aus der Liste.** `incoming` in `lib/network.ts`
   schlug die Gegenseite im geladenen Verzeichnis nach und warf jede Zeile
   weg, zu der es dort keine Firma gab (`.filter((x) => x.company)`). Das
   Verzeichnis wird einmal beim Seitenaufbau geholt — meldete sich die
   Gegenseite danach an, war die Anfrage unsichtbar. Jetzt werden die
   Firmen der Gegenseite einzeln über ihre ID nachgeladen (`partners`).

2. **Ein misslungenes „Vernetzen" sagte nichts.** `if (!error) loadMine()`
   — bei einem Fehler passierte schlicht gar nichts. Kein Unterschied
   zwischen Erfolg und Fehlschlag. Jetzt steht die Meldung im Klartext da;
   der doppelte Versuch (`23505`) und die fehlende Berechtigung (`42501`)
   haben eigene Sätze.

3. **Nichts kam live an.** In der Realtime-Publikation stand nur
   `messages`. Migration 33 nimmt `connections` und `companies` dazu, die
   Oberfläche hört auf INSERT und UPDATE. **Kein `REPLICA IDENTITY FULL`
   auf `connections`:** für gelöschte Zeilen prüft Supabase keine
   Zeilenregel, ein DELETE ginge an jeden Zuhörer — mit voller
   Replica-Identität stünden dort beide Firmen-IDs. So trägt es nur den
   Primärschlüssel. Löschungen fängt stattdessen der Blick auf den Tab ab
   (`visibilitychange`/`focus`).

4. **Die Glocke zählte einmal und dann nie wieder.** `useNotifications`
   hatte weder Realtime noch einen Takt. Jetzt hört sie mit.

Ausserdem las `ReceivedRequests` dieselbe Frage mit einer eigenen zweiten
Abfrage — zwei Wahrheiten. Sie liest jetzt aus `useNetwork()`.

**Der Prüfstand hatte eine Lücke, die genau hierhin führte.** `stubs.sql`
brachte die Supabase-Standardrechte nicht mit (`ALTER DEFAULT PRIVILEGES
… GRANT ALL ON TABLES TO anon, authenticated, service_role`). Ein Test auf
`connections` lief deshalb in „permission denied for table", wo in Supabase
längst RLS entscheidet — ein Fehler, den es dort nicht gibt, und der einen
echten Rechtefehler überdeckt hätte. Steht jetzt in `stubs.sql`; die
REVOKEs der Migrationen laufen danach und behalten das letzte Wort
(gegengeprüft: `kontrolle.sql` meldet weiterhin achtzehnmal `ok`).

Was im echten Bestand steht, zeigt `supabase/pruefung/verbindungen.sql`.

## Karte: Nadeln mit Namen, nicht Punkte

Ein Punkt sagt „hier ist jemand" und sonst nichts — man muss jeden einzeln
anklicken. Die Karte trägt jetzt Kartennadeln mit dem Firmennamen daneben
(`components/map/LeafletMap.tsx`, Gestaltung in `app/globals.css` unter
`.nadel`).

- Gold = Baustoffwerk, Navy = Bauunternehmen; die Farbe wiederholt sich als
  Kante am Namensschild.
- Haken in der Nadel = verifiziert, Kreis = nicht.
- Blasse Nadel = nur ungefähr verortet (Ort/Kanton statt Adresse).
- **Namen erst ab Zoomstufe 9.** Über der ganzen Schweiz lägen dreissig
  Namen übereinander; bis dahin nennt ein Zeiger auf der Nadel die Firma.
- Die Nadelspitze sitzt auf der Koordinate. Deshalb `iconSize: [0,0]` und
  `iconAnchor: [0,0]`: ein fester Kasten müsste so breit sein wie der
  längste Name und würde die Nadel danebenrücken. Dazu gehört
  `overflow: visible` auf `.nadel-huelle` — sonst schneidet Leaflet ab.
- Firmennamen gehen als HTML in `divIcon`, also durch `escape()`.

## Alles live — `lib/live.ts`

Der Auftraggeber: „anfragen standorte nachrichten etc sollten in realtime
passieren und ankommen ohne neuladen". Die Seite lud vorher überall genau
einmal beim Aufbau. Statt das in jedem Bildschirm einzeln zu flicken, steht
die Verkabelung an einer Stelle: `useLive(...)` und
`useFrischBeiRueckkehr(...)`.

Angeschlossen: Netzwerk (`lib/network.ts`), Glocke (`useNotifications`),
Karte (`SupplierMap`, `MapWidgets`), Bündel (`lib/bundles.ts`),
Materialanfragen (`lib/directRequests.ts`), Firmenprofil
(`CompanyConnect`), Vorschläge (`RecommendedPartners`).

In der Publikation stehen: `messages` (21), `connections` + `companies`
(33), `direct_requests`, `direct_offers`, `bundle_participations`,
`bundles` (34).

**Zwei Regeln, die dabei gelten und die man nicht aufweichen darf:**

1. **Nur INSERT und UPDATE.** Für gelöschte Zeilen prüft Supabase keine
   Zeilenregel — ein DELETE geht an jeden Zuhörer. Ohne
   `REPLICA IDENTITY FULL` trägt es nur den Primärschlüssel und verrät
   nichts. Deshalb steht auf keiner dieser Tabellen volle
   Replica-Identität (auf `messages` schon, aus Migration 21 — dort ist es
   für den Gelesen-Haken nötig und die Zeile geht ohnehin nur an Sender und
   Empfänger).
2. **Löschungen fängt der Tab-Wechsel ab** (`visibilitychange`/`focus`).
   Das ist zugleich das Auffangnetz für abgerissene Verbindungen.

**Noch nicht live:** der Beitragsfeed (`network_posts`, `post_likes`,
`post_comments`). Bewusst — ein Feed, der einem unter den Händen springt,
liest sich schlechter als einer, der stehenbleibt.

## UID-Nummern zum Testen

Die Anmeldung prüft die UID rechnerisch (`lib/uid.ts`, Gewichte 5-4-3-2-7-6-5-4,
Modulo 11). Ausgedachte Nummern fallen durch — zum Testen mit mehreren Konten
braucht es deshalb Nummern mit richtiger Prüfziffer:

```
CHE-999.000.019
CHE-999.000.025
CHE-999.000.031
```

Reserve, falls mehr gebraucht wird: `CHE-999.000.048`, `CHE-999.000.054`,
`CHE-999.000.060`, `CHE-999.000.077`, `CHE-999.000.083`.

**Warum der 999er-Bereich.** Das Register vergibt aufsteigend ab
`CHE-100.000.000` und steht heute bei rund 400 Millionen. Eine 999er-Nummer
ist also frei und kann keiner echten Firma gehören — genau das war die
Bedingung: keine erfundenen Angaben auf den Namen einer echten Firma.

`uid_number` ist UNIQUE: jede Nummer geht nur einmal. Jedes Testkonto
braucht ausserdem einen eigenen Login (eigene E-Mail bei Clerk) — die
Firmenzeile hängt an `clerk_user_id`.

**Vor dem Launch aufräumen:** Testfirmen stehen im offenen Verzeichnis.
Entweder vorher schliessen (`/konto`) oder die Zeilen entfernen — Letzteres
schlägt fehl, sobald Nachrichten daran hängen (`RESTRICT`, Migration 30),
dann bleibt nur das Schliessen.

# DAS GESCHÄFTSMODELL — ENTSCHIEDEN AM 10.09.2026

Ausdiskutiert mit dem Auftraggeber. **Nichts davon ist gebaut.** Wer hier
etwas ändert, ändert Vertragsinhalte — nicht einfach Code.

Alle Zahlen unten sind **Einstellungen in `app_settings`**, nicht Konstanten
im Quelltext. Heute steht die 2.25 an vier Stellen fest verdrahtet
(`supplier_bids.platform_fee_percent`, die Verträge, die Lieferscheine, und
`v_fee` in `place_bid()`). Das ist vor dem Bauen einzusammeln — sonst laufen
sie auseinander, und dann stimmt eine Rechnung nicht mehr mit einem Vertrag
überein.

## 1. Provision

**Bündel: 2.25 % — als Prozentpunkte auf den Referenzwert**, nicht auf den
Rechnungsbetrag. Der Lieferant bietet nicht auf den Mindestrabatt, sondern
auf Mindestrabatt + 2.25 Punkte.

Beispiel, 500 m³, KBOB 160.00/m³, Referenzwert CHF 80'000:

| | | |
|---|---|---|
| Mindestrabatt der Mengenstufe | 15 % | Besteller zahlen 136.00/m³ = 68'000 |
| Der Lieferant bietet | **17.25 %** | er sieht 132.40/m³ = 66'200 |
| Obtanet | 2.25 % von 80'000 | **1'800** |

Probe: 68'000 − 66'200 = 1'800.

**Direktgeschäfte: 1 %** auf den Auftragswert. Weniger, weil weniger
geliefert wird — kein Bündel, keine Mengenstufe, keine Ausschreibung.

**Überschuss gehört den Bestellern.** Bietet ein Werk 20 % statt 17.25 %,
bleibt Obtanet bei 2.25 Punkten; die Besteller bekommen 17.75 %. Obtanets
Anteil ist fix und damit erklärbar; der Wettbewerb muss beim Besteller
ankommen, sonst ist die Ausschreibung eine Attrappe.

**Fällig:** Die Forderung entsteht mit dem Zuschlag, fällig ist sie
**30 Tage nach Lieferbeginn**. Der Anspruch steht fest, das Werk hat Luft.

**Bemessen wird die ZUGESCHLAGENE Menge, nicht die gefahrene.** Das war
zuerst andersherum vorgeschlagen und ist bewusst gedreht worden: Eine
Gebühr auf die gefahrene Menge lädt Werk und Besteller zur Absprache ein —
jeder nicht gemeldete Kubikmeter spart dem Werk Gebühr, und Obtanet sässe
am Ende einer Kette, deren beide Enden verdienen, wenn sie es kleinrechnen.
Beim Zuschlag steht die Zahl fest und ist nicht manipulierbar. Juristisch
ist das auch die saubere Konstruktion: Vermittlungslohn verdient man mit
dem Abschluss, nicht mit der Erfüllung.

Dazu in die AGB: **Mindestabnahme 90 %** der gemeldeten Menge.

**Der eine Ausnahmefall:** Wird gar nichts geliefert, entfällt die Gebühr.
Dabei sind zwei Fälle zu trennen, sonst entsteht eine Hintertür:

- **Das Werk WILL nicht liefern** → Vertragsbruch. Schadenersatz, Eintrag,
  **die Gebühr steht.**
- **Das Werk KANN nicht liefern** (Konkurs, Werk abgebrannt) → zweitbestes
  Gebot springt ein; kommt gar nichts zustande, entfällt die Gebühr.
  „Kann nicht" muss belegt sein, sonst ist es „will nicht".

**Anwaltsliste:** ob ein Vermittlungslohn auf nicht erfüllte Menge in der
Schweiz haltbar ist.

**Der Besteller sieht die 2.25 % nicht** — er sieht seine 15 %. Der
Lieferant sieht sie am ausgeschriebenen Bündel. **Aber sie muss einmal in
den AGB stehen**, wahrheitsgemäss: Obtanet erhält vom Lieferanten eine
Vermittlungsgebühr. Nicht auf der Preisanzeige, aber nicht nirgends — sonst
erfährt es der Besteller vom Werk (die beiden chatten hier miteinander) und
es sieht verheimlicht aus statt selbstverständlich.

## 1b. Lieferantenkonto: Grundgebühr, verrechnet mit Provisionen

**Kein klassisches Abo.** Eine Jahresgebühr, an die jede bezahlte Provision
angerechnet wird.

| | Provision im Jahr | Grundgebühr | Zahlt insgesamt |
|---|---|---|---|
| Werk A — gewinnt Bündel | CHF 3'000 | angerechnet, nichts offen | **3'000** |
| Werk B — telefoniert nur | CHF 0 | CHF 1'200 | **1'200** |
| Werk C — ein kleines Bündel | CHF 400 | 800 offen | **1'200** |

Wer mitarbeitet, merkt sie nie. Wer hier zwanzig Kunden einsammelt und
alles daneben abwickelt, zahlt für den Zugang, den er benutzt.

**Warum das rechtlich geht und ein „wir haben gemerkt, dass du keine Deals
machst" nicht:** Die Gebühr steht von Anfang an in der Preisliste, jeder
stimmt ihr bei der Anmeldung zu, und sie ist **immer geschuldet** — die
Provisionen sind eine Anrechnung darauf, keine Strafe danach. Niemand wird
beobachtet, niemand einzeln bepreist, es gibt keine Überraschung im
Nachhinein. Genau das war beim ersten Erklärversuch missverständlich
formuliert und hat den Auftraggeber zu Recht stutzig gemacht.

**Das Lieferantenkonto ist die Schranke vor dem Bieten.** Ohne bezahltes
(oder freigestelltes) Lieferantenkonto bleibt ein Werk auf dem
**Basiskonto**: umsehen, vernetzen, chatten, Direktanfragen, selber
einkaufen — aber **nicht bieten**. Das fällt mit der Prüfleiter zusammen:

> geprüft ∧ freigegeben ∧ Lieferantenkonto aktiv = **bietfähig**

Ein Zustand weniger im System, eine Regel weniger zu erklären, und auf die
Frage „was kostet das?" gibt es eine klare Antwort: nichts, solange du dich
nur umsiehst.

**Abrechnung: jährlich, nachschüssig.** Am Jahresende steht fest, wie viel
Provision angefallen ist; nur die Differenz wird gestellt. Vorschüssig zu
verrechnen ginge auch, macht aber Gutschriften nötig und ist unnötig
kompliziert.

**Ein Jahr frei, ab Freischaltung des einzelnen Werks** — nicht ab einem
gemeinsamen Startdatum. Wer im zehnten Monat dazukommt, soll nicht zwei
Monate bekommen.

Der Grund liegt im Takt: Ein Bündel sammelt Wochen, dann Ausschreibung,
dann Zuschlag. Bis ein Werk sein erstes Bündel *gewinnt*, vergehen leicht
zwei bis drei Monate — und nur, wenn zufällig eines in seinem Material und
seiner Region läuft. Am Anfang laufen wenige. Bei drei Monaten schickt man
also eine Rechnung an jemanden, der noch nie etwas bekommen hat. Der zahlt
nicht, der geht — und in der Schweizer Baustoffbranche reden zwanzig Werke
miteinander.

Nach einem Jahr ist es umgekehrt: Wer Bündel gewonnen hat, zahlt durch die
Anrechnung ohnehin nichts extra. Übrig bleibt genau der, den die Gebühr
treffen soll.

**Gebaut wird das als Datum am Konto** (`frei_bis`), vorbelegt aus einer
Einstellung. Damit lässt sich später auf drei oder sechs Monate umstellen,
ohne Auslieferung, und einem einzelnen Werk jederzeit verlängern. Die
Entscheidung bleibt umkehrbar.

**Gründungskondition:** für die ersten Werke (~20) dauerhaft oder zwei
Jahre erlassen, offen benannt — „Gründungswerk, ihr seid dabei, bevor es
sich für euch rechnet." Kostet fast nichts, weil diese Werke am Anfang
wenig Provision zahlen, und bringt die Ersten, ohne die es keine Zweiten
gibt.

**Offen: der Betrag.** CHF 1'200 im Jahr ist ein Vorschlag, keine
Entscheidung.

Was trotzdem bleibt: Werke, die Kontakte knüpfen und danebendran Geschäfte
machen, lassen sich nicht daran hindern — erkennen liesse es sich nur durch
Mitlesen, und das ist ausgeschlossen (Abschnitt 7). Die Grundgebühr sorgt
nur dafür, dass der Zugang trotzdem etwas kostet. Der wertvollste Teil
wandert ohnehin nicht ab: gebündelte Nachfrage lässt sich nicht am Telefon
nachbauen, das Bündel existiert nur hier.

## 1c. Gratis / Pro / Enterprise gelten für ALLE — auch für Lieferanten

Diese Stufen verkaufen **allgemeine Funktionen** der Plattform (KI,
Auswertungen, Uploads), nicht Besteller-Funktionen. Sie hängen deshalb am
Konto, nicht an der Rolle.

Zwischenzeitlich stand hier der Vorschlag, Lieferanten von den Stufen
auszunehmen — begründet damit, dass ihre einzige Grenze `pool_limit` sei
und ein Werk keinem Bündel beitritt. **Das war falsch, und der Auftraggeber
hat den Fehler gefunden:** Bekämen Lieferanten alle allgemeinen Funktionen
gratis, wäre „ich bin Lieferant" der bequemste Weg zu Enterprise ohne zu
zahlen. Genau das Loch, das die ganze Lieferantenprüfung schliessen soll,
wäre damit wieder offen.

Es gilt also drei Ebenen, sauber getrennt:

| Ebene | Was sie verkauft | Für wen |
|---|---|---|
| **Gratis / Pro / Enterprise** | allgemeine Funktionen; für Besteller zusätzlich die Zahl gleichzeitiger Bündel | alle |
| **Lieferantenkonto** | Bietfähigkeit | nur geprüfte Werke |
| **Provision 2.25 %** | je gewonnenes Bündel | nur Werke |

Ein Werk, das auch einkauft, ist in seiner Bestellerrolle ganz normal auf
Gratis oder Pro. Die Rollen liegen nebeneinander, sie schliessen sich nicht
aus.

**Das Lieferantenkonto enthält NICHT die allgemeinen Stufen.** Auch das
wurde erwogen — „im Lieferantenkonto ist alles drin, was die Seite kann" —
und rechnet sich nicht: Enterprise kostet CHF 489 im Monat, also 5'868 im
Jahr; das Lieferantenkonto im ersten Jahr nichts und danach 1'200, die von
den Provisionen aufgefressen werden. Ein Werk bekäme Enterprise faktisch
gratis, während das Bauunternehmen im selben Bündel voll zahlt. Das fällt
auf, und zwar dem Besteller, der die KI-Funktionen bezahlt, die das Werk
umsonst hat.

Ein Werk löst also **normale Abos wie jede andere Firma**; wenn es die
Lizenz zum Bieten will, kommt das Lieferantenkonto dazu.

Wenn Werke später belohnt werden sollen, dann gezielt und verdient — „ab
CHF X Provision im Jahr ist Pro inklusive" — sobald man weiss, was ein Werk
im Schnitt umsetzt. Nicht vorher verschenkt.

## 1d. ZUGELASSEN, NICHT GEKAUFT

Der wichtigste Satz des ganzen Modells, vom Auftraggeber gefunden:

> **Das Lieferantenkonto kann man nicht kaufen. Man wird dazu zugelassen.**

Läge das Bieten hinter einer Zahlung, würde irgendwann jemand zahlen, um
hineinzukommen — ein Bauunternehmen kauft das Lieferantenkonto und bietet
mit. Das ganze Verfahren hinge an einer Kreditkarte. Hinter einem Nachweis
kann Geld nichts ausrichten.

**Die Reihenfolge ist deshalb: nachweisen → zugelassen werden → ab Jahr
zwei zahlen.** Nie umgekehrt. Eine Konzession, kein Produkt. In der
Datenbank heisst das: der Zahlungsvorgang setzt die Bietfähigkeit NICHT —
er setzt nur das Konto auf bezahlt. Freigegeben wird von Hand.

### Der Nachweis, dass es wirklich ein Werk ist

Zwei Dinge tragen die Entscheidung:

**1. Die Branchennummer im Register.** Ein Bauunternehmen steht unter
Hoch-, Tief- oder Ausbau; ein Baustoffwerk unter Kies- und Sandgewinnung,
Zement, Betonerzeugnissen oder Baustoffhandel. Automatisch prüfbar, trennt
die grosse Mehrheit sofort — aber selbst deklariert und manchmal veraltet,
also ein starkes Indiz und kein Beweis.

**2. Ein Nachweis, dass tatsächlich produziert wird.** Hier hat die Branche
etwas, das kein Bauunternehmen vorlegen kann: ein Betonwerk braucht eine
**Konformitätsbescheinigung nach SN EN 206** (zertifizierte werkseigene
Produktionskontrolle). Wer Beton verkauft, hat dieses Papier; wer keins
hat, verkauft keinen Beton. Für Kies und Sand ist es die Abbaubewilligung,
für Händler der Handelsregisterzweck plus Referenzen.

Das ist der beste Filter, den es gibt: ein Dokument, das im normalen
Geschäft ohnehin existiert und das man nicht mal eben beschafft.

**Am Ende steht trotzdem ein Mensch.** Die Dokumente geben ihm etwas zu
beurteilen — entscheiden muss er.

**Gesperrt wird nicht die Rolle, verlangt wird der Beweis.** Ein
Bauunternehmen, das tatsächlich ein eigenes Betonwerk betreibt — gibt es,
gerade bei den grösseren —, erbringt diese Nachweise und darf dann auch
bieten. Zu Recht. Wer nach Rolle sperrt, schliesst legitime Teilnehmer aus
und wird trotzdem von einem geschickten Betrüger umgangen.

**NICHT VERIFIZIERT:** der genaue Name der SN-EN-206-Bescheinigung, die
zuständigen Zertifizierungsstellen und die Branchennummern des Bundes.
Nachschlagen, bevor daraus eine Dokumentenliste in der Anmeldung wird.

**Die Linie, die nicht überschritten werden darf:** Eine Stufe darf
**niemals** beeinflussen, wer ein Bündel gewinnt. Heisst „Pro" irgendwann
bessere Chancen beim Zuschlag, ist die verdeckte Ausschreibung
korrumpiert — die Besteller merken es, die Werke erzählen es weiter, und
die Preisgarantie ist wertlos. Stufen dürfen Bequemlichkeit und Reichweite
verkaufen, nie einen Vorteil im Verfahren.

## 2. Mindestgebot

`place_bid()` **weist ein Gebot unter Mindestrabatt + Provision ab.** Heute
prüft es gar nichts: jeder Preis über null geht durch, und die 2.25 werden
nur danebengeschrieben. Eine Grenze, die der Browser durchsetzt, ist keine.

## 3. Lieferzeitraum

**Ein Bündel hat heute keinen.** Es gibt `deadline` (bis wann gesammelt
wird) und die Angebotsfrist — kein Feld dafür, wann geliefert werden soll.
Drei Folgen: der Besteller weiss nicht, wann er sein Material bekommt; das
Werk bietet blind auf einen Aufwand, den es nicht kennt (500 m³ in einer
Woche sind etwas anderes als 500 über ein halbes Jahr); und Kapazität lässt
sich ohne Zeitraum überhaupt nicht prüfen.

**Der Zeitraum gehört an die TEILNAHME, nicht ans Bündel** — nicht alle im
Bündel brauchen zur gleichen Zeit. Monatsebene reicht.

Aus den Teilnahmen entsteht die **Mengenkurve des Bündels**:

```
Mai      140 m³
Juni     215 m³
Juli     110 m³
August    35 m³
          ─────
          500 m³
```

Genau die sieht der Lieferant beim Bieten, und genau dagegen wird seine
Kapazität geprüft.

**Spannweite höchstens drei Monate** je Bündel (je Materialart
einstellbar), sonst landet ein Mai-Bedarf beim Frühling des nächsten Jahres
und kein Werk kann das preisen.

**Die KI ersetzt dieses Feld NICHT.** Sie gruppiert, was dasteht — steht
nirgends *wann*, würde sie raten. Sie ist der Nutzer der Angabe, nicht ihr
Ersatz.

**Die Baustelle wird beim Beitritt zur Pflicht.** Heute steht in
`join_bundle` ein `p_project_id UUID DEFAULT NULL` — man kann beitreten,
ohne zu sagen, wohin geliefert wird. Für die Zuteilung nach Baustellen
(Abschnitt 5) ist das tödlich: keine Baustelle, keine Adresse, kein Radius,
nichts zum Zuteilen.

## 4. Kapazität ist eine Rate, kein Vorrat

Der Denkfehler, den es zu vermeiden gilt: „die Kapazität schrumpft mit
jedem gewonnenen Bündel" stimmt **nur für den Lieferzeitraum**. Danach ist
sie wieder da. Als schrumpfende Gesamtzahl gebaut, wäre ein Werk mit
200 m³ Tagesleistung nach zwei Bündeln „leer", obwohl es monatlich 4'000
fahren kann.

**Das Werk erklärt eine Menge pro Monat je Material, plus Regionen.** Ein
Bündel belegt sie in den Monaten seines Zeitraums. Frei = erklärt − belegt.

Lebenslauf einer Belegung:

| Zustand | Wann |
|---|---|
| reserviert | beim Gebot |
| freigegeben | Gebot verliert, Frist verfällt, Rückzug, Bündel scheitert |
| fest gebucht | beim Zuschlag |
| abgebaut | Lieferschein für Lieferschein |
| aufgelöst | wenn das Bündel abgeschlossen ist |

**Prüfung in drei Stufen** — eine harte Reservierung beim Gebot wäre zu
streng: Ein Werk mit 1'500 m³/Monat könnte nur auf 1'500 m³ bieten, obwohl
es vielleicht eines von fünf Bündeln gewinnt. Das erstickt den Wettbewerb,
und ohne Wettbewerb keine 17.25 %.

1. **Beim Gebot:** harte Sperre nur, wenn *dieses eine Bündel allein* die
   freie Kapazität übersteigt. Auf etwas zu bieten, das man als einzigen
   Auftrag nicht schaffen würde, ist immer unseriös.
2. **Beim Gebot, sichtbar:** „Frei im Juni: 400 m³. Deine offenen Gebote:
   900 m³." Er entscheidet informiert.
3. **Beim Zuschlag:** harte Prüfung. Reicht es nicht, geht das Bündel ans
   nächstbeste Gebot und das Werk bekommt einen Eintrag.

**Die Grenze, ehrlich:** Was ein Werk ausserhalb von Obtanet verkauft,
sieht niemand. Wer 1'500 erklärt und 1'300 am Telefon verkauft, bietet mit
einer Zahl, die nicht stimmt. Dagegen hilft keine Software — dagegen hilft,
dass die Erklärung verbindlich ist und die Termintreue mitläuft.

## 5. Teil-Gebote

Ein Werk darf auf einen **Anteil** bieten, zum verlangten Mindestrabatt.
Das macht ein 2'000-m³-Bündel lieferbar, das kein einzelnes Werk stemmt.

**Aufgeteilt wird nach GANZEN BAUSTELLEN, nicht nach Prozentschnitt durch
jede Lieferung.** Eine Bodenplatte kommt aus einem Werk — zwei Werke auf
derselben Etappe heisst zwei Rezepturen, zwei Farbtöne, Fugenprobleme. Kein
Polier macht das mit. Nebenbei löst die Zuteilung nach Baustellen auch das
Rosinenpicken: der Lieferradius entscheidet ohnehin, was für ein Werk in
Frage kommt.

**Das Gebot trägt deshalb zwei Zahlen: Zielanteil und Puffer.**

> „Rund 33 %, ±5 Punkte, zu 17.4 %, in diesen Regionen."

Ganze Baustellen gehen nie glatt auf — 80/110/145/165 m³ ergeben kein
Drittel. Das System weist ganze Baustellen zu, bis er zwischen 28 % und
38 % liegt. Bekommt er 36 % statt 33 %, gilt derselbe Rabattsatz; er
rechnet pro Kubikmeter, die drei Punkte mehr kosten ihn nichts. Er muss dem
Puffer aber **vorher im Gebot zugestimmt** haben.

**Zugeschlagen wird nur bei 100 % Deckung.** Bleibt eine Baustelle übrig,
scheitert das Bündel und dieser Besteller erfährt warum. Alles andere wäre
ein halbes Versprechen.

**Komplett-Vorsprung: 1 Prozentpunkt** (einstellbar). Ein Gebot über die
volle Menge gewinnt auch dann, wenn die beste Aufteilung bis zu einem Punkt
besser ist — ein Ansprechpartner, eine Rechnung, eine Rezeptur ist etwas
wert. Keine absolute Bevorzugung: Sind drei Werke zusammen drei Punkte
besser, wäre es den Bestellern gegenüber falsch, das Geld liegenzulassen.

**Der Zuschlag ist eine Rechenregel, keine KI-Entscheidung.** Wer verdeckt
bietet und verliert, muss erfahren können warum; „das Modell fand die
andere Kombination besser" besteht vor keinem Werk und vor keinem Gericht.
Gleiche Eingabe, gleiches Ergebnis, und jedem Werk sagbar, welche
Baustellen es warum bekommen hat. Mit ganzen Baustellen, Puffern und Radien
ist das ein kleines Zuteilungsproblem — bei realistischen Grössen (bis ~50
Baustellen, ~10 Werke) exakt und in Millisekunden lösbar.

**Die KI gehört an den ANFANG der Kette** (welche Bedarfe bilden ein
Bündel), nicht an ihr Ende.

## 6. Wer wann gebunden ist

Dieselbe Regel für beide Seiten, in einem Satz erklärbar:

| | Frei bis | Danach |
|---|---|---|
| **Besteller** | Ende der Sammelphase | gebunden (Migration 31) |
| **Lieferant** | Ende der Angebotsfrist | gebunden |

Und die Unterscheidung, ohne die ein Loch entsteht:

- **Rückzug** — freiwillig, nur vor der Frist. Danach nicht mehr, Punkt.
- **Ausfall** — unfreiwillig, kann auch nach dem Zuschlag passieren. Dann
  bleibt das **zweitbeste Gebot als Notausgang** — nicht als Recht des
  Lieferanten, sondern als Rettung für die gebundenen Besteller. Plus
  Eintrag, plus Schadenersatzfrage.

Ohne diese Trennung nennt ein Werk seinen Rückzug „Ausfall" und ist raus.

**Heute bindet den Lieferanten nach dem Zuschlag gar nichts.** In der
Datenbank wird `awarded_supplier_id` gesetzt, und das war's. Liefert er
nicht, passiert nichts, während die Besteller festsitzen.

## 6b. Vier Zeilenregeln waren kaputt — gefunden am 10.09.2026

Beim Durchsehen des Ganzen aufgefallen, und es war ein Fehler in der
laufenden Seite. Vier Regeln aus Migration 01 prüften die eigene Firma über
`SELECT id FROM companies WHERE clerk_user_id = auth.jwt() ->> 'sub'`.
Zeilenregeln laufen mit den Rechten des AUFRUFERS — und `clerk_user_id` ist
seit Migration 19 gesperrt. Die Regeln lieferten deshalb nicht „keine
Zeilen", sondern `permission denied for table companies`:

    bundle_participations · sia_contracts · subscriptions · supplier_bids

**Warum es niemandem auffiel:** Das meiste liest über SECURITY-DEFINER-
Funktionen, die davon nicht betroffen sind. Und wo direkt gelesen wurde,
verschluckte die Anwendung den Fehler — `(data ?? [])` macht aus einer
Absage eine leere Liste. Auf `/pools` blieb „Meine" einfach leer, und
nichts wurde rot.

Migration 41 ersetzt alle vier durch `current_company_id()`. Die
Fehlerverschluckung in `lib/bundles.ts` ist ebenfalls behoben.
`kontrolle.sql` prüft, dass keine Regel auf diesen vier Tabellen wieder
`clerk_user_id` liest.

**Lehre, die über diesen Fall hinausgeht:** Ein `?? []` auf einer
Datenbankantwort ist keine Vorsicht, sondern eine Vertuschung. Wo eine
Absage möglich ist, gehört sie sichtbar gemacht.

## 7. NIEMAND LIEST IN CHATS

**Harte Regel, ohne Ausnahme.** Nachrichteninhalte werden nicht
ausgewertet — nicht für Gebühren, nicht für Statistik, nicht für
„intelligente" Funktionen. Das verstösst gegen die Zweckbindung des DSG und
zerstört das Vertrauen, auf dem eine B2B-Plattform steht.

Stand geprüft am 10.09.2026 — sauber. Jeder Zugriff auf `messages` ist auf
`current_company_id()` eingegrenzt: die Glocke liest die eigenen
ungelesenen, `chat_threads`/`chat_history` die eigenen Gespräche, und
`hat_geschaeft_mit()` liest nur, **ob** zwei Firmen je geschrieben haben —
kein Inhalt.

Was bleibt, ist der Dienstschlüssel: wer ihn hat, kann im SQL-Editor alles
lesen. Das lässt sich nicht wegprogrammieren, irgendjemand muss die
Datenbank betreiben können. Der Schutz ist dort organisatorisch. **Es gibt
keinen Grund, je eine Abfrage auf `messages` zu schreiben.**

Moderation, falls sie je nötig wird, ist **auf Meldung hin** — nie
vorsorglich durchsuchend.

## 8. Lieferant oder Bauunternehmen

**Heute kann sich jeder als Lieferant eintragen.** Die Rolle wird bei der
Anmeldung frei gewählt, die UID nur rechnerisch geprüft (Prüfziffer, nicht
Register, nicht Eigentum), und `verified` setzt niemand.

Immerhin: die Rolle ist nachträglich nicht vom Browser änderbar (`role`,
`verified` stehen bewusst nicht in der Schreibliste des Profils), und ohne
UPDATE-Regel auf `companies` verifiziert sich niemand selbst.

**Was ein falscher Lieferant heute gewinnt:** keine Daten. Die Bündel sind
für jeden lesbar (nachgestellt: sogar für nicht Angemeldete), Teilnahmen
und fremde Gebote bleiben verdeckt. **Er gewinnt das Bieten** — er kann ein
Bündel gewinnen, nicht liefern, und die gebundenen Besteller sitzen fest.

**Drei Fragen, die man nicht vermischen darf:**

| | Frage | Womit |
|---|---|---|
| 1 | Gibt es die Firma? | UID-Register des Bundes — automatisch, gratis |
| 2 | Gehört sie dem, der sie einträgt? | die schwierige. Die UID ist öffentlich |
| 3 | Ist sie wirklich Lieferant? | Branchennummer (NOGA) kommt nah dran |

Ein Personalausweis hilft bei keiner der drei.

**Die Leiter:**

0. **Selbstauskunft** (heute) — reicht zum Umsehen und zum Bestellen.
1. **Registerabgleich**, automatisch: Name passt, Status aktiv,
   Branchennummer gespeichert.
2. **Domain-Nachweis**: Bestätigung an eine Adresse auf der Firmendomain,
   die zum Register-/Websiteeintrag passt. Der billigste echte
   Zugehörigkeitsnachweis. Gegen einen eigenen Mitarbeiter hilft er nicht —
   verkraftbar.
3. **Handelsregisterauszug und Zeichnungsberechtigung** — nur für die
   Lieferantenrolle. Hier wird es ernst: ein Zuschlag ist ein Vertrag.
4. **Ein Mensch gibt frei.** Erst das setzt `verified`.

**Wiederkehrend geprüft sind drei verschiedene Dinge:**

| Was | Wie oft | Wie |
|---|---|---|
| Existiert die Firma noch? | monatlich, automatisch | Register: aktiv, kein Konkurs |
| Stimmt die Kapazität noch? | vierteljährlich + vor grossen Geboten | er bestätigt selbst — der Klick ist datiert |
| Liefert er wirklich? | laufend | Termintreue und Abweichungen aus den Lieferscheinen |

Nur das Dritte ist ein echter Beweis. Die Wahrheit über ein Werk steht auf
seinen Lieferscheinen.

**Bietfähigkeit ist kein Häkchen, sondern eine Rechnung:** freigegeben ∧
Register aktiv ∧ **Lieferantenkonto aktiv** (Abschnitt 1b) ∧ freie
Kapazität im Zeitraum ∧ keine Leistungssperre.
Durchgesetzt in der Datenbank, nicht in der Oberfläche.

**Die Rolle bleibt Selbstauskunft; die Lieferantenfähigkeit wird vergeben.**
Alles, was daran hängt, hängt an der Fähigkeit — nie an der Rolle.

Wird eine Freigabe entzogen, **binden laufende Bündel weiter** — dieselbe
Regel wie beim Kontoschliessen. Man kommt nicht raus, indem man seine
Verifikation verliert.

**Offen:** die genauen NOGA-Nummern und die Schnittstelle des
Bundesregisters sind noch nicht verifiziert. Vor dem Bauen nachschlagen,
nicht aus dem Gedächtnis schreiben.

## 9. Zwei Dashboards

Erkannt an der Rolle: Bauunternehmen → Besteller-Dashboard, Lieferant →
Lieferanten-Dashboard. Mehr Logik braucht es dafür nicht.

**Gleich für beide:** Startseite, Feed, Netzwerk, KBOB, Nachrichten,
Firmenprofil, Karte.

**Nur der Lieferant:**

| Seite | Was drauf steht |
|---|---|
| Ausschreibungen | Bündel, für die er bieten darf — mit Mengenkurve und „Mindestgebot 17.25 % (15 % Besteller + 2.25 % Obtanet)" |
| Meine Gebote | abgegeben, gewonnen, verloren, verfallen — sieht er heute nirgends wieder |
| Zugeschlagen | gewonnene Bündel, Baustellen, Menge, Preis, Abrufplan, Lieferscheine |
| Lieferprofil | Materialien, Kapazität je Monat, Lieferradius, Regionen |
| Abrechnung | offene und bezahlte Vermittlungsgebühren, je Bündel nachgerechnet |
| Direktanfragen | hat er schon |

**Weg bei ihm:** Projekte, Warenkorb, Bündel beitreten, Abo. Statt der
Abo-Seite: „Kein Abo. Du zahlst 2.25 % Vermittlung auf zugeschlagene
Bündel." Sonst sucht er ewig nach dem Haken.

## 10. Reihenfolge

1. ~~Provision und Mindestgebot in der Datenbank~~ — **GEBAUT**,
   Migration 35. Die Sätze stehen in `app_settings`; `mindestgebot()`
   sagt, was verlangt ist und woraus es besteht; `place_bid()` nimmt den
   Preis des WERKS entgegen und weist alles über dem Höchstpreis ab;
   `award_bundle()` friert Menge, Rabatt, Provisionssatz und Betrag ein.
   Nachgerechnet gegen die Beispielzahlen: Besteller 66'800, Werk 65'000,
   Obtanet 1'800.
2. ~~Lieferzeitraum und Pflicht-Baustelle~~ — **GEBAUT**, Migration 36.
   Zeitraum an der Teilnahme (Monatsebene), `mengenkurve()` als Verlauf
   über die Monate, Spannweite höchstens drei Monate, Baustelle NOT NULL.
   **Eine Zeile je Baustelle statt je Firma** — sonst hätte eine Firma mit
   zwei Baustellen im selben Bündel eine davon verloren. Die Plan-Grenze
   zählt deshalb jetzt `DISTINCT bundle_id`, sonst hätte diese Migration
   eine Grenze verschärft, die niemand angefasst hat.
3. ~~Kapazität~~ — **GEBAUT**, Migration 38/39. `lieferant_kapazitaet`
   (Menge je Material und Monat), `kapazitaets_bindung` mit dem Lebenslauf
   RESERVIERT → GEBUCHT → ERLEDIGT, `kapazitaet_pruefen()` und das
   Lieferprofil in der Oberfläche.

   **Geprüft wird gegen die BUCHUNGEN, nicht gegen Reservierungen** — an
   beiden Stellen. Zuerst war der Zuschlag streng gebaut (auch gegen
   eigene Reservierungen), und das war falsch: Ein Werk mit 300 m³ bot auf
   zwei Bündel zu je 250; beim Zuschlag des ersten sah die strenge Prüfung
   die Reservierung des zweiten und wies ab — das erste Bündel scheiterte,
   obwohl das Werk es gefahren hätte. Richtig ist die Reihenfolge: Jeder
   Zuschlag verbraucht Kapazität, der nächste sieht sie als belegt und
   geht ans nächstbeste Gebot. Nachgestellt und bestätigt.

   `award_bundle()` vermerkt am übergangenen Gebot, WARUM — sonst wäre der
   Zuschlag für das günstigere Werk unerklärlich.

4. ~~Teil-Gebote und Zuteilung~~ — **GEBAUT**, Migration 42.

   Ein Gebot trägt Zielanteil und Puffer („rund 33 %, ±6 Punkte").
   Zugeteilt werden **ganze Baustellen** — eine Bodenplatte kommt aus
   einem Werk. `zuteilungen` hält fest, wer welche beliefert; der
   UNIQUE-Index auf `participation_id` ist die eigentliche Garantie.

   **Ein Teilgebot ohne Puffer wird abgewiesen.** Ganze Baustellen ergeben
   nie genau einen Prozentwert; ohne Puffer würde das Werk wortlos
   übergangen.

   **Der Zuschlag ist eine Rechenregel**, gierig: günstigste Werke zuerst,
   grösste Baustellen zuerst, danach die Prüfung auf Untergrenze und volle
   Deckung. Gleiche Eingabe, gleiches Ergebnis, jedem Werk erklärbar.

   **Komplett-Vorsprung von einem Prozentpunkt** (einstellbar): Ein Werk,
   das allein alles kann, gewinnt auch dann, wenn die Aufteilung bis zu
   einem Punkt günstiger wäre. Keine absolute Bevorzugung — sind mehrere
   Werke deutlich günstiger, bekommen die Besteller das Geld.

   **Ein Konstruktionsfehler, der beim Testen herauskam:** Gebote, die NUR
   das ganze Bündel nehmen (Untergrenze 100 %), dürfen nicht in der
   gierigen Verteilung mitlaufen. Sie nehmen Baustellen an, erreichen ihre
   Untergrenze nie, fliegen raus — und was sie angenommen hatten, ist dann
   unverteilt. Im Test scheiterte deshalb ein Bündel, das ein einzelnes
   Werk problemlos hätte fahren können. Sie werden jetzt getrennt als
   Alleinanbieter geprüft.

   **Ehrlich zur Grenze:** Die gierige Zuteilung ist nachvollziehbar und
   immer gleich, aber NICHT beweisbar die billigste aller Kombinationen —
   bei ungünstigen Mengenverhältnissen kann eine andere Verteilung ganzer
   Baustellen knapp besser sein. Ein exaktes Verfahren wäre ein
   Rucksackproblem mit Nebenbedingungen. **Das gehört in die
   AGB-Formulierung:** zugeschlagen wird nach einem veröffentlichten
   Verfahren, nicht „zum bestmöglichen Preis".

   Die Lieferantensichten lesen seither aus `zuteilungen` statt aus
   `bundles.awarded_supplier_id` — bei einer Aufteilung ist das Feld leer,
   und dann sähe kein beteiligtes Werk seinen eigenen Zuschlag.
5. ~~Lieferantenprüfung~~ — **TEILWEISE GEBAUT**, Migration 37.
   `lieferantenkonten` mit Antrag, Zulassung und Freifrist;
   `bietfaehig()` als Rechnung statt Häkchen; `place_bid()` prüft sie
   statt der Rolle. **Die Rollenprüfung ist raus** — sie war eine
   Selbstauskunft und hat nichts geschützt. Ein Bauunternehmen mit
   eigenem Betonwerk darf mit Nachweis bieten, ein selbsternanntes Werk
   ohne Nachweis nicht.

   Zugelassen wird über `lieferantenkonto_entscheiden()`, die **keinen
   Grant an authenticated** hat — heute im SQL-Editor:
   ```sql
   SELECT lieferantenkonto_entscheiden('<company-uuid>', 'ZUGELASSEN',
          'D. Richner', 'SN EN 206 geprüft, NOGA 23.63 passt.');
   ```
   Offene Anträge: `SELECT * FROM lieferantenkonten WHERE status='BEANTRAGT';`

   **Noch nicht gebaut:** Registerabgleich, Domain-Nachweis,
   Dokumenten-Upload, die wiederkehrenden Prüfungen, Kapazität und
   Leistungssperre. `bietfaehig()` ist so gebaut, dass sie dazukommen,
   ohne dass ein Aufrufer sich ändert.

6. ~~Lieferanten-Dashboard~~ — **GEBAUT.** Erkannt an der Rolle:
   Beschaffung, Projekte und Bestellungen sind für Werke weg. Sechs
   Seiten:

   | Seite | Was sie kann |
   |---|---|
   | Ausschreibungen | Mindestgebot mit Aufschlüsselung, Mengenkurve über die Monate mit eigener Kapazität, Baustellen als PLZ-Gebiet, Voll- und Teilgebot |
   | Meine Gebote | abgegeben, gewonnen, verloren; Teilgebote mit Anteil und Puffer; **Zurückziehen**, solange die Frist läuft |
   | Zugeschlagen | gewonnene Bündel, eigene Baustellen mit voller Adresse, Menge, Preis |
   | Lieferprofil | Kapazität je Material und Monat |
   | Abrechnung | Vermittlung je Bündel, fällig 30 Tage nach Lieferbeginn |
   | Lieferantenkonto | Antrag, Stand, Begründung |

   `gebot_zurueckziehen()` stand seit Migration 38 in der Datenbank und
   war **nirgends verdrahtet** — beim Durchsehen aufgefallen. Ein Werk
   konnte ein Gebot abgeben und nicht mehr zurücknehmen, obwohl die Regel
   es erlaubt. Jetzt in „Meine Gebote", mit Freigabe der reservierten
   Kapazität.

   **Noch offen am Dashboard:** Lieferradius und Regionen im Lieferprofil
   (heute im Firmenprofil vergraben), und ein Abrufplan je Baustelle statt
   der Gleichverteilung über die Monate.

   **Bekannte Grenze:** Ein Werk, das selbst einkauft, kommt im Dashboard
   nicht an die Beschaffung. Laut Modell liegen die Fähigkeiten
   nebeneinander, das Dashboard schaltet aber hart nach Rolle. Wenn das
   erste Werk danach fragt, braucht es einen Umschalter.

   **Bekannte Grenze:** Ein Werk, das selbst einkauft, kommt im Dashboard
   nicht an die Beschaffung. Die Fähigkeiten liegen laut Modell
   nebeneinander, das Dashboard schaltet aber hart nach Rolle. Wenn das
   erste Werk danach fragt, braucht es einen Umschalter statt einer
   Rollenweiche.
7. Abrechnung und Lieferschein-Abgleich

Die Oberfläche zu bauen, bevor die Regel steht, heisst sie zweimal zu
bauen.

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
