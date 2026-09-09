# Der Film der Smart-Pools-Sektion

`film.html` ist die Quelle. Er laeuft von selbst durch, dauert nach dem
Zuschnitt 34 Sekunden und wird abgefilmt, nicht exportiert.

```
# Schriften holen (nicht im Git, ~440 KB)
curl -s "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700" \
  | grep -o 'https://fonts.gstatic.com[^)]*' | while read u; do
      curl -s "$u" -o "fonts/archivo-$(echo $u | md5sum | cut -c1-6).ttf"; done
# dazu logo-hell.png aus public/ danebenlegen

# abfilmen (Playwright, wartet auf document.title === 'ENDE'),
# dann zuschneiden und verkleinern — in einem Durchgang, damit nur
# einmal neu kodiert wird
ffmpeg -i roh.webm -ss 0.80 -to 34.88 \
       -c:v libvpx -b:v 1000k -crf 32 -an smart-pools.webm
ffmpeg -ss 10.4 -i smart-pools.webm -frames:v 1 smart-pools-poster.png
```

**Der Zuschnitt ist Pflicht, nicht Kosmetik.** Das erste Bild der Aufnahme
ist WEISS — das Aufnahmewerkzeug liefert es, bevor die Seite zum ersten Mal
zeichnet. In der Endlosschleife blitzt es bei jedem Durchgang auf. `-ss`
steht hinter `-i`, damit genau geschnitten wird und nicht am naechsten
Schluesselbild.

Die Zeiten stehen nicht fest: der Kopf haengt daran, wie schnell die
Schriften geladen sind. Vor dem Zuschneiden das Helligkeitsprofil der
Aufnahme messen (Bild fuer Bild in ein Canvas zeichnen und die mittlere
Helligkeit nehmen) und die beiden Marken daraus ableiten:

* **Anfang:** rund zwei Zehntel vor dem ersten Bild, das heller wird als
  der Grund (der liegt bei etwa 10 von 255).
* **Ende:** gut drei Zehntel nach dem letzten hellen Bild.

So bleibt zwischen zwei Durchgaengen gut eine halbe Sekunde Schwarz — ein
Atemzug, kein Ruckler. Gemessen: durchgehend 25 Bilder je Sekunde, eine
einzige Stockung von 24 ms am Uebergang.

Die Namen der Schriftdateien stehen oben in `film.html` — nach dem
Herunterladen dort anpassen. `film.html#standbild` haelt die Zeitachse an;
so laesst sich jede Szene einzeln als Standbild pruefen, ohne dass der
laufende Film die Klassen wieder umsetzt.

**Das `</script>` am Dateiende muss stehenbleiben.** Ohne es fuehrt
Chromium das Skript kommentarlos nicht aus — keine Fehlermeldung, kein
Konsoleneintrag, nur eine leere Seite.

## Sprachen

Alles Sichtbare steht in `WORT` am Kopf des Skripts, nichts im Aufbau.
Eine weitere Sprache ist ein weiterer Eintrag, danach
`film.html?sprache=xx` aufrufen und neu abfilmen. Heute: `de`, `en`.
Keine Ortsnamen, keine Firmennamen, kein KBOB — die Firmen heissen
Firma A bis D beziehungsweise Company A to D, die Anbieter Lieferant 1
bis 3 beziehungsweise Supplier 1 to 3, und der Vergleichspreis heisst
Referenzpreis. Das haelt den Film weltweit brauchbar.

## Wie die Sache dargestellt wird

Ein einziges Motiv: **die Schiene**. Sie ist immer 1660 px breit, das ist
die ganze nutzbare Bildflaeche und zugleich die Zielmenge von 500 m3.
Jede Menge im Film ist ein Stueck davon, im gleichen Massstab.

1. Vier eigene Schienen, jede kurz — allein reicht keine Bestellung.
2. Dieselben vier Mengen legen sich hintereinander und fuellen eine
   Schiene ganz aus, waehrend die Zahl mitlaeuft.
3. Die Anbieter bieten; die Gebote sind erst verdeckt, dann offen, der
   Zuschlag bekommt einen goldenen Strich an der Zeile.
4. Dieselbe Schiene noch einmal, jetzt zaehlt unter jedem Abschnitt die
   eigene Stufe hoch.
5. Die Bilanz.

Keine Kaesten, keine Karten, keine Farbverlaeufe, keine Symbole. Vier
Navy-Stufen halten die Firmen auseinander, Gold ist dem Zuschlag, den
Rabattstufen und der Summe vorbehalten.

**Die Zahlen sind nachgerechnet und muessen zusammenpassen:**
80 + 110 + 145 + 165 = 500 m3 · 500 x 160.00 = CHF 80'000 ·
Zuschlag 500 x 133.60 = CHF 66'800 (−16.5 %) ·
1'280 + 2'464 + 4'176 + 5'280 = CHF 13'200 · allein waeren es CHF 4'032.
Kein Unternehmen bringt mehr als ein Drittel des Buendels ein.

**Offen:** eine Hochkant-Fassung fuers Handy. Dort laeuft heute kein Film,
sondern die drei Belege als Text — 34-px-Schrift auf 390 px Breite waere
sieben Pixel hoch.
