import { TrendingUp, TrendingDown } from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Kpi = {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  sub: string;
};

const KPIS: Kpi[] = [
  { label: "Preis-Stabilitätsindex", value: "84.2", delta: "+12.4 %", up: true, sub: "vs. Vorquartal · Raum Zürich" },
  { label: "Ø Pool-Preis vs. KBOB", value: "−13.8 %", delta: "günstiger", up: true, sub: "letzte 12 Bündel" },
  { label: "Gebündeltes Volumen", value: "CHF 1.24 Mio.", delta: "+18.7 %", up: true, sub: "12 Monate · alle Regionen" },
  { label: "Erfasste Kategorien", value: "4", sub: "Beton · Stahl · Kies · Transport" },
];

function DeltaIcon({ up }: { up?: boolean }) {
  const Icon = up ? TrendingUp : TrendingDown;
  return <Icon className={cn("h-3.5 w-3.5", up ? "text-accent" : "text-rose-500")} />;
}

export default function KbobKpis() {
  return (
    <div className={cn(CARD, "grid grid-cols-2 divide-x divide-y divide-slate-200 lg:grid-cols-4 lg:divide-y-0")}>
      {KPIS.map((k, i) => (
        <div key={k.label} className={cn("p-4 sm:p-5", i % 2 === 0 && "border-l-0", "lg:border-l")}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{k.label}</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{k.value}</span>
            {k.delta && (
              <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", k.up ? "text-accent" : "text-rose-500")}>
                <DeltaIcon up={k.up} />
                {k.delta}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
