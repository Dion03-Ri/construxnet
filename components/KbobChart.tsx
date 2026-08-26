"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  MapPin,
  Check,
} from "lucide-react";
import kbobData from "@/data/kbobData.json";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */

type PricePoint = { period: string; kbob: number; pool: number };

type MaterialEntry = {
  label: string;
  unit: string;
  spec: string;
  regions: Record<string, PricePoint[]>;
};

type KbobData = {
  meta: { source: string; currency: string; updated: string };
  periods: string[];
  regions: Record<string, string>;
  timeRanges: Record<string, number>;
  materials: Record<string, MaterialEntry>;
};

const data = kbobData as KbobData;

const MATERIAL_KEYS = Object.keys(data.materials);
const REGION_KEYS = Object.keys(data.regions);
const RANGE_KEYS = Object.keys(data.timeRanges); // 1J, 3J, 5J, Max

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                          */
/* -------------------------------------------------------------------------- */

function decimalsFor(value: number) {
  if (value >= 300) return 0;
  if (value >= 10) return 2;
  return 3;
}

function chf(value: number, decimals?: number) {
  const d = decimals ?? decimalsFor(value);
  return new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
}

/** "2021-Q1" -> { q: "Q1", year: "2021", short: "Q1 '21" } */
function parsePeriod(period: string) {
  const [year, q] = period.split("-");
  return { q, year, short: `${q} '${year.slice(2)}` };
}

/* -------------------------------------------------------------------------- */
/*  Material dropdown (lightweight, accessible)                                 */
/* -------------------------------------------------------------------------- */

function MaterialSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = data.materials[value];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full min-w-[240px] items-center justify-between gap-3 rounded-lg",
          "border border-slate-200 bg-white px-4 py-2.5 text-left backdrop-blur",
          "transition-colors hover:border-slate-300 hover:bg-slate-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        )}
      >
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-800">
            {current.label}
          </span>
          <span className="text-[11px] text-slate-500">{current.spec}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className={cn(
              "absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200",
              "bg-white shadow-2xl shadow-slate-900/10 backdrop-blur-xl",
            )}
          >
            {MATERIAL_KEYS.map((key) => {
              const m = data.materials[key];
              const active = key === value;
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left",
                      "transition-colors hover:bg-slate-50",
                      active && "bg-brand/10",
                    )}
                  >
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-slate-800">
                        {m.label}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {m.spec}
                      </span>
                    </span>
                    {active && (
                      <Check className="h-4 w-4 shrink-0 text-brand" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Segmented control                                                          */
/* -------------------------------------------------------------------------- */

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 backdrop-blur">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.key
              ? "bg-brand text-white shadow-sm shadow-brand/30"
              : "text-slate-500 hover:text-slate-800",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Custom tooltip                                                             */
/* -------------------------------------------------------------------------- */

function ChartTooltip({
  active,
  payload,
  unit,
}: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload as {
    period: string;
    kbob: number;
    pool: number;
  };
  const { q, year } = parsePeriod(row.period);
  const savings = row.kbob - row.pool;
  const savingsPct = (savings / row.kbob) * 100;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-cardhover">
      <div className="mb-2 text-xs font-semibold text-slate-600">
        {q} {year}
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-kbob-blue" />
            KBOB Index
          </span>
          <span className="font-mono font-medium text-slate-800">
            CHF {chf(row.kbob)} / {unit}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-pool-green" />
            Smart Pool
          </span>
          <span className="font-mono font-medium text-slate-800">
            CHF {chf(row.pool)} / {unit}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-6 border-t border-slate-200 pt-2">
          <span className="text-slate-500">Ersparnis</span>
          <span className="font-mono font-semibold text-pool-green">
            −CHF {chf(savings)} ({savingsPct.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  KPI card                                                                   */
/* -------------------------------------------------------------------------- */

function Kpi({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 backdrop-blur">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function KbobChart() {
  const [material, setMaterial] = useState(MATERIAL_KEYS[0]);
  const [region, setRegion] = useState(REGION_KEYS[0]);
  const [range, setRange] = useState<string>("3J");

  const entry = data.materials[material];
  const unit = entry.unit;

  const chartData = useMemo(() => {
    const full = entry.regions[region];
    const count = data.timeRanges[range] ?? full.length;
    return full.slice(Math.max(0, full.length - count));
  }, [entry, region, range]);

  const kpis = useMemo(() => {
    const n = chartData.length;
    const last = chartData[n - 1];
    const prev = chartData[n - 2] ?? last;
    const current = last.kbob;
    const change = ((last.kbob - prev.kbob) / prev.kbob) * 100;
    const savings = last.kbob - last.pool;
    const savingsPct = (savings / last.kbob) * 100;
    return { current, change, savings, savingsPct };
  }, [chartData]);

  const regionLabel = data.regions[region];
  const regionShort = region.slice(0, 3).toUpperCase();
  const tickInterval = Math.max(0, Math.floor(chartData.length / 7) - 1);

  return (
    <section className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      {/* Header row: title + material select */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-800">
            KBOB Preisindex vs. Smart Pool
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {regionLabel} · Stand {data.meta.updated}
          </p>
        </div>
        <MaterialSelect value={material} onChange={setMaterial} />
      </div>

      {/* Region filter */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Region
        </span>
        <Segmented
          options={REGION_KEYS.map((k) => ({ key: k, label: data.regions[k] }))}
          value={region}
          onChange={setRegion}
        />
      </div>

      {/* KPI header */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label={`Marktpreis (KBOB)`}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-slate-900">
              CHF {chf(kpis.current)}
            </span>
            <span className="text-sm text-slate-500">/ {unit}</span>
          </div>
        </Kpi>

        <Kpi label="Veränderung ggü. Vorquartal">
          <div
            className={cn(
              "flex items-center gap-1.5 text-2xl font-semibold",
              kpis.change >= 0 ? "text-rose-400" : "text-pool-green",
            )}
          >
            {kpis.change >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {kpis.change >= 0 ? "+" : ""}
            {kpis.change.toFixed(1)}%
          </div>
        </Kpi>

        <Kpi label={`Smart Pool Ersparnis ${regionShort}`}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg">💡</span>
            <span className="text-2xl font-semibold text-pool-green">
              ~ CHF {chf(kpis.savings)}
            </span>
            <span className="text-sm text-slate-500">/ {unit}</span>
          </div>
        </Kpi>
      </div>

      {/* Chart */}
      <div className="mt-6 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 12, bottom: 0, left: -8 }}
          >
            <defs>
              <filter id="kbobGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(15,23,42,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tickFormatter={(p: string) => parsePeriod(p).short}
              interval={tickInterval}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(15,23,42,0.10)" }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={64}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => chf(v, decimalsFor(v) === 3 ? 2 : 0)}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} />}
              cursor={{ stroke: "rgba(15,23,42,0.18)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="kbob"
              name="KBOB Index"
              stroke="#254D7A"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              filter="url(#kbobGlow)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pool"
              name="Smart Pool"
              stroke="#10B981"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer: legend + time range */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded bg-kbob-blue" />
            Offizieller KBOB Index
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-0.5 w-6 rounded bg-pool-green"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg,#10B981 0 6px,transparent 6px 10px)",
                backgroundColor: "transparent",
              }}
            />
            ConstruxNet Pool-Ø
          </span>
        </div>
        <Segmented
          options={RANGE_KEYS.map((k) => ({ key: k, label: k }))}
          value={range}
          onChange={setRange}
        />
      </div>

      <p className="mt-4 text-[11px] text-slate-400">{data.meta.source}</p>
    </section>
  );
}
