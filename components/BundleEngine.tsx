"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import {
  MapPin,
  CalendarClock,
  FileText,
  Layers,
  Gavel,
  CheckCircle2,
  Minus,
  Plus,
  LineChart,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Business config                                                            */
/* -------------------------------------------------------------------------- */

const PLATFORM_FEE_PCT = 2.25;

// Feinere Staffel — mehr Stufen = echter Mehrwert & glattere Kurve.
const TIERS = [
  { tier: 1, min: 0, discount: 5 },
  { tier: 2, min: 101, discount: 9 },
  { tier: 3, min: 201, discount: 12 },
  { tier: 4, min: 351, discount: 16 },
  { tier: 5, min: 501, discount: 20 },
];
const SCALE_MAX = 650;

type Material = {
  key: string;
  label: string;
  spec: string;
  unit: string;
  listPrice: number;
  kbobPrice: number;
  material: string;
};

const MATERIALS: Material[] = [
  { key: "beton", label: "Beton C25/30", spec: "SN EN 206 · C25/30 · Cl 0.20 · Dmax 32", unit: "m³", listPrice: 165, kbobPrice: 156, material: "beton" },
  { key: "stahl", label: "Bewehrungsstahl B500B", spec: "SIA 262 · B500B · Ring / Stäbe", unit: "t", listPrice: 1180, kbobPrice: 1120, material: "stahl" },
  { key: "kies", label: "Koffer-/Wandkies 0/45", spec: "SN 670 · ungebrochen 0/45", unit: "t", listPrice: 42, kbobPrice: 39, material: "kies" },
];

const BASE_POOL: Record<string, number> = { beton: 180, stahl: 90, kies: 240 };

function chf(value: number, decimals = 2) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

function discountForVolume(volume: number) {
  let d = TIERS[0];
  for (const t of TIERS) if (volume >= t.min) d = t;
  return d;
}

/* -------------------------------------------------------------------------- */
/*  Chart: Rabatt über Poolvolumen                                             */
/* -------------------------------------------------------------------------- */

const CURVE = (() => {
  const pts: { v: number; d: number }[] = [];
  for (let v = 0; v <= SCALE_MAX; v += 10) pts.push({ v, d: discountForVolume(v).discount });
  return pts;
})();

function CurveTooltip({ active, payload, unit }: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { v: number; d: number };
  return (
    <div className="rounded-md border border-white/15 bg-navy-950 px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-semibold">{p.v} {unit} im Pool</div>
      <div className="text-brand">{p.d}% Rabatt</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Atoms (dunkel)                                                             */
/* -------------------------------------------------------------------------- */

function SpecPill({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
      <Icon className="h-3.5 w-3.5 text-white/40" />
      {children}
    </span>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone?: "gold" | "white" }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      <div className={cn("mt-1 text-lg font-bold tabular-nums", tone === "gold" ? "text-brand" : "text-white")}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-white/40">{sub}</div>}
    </div>
  );
}

const PHASES = [
  { key: "OPEN", label: "Sammelphase", icon: Layers },
  { key: "SEALED_BIDDING", label: "Sealed-Bid", icon: Gavel },
  { key: "AWARDED", label: "Zuschlag", icon: CheckCircle2 },
];

function PhaseStepper({ current }: { current: string }) {
  const idx = PHASES.findIndex((p) => p.key === current);
  return (
    <div className="flex items-center gap-2">
      {PHASES.map((p, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={p.key} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                active && "bg-brand/15 text-brand",
                done && "bg-white/10 text-white/70",
                !active && !done && "text-white/35",
              )}
            >
              <p.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{p.label}</span>
            </span>
            {i < PHASES.length - 1 && <span className="h-px w-3 bg-white/15" />}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main                                                                       */
/* -------------------------------------------------------------------------- */

export default function BundleEngine() {
  const [materialKey, setMaterialKey] = useState(MATERIALS[0].key);
  const [qty, setQty] = useState(60);

  const material = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[0];
  const { unit, listPrice, kbobPrice } = material;
  const base = BASE_POOL[material.key] ?? 180;
  const total = base + Math.max(0, qty);

  const calc = useMemo(() => {
    const tier = discountForVolume(total);
    const customerDiscount = tier.discount;
    const supplierDiscount = customerDiscount + PLATFORM_FEE_PCT;
    const customerUnitPrice = listPrice * (1 - customerDiscount / 100);
    const feeUnit = listPrice * (PLATFORM_FEE_PCT / 100);
    const savingsUnit = kbobPrice - customerUnitPrice;
    const yourSavings = savingsUnit * Math.max(0, qty);
    const totalSavings = savingsUnit * total;
    const next = TIERS.find((t) => t.min > total);
    const toNext = next ? { needed: next.min - total, disc: next.discount } : null;
    return { tier, customerDiscount, supplierDiscount, customerUnitPrice, feeUnit, savingsUnit, yourSavings, totalSavings, toNext };
  }, [total, listPrice, kbobPrice]);

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-navy-900 text-white shadow-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand/15 text-brand">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">Smart Bündel · {material.label}</h2>
            <p className="text-[12px] text-white/45">Raum Zürich / Limmattal · ≤ 25 km · Einbau Q4 2026</p>
          </div>
        </div>
        <PhaseStepper current="OPEN" />
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Steuerung */}
        <div>
          {/* Material */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Material</div>
          <div className="mt-2 inline-flex flex-wrap gap-1 rounded-md border border-white/10 bg-white/5 p-1">
            {MATERIALS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMaterialKey(m.key)}
                className={cn(
                  "rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors",
                  m.key === materialKey ? "bg-brand text-navy-900" : "text-white/60 hover:text-white",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Menge + Volumen */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Deine Menge ({unit})</div>
              <div className="mt-2 inline-flex items-center rounded-md border border-white/15 bg-white/[0.04]">
                <button type="button" onClick={() => setQty((q) => Math.max(0, q - 10))} className="grid h-10 w-10 place-items-center text-white/60 transition-colors hover:bg-white/5" aria-label="weniger">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20 border-x border-white/15 bg-transparent px-2 py-2 text-center text-lg font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button type="button" onClick={() => setQty((q) => q + 10)} className="grid h-10 w-10 place-items-center text-white/60 transition-colors hover:bg-white/5" aria-label="mehr">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Poolvolumen (neu)</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <motion.span key={total} initial={{ opacity: 0.4, y: -2 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold tabular-nums text-white">
                  {chf(total, 0)}
                </motion.span>
                <span className="text-sm text-white/45">{unit}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-white/40">{chf(base, 0)} bereits im Pool + {chf(Math.max(0, qty), 0)} von dir</div>
            </div>
          </div>

          {/* Rabatt-Kurve */}
          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Rabatt über Poolvolumen</div>
              <div className="text-[11px] text-white/40">aktuell <span className="font-bold text-brand">{calc.customerDiscount}%</span></div>
            </div>
            <div className="h-36 rounded-md border border-white/10 bg-white/[0.02] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CURVE} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
                  <defs>
                    <linearGradient id="dcurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D99000" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#D99000" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="v" type="number" domain={[0, SCALE_MAX]} tickFormatter={(v) => `${v}`} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,.4)" }} ticks={[0, 200, 350, 500, 650]} />
                  <YAxis dataKey="d" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,.4)" }} domain={[0, 22]} ticks={[0, 10, 20]} />
                  <Tooltip content={<CurveTooltip unit={unit} />} cursor={{ stroke: "rgba(255,255,255,.2)" }} />
                  <Area type="stepAfter" dataKey="d" stroke="#D99000" strokeWidth={2} fill="url(#dcurve)" />
                  <ReferenceLine x={total} stroke="#E6A417" strokeDasharray="3 3" />
                  <ReferenceDot x={total} y={calc.customerDiscount} r={4} fill="#E6A417" stroke="#08111E" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {calc.toNext ? (
              <p className="mt-2 text-[12px] text-white/55">
                Noch <span className="font-semibold text-white">{chf(calc.toNext.needed, 0)} {unit}</span> bis {calc.toNext.disc}% — der erreichte Rabatt gilt garantiert für alle Teilnehmer.
              </p>
            ) : (
              <p className="mt-2 text-[12px] font-medium text-brand">Höchste Stufe erreicht: 20% Rabatt für alle Teilnehmer.</p>
            )}
          </div>
        </div>

        {/* Ergebnis */}
        <div className="lg:border-l lg:border-white/10 lg:pl-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Dein aktueller Vorteil</div>
          <div className="mt-1 flex items-baseline gap-2">
            <motion.span key={calc.customerDiscount} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-bold tabular-nums text-brand">
              {calc.customerDiscount}%
            </motion.span>
            <span className="text-sm text-white/45">Rabatt</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-white/60">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> garantiert für alle im Pool
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Metric label="Kundenpreis" value={`CHF ${chf(calc.customerUnitPrice)}`} sub={`pro ${unit}`} />
            <Metric label="Ersparnis / Einheit" value={`CHF ${chf(calc.savingsUnit)}`} sub={`vs. KBOB ${chf(kbobPrice)}`} tone="gold" />
          </div>
          <div className="mt-2.5 rounded-md border border-brand/25 bg-brand/[0.06] p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              <TrendingDown className="h-3.5 w-3.5 text-brand" /> Deine Ersparnis
            </div>
            <motion.div key={Math.round(calc.yourSavings)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-1 text-2xl font-bold tabular-nums text-brand">
              CHF {chf(calc.yourSavings, 0)}
            </motion.div>
            <div className="text-[11px] text-white/40">auf {chf(Math.max(0, qty), 0)} {unit} · Pool spart total CHF {chf(calc.totalSavings, 0)}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <SpecPill icon={FileText}>{material.spec}</SpecPill>
            <SpecPill icon={MapPin}>Raum Zürich</SpecPill>
            <SpecPill icon={CalendarClock}>Q4 2026</SpecPill>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/beschaffung" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500">
              <Layers className="h-4 w-4" /> Diesem Pool beitreten
            </Link>
            <Link href={`/kbob?material=${material.material}`} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/5">
              <LineChart className="h-4 w-4" /> KBOB
            </Link>
          </div>
        </div>
      </div>

      <p className="border-t border-white/10 px-5 py-3 text-[11px] text-white/35 sm:px-7">
        Monetarisierung: {PLATFORM_FEE_PCT}% Plattform-Marge im Lieferanten-Bid ({calc.supplierDiscount.toFixed(2)}% = Kundenrabatt + Marge).
        Nach der Sammelphase bieten Lieferanten im Sealed-Bid auf das gesamte Poolvolumen; der günstigste Bid gegenüber dem KBOB-Referenzpreis erhält den Zuschlag.
      </p>
    </section>
  );
}
