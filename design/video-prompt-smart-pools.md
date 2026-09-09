# Auftrag: Werbefilm „Smart Pools" für Obtanet

Baue ein **35–45 Sekunden langes Erklärvideo** für die Startseite von
Obtanet, einer Schweizer Beschaffungsplattform für Baustoffe. Es zeigt,
wie mehrere Baufirmen ihren Materialbedarf bündeln, wie Werke auf das
gemeinsame Volumen bieten, und wie der Vorteil danach verteilt wird —
**je nach eingebrachter Menge unterschiedlich.**

**Lies den ganzen Auftrag, bevor du anfängst.** Er ist absichtlich lang.
Die Zahlen in Abschnitt 4 sind durchgerechnet und müssen exakt so
erscheinen. Die Verbote in Abschnitt 9 sind keine Geschmacksfragen.

---

## 0. Womit du es baust

Der Film lebt von **lesbarer Schrift und exakten Zahlen**. Rein
generative Video-Modelle (Sora, Veo, Runway, Kling) können das nicht —
sie erzeugen verwaschene Pseudo-Buchstaben und erfundene Ziffern. Baue
ihn deshalb als **Motion Design**:

- After Effects, Rive, Lottie, Cavalry, Blender
- oder als Code-Animation (HTML/SVG/CSS, GSAP, Remotion, Three.js) und
  danach als Video ausgespielt.

Wenn du ausschliesslich generative Clips erzeugen kannst: **Abschnitt 11**.

---

## 1. Wo der Film läuft — und was daraus folgt

Er steht **allein und gross** in einem Abschnitt der Startseite, rechts
neben einer Überschrift. Er läuft **automatisch, stumm, in Schleife**,
dargestellt etwa **740 Pixel breit** auf einem gewöhnlichen Bildschirm.

Daraus folgt hart:

- **Alles muss bei 740 px Darstellungsbreite lesbar sein.** Das ist der
  wichtigste technische Satz im ganzen Auftrag. Rechne so: Schrift, die
  im 1920er Bild kleiner als **34 px** ist, wird auf der Seite kleiner
  als 13 px und ist damit unlesbar. **Nichts unter 34 px.** Zahlen, auf
  die es ankommt, mindestens 60 px.
- **Ohne Ton verständlich.** Ton ist Beiwerk.
- **Nichts berührt die Bildkante.** Halte ringsum **130 px Rand** frei.
  Der Film sitzt in einer Spalte; was am Rand klebt, sieht aus wie
  abgeschnitten.
- **Erster und letzter Frame passen zusammen** (beide ruhiges Schwarz),
  damit die Schleife nicht springt.
- **Kein Vorspann, kein Logo am Anfang.** Die erste Sekunde zeigt schon
  Inhalt.

**Abgabe:**

| | |
|---|---|
| Format | 16:9, **1920 × 1080** |
| Zusätzlich | **1080 × 1350 (4:5) für Mobil** — gleicher Ablauf, enger gesetzt, Schrift entsprechend grösser |
| Bildrate | 30 fps konstant |
| Länge | 35–45 s |
| Dateien | **MP4 (H.264, yuv420p)** + **WebM (VP9)** + **Standbild eines guten Frames als JPG** |
| Grösse | MP4 möglichst unter 10 MB |
| Ton | eine Fassung mit, eine ohne |

---

## 2. Die Marke

**Farben — ausschliesslich diese:**

| Rolle | Wert |
|---|---|
| Grund | Tiefschwarz `#060B12` |
| Flächen, Volumen, Ruhe | Navy `#1B3A5C`, hellere Stufen `#22456B` `#2A5480` `#33608F` |
| Akzent: Vorteil, Zuschlag, alles Wichtige | Gold `#D99000` |
| Schrift hell | Weiss `#FFFFFF`, Nebentext Weiss 74 % |
| Schrift auf Gold | Navy `#08111E` — **nie Weiss auf Gold** |

**Verboten:** Grün in jeder Form. Neon. Regenbogenverläufe. Hellblau,
Türkis, Violett. Rot nur als winziges Warnsignal, wenn überhaupt.

**Typografie:** geometrische Grotesk — **Archivo** (bevorzugt), sonst
Inter, Suisse Int'l, Söhne, Helvetica Now. Zahlen immer mit gleicher
Ziffernbreite (tabular figures), sonst zappeln zählende Ziffern.

**Schweizer Schreibweise, streng:**
- Tausendertrenner ist das Hochkomma: `13'376` — **nicht** `13,376`
- Preise mit Punkt: `CHF 160.00`
- Volumen: `500 m³`
- **Kein ß.** Es heisst „grösser", „Grösse", „muss".

**Haltung:** technisch, ruhig, präzise. Ein gutes Messgerät, keine
Werbung. Kein Glitzern, kein Lens Flare, kein Partikelstaub.

---

## 3. Wie die vier Firmen dargestellt werden — der wichtigste Abschnitt

Das ist die Stelle, an der frühere Versuche gescheitert sind: Die Firmen
waren **Tabellenzeilen** — vier Namen untereinander, vier Zahlen daneben.
Das erklärt nichts und interessiert niemanden. Eine Firma, die Beton
bestellt, ist **eine Baustelle mit einem Bedarf**, und genau so muss man
sie sehen.

### 3.1 Jede Firma bekommt drei Merkmale

**a) Eine Baustelle als Strichzeichnung.** Dünne Linien in Weiss (1.5–2 px
bei 1920), technische Zeichnung, keine Füllung, keine Perspektive —
Aufriss von der Seite. Die **Grösse der Zeichnung entspricht der
Bestellmenge**, über den ganzen Film hinweg konsistent:

- **Firma A · 40 m³** — ein kleiner Rohbau, zwei Geschosse, schmal
- **Firma B · 90 m³** — ein Rohbau mit vier Geschossen
- **Firma C · 120 m³** — ein breiterer Rohbau, fünf Geschosse
- **Firma D · 250 m³** — ein grosser Wohnblock mit Kran daneben, gut
  sechsmal die Fläche von Firma A

Keine Menschen, keine Bauhelme, keine Verkehrszeichen, keine Wolken. Nur
Baukörper: Geschossdecken, Stützen, Gerüstlinien, bei D ein Kran.

**b) Ein Namensschild.** Klein, in Versalien, Weiss 74 %, unter der
Zeichnung:
`FIRMA A · ZÜRICH` / `FIRMA B · WINTERTHUR` / `FIRMA C · BADEN` /
`FIRMA D · WETZIKON`

Die Namen sind Platzhalter und bleiben Platzhalter. **Erfinde keine
Firmennamen, die echt klingen, und verwende keine echten.** Keine
fremden Logos.

**c) Ihre Menge als Fahrmischer.** Ein Fahrmischer fasst rund 10 m³ —
daraus wird die zählbare Einheit des ganzen Films:

- Firma A: **4 Fahrmischer**
- Firma B: **9**
- Firma C: **12**
- Firma D: **25**
- zusammen: **50**

Ein Fahrmischer ist eine **stark vereinfachte Silhouette in Navy**:
Fahrerhaus, schräge Trommel, drei Räder als Kreise. Etwa 90 × 44 px im
1920er Bild. Alle Mischer sind identisch — **sie sind eine Masseinheit,
kein Fuhrpark.** Sie stehen in einer Reihe vor ihrer Baustelle.

### 3.2 Die vier Zustände, in denen man eine Firma sieht

Dieselbe Firma erscheint im Film in vier Zuständen. Sie müssen sich klar
unterscheiden, damit man die Entwicklung sieht:

1. **Allein** — Baustelle weiss, Mischer in dunklem Navy `#1B3A5C`,
   daneben der Rabatt, den sie allein bekäme, in Grau. Die vier
   Baustellen stehen **weit auseinander**, jede für sich.
2. **Im Bündel** — die Mischer aller vier fahren zusammen und stehen als
   **eine Kolonne** von 50 Stück. Jede Firma behält ihre Navy-Stufe
   (`#1B3A5C` / `#22456B` / `#2A5480` / `#33608F`), zwischen den Gruppen
   steht eine **feine goldene Trennlinie**. Man muss bis zuletzt sehen
   können, wessen Anteil welcher ist.
3. **Beim Zuschlag** — die Kolonne steht still, das Werk ist bestimmt.
4. **Nach der Verteilung** — die Mischer fahren zurück zu ihren
   Baustellen, und **jede Baustelle bekommt ihren eigenen Preis und
   ihren eigenen Rabatt** angeschrieben. Die Zahlen sind verschieden —
   das ist die Pointe.

### 3.3 Das Werk

Die drei Werke sind **keine Firmen mit Baustellen**, sondern
Produktionsanlagen: eine Silhouette aus **Silo, Mischturm und
Förderband**, ebenfalls Strichzeichnung, aber in **Gold statt Weiss**,
damit die beiden Seiten des Geschäfts sich farblich unterscheiden. Namen:
`WERK NORD`, `WERK MITTE`, `WERK SÜD`.

---

## 4. Die Rechnung — exakt, nachrechenbar

**Material:** Beton C25/30. **Referenzpreis (Beispielwert, so
beschriften): `KBOB-Referenzpreis CHF 160.00 / m³`**

### Was jede Firma einbringt und bekommt

| Firma | Menge | Mischer | Rabatt **allein** | Rabatt **im Bündel** | **Ihr Preis** | **Sie spart** |
|---|---:|---:|---:|---:|---:|---:|
| A | 40 m³ | 4 | 0 % | **9 %** | CHF 145.60 | CHF 576 |
| B | 90 m³ | 9 | 0 % | **12 %** | CHF 140.80 | CHF 1'728 |
| C | 120 m³ | 12 | 5 % | **16 %** | CHF 134.40 | CHF 3'072 |
| D | 250 m³ | 25 | 12 % | **20 %** | CHF 128.00 | CHF 8'000 |
| **Bündel** | **500 m³** | **50** | | | **CHF 133.25** | **CHF 13'376** |

### Die drei Gebote der Werke

| Werk | Gebot je m³ | gegenüber KBOB |
|---|---:|---:|
| Werk Nord | CHF 141.20 | −12 % |
| Werk Mitte | CHF 137.90 | −14 % |
| **Werk Süd — Zuschlag** | **CHF 133.25** | **−17 %** |

### Kontrollrechnungen, die im Bild aufgehen müssen

- 40 + 90 + 120 + 250 = **500 m³**, das sind **50 Fahrmischer**
- 500 × 160.00 = **CHF 80'000** Listenwert
- 40×145.60 + 90×140.80 + 120×134.40 + 250×128.00 = **CHF 66'624**
- 66'624 ÷ 500 = **CHF 133.25 / m³** — genau das Gebot von Werk Süd
- 80'000 − 66'624 = **CHF 13'376** Vorteil
- Allein zusammen wären es nur **CHF 5'760** → **mehr als das Doppelte**

### Der Kern, den der Film erklären muss

> **Das Werk gibt einen Preis für das ganze Volumen. Die Verteilung macht
> die Plattform — und dabei hängt dein Prozentsatz an der Menge, die du
> selbst eingebracht hast.**
>
> Deshalb bekommt nicht jeder dasselbe: Firma A 9 %, Firma D 20 %. Aber
> **alle stehen besser da als allein** — A springt von 0 auf 9 %, D von
> 12 auf 20 %.

**20 % ist das Maximum. Nirgends im Film darf eine höhere Zahl stehen.**

---

## 5. Der Ablauf, Szene für Szene

### Szene 1 — Vier Baustellen, jede für sich (0:00 – 0:06)

Schwarz. Die vier Baustellen erscheinen nacheinander (je 0.3 s versetzt)
an vier weit auseinanderliegenden Stellen des Bildes — bewusst unruhig
verteilt, nicht in einer Reihe. Vor jeder stehen ihre Fahrmischer.
Unter jeder das Namensschild und, in Grau, der Rabatt allein:
`0 %` / `0 %` / `5 %` / `12 %`.

Grosser Text, oben links:
> **Vier Baustellen.**
> **Dasselbe Material, dieselbe Woche.**

Ruhe. Nichts bewegt sich ausser dem Erscheinen.

### Szene 2 — Die Kolonne (0:06 – 0:14) · Schlüsselmoment

Die Baustellen bleiben stehen und treten zurück (auf 25 % Deckung). Die
**50 Fahrmischer setzen sich in Bewegung**, fahren aus allen vier
Richtungen zur Bildmitte und ordnen sich zu **einer einzigen Kolonne**
in einer Reihe. Die vier Gruppen behalten ihre Navy-Stufen, dazwischen
goldene Trennlinien.

Die Bewegung ist **gleichmässig und mechanisch**, kein Wimmeln. Die
Mischer kommen in ihrer Gruppenreihenfolge an (A, B, C, D), sodass die
Kolonne von links nach rechts entsteht.

Während sie ankommen, zählt oben eine Zahl mit: **`0 → 500 m³`**,
darunter kleiner **`CHF 80'000 zum Listenpreis`**.

Text:
> **Aus vier Bestellungen wird ein Volumen.**

Kleiner Hinweis am Rand: `ein Fahrmischer = 10 m³`

### Szene 3 — Die Ausschreibung (0:14 – 0:22)

Die Kolonne rückt an den unteren Bildrand und bleibt sichtbar. Oben
erscheinen die **drei Werke** als goldene Strichzeichnungen nebeneinander,
darunter je ein Feld mit `•••` — die Gebote sind verdeckt.

Über allem eine dünne weisse Linie mit der Beschriftung
`KBOB-Referenzpreis · CHF 160.00 / m³`.

Text:
> **Drei Werke bieten auf das ganze Volumen. Verdeckt.**

Zwei Sekunden Stille — **die Spannung entsteht durch die Pause.**

Dann klappen die drei Gebote **gleichzeitig** auf:
`CHF 141.20 · −12 %` — `CHF 137.90 · −14 %` — `CHF 133.25 · −17 %`

Jedes Gebot erscheint als Zahl **unter** seinem Werk, nicht auf einer
Fläche. Zusätzlich fällt von jedem Werk ein dünner senkrechter Strich
nach unten, dessen Länge dem Abstand zum Referenzpreis entspricht — so
sieht man den Unterschied, bevor man die Zahlen liest.

### Szene 4 — Der Zuschlag (0:22 – 0:27) · Schlüsselmoment

Die beiden unterlegenen Werke und ihre Zahlen **verblassen auf 25 %**.
Werk Süd bleibt, seine Zeichnung und seine Zahl werden **golden**.

Ein einzelner, harter Akzent — ein Einrasten, kein Blitz. Dann fährt die
**ganze Kolonne zu Werk Süd hinüber** und steht dort.

Text, gross:
> **ZUSCHLAG · WERK SÜD**
> **500 m³ zu CHF 133.25 / m³**

Darunter klein: `−17 % gegenüber dem Referenzpreis`

### Szene 5 — Die Rückverteilung (0:27 – 0:36) · die eigentliche Aussage

Die Kolonne löst sich auf: **die Mischer fahren zurück zu ihren
Baustellen**, in vier Strömen, jeder Strom so gross wie sein Anteil (4,
9, 12, 25 Mischer). Die Baustellen kommen wieder auf volle Helligkeit.

Sobald eine Gruppe angekommen ist, erscheint bei ihrer Baustelle ein
**goldenes Schild** mit drei Zeilen:

```
FIRMA A            FIRMA B            FIRMA C            FIRMA D
40 m³              90 m³              120 m³             250 m³
CHF 145.60/m³      CHF 140.80/m³      CHF 134.40/m³      CHF 128.00/m³
0 % → 9 %          0 % → 12 %         5 % → 16 %         12 % → 20 %
spart CHF 576      spart CHF 1'728    spart CHF 3'072    spart CHF 8'000
```

Der alte Prozentsatz grau und durchgestrichen, der neue in Gold und
deutlich grösser. Die Schilder erscheinen **nacheinander** (A, B, C, D,
je 0.5 s), damit man mitliest.

Text, gross, über allem:
> **Ein Preis für alle. Ein Vorteil für jeden — nach seiner Menge.**

### Szene 6 — Die Summe (0:36 – 0:41)

Alles tritt zurück. In der Mitte, gross:

> **CHF 13'376**
> *Vorteil auf 500 m³*
>
> Allein wären es CHF 5'760 gewesen.

### Szene 7 — Abbinder (0:41 – 0:44)

Schnitt auf Schwarz. Eine Zeile in Weiss:

> **Gemeinsam einkaufen, direkt verhandeln.**

Darunter die Wortmarke (wird beigestellt). Letzter Frame: ruhiges
Schwarz, passend zum ersten.

---

## 6. Bewegung — wie es sich anfühlen muss

- **Beschleunigung:** `cubic-bezier(0.16, 1, 0.3, 1)` — schnell los,
  weich ankommen. Dauer je Bewegung 500–900 ms.
- **Die Fahrmischer fahren gleichmässig**, mit leichtem Versatz
  zueinander (60–90 ms), nie alle exakt gleichzeitig, aber auch nicht
  zufällig wimmelnd. Sie halten Abstand und richten sich aus.
- **Harte Schnitte** zwischen den Szenen. Keine Überblendungen, keine
  Wischer, keine Drehungen. Einzige Ausnahme: der Schnitt vor Szene 7.
- **Die Kamera steht.** Wenn überhaupt, ein sehr langsames Heranfahren,
  maximal 5 % über eine ganze Szene.
- **Zählende Zahlen zählen echt hoch** (0 → 500), nicht in Sprüngen, und
  brauchen dafür mindestens 1 Sekunde.
- **Schrift erscheint** durch Aufblenden plus 10 px Aufwärtsbewegung.
  Nie durch Zoom, Dreh, Tippeffekt oder Buchstabengewusel.
- **Mindestens ein Takt Stille vor dem Zuschlag.**
- Kein Hüpfen, kein Überschwingen, kein Wackeln, kein „Squash and
  Stretch". Das ist Bauwirtschaft, kein Zeichentrick.

---

## 7. Ton (optional — der Film muss ohne funktionieren)

- Tiefer, ruhiger Puls im Hintergrund. Kein Beat, keine Melodie.
- Beim Zusammenfahren der Kolonne: ein tiefes, kurzes Rollen.
- Beim Zuschlag: **ein einzelner, trockener Akzent** — wie ein Stempel.
- Bei der Rückverteilung: ein leises, ansteigendes Rauschen, das mit den
  Zahlen endet.
- **Keine Musik mit Gesang, kein Sprecher, keine Jingles.**

---

## 8. Der Text im Bild — vollständig und wörtlich

Nur diese Wörter kommen vor. Nichts dazuerfinden.

```
Vier Baustellen.
Dasselbe Material, dieselbe Woche.
FIRMA A · ZÜRICH        allein 0 %
FIRMA B · WINTERTHUR    allein 0 %
FIRMA C · BADEN         allein 5 %
FIRMA D · WETZIKON      allein 12 %

Aus vier Bestellungen wird ein Volumen.
ein Fahrmischer = 10 m³
500 m³ · CHF 80'000 zum Listenpreis

Drei Werke bieten auf das ganze Volumen. Verdeckt.
KBOB-Referenzpreis · CHF 160.00 / m³
WERK NORD    CHF 141.20   −12 %
WERK MITTE   CHF 137.90   −14 %
WERK SÜD     CHF 133.25   −17 %

ZUSCHLAG · WERK SÜD
500 m³ zu CHF 133.25 / m³
−17 % gegenüber dem Referenzpreis

Ein Preis für alle. Ein Vorteil für jeden — nach seiner Menge.
FIRMA A   40 m³    CHF 145.60/m³    0 % → 9 %     spart CHF 576
FIRMA B   90 m³    CHF 140.80/m³    0 % → 12 %    spart CHF 1'728
FIRMA C  120 m³    CHF 134.40/m³    5 % → 16 %    spart CHF 3'072
FIRMA D  250 m³    CHF 128.00/m³   12 % → 20 %    spart CHF 8'000

CHF 13'376
Vorteil auf 500 m³
Allein wären es CHF 5'760 gewesen.

Gemeinsam einkaufen, direkt verhandeln.
```

---

## 9. Was nicht vorkommen darf

- **Keine Karten.** Keine rechteckigen Panels mit abgerundeten Ecken, auf
  denen Text steht, keine Spielkarten, keine Kacheln, keine
  Umschlag-Metapher für verdeckte Gebote, keine „Karten, die sich
  umdrehen". Das ist das Vokabular jeder erzeugten Animation und der
  schnellste Weg, billig auszusehen. Zahlen stehen frei im Raum oder an
  einem Objekt — nicht auf einem Kärtchen.
- **Keine Tabellen als Hauptbild.** Vier Zeilen mit vier Zahlen sind
  keine Darstellung von vier Unternehmen. Die Firmen sind Baustellen
  (Abschnitt 3).
- **Keine Menschen.** Keine Gesichter, Hände, Bauarbeiter, Bauhelme,
  Handschläge.
- **Keine Fotos, kein Stockmaterial, keine Drohnenaufnahmen.**
- **Keine echten Firmen, Marken oder Logos** — und keine erfundenen, die
  echt klingen.
- **Keine Zahl über 20 %.**
- **Kein Geld-Vokabular:** keine Münzen, Geldscheine, Sparschweine,
  Dollarzeichen, Einkaufswagen, Prozent-Ballons.
- **Kein Grün**, kein Neon, keine Regenbogenverläufe.
- **Keine amerikanischen Zahlformate** (`13,376` ist falsch).
- **Kein ß.**
- Keine Schrift unter 34 px im 1920er Bild.

---

## 10. Prüfliste vor der Abgabe

Geh den Film Bild für Bild durch:

1. Steht in jeder Zahl genau der Wert aus Abschnitt 4?
2. Sieht man im Bild, dass 4 + 9 + 12 + 25 = 50 Mischer sind?
3. Ergibt 40 + 90 + 120 + 250 sichtbar 500 m³?
4. Ergeben 576 + 1'728 + 3'072 + 8'000 sichtbar 13'376?
5. Ist 133.25 als **ein** Preis für **alle** erkennbar — und die vier
   Firmenpreise als Folge davon?
6. Sind die vier Baustellen **unterschiedlich gross**, im Verhältnis
   ihrer Mengen, und bleibt das über den ganzen Film gleich?
7. Sieht man beim Rückfluss ohne zu lesen, dass D am meisten bekommt?
8. Steht nirgends ein Prozentsatz über 20?
9. Sind alle Tausendertrenner Hochkommas? Kein ß? Kein Grün?
10. **Verkleinere den Film auf 740 px Breite und schau ihn dort an.**
    Ist jede Zahl noch lesbar? Wenn nein: Schrift vergrössern, nicht
    diskutieren.
11. Berührt irgendetwas die Bildkante?
12. Versteht jemand mit stummem Ton in 40 Sekunden, wie das Modell
    funktioniert? Wenn nein: nachbessern, bevor du abgibst.

---

## 11. Nur falls dein Werkzeug ausschliesslich generative Clips erzeugt

Dann erzeuge **keine Schrift und keine Zahlen** — die werden im Schnitt
gesetzt. Liefere **sieben Clips** von je 4–7 Sekunden im selben Look:

> Technische Strichzeichnung, animiert. Tiefschwarzer Grund. Dünne weisse
> Linien für Baukörper, mattes Dunkelblau für Fahrzeuge, einzelne goldene
> Linien als Akzent. Statische Kamera, orthografische Ansicht von der
> Seite, kein Perspektivenwechsel. Keine Menschen, kein Text, keine
> Logos. Ruhig, präzise, technisch. 4K.

1. Vier verschieden grosse Rohbauten stehen weit auseinander, davor
   jeweils eine Reihe Fahrmischer (4, 9, 12, 25 Stück).
2. Die Fahrmischer setzen sich in Bewegung und fahren zur Bildmitte.
3. Sie ordnen sich zu einer einzigen langen Kolonne aus fünfzig
   Fahrzeugen, mit vier erkennbaren Abschnitten.
4. Drei Werksilhouetten (Silo, Mischturm, Förderband) erscheinen in Gold
   über der Kolonne.
5. Eine der drei Werksilhouetten leuchtet golden auf, die beiden anderen
   verblassen; die Kolonne fährt zu ihr hinüber.
6. Die Kolonne löst sich auf, die Fahrzeuge fahren in vier verschieden
   grossen Strömen zurück zu den vier Rohbauten.
7. Alles kommt zur Ruhe, das Bild verlöscht zu Schwarz.

Die Beschriftung aus Abschnitt 8 wird danach gesetzt — in der Schrift und
den Farben aus Abschnitt 2.
