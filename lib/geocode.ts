import "server-only";

/**
 * Adresse → Koordinaten, über die amtliche Ortssuche von swisstopo
 * (api3.geo.admin.ch). Kostenlos, kein Schlüssel, keine Registrierung, und
 * für die Schweiz genauer als jeder weltweite Dienst.
 *
 * Läuft ausschliesslich server-seitig: der Aufruf gehört nicht in den
 * Browser jedes Besuchers, und die Koordinaten werden ohnehin einmal
 * gespeichert statt bei jedem Laden neu geholt.
 */

export type GeoHit = {
  lat: number;
  lng: number;
  /** Was swisstopo gefunden hat — damit die Firma sieht, worauf sie steht. */
  label: string;
  /** Der Suchtext, der zum Treffer geführt hat. */
  query: string;
};

const ENDPOINT = "https://api3.geo.admin.ch/rest/services/api/SearchServer";

/** Die Schweiz mit etwas Rand. Alles ausserhalb ist ein Fehlgriff. */
function inSwitzerland(lat: number, lng: number) {
  return lat > 45.7 && lat < 47.9 && lng > 5.8 && lng < 10.6;
}

/** swisstopo liefert Treffer als HTML mit <b>-Auszeichnung. */
function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

type Attrs = Record<string, unknown>;

/**
 * Koordinaten aus einem Treffer lesen.
 *
 * Die Antwort führt je nach Datensatz `lat`/`lon` und zusätzlich `x`/`y`.
 * Welches Paar in WGS84 vorliegt, ist nicht über alle Ebenen gleich, darum
 * werden beide geprüft und nur übernommen, was in der Schweiz liegt —
 * statt sich auf eine Reihenfolge zu verlassen, die irgendwann kippt.
 */
function readCoords(attrs: Attrs): { lat: number; lng: number } | null {
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const pairs: [number | null, number | null][] = [
    [num(attrs.lat), num(attrs.lon)],
    [num(attrs.y), num(attrs.x)],
    [num(attrs.x), num(attrs.y)],
  ];
  for (const [lat, lng] of pairs) {
    if (lat !== null && lng !== null && inSwitzerland(lat, lng)) return { lat, lng };
  }
  return null;
}

async function search(query: string, signal: AbortSignal): Promise<GeoHit | null> {
  const url =
    `${ENDPOINT}?searchText=${encodeURIComponent(query)}` +
    `&type=locations&sr=4326&limit=5&lang=de`;

  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) return null;

  const json = (await res.json()) as { results?: { attrs?: Attrs }[] };
  for (const r of json.results ?? []) {
    if (!r.attrs) continue;
    const coords = readCoords(r.attrs);
    if (!coords) continue;
    const label = typeof r.attrs.label === "string" ? stripTags(r.attrs.label) : query;
    return { ...coords, label, query };
  }
  return null;
}

/** Baut die Suchtexte, vom Genauen zum Groben. */
export function geoQueries(c: {
  address?: string | null;
  city?: string | null;
  canton?: string | null;
}): string[] {
  const address = (c.address ?? "").replace(/\s+/g, " ").trim();
  const city = (c.city ?? "").trim();
  const canton = (c.canton ?? "").trim();

  const out: string[] = [];
  if (address && city && !address.toLowerCase().includes(city.toLowerCase())) {
    out.push(`${address}, ${city}`);
  }
  if (address) out.push(address);
  if (city && canton) out.push(`${city} ${canton}`);
  if (city) out.push(city);
  // Ohne Ort bleibt nur der Kanton — grob, aber besser als kein Punkt.
  if (!city && canton) out.push(canton);

  return Array.from(new Set(out.filter(Boolean)));
}

/**
 * Ermittelt den Standort einer Firma. Gibt `null` zurück, wenn nichts
 * Brauchbares gefunden wurde — die Karte fällt dann auf die grobe
 * Einordnung nach Ort bzw. Kanton zurück.
 */
export async function geocodeCompany(c: {
  address?: string | null;
  city?: string | null;
  canton?: string | null;
}): Promise<GeoHit | null> {
  const queries = geoQueries(c);
  if (queries.length === 0) return null;

  // Ein hängender Dienst darf das Umschalten der Zustimmung nicht blockieren.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    for (const q of queries) {
      const hit = await search(q, controller.signal);
      if (hit) return hit;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
