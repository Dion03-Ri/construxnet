# Der Film der Smart-Pools-Sektion

`film.html` ist die Quelle. Er laeuft von selbst durch, dauert 40 Sekunden
und wird abgefilmt, nicht exportiert.

```
# Schriften holen (nicht im Git, ~440 KB)
curl -s "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700" \
  | grep -o 'https://fonts.gstatic.com[^)]*' | while read u; do
      curl -s "$u" -o "fonts/archivo-$(echo $u | md5sum | cut -c1-6).ttf"; done
# dazu logo-hell.png aus public/ danebenlegen

# abfilmen (Playwright, wartet auf document.title === 'ENDE'), dann verkleinern
ffmpeg -i roh.webm -c:v libvpx -b:v 1000k -crf 32 -an smart-pools.webm
ffmpeg -ss 10.6 -i smart-pools.webm -frames:v 1 smart-pools-poster.png
```

Die Namen der Schriftdateien stehen oben in `film.html` — nach dem
Herunterladen dort anpassen. `film.html#standbild` haelt die Zeitachse an;
so lassen sich einzelne Szenen als Standbild pruefen, ohne dass der
laufende Film die Klassen wieder umsetzt.

## Wie die Sache dargestellt wird

Keine Kaesten, keine Karten, keine Farbverlaeufe — nur Schrift, Haarlinien
und zwei Zeichnungen:

* **Die Firmen sind Baustellen.** Ein Rohbau als Strichzeichnung, Geschosse
  und Breite wachsen mit der Menge; bei der groessten Firma steht ein Kran.
  Darunter, unter der Bodenlinie, das Schild mit Firma, Ort und Menge.
  Dieselben vier Haeuser stehen spaeter noch einmal da — dann mit dem Preis,
  den jede Firma zahlt. Der Vergleich ist damit ohne Erklaerung lesbar.
* **Die Menge sind Fahrmischer.** Einer steht fuer 10 m3, 50 Stueck ergeben
  500 m3 — fuenf Reihen zu zehn, abzaehlbar. Die vier Navy-Stufen zeigen,
  welcher Anteil von welcher Firma kommt.

**Die Zahlen sind nachgerechnet und muessen zusammenpassen:**
40 + 90 + 120 + 250 = 500 m3 · 500 x 160.00 = CHF 80'000 ·
Zuschlag 500 x 133.25 = CHF 66'624 ·
576 + 1'728 + 3'072 + 8'000 = CHF 13'376 · allein waeren es CHF 5'760.
Der ausfuehrliche Auftrag dazu: `design/video-prompt-smart-pools.md`.

**Offen:** eine Hochkant-Fassung fuers Handy. Dort laeuft heute kein Film,
sondern die drei Belege als Text — 34-px-Schrift auf 390 px Breite waere
sieben Pixel hoch.
