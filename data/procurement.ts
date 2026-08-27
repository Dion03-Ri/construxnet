// Beschaffungs-Stammdaten (Material, SIA-Spezifikation, KBOB-Referenz, Tier-Logik).
// Bewusst eigenständig, damit der Bedarfs-Flow die BundleEngine-Logik nicht verändert.

export type ProcCategory =
  | "Beton"
  | "Zement & Bindemittel"
  | "Bewehrung & Stahl"
  | "Kies, Aushub & Recycling"
  | "Mauerwerk"
  | "Dämmung"
  | "Belag & Asphalt"
  | "Holz"
  | "Entwässerung & Rohre"
  | "Bauchemie";

export type ProcMaterial = {
  key: string;
  label: string;
  sia: string; // SIA-/Normspezifikation
  unit: string;
  kbobPrice: number; // offizieller KBOB-Marktpreis (CHF/Einheit)
  category: ProcCategory;
};

// Kuratierter Katalog der gängigsten Baustoffe. Er ist bewusst breit — gebündelt
// werden kann grundsätzlich jedes Material; wo etwas fehlt, gibt es im
// Beschaffungs-Flow „Weiteres Material (frei)".
export const PROC_MATERIALS: ProcMaterial[] = [
  // Beton
  { key: "beton-25", label: "Beton C25/30", sia: "SN EN 206 · C25/30 · Cl 0.20 · Dmax 32 · XC3", unit: "m³", kbobPrice: 156, category: "Beton" },
  { key: "beton-30", label: "Beton C30/37", sia: "SN EN 206 · C30/37 · Cl 0.20 · Dmax 32 · XC4", unit: "m³", kbobPrice: 168, category: "Beton" },
  { key: "beton-20", label: "Beton C20/25", sia: "SN EN 206 · C20/25 · Dmax 32 · XC2", unit: "m³", kbobPrice: 148, category: "Beton" },
  { key: "beton-35", label: "Beton C35/45 (wasserdicht)", sia: "SN EN 206 · C35/45 · XC4/XD3 · Dmax 32", unit: "m³", kbobPrice: 192, category: "Beton" },
  { key: "beton-mager", label: "Magerbeton / Sauberkeitsschicht", sia: "SN EN 206 · C8/10 · Dmax 32", unit: "m³", kbobPrice: 128, category: "Beton" },
  { key: "estrich", label: "Zementestrich CT-C25-F4", sia: "SN EN 13813 · CT-C25-F4", unit: "m²", kbobPrice: 34, category: "Beton" },

  // Zement & Bindemittel
  { key: "zement-cem2", label: "Zement CEM II/A-LL 42.5 N", sia: "SN EN 197-1 · CEM II/A-LL 42.5 N", unit: "t", kbobPrice: 178, category: "Zement & Bindemittel" },
  { key: "zement-cem1", label: "Zement CEM I 52.5 R", sia: "SN EN 197-1 · CEM I 52.5 R", unit: "t", kbobPrice: 205, category: "Zement & Bindemittel" },
  { key: "kalk", label: "Baukalk CL 90", sia: "SN EN 459-1 · CL 90-S", unit: "t", kbobPrice: 235, category: "Zement & Bindemittel" },

  // Bewehrung & Stahl
  { key: "stahl-b500b", label: "Bewehrungsstahl B500B", sia: "SIA 262 · B500B · Ring / Stäbe", unit: "t", kbobPrice: 1120, category: "Bewehrung & Stahl" },
  { key: "stahl-matten", label: "Baustahlmatten B500A", sia: "SIA 262 · B500A · Lagermatten", unit: "t", kbobPrice: 1180, category: "Bewehrung & Stahl" },
  { key: "stahl-profil", label: "Stahlprofile S235/S355", sia: "SN EN 10025 · S235JR / S355J2", unit: "t", kbobPrice: 1650, category: "Bewehrung & Stahl" },

  // Kies, Aushub & Recycling
  { key: "kies-045", label: "Koffer-/Wandkies 0/45", sia: "SN 670 · ungebrochen 0/45", unit: "t", kbobPrice: 39, category: "Kies, Aushub & Recycling" },
  { key: "kies-032", label: "Rundkies 0/32", sia: "SN 670 · ungebrochen 0/32", unit: "t", kbobPrice: 42, category: "Kies, Aushub & Recycling" },
  { key: "sand-04", label: "Betonsand 0/4", sia: "SN EN 12620 · 0/4", unit: "t", kbobPrice: 44, category: "Kies, Aushub & Recycling" },
  { key: "rc-kies", label: "RC-Kies (Recycling) 0/32", sia: "SN 670 062 · RC-Typ A · 0/32", unit: "t", kbobPrice: 31, category: "Kies, Aushub & Recycling" },
  { key: "rc-beton", label: "RC-Betongranulat 0/45", sia: "SN 670 062 · RC-Beton · 0/45", unit: "t", kbobPrice: 28, category: "Kies, Aushub & Recycling" },

  // Mauerwerk
  { key: "backstein", label: "Backstein / Modulziegel", sia: "SIA 266 · Modul MB", unit: "Pal.", kbobPrice: 285, category: "Mauerwerk" },
  { key: "kalksandstein", label: "Kalksandstein KS", sia: "SN EN 771-2 · KS 15/1.8", unit: "Pal.", kbobPrice: 265, category: "Mauerwerk" },
  { key: "porenbeton", label: "Porenbeton-Stein", sia: "SN EN 771-4 · PP2-0.35", unit: "Pal.", kbobPrice: 240, category: "Mauerwerk" },

  // Dämmung
  { key: "daemmung-eps", label: "Dämmung EPS 034", sia: "SIA 279 · EPS λ 0.034 W/mK", unit: "m²", kbobPrice: 27, category: "Dämmung" },
  { key: "daemmung-xps", label: "Dämmung XPS 030", sia: "SIA 279 · XPS λ 0.030 W/mK", unit: "m²", kbobPrice: 38, category: "Dämmung" },
  { key: "daemmung-steinwolle", label: "Steinwolle 035", sia: "SIA 279 · MW λ 0.035 W/mK", unit: "m²", kbobPrice: 32, category: "Dämmung" },

  // Belag & Asphalt
  { key: "asphalt-ac11", label: "Asphaltbeton AC 11", sia: "SN 640 431 · AC 11 N", unit: "t", kbobPrice: 118, category: "Belag & Asphalt" },
  { key: "asphalt-ac22", label: "Asphalt Binderschicht AC 22", sia: "SN 640 431 · AC 22 S", unit: "t", kbobPrice: 112, category: "Belag & Asphalt" },

  // Holz
  { key: "holz-kvh", label: "Konstruktionsvollholz KVH C24", sia: "SN EN 14081 · C24 · KVH", unit: "m³", kbobPrice: 640, category: "Holz" },
  { key: "holz-bsh", label: "Brettschichtholz BSH GL24h", sia: "SN EN 14080 · GL24h", unit: "m³", kbobPrice: 890, category: "Holz" },
  { key: "holz-osb", label: "OSB-/Dreischichtplatte", sia: "SN EN 300 · OSB/3", unit: "m²", kbobPrice: 24, category: "Holz" },

  // Entwässerung & Rohre
  { key: "rohr-pp", label: "Kanalrohr PP DN 200", sia: "SN EN 1852 · PP SN10 · DN 200", unit: "lfm", kbobPrice: 42, category: "Entwässerung & Rohre" },
  { key: "rohr-beton", label: "Betonrohr DN 400", sia: "SN EN 1916 · DN 400", unit: "lfm", kbobPrice: 96, category: "Entwässerung & Rohre" },
  { key: "schacht", label: "Normschacht DN 1000", sia: "SN EN 1917 · DN 1000", unit: "Stk", kbobPrice: 520, category: "Entwässerung & Rohre" },

  // Bauchemie
  { key: "moertel", label: "Trockenmörtel / Werkmörtel", sia: "SN EN 998-2 · M10", unit: "t", kbobPrice: 265, category: "Bauchemie" },
  { key: "abdichtung", label: "Bitumen-Dichtungsbahn", sia: "SN EN 13707 · Polymerbitumen", unit: "m²", kbobPrice: 21, category: "Bauchemie" },
];

export const PROC_CATEGORIES: ProcCategory[] = [
  "Beton",
  "Zement & Bindemittel",
  "Bewehrung & Stahl",
  "Kies, Aushub & Recycling",
  "Mauerwerk",
  "Dämmung",
  "Belag & Asphalt",
  "Holz",
  "Entwässerung & Rohre",
  "Bauchemie",
];

export type Tier = { tier: number; min: number; max: number | null; discount: number };

// Gestaffelter Volumenrabatt (5 Stufen, deckungsgleich mit der BundleEngine-Kurve).
export const PROC_TIERS: Tier[] = [
  { tier: 1, min: 0, max: 100, discount: 5 },
  { tier: 2, min: 101, max: 200, discount: 9 },
  { tier: 3, min: 201, max: 350, discount: 12 },
  { tier: 4, min: 351, max: 500, discount: 16 },
  { tier: 5, min: 501, max: null, discount: 20 },
];

export function tierForVolume(volume: number): Tier {
  return [...PROC_TIERS].reverse().find((t) => volume >= t.min) ?? PROC_TIERS[0];
}

export const PROC_REGIONS = [
  "Zürich",
  "Bern",
  "Nordwestschweiz",
  "Innerschweiz",
  "Ostschweiz",
  "Westschweiz",
  "Tessin",
] as const;

export const DELIVERY_WINDOWS = [
  "Innerhalb 2 Wochen",
  "Diesen Monat",
  "Nächstes Quartal (Q+1)",
  "Flexibel / auf Abruf",
] as const;
