/**
 * Lässt nur ein sauberes ASCII-Token (JWT / opaques Session-Token) durch.
 *
 * Hintergrund: Der Rückgabewert von Clerks `getToken()` wird direkt als
 * `Authorization: Bearer <token>` gesetzt. Ist der Wert kein sauberer
 * ASCII-String (z. B. null, ein Objekt, oder — bei veralteten Sessions nach
 * einem Instanz-Wechsel — fehlerhafte/mehrbyte-Zeichen), wirft Node/undici
 * "Invalid header value ... multi-byte characters". Daher hier hart
 * validieren und im Zweifel null zurückgeben (→ Fallback auf Anon-Key).
 */
export function sanitizeAccessToken(token: unknown): string | null {
  if (typeof token !== "string") return null;
  const t = token.trim();
  if (!t) return null;
  // Session-Tokens/JWTs bestehen aus druckbarem ASCII ohne Leerzeichen.
  if (!/^[\x21-\x7E]+$/.test(t)) return null;
  return t;
}
