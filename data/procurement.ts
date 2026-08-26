// Beschaffungs-Stammdaten (Material, SIA-Spezifikation, KBOB-Referenz, Tier-Logik).
// Bewusst eigenständig, damit der Bedarfs-Flow die BundleEngine-Logik nicht verändert.

export type ProcMaterial = {
  key: string;
  label: string;
  sia: string; // SIA-/Normspezifikation
  unit: string;
  kbobPrice: number; // offizieller KBOB-Marktpreis (CHF/Einheit)
  category: "Beton" | "Stahl" | "Kies/Aushub" | "Dämmung";
};

export const PROC_MATERIALS: ProcMaterial[] = [
  { key: "beton-25", label: "Beton C25/30", sia: "SN EN 206 · C25/30 · Cl 0.20 · Dmax 32 · XC3", unit: "m³", kbobPrice: 156, category: "Beton" },
  { key: "beton-30", label: "Beton C30/37", sia: "SN EN 206 · C30/37 · Cl 0.20 · Dmax 32 · XC4", unit: "m³", kbobPrice: 168, category: "Beton" },
  { key: "stahl-b500b", label: "Bewehrungsstahl B500B", sia: "SIA 262 · B500B · Ring / Stäbe", unit: "t", kbobPrice: 1120, category: "Stahl" },
  { key: "kies-045", label: "Koffer-/Wandkies 0/45", sia: "SN 670 · ungebrochen 0/45", unit: "t", kbobPrice: 39, category: "Kies/Aushub" },
  { key: "rc-kies", label: "RC-Kies (Recycling) 0/32", sia: "SN 670 062 · RC-Typ A · 0/32", unit: "t", kbobPrice: 31, category: "Kies/Aushub" },
  { key: "daemmung-eps", label: "Dämmung EPS 034", sia: "SIA 279 · EPS λ 0.034 W/mK", unit: "m²", kbobPrice: 27, category: "Dämmung" },
];

export type Tier = { tier: number; min: number; max: number | null; discount: number };

// Gestaffelter Volumenrabatt (ConstruxNet-Staffel 5/12/20 %).
export const PROC_TIERS: Tier[] = [
  { tier: 1, min: 0, max: 100, discount: 5 },
  { tier: 2, min: 101, max: 300, discount: 12 },
  { tier: 3, min: 301, max: null, discount: 20 },
];

export function tierForVolume(volume: number): Tier {
  return (
    PROC_TIERS.find((t) => volume >= t.min && (t.max === null || volume <= t.max)) ??
    PROC_TIERS[0]
  );
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
