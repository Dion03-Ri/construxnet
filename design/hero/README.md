# Das Kopfbild der Startseite

`quelle-baustelle.png` ist die Vorlage, die der Auftraggeber beigestellt
hat: ein Bildgenerator-Render, 1703 x 924, Baustelle bei Nacht, im
Vordergrund ein Tablet mit der Bedarfsmeldung.

`grade.mjs` macht daraus `public/hero-baustelle.jpg`:

```
node grade.mjs 2400 0.84 hero-baustelle.jpg     # ~420 KB
```

Chromium ist hier das Bildwerkzeug — ImageMagick und Pillow fehlen, und
das mitgelieferte ffmpeg kann PNG schreiben, aber nicht lesen. Die
Vorlage geht als Data-URL in die Seite, sonst sperrt der Browser
`getImageData` (Canvas ist bei `file://` als fremd markiert).

Was das Rezept tut, und warum:

* **Hochrechnen auf 2400 px, in zwei Stufen.** Ein Sprung in einem Zug
  wirkt weich. Danach eine Unschaerfemaske, sonst sieht das Bild aus wie
  aufgeblasen.
* **Rot daempfen.** Die Absperrbaender und die roten Matten waren das
  Lauteste im Bild und haben mit Gold und Navy nichts zu tun.
* **Gruen herausnehmen.** Gruen ist in dieser Marke verboten.
* **Tiefen nach Navy, Kontrast leicht an, Belichtung leicht runter.**
  Ueber dem Bild liegen in der Seite zwei Verlaeufe; ohne diesen Schritt
  wird es darunter grau statt tief.

Abgedunkelt wird in der Seite, nicht in der Datei — die Datei behaelt
Zeichnung, damit man sie spaeter anders einsetzen kann.

**Offen:** Der Kleintext auf dem Tablet ist erzeugter Buchstabensalat.
In der Anzeigegroesse liest ihn niemand, echt sind nur die Ueberschrift
„Materialbedarf melden" und das Logo. Sauber waere, den Bildschirm durch
eine echte Aufnahme von `/beschaffung` zu ersetzen und perspektivisch
einzupassen.
