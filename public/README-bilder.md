# Bilder für die Startseite

Hier gehören zwei Dateien hin. Solange sie fehlen, bleiben die beiden Karten
auf der Startseite einfach dunkel — es bricht nichts.

| Datei | Wo sie erscheint | Motiv |
|---|---|---|
| `bg-pools.jpg` | Karte **Aktive Smart Pools** (links) | die abstrakte technische Grafik |
| `bg-netzwerk.jpg` | Karte **Firmen im Netzwerk** (rechts) | das Foto der Besprechung |

Beide liegen bereits hier. Sie wurden aus den Originalen (5940 × 3965 bzw.
8192 × 4320, zusammen 13 MB) auf **1800 px Breite** verkleinert und mit
mozjpeg neu gespeichert — zusammen noch 380 KB. Rohbilder in dieser Grösse
gehören nicht auf eine Startseite: sie hätten die Ladezeit vervielfacht.

**Ersetzen:** gleiches Vorgehen, Zielbreite 1800 px, Qualität ~72. Über beiden
liegt ein dunkler Verlauf, damit die Schrift lesbar bleibt — die Bilder dürfen
also ruhig hell und detailreich sein.

**Videos gehören NICHT hierher**, sondern in den Vercel Blob Store; die
Adresse steht in `data/media.ts`.

**Rechte:** nur Bilder ablegen, für die eine Lizenz vorliegt. Bei Stockfotos
den Nachweis aufbewahren.
