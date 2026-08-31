// Preview-Gate (Passwortschutz während der Entwicklungsphase).
//
// Aktiv, sobald die Env-Variable PREVIEW_PASSWORD gesetzt ist. Zum öffentlichen
// Launch einfach PREVIEW_PASSWORD in Vercel entfernen → Gate ist aus.
//
// Das Passwort steht NUR serverseitig (Env). Im Browser liegt lediglich ein
// httpOnly-Cookie mit einem SHA-256-Token, das die Middleware prüft.

export const PREVIEW_COOKIE = "cnx_preview";

/** SHA-256 als Hex — funktioniert in Edge-Middleware und Node-Route-Handlern. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Nur interne Pfade als Weiterleitungsziel zulassen (kein Open-Redirect). */
export function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}
