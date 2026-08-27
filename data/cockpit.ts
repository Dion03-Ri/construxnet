// Demo-Inhalte für das Netzwerk-Cockpit (Startseite). Werden gezeigt, solange
// noch wenige echte Firmen/Ereignisse vorhanden sind — klar als Beispiele.

export type Activity = {
  id: string;
  kind: "bundle" | "supplier" | "offer" | "match";
  text: string; // darf **fett** enthalten
  meta: string;
  cta: string;
  href: string;
};

export const DEMO_ACTIVITY: Activity[] = [
  { id: "a1", kind: "bundle", text: "**3 Firmen** bündeln gerade **Beton C25/30** in Zürich — noch **40 m³** bis **−16 %**.", meta: "Sammelphase · schliesst in 2 T 4 Std", cta: "Beitreten", href: "/beschaffung?material=beton-25" },
  { id: "a2", kind: "supplier", text: "**Vigier Beton** ist deinem **Kies-Pool Nordwestschweiz** beigetreten.", meta: "Neuer Lieferant · vor 3 Std", cta: "Ansehen", href: "/pools" },
  { id: "a3", kind: "offer", text: "**KIBAG** hat **CHF 145 / m³** in deinem Beton-Pool geboten (KBOB 156).", meta: "Neues Angebot · vor 5 Std", cta: "Angebot prüfen", href: "/pools" },
  { id: "a4", kind: "match", text: "**Gebr. Meier Hochbau** sucht denselben **Bewehrungsstahl** wie du — Tier 3 in Reichweite.", meta: "Passender Bündel-Partner · vor 8 Std", cta: "Vernetzen", href: "/network/discover" },
];

export type Group = { id: string; name: string; members: number; region: string; material: string };

export const DEMO_GROUPS: Group[] = [
  { id: "g1", name: "Beton Zürich", members: 128, region: "Zürich", material: "Beton" },
  { id: "g2", name: "Bewehrung Mittelland", members: 86, region: "Mittelland", material: "Bewehrungsstahl" },
  { id: "g3", name: "Kies & Aushub Nordwest", members: 64, region: "Nordwestschweiz", material: "Kies" },
];

// Fallback-Partner, falls (noch) keine echten Vorschläge geladen werden können.
export type DemoPartner = {
  id: string;
  name: string;
  role: "SUPPLIER" | "BUYER";
  city: string;
  verified: boolean;
  reason: string;
  tone: "gold" | "navy";
};

export const DEMO_PARTNERS: DemoPartner[] = [
  { id: "d-kibag", name: "KIBAG Baustoffe", role: "SUPPLIER", city: "Zürich", verified: true, reason: "Liefert **Beton C25/30** in Zürich — dein häufigster Bedarf.", tone: "gold" },
  { id: "d-meier", name: "Gebr. Meier Hochbau", role: "BUYER", city: "Zürich", verified: true, reason: "Braucht denselben **Bewehrungsstahl** — zusammen erreicht ihr **Tier 3 (−20 %)**.", tone: "navy" },
  { id: "d-vigier", name: "Vigier Beton Mittelland", role: "SUPPLIER", city: "Bern", verified: true, reason: "Transportbeton im Mittelland — passend für deinen Q4-Bedarf.", tone: "gold" },
];
