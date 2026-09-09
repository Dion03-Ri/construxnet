# Der Film der Smart-Pools-Sektion

`film.html` ist die Quelle. Er laeuft von selbst durch, dauert 33 Sekunden
und wird abgefilmt, nicht exportiert:

```
# Schriften holen (nicht im Git, ~440 KB)
curl -s "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700" \
  | grep -o 'https://fonts.gstatic.com[^)]*' | while read u; do
      curl -s "$u" -o "fonts/archivo-$(echo $u | md5sum | cut -c1-6).ttf"; done
# dazu logo-hell.png aus public/ danebenlegen

# abfilmen (Playwright), dann verkleinern
ffmpeg -i roh.webm -c:v libvpx -b:v 900k -crf 33 -an smart-pools.webm
ffmpeg -ss 10.4 -i roh.webm -frames:v 1 smart-pools-poster.png
```

Die Namen der Schriftdateien stehen oben in `film.html` — nach dem
Herunterladen dort anpassen.

**Die Zahlen sind nachgerechnet und muessen zusammenpassen:**
40 + 90 + 120 + 250 = 500 m3 · 500 x 160.00 = CHF 80'000 ·
576 + 1'728 + 3'072 + 8'000 = CHF 13'376 · allein waeren es CHF 5'760.
Der ausfuehrliche Auftrag dazu: `design/video-prompt-smart-pools.md`.

**Offen:** eine Hochkant-Fassung fuers Handy. Dort laeuft heute kein Film,
sondern die drei Belege als Text — 34-px-Schrift auf 390 px Breite waere
sieben Pixel hoch.
