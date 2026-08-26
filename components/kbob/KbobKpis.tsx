import { TrendingUp, TrendingDown, Boxes, Wallet } from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Segment = { label: string; value: number; color: string };

function chf(v: number, d = 0) {
  return new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(v);
}

function SegmentBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <>
      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-sm bg-slate-100">
        {segments.map((s) => (
          <div
            key={s.label}
            className={cn("h-full", s.color)}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[13px] text-slate-600">
            <span className={cn("h-2 w-2 rounded-full", s.color)} />
            {s.label}
            <span className="font-semibold text-slate-900">{s.value}%</span>
          </span>
        ))}
      </div>
    </>
  );
}

function Badge({ delta }: { delta: number }) {
  const up = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        up ? "bg-accent/10 text-accent" : "bg-rose-100 text-rose-600",
      )}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {up ? "+" : ""}
      {delta}%
    </span>
  );
}

export default function KbobKpis() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Stabilitäts-Index */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Boxes className="h-4 w-4" />
          </span>
          Regionaler Preis-Stabilitätsindex
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">84.2</span>
          <Badge delta={12.4} />
        </div>
        <p className="mt-0.5 text-xs text-slate-400">vs. Vorquartal · Raum Zürich</p>
        <SegmentBar
          segments={[
            { label: "Beton", value: 72, color: "bg-accent" },
            { label: "Stahl", value: 64, color: "bg-brand" },
            { label: "Kies", value: 81, color: "bg-accent" },
          ]}
        />
      </div>

      {/* Beschaffungsvolumen */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Wallet className="h-4 w-4" />
          </span>
          Beschaffungsvolumen (12 Mt.)
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            CHF {chf(1_242_600)}
          </span>
          <Badge delta={18.7} />
        </div>
        <p className="mt-0.5 text-xs text-slate-400">gebündeltes Poolvolumen · alle Regionen</p>
        <SegmentBar
          segments={[
            { label: "Beton", value: 48, color: "bg-accent" },
            { label: "Stahl", value: 34, color: "bg-brand" },
            { label: "Kies", value: 18, color: "bg-accent" },
          ]}
        />
      </div>
    </div>
  );
}
