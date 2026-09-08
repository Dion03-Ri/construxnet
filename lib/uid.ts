/**
 * Schweizer Unternehmens-Identifikationsnummer (UID).
 *
 * Bisher wurde nur die FORM geprüft: `CHE-123.456.789`. Damit kommt jede
 * ausgedachte Zahlenfolge durch — und auf der Seite steht danach ein
 * Firmenprofil mit einer UID, die es nicht gibt.
 *
 * Eine UID trägt eine Prüfziffer. Die letzte der neun Stellen ergibt sich
 * aus den ersten acht, mit den Gewichten 5-4-3-2-7-6-5-4 und Modulo 11.
 * Das ist reine Rechnung, ohne Netz und ohne Dienst: es fängt Tippfehler
 * und erfundene Nummern ab, bevor sie in der Datenbank stehen.
 *
 * Was es NICHT leistet: es sagt nicht, ob die Firma existiert oder ob sie
 * dem gehört, der sie einträgt. Dafür braucht es den Abgleich gegen das
 * UID-Register des Bundes — siehe `registerLookupPending` unten.
 */

const GEWICHTE = [5, 4, 3, 2, 7, 6, 5, 4];

export type UidPruefung =
  | { ok: true; normalisiert: string }
  | { ok: false; grund: "form" | "pruefziffer" };

/** `che123456789`, `CHE 123.456.789` → `CHE-123.456.789`. */
export function normalisiereUid(eingabe: string): string | null {
  const ziffern = eingabe.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (!ziffern.startsWith("CHE") || ziffern.length !== 12) return null;
  const z = ziffern.slice(3);
  if (!/^\d{9}$/.test(z)) return null;
  return `CHE-${z.slice(0, 3)}.${z.slice(3, 6)}.${z.slice(6, 9)}`;
}

/** Die Prüfziffer, die zu den ersten acht Stellen gehört. */
export function pruefziffer(achtStellen: string): number | null {
  if (!/^\d{8}$/.test(achtStellen)) return null;
  const summe = achtStellen
    .split("")
    .reduce((s, z, i) => s + Number(z) * GEWICHTE[i], 0);
  const rest = summe % 11;
  if (rest === 0) return 0;
  const ziffer = 11 - rest;
  // Rest 1 ergäbe die Ziffer 10 — solche Nummern vergibt das Register nicht.
  return ziffer === 10 ? null : ziffer;
}

export function pruefeUid(eingabe: string): UidPruefung {
  const normalisiert = normalisiereUid(eingabe);
  if (!normalisiert) return { ok: false, grund: "form" };

  const z = normalisiert.replace(/[^0-9]/g, "");
  const erwartet = pruefziffer(z.slice(0, 8));
  if (erwartet === null || erwartet !== Number(z[8])) {
    return { ok: false, grund: "pruefziffer" };
  }
  return { ok: true, normalisiert };
}

/**
 * Der Abgleich gegen das UID-Register des Bundes ist NICHT gebaut.
 *
 * Er braucht den Webdienst der Bundesstatistik (`uid.admin.ch`). Solange
 * er fehlt, heisst „geprüft" ausschliesslich: die Nummer ist rechnerisch
 * gültig. Der Haken `companies.verified` bleibt davon unberührt — den
 * setzt weiterhin niemand, und das ist richtig so, bis es einen echten
 * Abgleich gibt.
 */
export const registerLookupPending = true;
