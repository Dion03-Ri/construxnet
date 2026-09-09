import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';

const BREITE = Number(process.argv[2] || 2400);
const GUETE  = Number(process.argv[3] || 0.85);
const ZIEL   = process.argv[4] || 'hero-baustelle.jpg';

const quelle = 'data:image/png;base64,' + fs.readFileSync('quelle.png').toString('base64');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 400, height: 300 } });
await p.goto('file://' + process.cwd() + '/rahmen.html');

const datenUrl = await p.evaluate(async ([BREITE, GUETE, quelle]) => {
  const bild = new Image();
  bild.src = quelle;
  await bild.decode();
  const H = Math.round(BREITE * bild.naturalHeight / bild.naturalWidth);

  /* Hochrechnen in zwei Schritten. Ein Sprung von 1703 auf 2400 in einem
     Zug wirkt weich; ueber eine Zwischenstufe bleibt mehr Kante stehen. */
  const zwischen = document.createElement('canvas');
  zwischen.width = Math.round(bild.naturalWidth * 1.2);
  zwischen.height = Math.round(bild.naturalHeight * 1.2);
  let k = zwischen.getContext('2d');
  k.imageSmoothingEnabled = true; k.imageSmoothingQuality = 'high';
  k.drawImage(bild, 0, 0, zwischen.width, zwischen.height);

  const c = document.createElement('canvas');
  c.width = BREITE; c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(zwischen, 0, 0, BREITE, H);

  const bd = g.getImageData(0, 0, BREITE, H);
  const d = bd.data;

  /* ---- Farbstimmung ----------------------------------------------
     Drei Eingriffe, jeder mit einem Grund:
     1. Rot herunternehmen. Die Absperrbaender und die roten Matten sind
        das Lauteste im Bild und haben mit Gold und Navy nichts zu tun.
     2. Gruen fast ganz herausnehmen. Gruen ist in dieser Marke verboten.
     3. Die Tiefen nach Navy ziehen und leicht abdunkeln, damit das Bild
        unter dem Verlauf der Seite nicht grau wird.
     ---------------------------------------------------------------- */
  const misch = (v, ziel, t) => v + (ziel - v) * t;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], gr = d[i + 1], bl = d[i + 2];
    const luma = 0.2126 * r + 0.7152 * gr + 0.0722 * bl;

    const max = Math.max(r, gr, bl), min = Math.min(r, gr, bl);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat > 0.12) {
      let h;                                   /* Farbton in Grad */
      const dd = max - min;
      if (max === r)       h = 60 * (((gr - bl) / dd) % 6);
      else if (max === gr) h = 60 * ((bl - r) / dd + 2);
      else                 h = 60 * ((r - gr) / dd + 4);
      if (h < 0) h += 360;
      if (h < 22 || h > 338) {                 /* Rot */
        r = misch(r, luma, .50); gr = misch(gr, luma, .50); bl = misch(bl, luma, .50);
      } else if (h > 72 && h < 172) {          /* Gruen */
        r = misch(r, luma, .62); gr = misch(gr, luma, .62); bl = misch(bl, luma, .62);
      }
    }

    /* Tiefen nach Navy */
    if (luma < 118) {
      const k2 = (118 - luma) / 118;
      r -= 9 * k2; gr -= 3 * k2; bl += 7 * k2;
    }

    /* Kontrast und Belichtung */
    const kurve = (v) => {
      let x = v / 255;
      x = (x - 0.5) * 1.09 + 0.5;              /* Kontrast */
      x = x - 0.022 * (1 - x);                 /* Fuss leicht tiefer */
      return Math.max(0, Math.min(255, x * 255 * 0.972));
    };
    d[i] = kurve(r); d[i + 1] = kurve(gr); d[i + 2] = kurve(bl);
  }

  /* ---- Nachschaerfen (Unschaerfemaske 3x3) ----
     Das Bild wurde hochgerechnet; ohne diesen Schritt sieht es weich aus. */
  const q = new Uint8ClampedArray(d);
  const W = BREITE, staerke = 0.55;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = (y * W + x) * 4;
      for (let k2 = 0; k2 < 3; k2++) {
        const mitte = q[i + k2];
        const um = (q[i - 4 + k2] + q[i + 4 + k2] + q[i - W * 4 + k2] + q[i + W * 4 + k2]) / 4;
        d[i + k2] = Math.max(0, Math.min(255, mitte + (mitte - um) * staerke));
      }
    }
  }
  g.putImageData(bd, 0, 0);
  return c.toDataURL('image/jpeg', GUETE);
}, [BREITE, GUETE, quelle]);

fs.writeFileSync(ZIEL, Buffer.from(datenUrl.split(',')[1], 'base64'));
console.log(ZIEL, (fs.statSync(ZIEL).size / 1024).toFixed(0) + ' KB');
await b.close();
