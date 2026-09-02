/**
 * Einfache Ratenbegrenzung im Arbeitsspeicher.
 *
 * Was sie leistet: sie stoppt das schnelle Durchprobieren von Passwörtern
 * und das Zuspammen der Warteliste von einer Quelle aus.
 *
 * Was sie nicht leistet: auf Vercel läuft jede Instanz für sich, und
 * Instanzen kommen und gehen. Ein verteilter Angriff über viele Adressen
 * oder über längere Zeit läuft daran vorbei. Für einen dauerhaften Schutz
 * braucht es einen gemeinsamen Speicher — Upstash, Vercel KV oder eine
 * Tabelle in Supabase.
 *
 * Bewusst trotzdem so gebaut: das Naheliegende zu verhindern kostet hier
 * nichts, und ein ehrlicher Hinweis auf die Grenze ist mehr wert als eine
 * Lösung, die mehr verspricht als sie hält.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Verhindert, dass die Map bei vielen Adressen unbegrenzt wächst. */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export type RateResult = { ok: boolean; retryAfterSec: number };

export function rateLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);

  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > max) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/**
 * Aufrufer-Kennung aus den Proxy-Kopfzeilen.
 *
 * Hinter Vercel ist x-forwarded-for verlässlich; der erste Eintrag ist die
 * echte Gegenstelle. Fehlt alles, wird auf einen gemeinsamen Schlüssel
 * zurückgefallen — dann greift die Grenze eben für alle zusammen, was
 * immer noch besser ist als keine.
 */
export function callerKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unbekannt";
  return `${scope}:${ip}`;
}
