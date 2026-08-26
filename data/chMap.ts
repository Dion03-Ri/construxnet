// Stilisierte Schweiz-Karte (eigene, vereinfachte Silhouette — keine externen
// Tiles/Assets) plus ungefähre Kanton-Ankerpunkte im viewBox 0 0 960 600.

export const CH_VIEWBOX = "0 0 960 600";

// Vereinfachte, stilisierte Silhouette (bewusst nicht geografisch exakt).
export const CH_PATH =
  "M90 470 C60 430 90 380 150 360 C210 340 250 300 320 270 C360 250 360 190 400 150 C440 120 480 150 520 170 C560 150 600 160 650 180 C720 200 780 210 820 250 C860 280 850 330 800 360 C760 390 740 430 690 470 C640 520 600 560 540 540 C480 520 440 540 380 520 C320 540 270 520 220 500 C170 490 120 500 90 470 Z";

export type Hub = { x: number; y: number; label: string };

export const CANTON_XY: Record<string, Hub> = {
  ZH: { x: 600, y: 250, label: "Zürich" },
  BE: { x: 360, y: 340, label: "Bern" },
  LU: { x: 470, y: 320, label: "Luzern" },
  SG: { x: 720, y: 270, label: "St. Gallen" },
  BS: { x: 400, y: 180, label: "Basel-Stadt" },
  BL: { x: 380, y: 210, label: "Basel-Land" },
  AG: { x: 490, y: 230, label: "Aargau" },
  ZG: { x: 540, y: 290, label: "Zug" },
  SZ: { x: 590, y: 310, label: "Schwyz" },
  TG: { x: 660, y: 230, label: "Thurgau" },
  SH: { x: 560, y: 165, label: "Schaffhausen" },
  SO: { x: 420, y: 250, label: "Solothurn" },
  GR: { x: 765, y: 360, label: "Graubünden" },
  TI: { x: 620, y: 470, label: "Tessin" },
  VS: { x: 350, y: 460, label: "Wallis" },
  VD: { x: 220, y: 400, label: "Waadt" },
  GE: { x: 120, y: 460, label: "Genf" },
  NE: { x: 250, y: 330, label: "Neuenburg" },
  FR: { x: 320, y: 390, label: "Freiburg" },
  JU: { x: 300, y: 250, label: "Jura" },
  UR: { x: 560, y: 360, label: "Uri" },
  OW: { x: 500, y: 360, label: "Obwalden" },
  NW: { x: 520, y: 345, label: "Nidwalden" },
  GL: { x: 660, y: 320, label: "Glarus" },
  AR: { x: 700, y: 252, label: "Appenzell A.Rh." },
  AI: { x: 715, y: 262, label: "Appenzell I.Rh." },
};

// Demo-Verteilung (Fallback, wenn noch keine echten Firmenstandorte vorliegen)
export const DEMO_DISTRIBUTION: Record<string, number> = {
  ZH: 217,
  BE: 185,
  BS: 96,
  AG: 78,
  LU: 74,
  SG: 63,
  VD: 58,
  GR: 41,
  TI: 37,
  VS: 29,
};

export const GEO_KPIS = [
  { label: "Aufträge total", value: "13'742", delta: "+8.2%", up: true },
  { label: "Volumen bestellt", value: "98'640", delta: "+4.8%", up: true },
  { label: "Beschaffungs-ROI", value: "312%", delta: "+0.2%", up: true },
];

export const SPEND_BY_CATEGORY = [
  { category: "Beton C25/30", spend: 16_810_785, tx: 1023, suppliers: 83, cycle: "11 T.", trend: [4, 6, 5, 7, 8, 7, 9] },
  { category: "Armierungsstahl", spend: 15_032_214, tx: 1019, suppliers: 21, cycle: "8 T.", trend: [6, 5, 6, 4, 5, 6, 7] },
  { category: "Koffer-/Wandkies", spend: 9_012_107, tx: 820, suppliers: 28, cycle: "5 T.", trend: [3, 4, 4, 5, 4, 5, 6] },
  { category: "Transport/Diesel", spend: 6_235_325, tx: 735, suppliers: 44, cycle: "3 T.", trend: [7, 6, 8, 6, 7, 8, 7] },
];

export const SUPPLIER_DISTRIBUTION = [
  { region: "Zürich", pct: 34 },
  { region: "Bern", pct: 22 },
  { region: "Nordwestschweiz", pct: 18 },
  { region: "Ostschweiz", pct: 14 },
  { region: "Übrige", pct: 12 },
];

export const INVOICE_DISCOUNT = [
  { m: "Jan", volume: 180, discount: 2.8 },
  { m: "Feb", volume: 150, discount: 3.1 },
  { m: "Mär", volume: 220, discount: 3.4 },
  { m: "Apr", volume: 190, discount: 3.0 },
  { m: "Mai", volume: 260, discount: 3.9 },
  { m: "Jun", volume: 300, discount: 4.1 },
  { m: "Jul", volume: 240, discount: 3.6 },
  { m: "Aug", volume: 280, discount: 3.8 },
];
