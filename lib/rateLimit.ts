/**
 * Ratenbegrenzung.
 *
 * ZWEI STUFEN, und beide werden gebraucht:
 *
 * 1. Im Arbeitsspeicher (`rateLimit`). Schnell, ohne Netz, faengt den
 *    schnellen Ansturm auf DERSELBEN Instanz ab.
 * 2. Gemeinsam (`rateLimitShared`), ueber die Tabelle `rate_limits` in
 *    Supabase. Auf Vercel laeuft jede Instanz fuer sich, und Instanzen
 *    kommen und gehen — ohne gemeinsamen Speicher bekommt, wer ein
 *    Passwort durchprobiert, bei jeder neuen Instanz zehn frische
 *    Versuche. Damit waere die Grenze eine Bremse gewesen, kein Schutz.
 *
 * Warum kein Redis: eine Tabelle in Supabase kostet kein weiteres Konto,
 * keine weiteren Zugangsdaten und keine weitere Sache, die ausfallen
 * kann. Ein Zugriff pro Anfrage auf eine Tabelle mit Primaerschluessel
 * faellt neben dem Rest nicht auf.
 *
 * Wenn die Datenbank nicht antwortet, bleibt Stufe 1 stehen. Das ist die
 * bewusste Entscheidung: eine Anmeldeseite, die bei einer
 * Datenbankstoerung gar niemanden mehr durchlaesst, waere schlimmer als
 * eine, die kurzzeitig nur je Instanz begrenzt.
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

/**
 * Dieselbe Grenze, aber ueber alle Instanzen hinweg.
 *
 * Erst der Speicher-Zaehler (kostet nichts und faengt das Naheliegende
 * ab), dann der gemeinsame. Wer schon an Stufe 1 scheitert, erzeugt gar
 * keine Datenbanklast.
 */
export async function rateLimitShared(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateResult> {
  const lokal = rateLimit(key, max, windowMs);
  if (!lokal.ok) return lokal;

  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    const { data, error } = await supabaseAdmin().rpc("rate_hit", {
      p_key: key,
      p_max: max,
      p_window_ms: windowMs,
    });
    if (error) return lokal;
    const zeile = (Array.isArray(data) ? data[0] : data) as
      | { ok: boolean; retry_after_sec: number }
      | undefined;
    if (!zeile) return lokal;
    return { ok: zeile.ok, retryAfterSec: zeile.ok ? 0 : zeile.retry_after_sec };
  } catch {
    // Datenbank nicht erreichbar oder Migration noch nicht eingespielt:
    // Stufe 1 gilt weiter.
    return lokal;
  }
}
