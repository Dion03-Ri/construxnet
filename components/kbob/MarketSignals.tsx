import {
  Activity,
  Truck,
  TrendingDown,
  Boxes,
  Fuel,
  type LucideIcon,
} from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Signal = {
  icon: LucideIcon;
  label: string;
  sub: string;
  score: number;
  tone: "emerald" | "brand" | "accent" | "rose";
};

const TONE: Record<Signal["tone"], { chip: string; bar: string; text: string }> = {
  emerald: { chip: "bg-emerald/10 text-emerald", bar: "bg-emerald", text: "text-emerald" },
  brand: { chip: "bg-brand/10 text-brand", bar: "bg-brand", text: "text-brand" },
  accent: { chip: "bg-accent/10 text-accent", bar: "bg-accent", text: "text-accent" },
  rose: { chip: "bg-rose-100 text-rose-600", bar: "bg-rose-500", text: "text-rose-600" },
};

const SIGNALS: Signal[] = [
  { icon: Activity, label: "Zementpreis-Stabilität", sub: "Raum Zürich · 30 T.", score: 92.4, tone: "emerald" },
  { icon: Truck, label: "Lieferkapazität", sub: "Baustoffwerke Region ZH", score: 87.2, tone: "emerald" },
  { icon: TrendingDown, label: "Ø Pool-Ersparnis", sub: "letzte 12 Bündel", score: 13.8, tone: "brand" },
  { icon: Boxes, label: "Nachfrage Armierungsstahl", sub: "Zentralschweiz", score: 64.0, tone: "accent" },
  { icon: Fuel, label: "Diesel-/Transportindex", sub: "Volatilität hoch", score: 42.0, tone: "rose" },
];

export default function MarketSignals() {
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="border-b border-slate-200 px-5 py-3.5">
        <h3 className="text-[15px] font-semibold text-slate-900">Markt-Monitore &amp; Signale</h3>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Live-Indikatoren aus dem Netzwerk
        </p>
      </div>

      <ul className="divide-y divide-slate-100">
        {SIGNALS.map((s) => {
          const t = TONE[s.tone];
          return (
            <li key={s.label} className="flex items-center gap-3 px-5 py-3">
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md", t.chip)}>
                <s.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-slate-800">{s.label}</span>
                  <span className={cn("shrink-0 text-sm font-bold tabular-nums", t.text)}>{s.score}%</span>
                </div>
                {/* Scharfe Fortschrittslinie (kein rundes Meter) */}
                <div className="mt-1.5 h-1 w-full bg-slate-100">
                  <div className={cn("h-full", t.bar)} style={{ width: `${Math.min(s.score, 100)}%` }} />
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{s.sub}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
