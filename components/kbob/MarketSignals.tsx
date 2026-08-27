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
  status: string; // Klartext-Einordnung
  value: string; // angezeigter Wert inkl. Einheit
  score: number; // 0..100 für den Balken
  tone: "accent" | "brand" | "navy" | "rose";
};

const TONE: Record<Signal["tone"], { chip: string; bar: string; text: string }> = {
  accent: { chip: "bg-accent-50 text-accent", bar: "bg-accent-500", text: "text-accent" },
  brand: { chip: "bg-brand/10 text-brand", bar: "bg-brand", text: "text-brand" },
  navy: { chip: "bg-accent/10 text-accent-700", bar: "bg-accent-700", text: "text-accent-700" },
  rose: { chip: "bg-rose-100 text-rose-600", bar: "bg-rose-500", text: "text-rose-600" },
};

const SIGNALS: Signal[] = [
  { icon: Activity, label: "Zementpreis-Stabilität", status: "Sehr stabil · Raum Zürich", value: "92 / 100", score: 92, tone: "accent" },
  { icon: Truck, label: "Lieferkapazität der Werke", status: "Hoch · Region ZH", value: "87 / 100", score: 87, tone: "navy" },
  { icon: TrendingDown, label: "Ø Pool-Ersparnis vs. KBOB", status: "letzte 12 Bündel", value: "−13.8 %", score: 69, tone: "brand" },
  { icon: Boxes, label: "Nachfrage Armierungsstahl", status: "Steigend · Zentralschweiz", value: "64 / 100", score: 64, tone: "navy" },
  { icon: Fuel, label: "Transport-/Dieselkosten", status: "Volatil — höheres Risiko", value: "42 / 100", score: 42, tone: "rose" },
];

export default function MarketSignals() {
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="border-b border-slate-200 px-5 py-3.5">
        <h3 className="text-[15px] font-semibold text-slate-900">Marktsignale</h3>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Fünf Indikatoren, die deinen Beschaffungszeitpunkt beeinflussen. Höher = günstiger/stabiler.
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
                  <span className={cn("shrink-0 text-sm font-bold tabular-nums", t.text)}>{s.value}</span>
                </div>
                <div className="mt-1.5 h-1 w-full bg-slate-100">
                  <div className={cn("h-full", t.bar)} style={{ width: `${Math.min(s.score, 100)}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{s.status}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
