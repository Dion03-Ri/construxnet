/**
 * Zahlen im Schweizer Format — an EINER Stelle.
 *
 * `Intl.NumberFormat("de-CH")` liefert nicht überall dasselbe Zeichen als
 * Tausendertrenner: Node schreibt den geraden Apostroph `'`, Chrome den
 * typografischen `’`. Wird eine Zahl auf dem Server gerendert und im
 * Browser wieder aufgebaut, hält React das für unterschiedliches HTML und
 * zeichnet den ganzen Teilbaum neu — genau der Hydration-Fehler, der auf
 * `/beschaffung` bei jedem Aufruf auftrat („1'120" gegen „1’120").
 *
 * Deshalb wird der Trenner hier festgeschrieben, statt ihn der jeweiligen
 * Laufzeit zu überlassen. Die Bundeskanzlei schreibt für Zahlen den
 * typografischen Apostroph vor, also der.
 *
 * Sechs Bausteine hatten je eine eigene Kopie dieser Funktion. Wer eine
 * siebte braucht, nimmt diese hier.
 */

const SWISS_GROUP = "’"; // ’

/** Gruppiert nach Schweizer Konvention, mit fester Anzahl Nachkommastellen. */
export function chf(value: number, decimals = 0): string {
  const raw = new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  // Jeden Trenner, den die Laufzeit gewählt hat, auf unseren vereinheitlichen.
  return raw.replace(/['’  ]/g, SWISS_GROUP);
}

/**
 * Nachkommastellen nach Grössenordnung.
 *
 * Ein Kubikmeterpreis von 156.12 braucht zwei Stellen, ein Volumen von
 * 1'120 m³ keine, und ein Literpreis von 2.008 drei. Ohne diese Regel
 * stünde entweder überall „156.—" oder überall „1'120.00".
 */
export function decimalsFor(value: number): number {
  return value >= 300 ? 0 : value >= 10 ? 2 : 3;
}

/** Wie `chf`, aber die Nachkommastellen ergeben sich aus der Grösse. */
export function chfAuto(value: number): string {
  return chf(value, decimalsFor(value));
}
