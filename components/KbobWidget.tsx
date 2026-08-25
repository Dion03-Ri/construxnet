"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import kbobData from "@/data/kbobData.json";

type PricePoint = { period: string; kbob: number; pool: number };

const data = kbobData as unknown as {
  materials: Record<
    string,
    { label: string; unit: string; regions: Record<string, PricePoint[]> }
  >;
};

function chf(v: number, d = 2) {
  return new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(v);
}

/** Compact SVG sparkline for one numeric series. */
function Sparkline({
  values,
  color,
  dashed,
  width = 240,
  height = 56,
  min,
  max,
}: {
  values: number[];
  color: string;
  dashed?: boolean;
  width?: number;
  height?: number;
  min: number;
  max: number;
}) {
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / span) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeDasharray={dashed ? "5 4" : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export default function KbobWidget() {
  const material = data.materials["beton"];
  const series = material.regions["zuerich"].slice(-12);
  const kbobVals = series.map((p) => p.kbob);
  const poolVals = series.map((p) => p.pool);

  const last = series[series.length - 1];
  const prev = series[series.length - 2] ?? last;
  const change = ((last.kbob - prev.kbob) / prev.kbob) * 100;
  const savings = last.kbob - last.pool;

  const all = [...kbobVals, ...poolVals];
  const min = Math.min(...all);
  const max = Math.max(...all);

  return (
    <Link
      href="/kbob"
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-cardhover"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            KBOB Index · {material.label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900">
              CHF {chf(last.kbob)}
            </span>
            <span className="text-sm text-slate-400">/ {material.unit}</span>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-brand" />
      </div>

      <svg
        viewBox="0 0 240 56"
        className="mt-3 h-14 w-full"
        preserveAspectRatio="none"
      >
        <Sparkline values={kbobVals} color="#3B82F6" min={min} max={max} />
        <Sparkline values={poolVals} color="#10B981" dashed min={min} max={max} />
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span
          className={`inline-flex items-center gap-1 font-medium ${
            change >= 0 ? "text-rose-400" : "text-emerald"
          }`}
        >
          {change >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% ggü. Vorquartal
        </span>
        <span className="font-medium text-emerald">
          Pool −CHF {chf(savings)}
        </span>
      </div>
    </Link>
  );
}
