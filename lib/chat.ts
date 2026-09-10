/**
 * Die Rechenteile des Chats — ohne React, ohne Netz, damit sie prüfbar sind.
 *
 * Sie standen vorher mitten im Bauteil. Genau dort sass auch der Fehler,
 * den diese Runde behebt: die Liste der Gespräche wurde aus dem gesamten
 * Nachrichtenbestand abgeleitet, weil es keinen anderen Ort gab, an dem so
 * etwas hätte stehen können. Was man nicht einzeln aufrufen kann, prüft
 * man auch nicht einzeln.
 */

export type ChatNachricht = {
  id: string;
  sender_company_id: string;
  receiver_company_id: string;
  content: string;
  is_negotiation_offer: boolean;
  offer_amount: number | null;
  created_at: string;
  read_at?: string | null;
};

/** Eine Zeile aus chat_threads(). */
export type ThreadZeile = {
  other_company_id: string;
  last_message_at: string | null;
  last_content: string | null;
  last_is_offer: boolean;
  last_from_me: boolean;
  unread_count: number;
  last_offer_content: string | null;
  archived: boolean;
};

/** Was in der Gesprächsliste steht, auch ohne geladenen Verlauf. */
export type Vorschau = {
  at: string | null;
  text: string | null;
  offer: boolean;
  fromMe: boolean;
};

/**
 * Aus den Zeilen von chat_threads() alles bauen, was die Liste braucht.
 *
 * `jungstes` ist das Gespräch, das beim Öffnen des Chats erscheinen soll:
 * das mit der neuesten Nachricht, und zwar nur aus denen, die nicht
 * weggelegt sind. Wer alles weggelegt hat, landet auf keinem — das ist
 * richtig so, sonst holt das Öffnen des Chats ein Gespräch zurück, das
 * man gerade weggelegt hat.
 */
export function ausThreadZeilen(zeilen: ThreadZeile[]) {
  const zuletzt: Record<string, Vorschau> = {};
  const ungelesen: Record<string, number> = {};
  const archiviert: Record<string, boolean> = {};
  const angebote: Record<string, string> = {};

  for (const z of zeilen) {
    if (!z.other_company_id) continue;
    zuletzt[z.other_company_id] = {
      at: z.last_message_at,
      text: z.last_content,
      offer: !!z.last_is_offer,
      fromMe: !!z.last_from_me,
    };
    ungelesen[z.other_company_id] = z.unread_count ?? 0;
    archiviert[z.other_company_id] = !!z.archived;
    if (z.last_offer_content) angebote[z.other_company_id] = z.last_offer_content;
  }

  const ids = zeilen.map((z) => z.other_company_id).filter(Boolean);
  const jungstes =
    zeilen
      .filter((z) => z.other_company_id && !z.archived)
      .sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? ""))[0]
      ?.other_company_id ?? null;

  return { ids, zuletzt, ungelesen, archiviert, angebote, jungstes };
}

/**
 * Ein geholtes Fenster in den vorhandenen Verlauf einfügen.
 *
 * Die Datenbank liefert absteigend (neueste zuerst); hier wird für die
 * Anzeige gedreht. Zwei Fälle:
 *
 * · ohne `vor` — das neueste Fenster. Es ersetzt, was da war, bis auf die
 *   eigenen noch unbestätigten Nachrichten: sonst verschwindet, was man
 *   gerade abgeschickt hat, sobald das Fenster ankommt.
 * · mit `vor` — ältere Nachrichten, sie kommen davor. Was schon da ist,
 *   kommt nicht doppelt.
 */
export function fensterEinfuegen(
  alt: ChatNachricht[],
  absteigend: ChatNachricht[],
  vor?: string,
): ChatNachricht[] {
  const fenster = [...absteigend].reverse();
  if (!vor) {
    const offen = alt.filter((m) => m.id.startsWith("tmp-"));
    return [...fenster, ...offen];
  }
  const bekannt = new Set(alt.map((m) => m.id));
  return [...fenster.filter((m) => !bekannt.has(m.id)), ...alt];
}

/**
 * Reihenfolge und Sichtbarkeit der Gesprächsliste.
 *
 * Weggelegte Gespräche stehen in einer eigenen Ansicht, nicht zwischen den
 * aktiven — eine gemischte Liste mit ausgegrauten Zeilen ist keine Ordnung,
 * sondern eine Ausrede.
 */
export function sichtbareGespraeche<T extends { id: string; company_name: string }>(
  alle: T[],
  opt: {
    archiviert: Record<string, boolean>;
    zeigeArchiv: boolean;
    suche: string;
    zeitpunkt: (id: string) => string;
  },
): T[] {
  const q = opt.suche.trim().toLowerCase();
  return [...alle]
    .filter((c) => (opt.zeigeArchiv ? !!opt.archiviert[c.id] : !opt.archiviert[c.id]))
    .filter((c) => !q || c.company_name.toLowerCase().includes(q))
    .sort((a, b) => opt.zeitpunkt(b.id).localeCompare(opt.zeitpunkt(a.id)));
}
