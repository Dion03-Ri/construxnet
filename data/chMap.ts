// Echter Schweizer Landesumriss — projiziert aus Natural-Earth-50m-Grenzdaten
// (aspektkorrekte equirektanguläre Projektion). Keine externen Tiles/Assets.

export const CH_VIEWBOX = "0 0 1000 643";

export const CH_OUTLINE =
  "M785.5 91.9 L792.1 96.1 L807.6 110.1 L804 134 L786.2 172.5 L776.8 203.7 L775.8 227.6 L777.6 238.8 L780.8 238.7 L797.7 240.4 L806.3 240.3 L833.6 246.8 L855.4 256.3 L859.6 266.2 L862.5 278.4 L888.4 295.1 L918.1 305.8 L928.2 302.4 L965.1 263.5 L979.4 269.9 L988 290.6 L987.6 301.5 L977.4 342.9 L975.7 365.1 L984.5 379.8 L985.4 391.2 L982.8 401.7 L968.1 402.6 L948.3 397 L931.6 379.1 L919 381.2 L908 385.8 L902.4 402.7 L897.4 422.9 L899 434.1 L906.9 442.8 L912.9 461.2 L917.3 485 L920.7 495.9 L917 500.8 L906.6 504.1 L898 500.9 L882.9 472.4 L875.8 461.5 L863.9 459.6 L842.9 466.5 L810.6 482.5 L797.6 482.4 L786.5 479.2 L776.1 465.7 L767.3 439.6 L764.5 423.2 L758.3 423.7 L737.7 419 L728 425.5 L728 452.2 L726.1 485.4 L715.7 506.8 L686.9 544 L676.3 560.2 L672.1 571.8 L671.2 581.9 L675.6 599.4 L681.6 616.1 L676.6 625.6 L661.4 630.6 L650.6 620.4 L646.4 602.4 L623.1 577.8 L633.7 557.1 L631.9 552 L593.5 541.3 L576.9 525.7 L553.6 498.4 L549.2 486.6 L550.2 448.5 L548.9 439.2 L545.8 434.7 L534.5 435 L518.8 448.3 L504.3 468.1 L474.6 490.4 L471.5 495.2 L481.5 516.9 L481 525.4 L456.9 560 L452.3 571.5 L421.7 593.3 L407.6 601.4 L365.1 585.4 L353.4 583.5 L334.4 594.2 L307.5 604.4 L264.2 614.6 L248.3 607.1 L240.8 600.1 L237 589.6 L226.1 571.1 L213.8 560.1 L205.3 548.1 L193.9 535 L186.6 524 L196.3 489.1 L189.2 476.7 L185.5 459.2 L187.4 447.3 L183.5 444.4 L144.4 437.5 L111.9 439.7 L88.6 451.4 L69.6 470.8 L67.3 475 L68.5 478.5 L77.9 496.4 L61.9 515.2 L37.4 529.8 L20 531.3 L12.3 528.5 L12 508.3 L26.4 500.9 L39.4 487.7 L43.8 469.2 L45.3 456.2 L31.6 440.4 L33.3 430.8 L41.8 412.5 L46.7 396.3 L53.5 382.3 L80.6 359.4 L107.8 336.4 L111.9 311.9 L114 282.2 L117.8 275 L154.5 257.2 L163.7 250.2 L168.3 240.1 L197.1 206.7 L225.7 173.7 L231.5 162.6 L236.3 156.1 L236.3 150.7 L232.7 146.5 L219.1 143.8 L214.5 133.3 L229.3 114.5 L247.8 103 L265.8 102.9 L273 108.1 L272.6 114.4 L280.4 121 L294 123.2 L310.8 120.9 L327.6 113.9 L337.9 97.2 L343.9 84.6 L370.1 70.2 L388.1 77.4 L437.9 79.3 L474.2 75.4 L496.9 65.6 L525.1 65.6 L544.1 71.1 L547.4 70.3 L552.6 69.1 L557.7 63.8 L575.6 60.2 L578 55.8 L577.2 51.3 L574 49 L552.1 51.4 L543.7 47.9 L541.6 39.9 L548.6 26.1 L564.8 14.8 L578.4 12 L588.3 15 L612.3 36 L618.1 36.7 L621.4 32.9 L626.4 30.8 L634.7 34.9 L644 47.9 L645.6 49.9 L699.2 45.4 L711.2 45.4 L747.6 68.2 L785.5 91.9 Z";

// Projektionsparameter, um Lieferanten anhand ihrer Koordinaten (lng/lat)
// exakt auf denselben Umriss zu setzen.
const PROJ = {"W":1000,"H":643,"PAD":12,"minL":5.97002,"maxB":47.775635,"kx":0.6845110738320704,"scale":317.94246127934434};

export function projectLngLat(lng: number, lat: number): { x: number; y: number } {
  return {
    x: PROJ.PAD + (lng - PROJ.minL) * PROJ.kx * PROJ.scale,
    y: PROJ.PAD + (PROJ.maxB - lat) * PROJ.scale,
  };
}

// Ungefähre Koordinaten der grössten Schweizer Wirtschaftsräume — nur als
// Orientierung/Labels auf der leeren Karte (keine erfundenen Lieferanten).
export const CH_CITIES: { name: string; lng: number; lat: number }[] = [
  { name: "Basel", lng: 7.588, lat: 47.559 },
  { name: "Zürich", lng: 8.541, lat: 47.376 },
  { name: "Bern", lng: 7.447, lat: 46.948 },
  { name: "Luzern", lng: 8.307, lat: 47.05 },
  { name: "St. Gallen", lng: 9.377, lat: 47.424 },
  { name: "Chur", lng: 9.53, lat: 46.849 },
  { name: "Lausanne", lng: 6.633, lat: 46.519 },
  { name: "Genf", lng: 6.143, lat: 46.204 },
  { name: "Lugano", lng: 8.951, lat: 46.003 },
  { name: "Sion", lng: 7.359, lat: 46.233 },
];

// ── Markt-Analytik (Aggregat, keine erfundenen Einzel-Lieferanten) ──────────
// Wird im Geo-Dashboard neben der Karte gezeigt.
export const SPEND_BY_CATEGORY: {
  category: string;
  spend: number;
  tx: number;
  suppliers: number;
  trend: number[];
}[] = [
  { category: "Transportbeton", spend: 2_840_000, tx: 312, suppliers: 18, trend: [12, 14, 13, 16, 18, 21] },
  { category: "Armierungsstahl", spend: 1_920_000, tx: 204, suppliers: 11, trend: [9, 8, 11, 10, 13, 15] },
  { category: "Kies & Sand", spend: 1_140_000, tx: 268, suppliers: 22, trend: [7, 9, 8, 10, 9, 11] },
  { category: "Zement", spend: 880_000, tx: 96, suppliers: 7, trend: [5, 6, 6, 7, 8, 9] },
  { category: "Backstein / Mauerwerk", spend: 610_000, tx: 142, suppliers: 14, trend: [4, 5, 5, 6, 6, 7] },
];

export const SUPPLIER_DISTRIBUTION: { region: string; pct: number }[] = [
  { region: "Zürich / Nordostschweiz", pct: 34 },
  { region: "Mittelland / Bern", pct: 24 },
  { region: "Nordwestschweiz", pct: 18 },
  { region: "Westschweiz", pct: 14 },
  { region: "Innerschweiz / Tessin", pct: 10 },
];

export const INVOICE_DISCOUNT: { m: string; volume: number; discount: number }[] = [
  { m: "Jan", volume: 420, discount: 2.9 },
  { m: "Feb", volume: 460, discount: 3.1 },
  { m: "Mär", volume: 510, discount: 3.4 },
  { m: "Apr", volume: 540, discount: 3.3 },
  { m: "Mai", volume: 600, discount: 3.8 },
  { m: "Jun", volume: 650, discount: 4.1 },
];

// Kanton-Schwerpunkte (lng/lat) — Fallback, um einen Lieferanten ohne exakte
// Koordinaten grob auf der Karte zu platzieren.
export const CANTON_CENTROID: Record<string, { lng: number; lat: number; label: string }> = {
  ZH: { lng: 8.65, lat: 47.41, label: "Zürich" },
  BE: { lng: 7.62, lat: 46.82, label: "Bern" },
  LU: { lng: 8.14, lat: 47.07, label: "Luzern" },
  UR: { lng: 8.68, lat: 46.77, label: "Uri" },
  SZ: { lng: 8.76, lat: 47.06, label: "Schwyz" },
  OW: { lng: 8.25, lat: 46.87, label: "Obwalden" },
  NW: { lng: 8.39, lat: 46.96, label: "Nidwalden" },
  GL: { lng: 9.05, lat: 46.98, label: "Glarus" },
  ZG: { lng: 8.55, lat: 47.16, label: "Zug" },
  FR: { lng: 7.13, lat: 46.72, label: "Freiburg" },
  SO: { lng: 7.62, lat: 47.30, label: "Solothurn" },
  BS: { lng: 7.60, lat: 47.56, label: "Basel-Stadt" },
  BL: { lng: 7.73, lat: 47.45, label: "Basel-Land" },
  SH: { lng: 8.60, lat: 47.70, label: "Schaffhausen" },
  AR: { lng: 9.42, lat: 47.38, label: "Appenzell A.Rh." },
  AI: { lng: 9.42, lat: 47.32, label: "Appenzell I.Rh." },
  SG: { lng: 9.35, lat: 47.20, label: "St. Gallen" },
  GR: { lng: 9.63, lat: 46.66, label: "Graubünden" },
  AG: { lng: 8.20, lat: 47.39, label: "Aargau" },
  TG: { lng: 9.09, lat: 47.57, label: "Thurgau" },
  TI: { lng: 8.90, lat: 46.30, label: "Tessin" },
  VD: { lng: 6.62, lat: 46.60, label: "Waadt" },
  VS: { lng: 7.60, lat: 46.20, label: "Wallis" },
  NE: { lng: 6.85, lat: 46.99, label: "Neuenburg" },
  GE: { lng: 6.14, lat: 46.21, label: "Genf" },
  JU: { lng: 7.14, lat: 47.35, label: "Jura" },
};

// Häufige Städte für eine genauere Punkt-Platzierung (nach Name gematcht).
export const CITY_GAZETTEER: Record<string, { lng: number; lat: number }> = {
  "zürich": { lng: 8.541, lat: 47.376 },
  "winterthur": { lng: 8.729, lat: 47.500 },
  "bern": { lng: 7.447, lat: 46.948 },
  "biel": { lng: 7.247, lat: 47.136 },
  "biel/bienne": { lng: 7.247, lat: 47.136 },
  "luzern": { lng: 8.307, lat: 47.050 },
  "basel": { lng: 7.588, lat: 47.559 },
  "st. gallen": { lng: 9.377, lat: 47.424 },
  "st.gallen": { lng: 9.377, lat: 47.424 },
  "chur": { lng: 9.530, lat: 46.849 },
  "lausanne": { lng: 6.633, lat: 46.519 },
  "genf": { lng: 6.143, lat: 46.204 },
  "genève": { lng: 6.143, lat: 46.204 },
  "geneve": { lng: 6.143, lat: 46.204 },
  "lugano": { lng: 8.951, lat: 46.003 },
  "bellinzona": { lng: 9.024, lat: 46.195 },
  "sion": { lng: 7.359, lat: 46.233 },
  "sitten": { lng: 7.359, lat: 46.233 },
  "fribourg": { lng: 7.162, lat: 46.806 },
  "freiburg": { lng: 7.162, lat: 46.806 },
  "neuchâtel": { lng: 6.931, lat: 46.990 },
  "neuenburg": { lng: 6.931, lat: 46.990 },
  "zug": { lng: 8.517, lat: 47.166 },
  "aarau": { lng: 8.044, lat: 47.391 },
  "solothurn": { lng: 7.538, lat: 47.208 },
  "schaffhausen": { lng: 8.634, lat: 47.697 },
  "frauenfeld": { lng: 8.898, lat: 47.556 },
  "wildegg": { lng: 8.180, lat: 47.418 },
  "kloten": { lng: 8.582, lat: 47.452 },
  "baden": { lng: 8.308, lat: 47.476 },
  "thun": { lng: 7.628, lat: 46.758 },
};
