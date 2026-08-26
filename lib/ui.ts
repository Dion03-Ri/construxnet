// Wiederverwendbare Enterprise-Design-Primitive (scharf, präzise, institutionell).
// CI: Gold #D99000 (brand), Navy #1B3A5C (accent), Grün #10B981 (accent).

import { cn } from "@/lib/utils";

/** Standard-Karte: weiss, hauchdünne Border, flache Elevation, 8px-Radius. */
export const CARD = "rounded-lg border border-slate-200 bg-white shadow-card";

/** Karte mit dezenter Hover-Elevation (für klickbare/interaktive Karten). */
export const CARD_HOVER =
  "rounded-lg border border-slate-200 bg-white shadow-card transition-shadow duration-200 hover:shadow-cardhover hover:border-slate-300";

/** Haupt-Input: scharf, umrandet, Slate-Grund. */
export const INPUT =
  "rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30";

/** Scharfe, umrandete Status-Badge (kein Oval). */
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
    "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold",
    upper && "uppercase tracking-wider",
    BADGE_TONES[tone],
  );
}

/** Wrapper für eine Gruppe scharfer Segmented-Tabs. */
export const SEGMENT_GROUP =
  "inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5";

/** Einzelner Segmented-Tab; `active` steuert den gefüllten Zustand. */
export function segment(active: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors",
    active
      ? "bg-white text-slate-900 shadow-sm"
      : "text-slate-500 hover:text-slate-900",
  );
}
