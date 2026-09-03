/**
 * Rechtliche Eckdaten an EINER Stelle.
 *
 * Alles, was mit `[[` beginnt, ist noch nicht gesetzt. Die Rechtsseiten
 * zeigen solche Stellen sichtbar in Gold statt sie stillschweigend als Text
 * auszugeben — ein Impressum mit "[[Strasse]]" darin fällt so sofort auf,
 * statt monatelang unbemerkt online zu stehen.
 *
 * Zum Ausfüllen: die Werte hier ersetzen, sonst nichts.
 */
export const LEGAL = {
  /** Rechtsträger hinter der Plattform, wie im Handelsregister eingetragen. */
  betreiberin: "[[Rechtsträger, z. B. Obtanet AG]]",
  /** Rechtsform, falls nicht schon im Namen enthalten. */
  rechtsform: "[[AG / GmbH / Einzelunternehmen]]",
  strasse: "[[Strasse und Nummer]]",
  plzOrt: "[[PLZ und Ort]]",
  land: "Schweiz",
  /** Pflichtangabe nach Art. 3 Abs. 1 lit. s UWG — ein Formular genügt nicht. */
  email: "[[kontakt@obtanet.com]]",
  telefon: "[[+41 …]]",
  /** Unternehmens-Identifikationsnummer, falls im Handelsregister eingetragen. */
  uid: "[[CHE-123.456.789]]",
  handelsregister: "[[Handelsregisteramt des Kantons …]]",
  /** Nur angeben, wenn tatsächlich MWST-pflichtig. */
  mwst: "[[CHE-123.456.789 MWST — oder: nicht MWST-pflichtig]]",
  vertretung: "[[zeichnungsberechtigte Person]]",
  /** Vereinbarter Gerichtsstand (unter Firmen zulässig, Art. 17 ZPO). */
  gerichtsstand: "[[Sitz der Betreiberin, z. B. Zürich]]",
  /** Vermittlungsentgelt gegenüber dem Werk, in Prozent des Auftragswerts. */
  kommission: "[[…]]",
  /** Region, in der die Supabase-Instanz läuft (im Supabase-Projekt ablesbar). */
  datenbankRegion: "[[z. B. EU (Frankfurt) — im Supabase-Projekt nachsehen]]",
  /** Datum der letzten Anpassung dieser Dokumente. */
  stand: "September 2026",
} as const;

/** Noch nicht ausgefüllt? */
export function isOpen(value: string) {
  return value.trim().startsWith("[[");
}
