# Auftrag: Erklärvideo „Smart Pools" für Obtanet

Du bist Motion-Designer. Baue ein **35–45 Sekunden langes Erklärvideo**, das
zeigt, wie Mengenbündelung im Baustoffeinkauf funktioniert — von mehreren
einzelnen Bedarfen über die Verhandlung mit dem Werk bis zur Verteilung des
Rabatts an die beteiligten Firmen.

**Lies zuerst den ganzen Auftrag, bevor du anfängst.** Die Zahlen in
Abschnitt 3 sind exakt und müssen im Video exakt so erscheinen — sie gehen
auf und lassen sich nachrechnen. Ein Video mit falschen Zahlen ist
unbrauchbar, egal wie schön es aussieht.

---

## 0. Wenn du wählen kannst, wie du es baust

Dieses Video lebt von **lesbarer Schrift und exakten Zahlen**. Generative
Video-Modelle (Sora, Veo, Runway, Kling) können das nicht zuverlässig — sie
erzeugen verwaschene Pseudo-Buchstaben und erfundene Ziffern. Baue es
deshalb als **Motion Design**:

- After Effects, Rive, Lottie, Blender (Grease Pencil / geometrische Formen)
- oder als Code-Animation (HTML/CSS/SVG, GSAP, Framer Motion, Remotion,
  Manim) und dann als Video ausgespielt.

Nur wenn dein Werkzeug ausschliesslich generative Videoclips erzeugen kann,
folge **Abschnitt 9** — dort steht die Fassung ohne Schrift, die
nachträglich beschriftet wird.

---

## 1. Wo es läuft und wie es abgegeben wird

Das Video steht **allein und gross** auf der Startseite eines Schweizer
B2B-Portals für Baustoffbeschaffung, im Abschnitt „Smart Pools". Es läuft
**stumm und automatisch**, oft in einer Schleife.

**Daraus folgt, ohne Ausnahme:**

- Es muss **ohne Ton verständlich** sein. Ton ist Beiwerk, nie Träger.
- **Erster und letzter Frame müssen zusammenpassen** (gleicher Hintergrund,
  gleiche Ruhe), damit die Schleife nicht springt.
- **Kein Vorspann, kein Logo am Anfang.** Die erste Sekunde muss schon
  etwas zeigen. Wer drei Sekunden auf ein Logo wartet, scrollt weiter.

**Technische Abgabe:**

| | |
|---|---|
| Format | 16:9, **1920 × 1080** (bitte zusätzlich 1:1 1080 × 1080 für Mobil, gleicher Inhalt, enger gerahmt) |
| Bildrate | 30 fps, konstant |
| Länge | 35–45 s |
| Dateien | **MP4 (H.264, yuv420p)** als Hauptdatei + **WebM (VP9)** + **Standbild des ersten Frames als JPG** (Poster) |
| Grösse | MP4 möglichst **unter 10 MB** (es lädt auf einer Startseite mit) |
| Ton | eine Fassung mit, eine ohne Tonspur |

---

## 2. Marke — daran gibt es nichts zu deuten

**Farben, ausschliesslich diese:**

| Rolle | Wert |
|---|---|
| Grund (Hintergrund) | Tiefschwarz `#060B12`, alternativ `#0B1522` |
| Flächen, Volumen, Ruhe | Navy `#1B3A5C`, hellere Stufe `#254D7A` |
| Akzent, Vorteil, alles Wichtige | Gold `#D99000` |
| Schrift hell | Weiss `#FFFFFF`, Nebentext Weiss mit 72 % Deckung |
| Schrift auf Gold | Navy `#08111E` — **nie Weiss auf Gold**, das liest sich nicht |

**Verboten:** Grün in jeder Form. Neon. Regenbogenverläufe. Blau, das nicht
das Navy oben ist. Rot nur als winziges Warnsignal, wenn überhaupt.

**Typografie:** eine geometrische Grotesk — Archivo, Inter, Suisse Int'l,
Söhne oder Helvetica Now. Zahlen **immer mit gleicher Ziffernbreite**
(tabular figures), damit zählende Ziffern nicht zappeln.

**Schweizer Schreibweise, streng:**
- Zahlen mit Hochkomma als Tausendertrenner: `13'376`, **nicht** `13,376`
- Preise: `CHF 160.00` — Punkt als Dezimaltrenner
- Volumen: `500 m³` (mit hochgestellter 3)
- **Kein ß.** Es heisst „grösser", „Grösse", „muss".

**Bildsprache:** abstrakt-geometrisch, technisch, ruhig. Denke an ein
Fliessschema oder eine gute Infografik — nicht an Werbung.

---

## 3. Die Rechnung — exakt so, nachrechenbar

Vier Baufirmen brauchen dasselbe Material (Beton C25/30) in derselben
Region und im selben Zeitfenster.

**Referenzpreis (Beispielwert, so beschriften): `CHF 160.00 / m³`**

| Firma | Menge | Bestellwert | Rabatt **allein** | Rabatt **im Bündel** | Vorteil im Bündel |
|---|---:|---:|---:|---:|---:|
| Firma A | 40 m³ | CHF 6'400 | 0 % | **9 %** | CHF 576 |
| Firma B | 90 m³ | CHF 14'400 | 0 % | **12 %** | CHF 1'728 |
| Firma C | 120 m³ | CHF 19'200 | 5 % | **16 %** | CHF 3'072 |
| Firma D | 250 m³ | CHF 40'000 | 12 % | **20 %** | CHF 8'000 |
| **Bündel** | **500 m³** | **CHF 80'000** | | | **CHF 13'376** |

**Kontrollrechnung, die aufgehen muss:**
- 40 + 90 + 120 + 250 = **500 m³**
- 500 × 160.00 = **CHF 80'000**
- 576 + 1'728 + 3'072 + 8'000 = **CHF 13'376**
- Allein zusammen wären es nur CHF 5'760 → das Bündel bringt **mehr als das
  Doppelte**

**Der Kern des Modells — das ist die Aussage des ganzen Videos:**

> Der Prozentsatz richtet sich nach der Menge, die eine Firma **selbst**
> ins Bündel einbringt. Wer mehr einbringt, steht auf einer höheren Stufe.
> Aber **alle** stehen höher, als sie allein je stünden — die kleine Firma
> springt von 0 % auf 9 %, die grosse von 12 % auf 20 %.

Es ist also **kein** gleicher Rabatt für alle. Genau dieser Unterschied
muss man im Bild sehen: vier verschiedene Prozentsätze, vier verschieden
dicke Rückflüsse.

**Die Rabattstufen (Leiter), die eingeblendet wird:**
`5 % · 9 % · 12 % · 16 % · 20 %` — **20 % ist das Maximum. Nirgends im
Video darf eine höhere Zahl stehen.**

**Firmennamen:** ausschliesslich „Firma A", „Firma B", „Firma C",
„Firma D". **Erfinde keine Firmennamen und verwende keine echten** — weder
Baufirmen noch Werke noch Marken. Keine fremden Logos.

---

## 4. Der Ablauf, Szene für Szene

### Szene 1 — Allein (0:00 – 0:04)

Schwarzer Grund. Vier kleine Quader in Navy, weit voneinander entfernt, an
den vier Ecken eines gedachten Rechtecks. Jeder trägt klein und in Weiss
seinen Namen und seine Menge: `Firma A · 40 m³` usw. Neben jedem steht
gedämpft und grau der Rabatt, den er allein bekäme: `0 %`, `0 %`, `5 %`,
`12 %`.

Alles steht still. Die Quader sind **unterschiedlich gross, im Verhältnis
zur Menge** (Firma D ist gut sechsmal so gross wie Firma A) — dieses
Grössenverhältnis muss über das ganze Video stimmen.

Untertitel unten links, klein, weiss:
> **Allein bestellt jeder zum Listenpreis.**

### Szene 2 — Der Bedarf (0:04 – 0:09)

Die vier Quader „füllen" sich von unten mit Navy, während ihre Mengenzahlen
von 0 hochzählen: 40 / 90 / 120 / 250 m³. Alle vier zählen **gleichzeitig**
und kommen **gleichzeitig** an — nicht nacheinander.

Eine feine goldene Linie zieht sich zwischen ihnen auf: sie brauchen
dasselbe. Untertitel:
> **Gleiches Material. Gleiche Region. Gleiches Zeitfenster.**

### Szene 3 — Das Bündel (0:09 – 0:16) · **Schlüsselmoment**

Die vier Quader gleiten aufeinander zu und **setzen sich zu einem einzigen
grossen Quader zusammen** — wie vier Blöcke, die ineinander rasten. Ein
harter, präziser Zusammenschluss, kein Verschmelzen, kein Morphing.

**Wichtig:** Im grossen Quader bleiben die vier Anteile als **Segmente
sichtbar** (unterschiedlich grosse Abschnitte in leicht verschiedenen
Navy-Tönen, jeder mit einem dünnen goldenen Trennstrich). Man muss bis zum
Schluss erkennen können, wessen Anteil welcher ist. Das ist die
Voraussetzung dafür, dass Szene 6 verstanden wird.

Über dem Quader zählt eine grosse Zahl zusammen:
`40 + 90 + 120 + 250` → **`500 m³`**, dann darunter **`CHF 80'000`**.

Untertitel:
> **Aus vier Bestellungen wird ein Volumen.**

### Szene 4 — Zum Werk (0:16 – 0:23)

Der grosse Quader wandert nach rechts zu einer **abstrakten Werk-Silhouette**
(Silo, Mischturm, Förderband — geometrisch, in Navy-Kontur auf Schwarz, kein
Foto, keine Menschen).

Von rechts kommen **drei verschlossene Umschläge/Karten** herein — die
verdeckten Angebote (Sealed Bid). Sie legen sich nebeneinander,
**geschlossen**. Kurze Spannung, ein Takt Stille.

Quer durchs Bild liegt eine dünne weisse Linie, beschriftet:
`KBOB-Referenzpreis · CHF 160.00 / m³`

Untertitel:
> **Die Werke bieten verdeckt. Gemessen am Referenzpreis.**

### Szene 5 — Der Zuschlag (0:23 – 0:29) · **Schlüsselmoment**

Die drei Umschläge klappen **gleichzeitig** auf. Drei Preise erscheinen,
alle unterhalb der Referenzlinie, verschieden weit:
`CHF 148.50` · `CHF 141.20` · `CHF 152.00`

Der günstigste (`CHF 141.20`) **rastet ein**: goldener Rahmen, die beiden
anderen verblassen auf 25 % Deckung. Ein kurzer, harter Akzent — ein
Stempel, ein Einrasten, kein Glitzern.

Darüber erscheint in Gold, gross:
> **ZUSCHLAG**

Die weisse Referenzlinie und der Zuschlagspreis stehen kurz zusammen im
Bild, der Abstand dazwischen wird golden ausgefüllt — **das ist der
Vorteil**, sichtbar als Fläche.

### Szene 6 — Die Verteilung (0:29 – 0:40) · **die eigentliche Aussage**

Der grosse Quader wandert zurück in die Bildmitte und **zerfällt wieder in
seine vier Segmente**, die zu ihren Firmen zurückgleiten.

Aus dem goldenen Vorteilsfeld fliessen **vier goldene Ströme** zurück —
**deutlich unterschiedlich dick**, im Verhältnis 576 : 1'728 : 3'072 : 8'000
(also etwa 1 : 3 : 5.3 : 13.9). Der Strom zu Firma D ist der mit Abstand
mächtigste, der zu Firma A ein dünner Faden. **Dieser Unterschied ist der
wichtigste visuelle Moment des ganzen Videos** — er muss sofort ins Auge
springen.

Bei jeder Firma erscheinen nacheinander (A, B, C, D, je 0.4 s versetzt):

```
Firma A    40 m³     0 % → 9 %      CHF   576
Firma B    90 m³     0 % → 12 %     CHF 1'728
Firma C   120 m³     5 % → 16 %     CHF 3'072
Firma D   250 m³    12 % → 20 %     CHF 8'000
```

Der alte Prozentsatz steht grau und durchgestrichen, der neue in Gold. Der
Pfeil dazwischen ist schlicht.

Rechts blendet sich die **Stufenleiter** ein — fünf Sprossen, von unten
nach oben: `5 % · 9 % · 12 % · 16 % · 20 %`. Auf jeder Sprosse leuchtet
kurz die Firma auf, die dort steht: A auf 9, B auf 12, C auf 16, D auf 20.
So versteht man in zwei Sekunden, warum die Zahlen verschieden sind.

Untertitel, das Wichtigste des Videos:
> **Deine Stufe hängt an deiner Menge. Dass es die Stufe überhaupt gibt,
> hängt am Bündel.**

### Szene 7 — Summe und Abbinder (0:40 – 0:44)

Alle Elemente ziehen sich zusammen. In der Mitte steht schlicht:

> **500 m³ · CHF 13'376 Vorteil**
> *Allein wären es CHF 5'760 gewesen.*

Dann Schnitt auf schwarzen Grund mit einer Zeile in Weiss:

> **Gemeinsam einkaufen, direkt verhandeln.**

Kein Logo nötig (das steht auf der Seite daneben). Der letzte Frame ist
ruhiges Schwarz — passend zum ersten, damit die Schleife nicht springt.

---

## 5. Bewegung — wie es sich anfühlen muss

- **Ruhig, präzise, technisch.** Kein Hüpfen, kein Überschwingen, kein
  Cartoon. Die Bewegung eines guten Messgeräts, nicht die einer Werbung.
- Beschleunigung: `cubic-bezier(0.16, 1, 0.3, 1)` („expo out") — schnell
  los, weich ankommen. Dauer je Bewegung 500–800 ms.
- **Harte Schnitte** zwischen den Szenen, keine Überblendungen. Einzige
  Ausnahme: der Schnitt vor Szene 7 darf weich sein.
- Die Kamera steht. Wenn überhaupt Kamerabewegung, dann ein sehr langsames
  Heranfahren (max. 5 % über die ganze Szene).
- Zählende Zahlen zählen **echt** hoch (0 → 500), nicht in Sprüngen, und
  brauchen dafür mindestens 800 ms.
- Schrift erscheint durch **Aufblenden und 8 px Aufwärtsbewegung**, nie
  durch Zoom, Dreh oder Buchstaben-Gewusel.
- Mindestens **ein Takt Stille** vor dem Zuschlag (Szene 5). Spannung
  entsteht durch Pause, nicht durch Tempo.

---

## 6. Ton (optional, das Video muss ohne funktionieren)

- Tiefer, ruhiger Puls im Hintergrund, kein Beat, keine Melodie.
- Beim Zusammenrasten des Bündels: ein tiefes, kurzes „Klack".
- Beim Zuschlag: ein einzelner, trockener Akzent — wie ein Stempel.
- Beim Rückfluss: ein leises, ansteigendes Rauschen, das mit den Zahlen
  endet.
- **Keine Musik mit Gesang, kein Sprecher, keine Firmenjingles.**

---

## 7. Was nicht vorkommen darf

- **Keine Menschen.** Keine Gesichter, keine Hände, keine Bauarbeiter, keine
  Bauhelme, keine Handschläge.
- **Keine Fotos.** Kein Stockmaterial, keine echten Baustellen, keine
  Drohnenaufnahmen.
- **Keine echten Firmen, Marken oder Logos.** Auch keine erfundenen, die
  echt klingen.
- **Keine Zahl über 20 %.**
- **Kein Grün**, kein Neon, keine Regenbogenverläufe.
- **Keine Schrift ausser der hier vorgegebenen.** Kein „Lorem ipsum", keine
  Platzhalterzeichen, keine erfundenen Beschriftungen.
- Keine Münzen, keine Geldscheine, keine Sparschweine, keine Pfeile mit
  Dollarzeichen, keine hüpfenden Kaufwagen.
- Keine amerikanischen Zahlformate (`13,376` ist falsch — `13'376` ist
  richtig).
- Kein Deutsch mit ß.

---

## 8. Prüfliste vor der Abgabe

Gehe das Video Bild für Bild durch und prüfe:

1. Steht in **jeder** eingeblendeten Zahl genau der Wert aus Abschnitt 3?
2. Ergeben 40 + 90 + 120 + 250 im Bild sichtbar 500?
3. Ergeben 576 + 1'728 + 3'072 + 8'000 im Bild sichtbar 13'376?
4. Sind die vier Rückflüsse **deutlich** verschieden dick — sieht man ohne
   zu lesen, dass D am meisten bekommt?
5. Steht nirgends ein Prozentsatz über 20?
6. Sind alle Tausendertrenner Hochkommas?
7. Kommt kein ß, kein Grün, kein Mensch vor?
8. Ist der letzte Frame dem ersten ähnlich genug für eine Schleife?
9. Ist jede Schrift auch auf einem Handy (Videobreite 640 px) noch lesbar?
   Faustregel: die kleinste Schrift ist mindestens **2.5 % der Bildhöhe**,
   die Zahlen mindestens **4 %**.
10. Versteht jemand, der den Ton aus hat und den Text daneben nicht liest,
    in 40 Sekunden, wie das Modell funktioniert? Wenn nein: nachbessern,
    bevor du abgibst.

---

## 9. Nur falls dein Werkzeug ausschliesslich generative Videoclips erzeugt

Dann erzeuge **keine Schrift und keine Zahlen** — die werden nachträglich im
Schnitt gesetzt. Liefere stattdessen **sieben getrennte Clips** von je 4–7
Sekunden, alle im selben Look:

> Abstrakte, geometrische 3D-Animation auf tiefschwarzem Grund. Präzise
> Quader aus mattem, dunkelblauem Material (Navy), Kanten mit dünnen
> goldenen Lichtlinien. Technisch, kühl, ruhig. Studiolicht von oben,
> weiche Schatten, keine Spiegelungen. Statische Kamera, leichter
> Weitwinkel. Kein Text, keine Menschen, keine Logos. Filmisch, hohe
> Detailtiefe, 4K.

1. Vier verschieden grosse Quader liegen weit auseinander, still.
2. Die Quader füllen sich langsam von unten mit leuchtendem Material.
3. Die vier Quader gleiten zusammen und rasten zu einem grossen Block
   zusammen; die Trennlinien zwischen den Anteilen bleiben golden sichtbar.
4. Der grosse Block gleitet auf eine abstrakte Silo- und Förderband-Silhouette
   zu; drei geschlossene Karten schweben heran.
5. Die drei Karten klappen auf; eine wird von einem goldenen Rahmen
   umschlossen, die anderen verblassen.
6. Aus einer goldenen Fläche fliessen vier verschieden dicke goldene Ströme
   zurück zu den vier Quadern — einer sehr dünn, einer sehr mächtig.
7. Alles zieht sich in die Mitte zusammen und verlöscht zu ruhigem Schwarz.

Die Beschriftung aus Abschnitt 4 wird danach im Schnittprogramm gesetzt —
in der Schrift und den Farben aus Abschnitt 2.
