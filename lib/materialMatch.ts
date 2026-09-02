import { PROC_MATERIALS, type ProcMaterial } from "@/data/procurement";

/**
 * Materialabgleich: freie Eingabe auf eine Materialnummer bringen.
 *
 * Warum das der Kern des Produkts ist: gebündelt wird auf der Nummer.
 * Solange „Beton C25/30", „Transportbeton 25/30" und „Beton 25er" als drei
 * verschiedene Dinge im System liegen, verteilen sich drei Firmen mit
 * demselben Bedarf auf drei Töpfe und niemand erreicht eine Rabattstufe.
 *
 * Der Abgleich läuft in drei Stufen, von billig nach teuer:
 *   1. Alias-Nachschlag  — schon einmal zugeordnet, kein Rechnen nötig
 *   2. Deterministisch   — diese Datei, Normkürzel und Wortüberschneidung
 *   3. KI                — nur was Stufe 1 und 2 offenlassen (noch offen)
 *
 * Stufe 2 trägt bei Baustoffen weit, weil die Normbezeichnung sehr
 * aussagekräftig ist: wer „C25/30" schreibt, meint Beton C25/30 — egal ob
 * davor „Transport-", „Ort-" oder gar nichts steht.
 */

/* -------------------------------------------------------------------------- */
/*  Normalisierung                                                            */
/* -------------------------------------------------------------------------- */

/** Gängige Schreibweisen, die dasselbe meinen. */
const SYNONYMS: Record<string, string> = {
  transportbeton: "beton",
  ortbeton: "beton",
  frischbeton: "beton",
  fertigbeton: "beton",
  armierung: "bewehrung",
  armierungsstahl: "bewehrungsstahl",
  moniereisen: "bewehrungsstahl",
  betonstahl: "bewehrungsstahl",
  rundeisen: "bewehrungsstahl",
  baustahlgewebe: "baustahlmatten",
  matten: "baustahlmatten",
  kies: "kies",
  splitt: "kies",
  schotter: "kies",
  daemmplatte: "daemmung",
  isolation: "daemmung",
  waermedaemmung: "daemmung",
  styropor: "eps",
  steinwolle: "steinwolle",
  mineralwolle: "steinwolle",
  glaswolle: "steinwolle",
  backstein: "backstein",
  ziegel: "backstein",
  modulziegel: "backstein",
  belag: "asphalt",
  deckbelag: "asphalt",
  tragschicht: "asphalt",
  moertel: "moertel",
  werkmoertel: "moertel",
  trockenmoertel: "moertel",
  zement: "zement",
  bindemittel: "zement",
  estrich: "estrich",
  unterlagsboden: "estrich",
  abdichtung: "abdichtung",
  dichtungsbahn: "abdichtung",
  schacht: "schacht",
  normschacht: "schacht",
};

/** Umlaute ausschreiben, Satzzeichen weg, alles klein. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9/.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Die aussagekräftigen Kürzel aus einem Text ziehen.
 *
 * Betonfestigkeit (C25/30), Stahlsorte (B500B), Körnung (0/45),
 * Nennweite (DN 400), Dämmstoffart (EPS/XPS), Gipsplatte (GKB/GKF),
 * Stahlprofil (S235) und Mattentyp (Q188).
 */
export function specTokens(input: string): string[] {
  const n = normalize(input);
  const out = new Set<string>();

  for (const m of n.matchAll(/\bc\s?(\d{1,2})\/(\d{2})\b/g)) out.add(`c${m[1]}/${m[2]}`);
  for (const m of n.matchAll(/\bb\s?(\d{3})([ab])?\b/g)) out.add(`b${m[1]}${m[2] ?? ""}`);
  for (const m of n.matchAll(/\bs\s?(\d{3})\b/g)) out.add(`s${m[1]}`);
  for (const m of n.matchAll(/\bq\s?(\d{3})\b/g)) out.add(`q${m[1]}`);
  for (const m of n.matchAll(/\bdn\s?(\d{2,4})\b/g)) out.add(`dn${m[1]}`);
  for (const m of n.matchAll(/\b(\d{1,2})\/(\d{1,2})\b/g)) {
    // Körnung wie 0/45 — Festigkeitsklassen sind oben schon erfasst.
    if (!n.includes(`c${m[1]}/${m[2]}`)) out.add(`${m[1]}/${m[2]}`);
  }
  for (const kw of ["eps", "xps", "gkb", "gkf", "gkbi", "kvh", "bsh", "osb", "ac11", "ac22", "ks", "pp"]) {
    if (new RegExp(`\\b${kw}\\b`).test(n)) out.add(kw);
  }
  return [...out];
}

/** Wörter eines Textes, Synonyme aufgelöst, Füllwörter raus. */
const STOPWORDS = new Set(["und", "oder", "mit", "fuer", "der", "die", "das", "je", "pro", "ca", "ab"]);

export function tokens(input: string): string[] {
  return normalize(input)
    .split(" ")
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    .map((t) => SYNONYMS[t] ?? t);
}

/**
 * Gehören zwei Wörter zusammen?
 *
 * Deutsch setzt zusammen: „Unterlagsboden" wird zu „Estrich", der im
 * Katalog „Zementestrich" heisst; „Wandkies" enthält „Kies". Ohne diese
 * Regel findet der Abgleich genau die Fälle nicht, für die es ihn gibt.
 * Vier Zeichen Mindestlänge, damit nicht jedes Fragment auf alles passt.
 */
function related(a: string, b: string): number {
  if (a === b) return 1;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  // Ein Teilwort-Treffer zählt weniger als ein exakter: "Beton" steckt auch
  // in "Asphaltbeton", ohne dass die beiden dasselbe wären.
  return short.length >= 4 && long.includes(short) ? 0.6 : 0;
}

/* -------------------------------------------------------------------------- */
/*  Bewertung                                                                 */
/* -------------------------------------------------------------------------- */

export type MatchResult = {
  material: ProcMaterial;
  /** 0–1. Ab 0.8 sicher, ab 0.45 zeigenswert, darunter verworfen. */
  score: number;
  /** Was den Ausschlag gab — wird dem Nutzer gezeigt. */
  reason: string;
};

/**
 * Kandidaten für eine freie Eingabe, beste zuerst.
 *
 * Die Normkürzel wiegen schwer: eine Übereinstimmung bei „c25/30" ist
 * mehr wert als drei gemeinsame Wörter, weil sie das Material eindeutig
 * festlegt. Reine Wortüberschneidung allein reicht nie für Gewissheit —
 * „Beton" passt auf sechs Positionen.
 */
export function matchMaterial(
  input: string,
  limit = 3,
  /** Worin gesucht wird. Standard ist der feste Katalog; wo eigene und
   *  freigegebene Materialien dazugehören, wird die erweiterte Liste
   *  übergeben — sonst findet der Abgleich genau die nicht. */
  catalog: ProcMaterial[] = PROC_MATERIALS,
): MatchResult[] {
  const q = normalize(input);
  if (q.length < 2) return [];

  const qSpecs = specTokens(input);
  const qTokens = tokens(input);
  if (qTokens.length === 0 && qSpecs.length === 0) return [];

  const results: MatchResult[] = [];

  for (const m of catalog) {
    const haystack = `${m.label} ${m.sia}`;
    const mSpecs = specTokens(haystack);
    const mTokens = tokens(m.label);

    const specHits = qSpecs.filter((s) => mSpecs.includes(s));
    // Je Suchwort der beste Treffer im Materialnamen.
    const hitWeights = qTokens.map((t) => Math.max(0, ...mTokens.map((mt) => related(t, mt))));
    const hitSum = hitWeights.reduce((a, b) => a + b, 0);
    const tokenHits = qTokens.filter((_, i) => hitWeights[i] > 0);

    if (specHits.length === 0 && hitSum === 0) continue;

    // Normkürzel bestätigen, Wörter tragen. Ein Normkürzel in der Eingabe,
    // das auf nichts passt (Q188 kennt der Katalog nicht), darf die
    // Wortüberschneidung nicht zunichtemachen — deshalb addiert sich der
    // Normanteil, statt zu multiplizieren.
    const specScore = qSpecs.length ? (specHits.length / qSpecs.length) * 0.7 : 0;
    // Gemessen an dem, was der Nutzer geschrieben hat: seine Wörter sollen
    // erklärt sein. Am Katalognamen zu messen würde einwortige Positionen
    // bevorzugen — "Asphaltbeton" bekäme für ein Teilwort die volle Punktzahl.
    const tokenScore = (hitSum / (qTokens.length || 1)) * 0.6;

    // Ganze Bezeichnung enthalten — starkes Signal, aber kein Beweis.
    const contains = normalize(m.label).includes(q) || q.includes(normalize(m.label)) ? 0.2 : 0;

    const score = Math.min(1, specScore + tokenScore + contains);
    if (score < 0.3) continue;

    const reason = specHits.length
      ? `Normbezeichnung ${specHits.join(", ").toUpperCase()} stimmt überein`
      : tokenHits.length
        ? `Übereinstimmung bei ${tokenHits.join(", ")}`
        : "ähnliche Bezeichnung";

    results.push({ material: m, score, reason });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Ab hier gilt eine Zuordnung als sicher genug für automatisches Setzen. */
export const CERTAIN = 0.8;
/** Darunter wird gar nichts vorgeschlagen. */
export const WORTH_SHOWING = 0.45;
