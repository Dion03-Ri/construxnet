// Preview-Gate (Passwortschutz während der Entwicklungsphase).
//
// Aktiv, sobald die Env-Variable PREVIEW_PASSWORD gesetzt ist. Zum öffentlichen
// Launch einfach PREVIEW_PASSWORD in Vercel entfernen → Gate ist aus.
//
// Das Passwort steht NUR serverseitig (Env). Im Browser liegt lediglich ein
// httpOnly-Cookie mit einem SHA-256-Token, das die Middleware prüft.

export const PREVIEW_COOKIE = "cnx_preview";

/**
 * Das gültige Zugangs-Passwort — ausschliesslich aus der Umgebung.
 *
 * Früher stand hier ein fester Standardwert als Rückfalloption. Der machte
 * die Sperre genau so stark wie die Verschwiegenheit des Repositorys: wer
 * den Code sah, kam vorbei. Er ist entfernt.
 *
 * Ist nichts gesetzt, gibt es null — und damit keinen Weg hinein. Das ist
 * Absicht: eine Sperre, die bei fehlender Konfiguration jeden durchlässt,
 * ist keine. Ein leeres Passwort darf niemals passen.
 */
export function getBypassPassword(): string | null {
  const pw = process.env.PREVIEW_PASSWORD?.trim();
  return pw && pw.length > 0 ? pw : null;
}

/** SHA-256 als Hex — funktioniert in Edge-Middleware und Node-Route-Handlern. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Zeichenkettenvergleich mit gleichbleibender Laufzeit.
 *
 * Ein gewöhnliches `===` bricht beim ersten abweichenden Zeichen ab. Aus
 * den Laufzeitunterschieden lässt sich ein Passwort zeichenweise erraten.
 * Über das Netz ist das schwer auszunutzen, aber der Aufwand hier ist
 * eine Zeile.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  // Längenunterschied darf den Vergleich nicht verkürzen.
  let diff = ab.length ^ bb.length;
  const n = Math.max(ab.length, bb.length);
  for (let i = 0; i < n; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

/** Nur interne Pfade als Weiterleitungsziel zulassen (kein Open-Redirect). */
export function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}
