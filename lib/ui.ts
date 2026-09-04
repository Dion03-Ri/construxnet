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

/** Umrandete Status-Badge als Pille. */
export type BadgeTone = "gold" | "accent" | "navy" | "red" | "slate";

const BADGE_TONES: Record<BadgeTone, string> = {
  gold: "border-brand/30 bg-brand/10 text-brand",
  accent: "border-accent-500/40 bg-accent-500/15 text-accent-200",
  navy: "border-white/15 bg-white/[0.06] text-white/75",
  red: "border-rose-400/35 bg-rose-500/10 text-rose-300",
  slate: "border-white/12 bg-white/[0.06] text-white/60",
};

/** Klassen für eine scharfe Badge; `upper` = Uppercase-Kategorie-Look. */
export function badge(tone: BadgeTone = "slate", upper = false) {
  return cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
    upper && "uppercase tracking-wider",
    BADGE_TONES[tone],
  );
}

/** Wrapper für eine Gruppe Segmented-Tabs. */
export const SEGMENT_GROUP =
  "inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5";

/** Einzelner Segmented-Tab; `active` steuert den gefüllten Zustand. */
export function segment(active: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
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
  "font-display font-bold text-[3.1rem] leading-[0.99] tracking-[-0.03em] sm:text-d-lg lg:text-d-xl";
export const D_LG =
  "font-display font-bold text-[2.25rem] leading-[1.06] tracking-[-0.025em] sm:text-d-md lg:text-d-lg";
export const D_MD = "font-display font-bold text-[1.75rem] leading-[1.12] tracking-[-0.02em] sm:text-d-sm lg:text-d-md";

/** Fliesstext direkt unter einer Display-Ueberschrift. */
export const LEAD = "text-[16px] leading-relaxed sm:text-[17px]";

/** Kategorie-Zeile ueber einer Ueberschrift. Ohne Icon — Icons in
 *  Kacheln sind das Erkennungszeichen generierter Seiten. */
export const EYEBROW =
  "text-[11.5px] font-semibold uppercase tracking-[0.16em] text-brand";

/* ---- Abstands-Rhythmus ----
   Bewusst nur drei Stufen. Ein Abschnitt mit viel Luft muss auf einen
   dichten folgen, sonst entsteht wieder die gleichfoermige Liste. */
export const SECTION = "py-20 sm:py-28 lg:py-32";
export const SECTION_TIGHT = "py-14 sm:py-16 lg:py-20";
export const SECTION_WIDE = "py-24 sm:py-32 lg:py-40";

/* ---- Knoepfe ----
   Gold ist die knappste Ressource der Seite: hoechstens EIN gefuellter
   Gold-Knopf pro Bildschirm. Alles andere ist weiss, dunkel oder offen. */
export const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14.5px] font-semibold transition-colors";

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
export const GROUND = "bg-[#060B12] text-white";

/** Karte auf dem Grund. */
export const PANEL = "rounded-2xl border border-white/[0.08] bg-[#0B1522]";

/** Anklickbare Karte. */
export const PANEL_HOVER =
  "rounded-2xl border border-white/[0.08] bg-[#0B1522] transition-colors hover:border-brand/40 hover:bg-[#0E1A2A]";

/** Zeile oder Feld innerhalb eines Panels. */
export const ROW = "rounded-xl border border-white/[0.07] bg-white/[0.03]";

/** Anklickbare Zeile innerhalb eines Panels. */
export const ROW_HOVER =
  "rounded-xl border border-white/[0.07] bg-white/[0.03] transition-colors hover:border-brand/40 hover:bg-white/[0.06]";

/** Trennlinie auf dunklem Grund. */
export const HAIRLINE = "border-white/[0.08]";

/* ---- Textstufen. Nur drei, sonst franst die Hierarchie aus. ---- */
export const T_HI = "text-white";
export const T_MID = "text-white/60";
export const T_LOW = "text-white/40";

/** Eingabefeld auf dunklem Grund. */
export const INPUT_DARK =
  "rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand/60 focus:bg-white/[0.07]";

/** Feines technisches Raster — die Hightech-Note der Seite. */
export const GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

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
