// Wiederverwendbare Design-Bausteine: ruhig, weiche Ecken, hauchdünne Ränder.
// Keine harten 8px-Kanten mehr — die wirkten wie von der Stange.
// CI: Gold #D99000 (brand), Navy #1B3A5C / #254D7A (accent). Kein Grün.

import { cn } from "@/lib/utils";

/** Standard-Karte: weiss, hauchdünne Border, flache Elevation, weiche Ecken. */
export const CARD = "rounded-2xl border border-slate-200 bg-white shadow-card";

/** Karte mit dezenter Hover-Elevation (für klickbare/interaktive Karten). */
export const CARD_HOVER =
  "rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow duration-200 hover:shadow-cardhover hover:border-slate-300";

/** Haupt-Input: umrandet, Slate-Grund, weiche Ecken. */
export const INPUT =
  "rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30";

/** Umrandete Status-Badge als Pille. */
export type BadgeTone = "gold" | "accent" | "navy" | "red" | "slate";

const BADGE_TONES: Record<BadgeTone, string> = {
  gold: "border-brand/30 bg-brand/10 text-brand",
  accent: "border-accent-500/30 bg-accent-50 text-accent-700",
  navy: "border-accent/30 bg-accent/5 text-accent",
  red: "border-rose-300 bg-rose-50 text-rose-600",
  slate: "border-slate-300 bg-slate-100 text-slate-600",
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
  "inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5";

/** Einzelner Segmented-Tab; `active` steuert den gefüllten Zustand. */
export function segment(active: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
    active
      ? "bg-white text-slate-900 shadow-sm"
      : "text-slate-500 hover:text-slate-900",
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
