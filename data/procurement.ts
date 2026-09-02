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
  /** Obtanet-Materialnummer, z. B. "OB-BET-001". Siehe CATEGORY_CODE. */
  id: string;
  label: string;
  sia: string; // SIA-/Normspezifikation
  unit: string;
  kbobPrice: number; // offizieller KBOB-Marktpreis (CHF/Einheit)
  category: ProcCategory;
};

/**
 * Dreistelliger Kürzel je Kategorie. Die Materialnummer setzt sich daraus
 * zusammen: OB-<Kategorie>-<laufende Nummer>, z. B. OB-BET-001.
 *
 * Die Nummer ist die stabile Kennung nach aussen — auf Anfragen, Angeboten,
 * Bestellungen und Verträgen. Der interne Schlüssel (key) bleibt daneben
 * bestehen, weil URLs und Vorauswahlen darauf zeigen.
 *
 * Codes einmal vergeben heisst: nie wieder ändern. Wird eine Position aus
 * dem Katalog genommen, bleibt ihre Nummer trotzdem belegt, damit alte
 * Bestellungen lesbar bleiben.
 */
export const CATEGORY_CODE: Record<ProcCategory, string> = {
  "Beton": "BET",                       // Beton
  "Zement & Bindemittel": "ZEM",        // Zement — das Leitwort der Gruppe
  "Bewehrung & Stahl": "BST",           // BewehrungsSTahl
  "Kies, Aushub & Recycling": "KAR",    // Kies, Aushub, Recycling
  "Mauerwerk": "MAU",                   // Mauerwerk
  "Dämmung": "DAE",                     // Dämmung (ä → ae)
  "Belag & Asphalt": "BAS",             // Belag, ASphalt
  "Holz": "HOL",                        // Holz
  "Entwässerung & Rohre": "ENR",        // ENtwässerung, Rohre
  "Bauchemie": "BCH",                   // BauCHemie — "BAU" wäre zu allgemein
};
// Kuratierter Katalog der gängigsten Baustoffe. Er ist bewusst breit — gebündelt
// werden kann grundsätzlich jedes Material; wo etwas fehlt, gibt es im
// Beschaffungs-Flow „Weiteres Material (frei)".
export const PROC_MATERIALS: ProcMaterial[] = [
  // Beton
  { key: "beton-25", id: "OB-BET-001", label: "Beton C25/30", sia: "SN EN 206 · C25/30 · Cl 0.20 · Dmax 32 · XC3", unit: "m³", kbobPrice: 156, category: "Beton" },
  { key: "beton-30", id: "OB-BET-002", label: "Beton C30/37", sia: "SN EN 206 · C30/37 · Cl 0.20 · Dmax 32 · XC4", unit: "m³", kbobPrice: 168, category: "Beton" },
  { key: "beton-20", id: "OB-BET-003", label: "Beton C20/25", sia: "SN EN 206 · C20/25 · Dmax 32 · XC2", unit: "m³", kbobPrice: 148, category: "Beton" },
  { key: "beton-35", id: "OB-BET-004", label: "Beton C35/45 (wasserdicht)", sia: "SN EN 206 · C35/45 · XC4/XD3 · Dmax 32", unit: "m³", kbobPrice: 192, category: "Beton" },
  { key: "beton-mager", id: "OB-BET-005", label: "Magerbeton / Sauberkeitsschicht", sia: "SN EN 206 · C8/10 · Dmax 32", unit: "m³", kbobPrice: 128, category: "Beton" },
  { key: "estrich", id: "OB-BET-006", label: "Zementestrich CT-C25-F4", sia: "SN EN 13813 · CT-C25-F4", unit: "m²", kbobPrice: 34, category: "Beton" },

  // Zement & Bindemittel
  { key: "zement-cem2", id: "OB-ZEM-001", label: "Zement CEM II/A-LL 42.5 N", sia: "SN EN 197-1 · CEM II/A-LL 42.5 N", unit: "t", kbobPrice: 178, category: "Zement & Bindemittel" },
  { key: "zement-cem1", id: "OB-ZEM-002", label: "Zement CEM I 52.5 R", sia: "SN EN 197-1 · CEM I 52.5 R", unit: "t", kbobPrice: 205, category: "Zement & Bindemittel" },
  { key: "kalk", id: "OB-ZEM-003", label: "Baukalk CL 90", sia: "SN EN 459-1 · CL 90-S", unit: "t", kbobPrice: 235, category: "Zement & Bindemittel" },

  // Bewehrung & Stahl
  { key: "stahl-b500b", id: "OB-BST-001", label: "Bewehrungsstahl B500B", sia: "SIA 262 · B500B · Ring / Stäbe", unit: "t", kbobPrice: 1120, category: "Bewehrung & Stahl" },
  { key: "stahl-matten", id: "OB-BST-002", label: "Baustahlmatten B500A", sia: "SIA 262 · B500A · Lagermatten", unit: "t", kbobPrice: 1180, category: "Bewehrung & Stahl" },
  { key: "stahl-profil", id: "OB-BST-003", label: "Stahlprofile S235/S355", sia: "SN EN 10025 · S235JR / S355J2", unit: "t", kbobPrice: 1650, category: "Bewehrung & Stahl" },

  // Kies, Aushub & Recycling
  { key: "kies-045", id: "OB-KAR-001", label: "Koffer-/Wandkies 0/45", sia: "SN 670 · ungebrochen 0/45", unit: "t", kbobPrice: 39, category: "Kies, Aushub & Recycling" },
  { key: "kies-032", id: "OB-KAR-002", label: "Rundkies 0/32", sia: "SN 670 · ungebrochen 0/32", unit: "t", kbobPrice: 42, category: "Kies, Aushub & Recycling" },
  { key: "sand-04", id: "OB-KAR-003", label: "Betonsand 0/4", sia: "SN EN 12620 · 0/4", unit: "t", kbobPrice: 44, category: "Kies, Aushub & Recycling" },
  { key: "rc-kies", id: "OB-KAR-004", label: "RC-Kies (Recycling) 0/32", sia: "SN 670 062 · RC-Typ A · 0/32", unit: "t", kbobPrice: 31, category: "Kies, Aushub & Recycling" },
  { key: "rc-beton", id: "OB-KAR-005", label: "RC-Betongranulat 0/45", sia: "SN 670 062 · RC-Beton · 0/45", unit: "t", kbobPrice: 28, category: "Kies, Aushub & Recycling" },

  // Mauerwerk
  { key: "backstein", id: "OB-MAU-001", label: "Backstein / Modulziegel", sia: "SIA 266 · Modul MB", unit: "Pal.", kbobPrice: 285, category: "Mauerwerk" },
  { key: "kalksandstein", id: "OB-MAU-002", label: "Kalksandstein KS", sia: "SN EN 771-2 · KS 15/1.8", unit: "Pal.", kbobPrice: 265, category: "Mauerwerk" },
  { key: "porenbeton", id: "OB-MAU-003", label: "Porenbeton-Stein", sia: "SN EN 771-4 · PP2-0.35", unit: "Pal.", kbobPrice: 240, category: "Mauerwerk" },

  // Dämmung
  { key: "daemmung-eps", id: "OB-DAE-001", label: "Dämmung EPS 034", sia: "SIA 279 · EPS λ 0.034 W/mK", unit: "m²", kbobPrice: 27, category: "Dämmung" },
  { key: "daemmung-xps", id: "OB-DAE-002", label: "Dämmung XPS 030", sia: "SIA 279 · XPS λ 0.030 W/mK", unit: "m²", kbobPrice: 38, category: "Dämmung" },
  { key: "daemmung-steinwolle", id: "OB-DAE-003", label: "Steinwolle 035", sia: "SIA 279 · MW λ 0.035 W/mK", unit: "m²", kbobPrice: 32, category: "Dämmung" },

  // Belag & Asphalt
  { key: "asphalt-ac11", id: "OB-BAS-001", label: "Asphaltbeton AC 11", sia: "SN 640 431 · AC 11 N", unit: "t", kbobPrice: 118, category: "Belag & Asphalt" },
  { key: "asphalt-ac22", id: "OB-BAS-002", label: "Asphalt Binderschicht AC 22", sia: "SN 640 431 · AC 22 S", unit: "t", kbobPrice: 112, category: "Belag & Asphalt" },

  // Holz
  { key: "holz-kvh", id: "OB-HOL-001", label: "Konstruktionsvollholz KVH C24", sia: "SN EN 14081 · C24 · KVH", unit: "m³", kbobPrice: 640, category: "Holz" },
  { key: "holz-bsh", id: "OB-HOL-002", label: "Brettschichtholz BSH GL24h", sia: "SN EN 14080 · GL24h", unit: "m³", kbobPrice: 890, category: "Holz" },
  { key: "holz-osb", id: "OB-HOL-003", label: "OSB-/Dreischichtplatte", sia: "SN EN 300 · OSB/3", unit: "m²", kbobPrice: 24, category: "Holz" },

  // Entwässerung & Rohre
  { key: "rohr-pp", id: "OB-ENR-001", label: "Kanalrohr PP DN 200", sia: "SN EN 1852 · PP SN10 · DN 200", unit: "lfm", kbobPrice: 42, category: "Entwässerung & Rohre" },
  { key: "rohr-beton", id: "OB-ENR-002", label: "Betonrohr DN 400", sia: "SN EN 1916 · DN 400", unit: "lfm", kbobPrice: 96, category: "Entwässerung & Rohre" },
  { key: "schacht", id: "OB-ENR-003", label: "Normschacht DN 1000", sia: "SN EN 1917 · DN 1000", unit: "Stk", kbobPrice: 520, category: "Entwässerung & Rohre" },

  // Bauchemie
  { key: "moertel", id: "OB-BCH-001", label: "Trockenmörtel / Werkmörtel", sia: "SN EN 998-2 · M10", unit: "t", kbobPrice: 265, category: "Bauchemie" },
  { key: "abdichtung", id: "OB-BCH-002", label: "Bitumen-Dichtungsbahn", sia: "SN EN 13707 · Polymerbitumen", unit: "m²", kbobPrice: 21, category: "Bauchemie" },
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

/** Nachschlagen über die Materialnummer, gross-/kleinschreibungsegal. */
export function materialById(id: string): ProcMaterial | undefined {
  const needle = id.trim().toUpperCase();
  return PROC_MATERIALS.find((m) => m.id === needle);
}

/**
 * Passt der Suchbegriff auf dieses Material?
 *
 * Sucht über Bezeichnung, Norm und Materialnummer. Die Nummer auch ohne
 * Präfix und ohne Bindestriche, damit "bet001" und "OB-BET-001" beide
 * treffen — abgetippte Nummern kommen selten sauber an.
 */
export function matchesMaterial(m: ProcMaterial, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const flatId = m.id.toLowerCase().replace(/[^a-z0-9]/g, "");
  const flatQ = q.replace(/[^a-z0-9]/g, "");
  return (
    m.label.toLowerCase().includes(q) ||
    m.sia.toLowerCase().includes(q) ||
    m.id.toLowerCase().includes(q) ||
    (flatQ.length >= 3 && flatId.includes(flatQ.replace(/^ob/, "")))
  );
}

/**
 * Nummer für ein selbst angelegtes Material.
 *
 * Solche Materialien stehen noch in keinem gemeinsamen Katalog, deshalb
 * das Kürzel EIG statt einer Kategorie und eine laufende Nummer je
 * Sitzung. Sobald eigene Materialien in der Datenbank landen und für
 * andere Firmen freigegeben werden, bekommen sie eine echte Nummer.
 */
export function ownMaterialId(index: number): string {
  return `OB-EIG-${String(index + 1).padStart(3, "0")}`;
}

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
