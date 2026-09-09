/**
 * Ein zweiter Versuch fuer Abfragen, die an der Uhr scheitern.
 *
 * Clerk erneuert das Sitzungs-Token etwa jede Minute. Ein frisch
 * ausgestelltes Token traegt ein „nicht gueltig vor" (nbf) — und wenn die
 * Uhr von Supabase ein, zwei Sekunden hinter der von Clerk liegt, lehnt
 * Supabase genau dieses eine Token ab:
 *
 *     JWT not yet valid
 *
 * Das ist kein Fehler der Anwendung und auch keiner der Anmeldung: eine
 * Sekunde spaeter geht dieselbe Abfrage durch. Genau darum geht es hier —
 * kurz warten und es nochmals versuchen, statt dem Nutzer eine rote
 * Meldung hinzustellen, die sich von selbst erledigt haette.
 *
 * Ebenso behandelt: ein Token, das zwischen Ausstellung und Ankunft
 * abgelaufen ist (dieselbe Uhrenfrage, andere Richtung).
 */
const UHRENFEHLER = /not yet valid|jwt expired|token is expired|PGRST301/i;

export function istUhrenfehler(fehler: { message?: string; code?: string } | null): boolean {
  if (!fehler) return false;
  return UHRENFEHLER.test(`${fehler.message ?? ""} ${fehler.code ?? ""}`);
}

/**
 * Fuehrt die Abfrage aus und wiederholt sie bei einem Uhrenfehler.
 * Die Pausen wachsen (0.8 s, 2 s), damit ein laengerer Versatz auch noch
 * aufgeholt wird, ohne dass die Seite minutenlang haengt.
 */
export async function mitGeduld<T extends { error: { message?: string; code?: string } | null }>(
  abfrage: () => PromiseLike<T>,
  pausen: number[] = [800, 2000],
): Promise<T> {
  let ergebnis = await abfrage();
  for (const pause of pausen) {
    if (!istUhrenfehler(ergebnis.error)) return ergebnis;
    await new Promise((r) => setTimeout(r, pause));
    ergebnis = await abfrage();
  }
  return ergebnis;
}
