// Wiederverwendbare Design-Bausteine: ruhig, weiche Ecken, hauchdünne Ränder.
// Keine harten 8px-Kanten mehr — die wirkten wie von der Stange.
// CI: Gold #D99000 (brand), Navy #1B3A5C / #254D7A (accent). Kein Grün.

import { cn } from "@/lib/utils";

/** Standard-Karte: weiss, hauchdünne Border, flache Elevation, weiche Ecken. */
/** @deprecated Es gibt nur noch das dunkle Register — bitte PANEL benutzen. */
export const CARD = "rounded-2xl border border-white/[0.08] bg-[#0B1522]";

/** Karte mit dezenter Hover-Elevation (für klickbare/interaktive Karten). */
/** @deprecated Bitte PANEL_HOVER benutzen. */
export const CARD_HOVER =
  "rounded-2xl border border-white/[0.08] bg-[#0B1522] transition-colors hover:border-brand/40 hover:bg-[#0E1A2A]";

/** Haupt-Input: umrandet, Slate-Grund, weiche Ecken. */
export const INPUT =
  "rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-brand/25";

/* Ovale Status-Etiketten gibt es nicht mehr.

   `badge()` erzeugte eine Kapsel mit Rand und gefuellter Flaeche um zwei
   Woerter — ein Oval um einen Status. Der Nutzer hat das als typisches
   Merkmal erzeugter Oberflaechen benannt, und er hat recht: bei zehn
   Zeilen ergeben zehn Ovale eine Kette bunter Aufkleber, in der kein
   Status mehr wichtiger ist als ein anderer.

   Ein Status steht jetzt als Wort in Grossbuchstaben, gesperrt, in der
   Kennzeile — ohne Flaeche, ohne Rand. Farbe traegt nur, was Farbe
   braucht: Gold fuer aktiv, Weiss/45 fuer neutral, Rosé fuer Frist
   abgelaufen. */

/** Wrapper für eine Gruppe Segmented-Tabs. */
export const SEGMENT_GROUP =
  "inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5";

/** Einzelner Segmented-Tab; `active` steuert den gefüllten Zustand. */
export function segment(active: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
    active
      ? "bg-white/[0.12] text-white"
      : "text-white/45 hover:text-white",
  );
}

/* ==================================================================
   MARKETING-BAUSTEINE (Register A — oeffentliche Seiten)
   ------------------------------------------------------------------
   Die App-Oberflaeche oben ist praezise und dicht. Die oeffentlichen
   Seiten sind das Gegenteil: gross, luftig, wenig Text pro Bild.
   Vorbild sind Robinhood und Revolut — dort traegt eine Seite selten
   mehr als eine Aussage pro Bildschirm.
   ================================================================== */

/** Display-Ueberschriften. Immer die Display-Schrift, nie Inter. */
export const D_XL =
  "font-display font-medium text-[3rem] leading-[1.0] tracking-[-0.01em] sm:text-[4rem] lg:text-[5rem]";
export const D_LG =
  "font-display font-medium text-[2.25rem] leading-[1.21] tracking-[-0.01em] sm:text-[2.5rem] lg:text-[3rem]";
export const D_MD = "font-display font-medium text-[1.75rem] leading-[1.2] tracking-[-0.01em] sm:text-[2rem] lg:text-[2.5rem]";

/** Fliesstext direkt unter einer Display-Ueberschrift. */
export const LEAD = "text-[18px] leading-[1.56] tracking-[-0.005em]";

/** Kategorie-Zeile ueber einer Ueberschrift. Ohne Icon — Icons in
 *  Kacheln sind das Erkennungszeichen generierter Seiten. */
export const EYEBROW =
  "text-[11.5px] font-semibold uppercase tracking-[0.16em] text-brand";

/* ---- Abstands-Rhythmus ----
   Bewusst nur drei Stufen. Ein Abschnitt mit viel Luft muss auf einen
   dichten folgen, sonst entsteht wieder die gleichfoermige Liste. */
export const SECTION = "py-16 sm:py-20 lg:py-[88px]";
export const SECTION_TIGHT = "py-12 sm:py-14 lg:py-16";
export const SECTION_WIDE = "py-20 sm:py-28 lg:py-[120px]";

/* ---- Knoepfe ----
   Gold ist die knappste Ressource der Seite: hoechstens EIN gefuellter
   Gold-Knopf pro Bildschirm. Alles andere ist weiss, dunkel oder offen.

   Die Knoepfe waren Kapseln — `rounded-full`, sattes Gold, ein Pfeil im
   Text. Diese Kombination ist das Erkennungszeichen jeder erzeugten
   Landingpage; der Nutzer hat sie ausdruecklich als solche benannt.

   Jetzt ein klarer, aber endlicher Radius (12 px), etwas kompakter und
   ohne Pfeil. So machen es Linear und Stripe: der Knopf ist ein Knopf,
   kein Aufkleber. */
export const BTN_BASE =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-[16px] font-semibold leading-[1.5] tracking-[0.015em] transition-colors";

/** Die eine Hauptaktion. Voll gefuelltes Gold auf dunklem Text. */
export const BTN_GOLD = cn(BTN_BASE, "bg-brand text-navy-950 hover:bg-brand-500");
/** Hauptaktion auf hellem Grund. */
export const BTN_DARK = cn(BTN_BASE, "bg-navy-900 text-white hover:bg-navy-800");
/** Hauptaktion auf dunklem Grund — weiss gefuellt, wie bei Robinhood. */
export const BTN_LIGHT = cn(BTN_BASE, "bg-white text-navy-950 hover:bg-slate-100");
/** Zweite Aktion auf dunklem Grund. */
export const BTN_OUTLINE_DARK = cn(
  BTN_BASE,
  "border border-white/20 text-white hover:bg-white/[0.07]",
);
/** Zweite Aktion auf hellem Grund. */
export const BTN_OUTLINE_LIGHT = cn(
  BTN_BASE,
  "border border-slate-300 text-slate-800 hover:bg-slate-100",
);

/* ==================================================================
   EIN DUNKLES REGISTER FÜR DIE GANZE SEITE
   ------------------------------------------------------------------
   Frueher gab es zwei Sprachen: dunkel im Marketing, hell in der App.
   Das las sich wie zwei Websites in einer. Es gibt jetzt nur noch eine,
   und sie ist dunkel — Startseite wie eingeloggter Bereich.

   Drei Flaechenstufen, mehr nicht. Wer eine vierte braucht, hat den
   Aufbau zu tief verschachtelt.
     GROUND  der Seitengrund, das Dunkelste
     PANEL   Karten und Bloecke, die auf dem Grund liegen
     ROW     Zeilen und Felder INNERHALB eines Panels
   ================================================================== */

/** Seitengrund. Gehoert auf das <main> jeder Seite. */
export const GROUND = "bg-black text-white";

/** Karte auf dem Grund. */
export const PANEL = "rounded-[20px] bg-[#16181a]";

/** Anklickbare Karte. */
export const PANEL_HOVER =
  "rounded-[20px] bg-[#16181a] transition-colors hover:bg-[#1c1f21]";

/** Zeile oder Feld innerhalb eines Panels. */
export const ROW = "rounded-xl border border-white/[0.07] bg-white/[0.03]";

/** Anklickbare Zeile innerhalb eines Panels. */
export const ROW_HOVER =
  "rounded-xl border border-white/[0.07] bg-white/[0.03] transition-colors hover:border-brand/40 hover:bg-white/[0.06]";

/** Trennlinie auf dunklem Grund. */
export const HAIRLINE = "border-white/[0.12]";

/* ---- Textstufen. Nur drei, sonst franst die Hierarchie aus. ---- */
export const T_HI = "text-white";
export const T_MID = "text-white/[0.72]";
export const T_LOW = "text-white/[0.56]";

/** Eingabefeld auf dunklem Grund. */
export const INPUT_DARK =
  "rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand/60 focus:bg-white/[0.07]";


/* ==================================================================
   BLOCK — der Ersatz für die Karte
   ------------------------------------------------------------------
   Ein dünn umrandetes Rechteck um eine Gruppe ist das Erkennungszeichen
   generierter Entwürfe. Wo eine Karte nur GRUPPIERT hat, statt selbst
   etwas zu sein, steht jetzt ein Block: eine Haarlinie oben, Abstand,
   fertig. So arbeiten Linear, Stripe und TradingView.

   PANEL bleibt für das, was wirklich ein eigenes Objekt ist — eine
   Produktaufnahme, ein Blatt, eine grosse Produktkarte.
   ================================================================== */
export const BLOCK = "border-t border-white/[0.08] pt-5";

/** Überschrift eines Blocks — ersetzt die Kopfzeile einer Karte. */
export const BLOCK_HEAD =
  "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40";

/** Zeile in einer Liste: Trennung durch Haarlinie statt durch Rahmen. */
export const LIST_ROW = "border-t border-white/[0.08]";

/* ==================================================================
   SHELL — die Breite der Seite, an EINER Stelle
   ------------------------------------------------------------------
   Vorher hatte fast jede Seite ihre eigene Breite: die Kopfzeile
   `max-w-7xl`, die Startseite `max-w-6xl`, Referenzpreise `max-w-5xl`,
   Termine `max-w-3xl`. Man sieht das: das Logo sitzt links neben dem
   Seiteninhalt, und beim Wechsel von einer Seite zur nächsten springt
   der Text. Genau solche Unstimmigkeiten lassen einen Entwurf
   zusammengesetzt statt entworfen aussehen.

   Deshalb zwei Breiten, mehr nicht:
   - `SHELL` für alles, was Listen, Tabellen oder Spalten zeigt.
   - `SHELL_NARROW` für Seiten, die überwiegend Fliesstext oder ein
     Formular sind — dort ist eine breite Zeile schlechter lesbar,
     nicht besser.

   Der Rand ist bewusst schmal: 72 px, also knapp zwei Zentimeter von der
   Fensterkante bis zum ersten Buchstaben. Eine zentrierte Spalte mit
   breiten Leerrändern links und rechts ist das Layout jeder erzeugten
   Seite — Robinhood läuft fast bis an die Kante.

   Damit der Fliesstext trotzdem lesbar bleibt, wird er NICHT hier
   begrenzt, sondern am Absatz selbst (`max-w-xl` und Verwandte). Breite
   Hülle, schmale Textspalten — so machen es die Vorbilder.

   `max-w-[1760px]` fängt nur sehr grosse Schirme ab; darunter ist die
   Seite praktisch randlos.
   ================================================================== */
export const SHELL = "mx-auto w-full max-w-[1760px] px-5 sm:px-10 lg:px-[72px]";

/** Fliesstext und Formulare — eine breite Zeile liest sich schlechter. */
export const SHELL_NARROW = "mx-auto w-full max-w-[980px] px-5 sm:px-10 lg:px-[72px]";

/* ==================================================================
   REGISTER B — DAS BLATT
   ------------------------------------------------------------------
   Es gibt jetzt doch zwei Register, aber nicht wie früher.

   Früher war die Aufteilung willkürlich: Marketing dunkel, Anwendung
   hell, ohne Grund. Das las sich wie zwei Websites in einer und wurde
   zu Recht verworfen.

   Die Regel jetzt lässt sich in einem Satz sagen:

       Wo gelesen und geschrieben wird, ist Papier.
       Wo Zahlen und Markt stehen, ist es dunkel.

   Eine Unterhaltung ist Papier. Eine Marktliste nicht. Deshalb ist die
   Nachrichtenseite ein weisses Blatt — auf dunklem Grund liegend, wie
   der Beispiel-Zuschlag auf der Startseite.

   Der Rahmen bleibt immer dunkel: Kopfzeile, Fussbereich und der Grund
   hinter allem. Das Blatt liegt darauf, es ersetzt ihn nicht. Und Gold
   bleibt der einzige Akzent, in beiden Registern.
   ================================================================== */

/** Das Blatt selbst — die einzige helle Fläche, die es geben darf. */
export const SHEET = "rounded-2xl border border-slate-200 bg-white text-slate-900";

/** Nebenfläche im Blatt (Seitenspalten, Eingabeleisten). */
export const SHEET_MUTED = "bg-slate-50";

/** Haarlinie im Blatt — das Gegenstück zu HAIRLINE. */
export const SHEET_LINE = "border-slate-200";

/** Textstufen im Blatt. Wieder genau drei, wie im dunklen Register. */
export const S_HI = "text-slate-900";
export const S_MID = "text-slate-500";
export const S_LOW = "text-slate-400";

/** Eingabefeld im Blatt. */
export const INPUT_SHEET =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand";

/* ==================================================================
   TILE — der schwarze Anker
   ------------------------------------------------------------------
   Der Seitengrund ist `#060B12`, also fast, aber nicht ganz schwarz.
   Genau dieser Unterschied lässt sich nutzen: eine Fläche in echtem
   Schwarz tritt darauf hervor, ohne dass ein Rahmen nötig wäre.

   Gedacht für die eine Zahl, die auf einer Seite zählt — den
   Referenzpreis, die Kennzahlen, den Marktstand. So arbeitet Robinhood:
   der Kurs steht auf einer eigenen, dunkleren Fläche, alles andere
   liegt auf dem Grund.

   Sparsam einsetzen. Zwei schwarze Anker auf einem Bildschirm heben
   sich gegenseitig auf.
   ================================================================== */
export const TILE = "rounded-[20px] bg-[#16181a]";
