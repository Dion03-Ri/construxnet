// Demo-Inhalte, damit Feed & Widgets nie leer wirken (Fallback, wenn noch
// keine echten Daten in Supabase liegen).

export type MockCompany = {
  company_name: string;
  city: string | null;
  verified: boolean;
  logo_url: string | null;
};

export type MockPost = {
  id: string;
  post_type: string;
  title: string | null;
  content: string;
  region: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  company_id: string;
  companies: MockCompany;
  gradient?: string;
  demo?: boolean;
};

const H = 3600_000;

export const SAMPLE_POSTS: MockPost[] = [
  {
    id: "demo-1",
    post_type: "MATERIAL_OFFER",
    title: "Freie Kapazität: Beton C25/30 – Raum Zürich, Q4",
    content:
      "Wir haben kurzfristig ~600 m³ Transportbeton C25/30 (Cl 0.20, Dmax 32) frei. Lieferradius Limmattal ≤ 25 km. Interessierte Bauunternehmen können einen Smart Pool starten – aktueller Tier-Rabatt bereits bei 12 %.",
    region: "Zürich",
    likes_count: 34,
    comments_count: 8,
    created_at: new Date(Date.now() - 2 * H).toISOString(),
    company_id: "seed-kibag",
    companies: { company_name: "KIBAG Baustoffe", city: "Zürich", verified: true, logo_url: null },
    gradient: "from-sky-500/25 via-sky-400/10 to-emerald-400/20",
  },
  {
    id: "demo-2",
    post_type: "PROJECT",
    title: "Neubau Wohnüberbauung Bern-West – Partner gesucht",
    content:
      "Baustart Frühling 2026, 42 Wohneinheiten. Wir bündeln Armierungsstahl B500B (~48 t) und suchen regionale Werke für die Sealed-Bid-Phase. Wer liefert im Raum Bern zuverlässig nach SN EN?",
    region: "Bern",
    likes_count: 21,
    comments_count: 5,
    created_at: new Date(Date.now() - 6 * H).toISOString(),
    company_id: "seed-meier",
    companies: { company_name: "Gebr. Meier Hochbau AG", city: "Bern", verified: true, logo_url: null },
  },
  {
    id: "demo-3",
    post_type: "ANNOUNCEMENT",
    title: "Neue Recycling-Linie in Betrieb",
    content:
      "Ab sofort liefern wir RC-Kies aus unserer neuen Aufbereitungsanlage – nachhaltig und preisstabil. Erste Pools in der Nordwestschweiz laufen bereits.",
    region: "Nordwestschweiz",
    likes_count: 47,
    comments_count: 12,
    created_at: new Date(Date.now() - 20 * H).toISOString(),
    company_id: "seed-togg",
    companies: { company_name: "Toggenburger Kies AG", city: "Wil", verified: false, logo_url: null },
    gradient: "from-emerald-500/25 via-emerald-400/10 to-amber-400/15",
  },
  {
    id: "demo-4",
    post_type: "UPDATE",
    title: null,
    content:
      "Rückblick auf ein starkes Quartal: über 1'200 m³ Beton gebündelt, Ø 13.8 % Ersparnis für unsere Poolteilnehmer. Danke an alle Partner in der Innerschweiz! 🚧",
    region: "Innerschweiz",
    likes_count: 63,
    comments_count: 9,
    created_at: new Date(Date.now() - 30 * H).toISOString(),
    company_id: "seed-rhomberg",
    companies: { company_name: "Rhomberg Bau AG", city: "Luzern", verified: true, logo_url: null },
  },
];

export const SAMPLE_PARTNERS: {
  id: string;
  company_name: string;
  role: string;
  city: string | null;
  verified: boolean;
}[] = [
  { id: "seed-kibag", company_name: "KIBAG Baustoffe", role: "SUPPLIER", city: "Zürich", verified: true },
  { id: "seed-vigier", company_name: "Vigier Beton Mittelland", role: "SUPPLIER", city: "Bern", verified: true },
  { id: "seed-meier", company_name: "Gebr. Meier Hochbau AG", role: "BUYER", city: "Bern", verified: true },
  { id: "seed-rhomberg", company_name: "Rhomberg Bau AG", role: "BUYER", city: "Luzern", verified: true },
];

export const GEWERKE = [
  "#Betonbau",
  "#Hochbau_Zürich",
  "#Aushub",
  "#Armierung",
  "#Tiefbau",
];
