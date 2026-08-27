// Offene, gebündelte Bedarfe (Smart Pools). Geteilt zwischen der Pools-Übersicht
// und der Seite „Gespeicherte Pools".

export type Pool = {
  id: string;
  material: string;
  matKey: string; // Katalog-Key → im Beschaffungs-Flow vorausgewählt
  region: string;
  unit: string;
  vol: number;
  target: number;
  tier: number;
  disc: number;
  participants: number;
  phase: "OPEN" | "SEALED";
  endsInH: number; // Stunden bis Deadline
};

export const OPEN_POOLS: Pool[] = [
  { id: "p1", material: "Beton C25/30", matKey: "beton-25", region: "Zürich", unit: "m³", vol: 230, target: 300, tier: 2, disc: 12, participants: 8, phase: "OPEN", endsInH: 53 },
  { id: "p2", material: "Bewehrungsstahl B500B", matKey: "stahl-b500b", region: "Bern", unit: "t", vol: 48, target: 60, tier: 2, disc: 12, participants: 5, phase: "OPEN", endsInH: 212 },
  { id: "p3", material: "Koffer-/Wandkies 0/45", matKey: "kies-045", region: "Nordwestschweiz", unit: "t", vol: 320, target: 301, tier: 3, disc: 20, participants: 11, phase: "SEALED", endsInH: 19 },
  { id: "p4", material: "Beton C30/37", matKey: "beton-30", region: "Innerschweiz", unit: "m³", vol: 90, target: 250, tier: 1, disc: 5, participants: 3, phase: "OPEN", endsInH: 288 },
  { id: "p5", material: "Transportbeton C25/30", matKey: "beton-25", region: "Westschweiz", unit: "m³", vol: 140, target: 200, tier: 2, disc: 12, participants: 6, phase: "OPEN", endsInH: 7 },
  { id: "p6", material: "Dämmung EPS 034", matKey: "daemmung-eps", region: "Ostschweiz", unit: "m²", vol: 1800, target: 3000, tier: 2, disc: 12, participants: 4, phase: "OPEN", endsInH: 121 },
];

export const SAVED_POOLS_KEY = "cnx_saved_pools";
