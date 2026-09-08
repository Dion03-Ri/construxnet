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
- **Kästchen-Abbau:** Startseite, Feed, Netzwerk, Smart Pools und
  Referenzpreise sind auf Haarlinien statt Rahmen umgestellt. Noch offen:
  `/beschaffung`, `/messages`, `/termine`, `/profile/edit`, `/map`,
  `/company/[id]`, `/network/entdecken`, `/notifications`. Wer eine davon
  anfasst, zieht sie gleich mit nach.
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
- Migrationen `08`–`20` sind eingespielt; `21_realtime_chat.sql` ist neu.

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
5. **Ratenbegrenzung über einen gemeinsamen Speicher** statt im
   Arbeitsspeicher (Upstash, Vercel KV oder Supabase-Tabelle).
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

**Überschriften.** Die Hero-Zeile hiess einmal „Vernetzen. Bündeln.
Sparen." — drei abstrakte Verben, jedes auf einer Zeile, das letzte in
Gold. Das ist das meistkopierte Überschriftenmuster überhaupt. Eine
Überschrift sagt einen Satz, der etwas behauptet, und die Farbe steckt
in der Zeile darüber und im Knopf darunter, nicht im letzten Wort.

**Schriftgrössen-Hierarchie der Startseite:** `D_LG` nur für die
Hero-Zeile, `D_MD` für alle Abschnittsüberschriften. Zwei Stufen, mehr
nicht — wenn drei Überschriften gleich gross sind, gibt es keine
Rangfolge mehr.

## Was ich davon nicht ohne Zuruf anfasse
- Die CI-Farben. Sie stehen als „STRIKT" in dieser Datei.
- Die Formensprache (weiche Ecken).
- Alles mit Geld: Preise, Gebühren, Escrow.
Diese drei brauchen eine ausdrückliche Ansage, sonst bleibt es beim
heutigen Stand.

---

# OFFENE AUFTRÄGE DES NUTZERS (Stand: siehe letzten Commit)

Vom Nutzer ausdrücklich auf die Todo-Liste gegeben. Nichts davon ist
gebaut. Reihenfolge ist keine Rangfolge — sie ist die, in der er sie
genannt hat.

## 1. Abos aktivieren, damit man sie lösen kann
Der Preisabschnitt auf `/` ist heute reine Darstellung: die Knöpfe
zeigen auf `/sign-up`, es gibt kein Abo-Objekt, keinen Zustand
„gebucht", keine Rechnung.

Was dazugehört: Stufen im Schema (Firma → Abo, Gültigkeit,
Zahlungsstatus), das Freischalten von Funktionen je Stufe (heute ist
alles für alle offen), ein Wechsel- und Kündigungsweg, und die
Rechnungsstellung.

**Hängt an Punkt 0 der Launch-Liste** — die Zahlen 0 / 79 / 189 sind
Platzhalter. Ein Abo zu bauen, das man buchen kann, bevor der Preis
steht, heisst den Preis stillschweigend zu bestätigen. Erst der Preis,
dann die Mechanik.

## 2. Zahlungsmethoden und Zahlungssysteme einbauen
Bisher ist gar keine Zahlung angebunden. Aus dem Master-Briefing:
Stripe Connect mit Treuhandkonto. Zwei getrennte Dinge, die nicht
verwechselt werden dürfen:
- **Abo-Zahlung** (Punkt 1) — einfach, monatlich, an Obtanet.
- **Vermittlungsgebühr / Escrow auf abgeschlossene Bündel** — fremde
  Gelder halten ist in der Schweiz aufsichtsrechtlich reguliert. Das
  ist vor dem Bau juristisch zu klären, nicht danach.

## 3. E-Mails kommen noch von „construxnet"
Im Verzeichnis liegt kein Mailversand — die Mails (Anmeldung,
Bestätigung, Passwort) verschickt **Clerk**. Zu ändern also nicht im
Code, sondern im Clerk-Dashboard: Anwendungsname, Absenderadresse und
-name, die E-Mail-Vorlagen und die Anmeldeseiten-Beschriftung. Wenn
eine eigene Absenderdomain gewünscht ist, braucht es dort zusätzlich
die DNS-Einträge. Ebenfalls prüfen: Projektname in Supabase und in
Vercel, die tauchen in Systemmails auf.

## 4. Das KI-Oval um Aktivitäts- und Statuszeichen
Gemeint ist `badge()` in `lib/ui.ts`: `rounded-full` + Rand + gefüllte
Fläche — ein Oval um zwei Wörter. Noch an 12 Stellen in fünf Dateien:
`app/company/[id]/page.tsx`, `components/termine/TermineList.tsx`,
`components/procurement/BeschaffungFlow.tsx`,
`components/dashboard/DashboardShell.tsx`,
`components/pools/SavedPools.tsx`.

Im Feed und in der Bündelliste ist es bereits ersetzt: der Status steht
dort als Wort in Grossbuchstaben in der Kennzeile, ohne Fläche und ohne
Rand. Dasselbe Muster auf die fünf Dateien anwenden und `badge()`
danach entfernen.

## 5. Farben: mehr Weiss und Schwarz, dazu Gold und Navy
**Angefangen — die Nachrichtenseite ist der erste Versuch.**

Der Nutzer will „eine perfekte Kombi", keine der beiden reinen
Lesarten. Ausgangspunkt war seine Beobachtung: „die Nachrichten-Seite
ist besser, wenn der Hintergrund weiss ist." Daraus die Regel, die in
`lib/ui.ts` unter REGISTER B steht:

> Wo gelesen und geschrieben wird, ist Papier.
> Wo Zahlen und Markt stehen, ist es dunkel.

Was daraus folgt, sobald der Nutzer die Nachrichtenseite abgenommen hat:
- **Papier (`SHEET`):** Nachrichten (gebaut), Beschaffung, Profil
  bearbeiten, Termine, Firmenprofil, Rechtsseiten.
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

## 6. „Profil bearbeiten" — typische KI-Kästchen
`/profile/edit`. Steht ohnehin auf der Liste der Seiten, auf denen der
Kästchen-Abbau noch aussteht.

## 7. Logo ersetzen
Der Nutzer hat selbst eines entworfen. Kommt später von ihm — bis dahin
bleibt das jetzige (Bauhelm-Symbol in Gold, `components/AppShell.tsx`
und Fussbereich). Beim Austausch mitziehen: Favicon, das „O" im
Beispiel-Zuschlag (`components/home/OfferSheet.tsx`) und alle Stellen
mit dem Wortbild „Obta**net**".

## 8. Grafik bei Smart Pools ändern
Der Abschnitt „Mengenrabatte, die alleine niemand bekommt" auf `/`
zeigt rechts `components/home/OfferSheet.tsx` — den Zuschlag als
weisses Blatt. Was stattdessen dort stehen soll, ist noch offen.
**Keine selbst erzeugte Grafik.** Kommt ein Bild, dann Stockfoto, und
das ist vorher zu sagen.

## Was schon vorher offen war (nicht vergessen)
Steht ausführlich weiter oben in dieser Datei:
- **Preismodell bestätigen** (Launch-Liste Punkt 0) — blockiert Punkt 1.
- **Rabattstufen festlegen** und **KBOB-Referenz aus belegbarer Quelle**
  — ohne beides darf keine Garantie raus.
- `data/legal.ts`: alle `[[…]]` füllen, anwaltliche Durchsicht.
- Vorstart-Sperre entfernen, Web-Push, Ratenbegrenzung über einen
  gemeinsamen Speicher, Lieferschein-Abgleich.
- KI-Materialabgleich Stufe 3 — wartet auf `ANTHROPIC_API_KEY`.
- Kästchen-Abbau auf `/beschaffung`, `/messages`, `/termine`,
  `/profile/edit`, `/map`, `/company/[id]`, `/network/entdecken`,
  `/notifications`.
- Aus dem Master-Briefing: KYB-Prüfung (UID/DUNS), Geofencing,
  dynamischer Kontextwechsel (Währung/Einheit/Normwerk) — letzterer
  gehört technisch früh, sonst wird er später zum Umbau von allem.
