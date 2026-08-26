"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  CalendarClock,
  FileText,
  Layers,
  TrendingDown,
  Coins,
  ShieldCheck,
  Gavel,
  CheckCircle2,
  Minus,
  Plus,
  LineChart,
} from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Business config                                                            */
/* -------------------------------------------------------------------------- */

const PLATFORM_FEE_PCT = 2.25;
const SCALE_MAX = 550; // Skala des Fortschrittsbalkens

const TIERS = [
  { tier: 1, min: 0, max: 100, discount: 5 },
  { tier: 2, min: 101, max: 300, discount: 12 },
  { tier: 3, min: 301, max: null as number | null, discount: 20 },
];

type Material = {
  key: string;
  label: string;
  spec: string;
  unit: string;
  listPrice: number; // Listenpreis Werk (netto)
  kbobPrice: number; // offizieller KBOB-Marktpreis
  material: string;
};

const MATERIALS: Material[] = [
  { key: "beton", label: "Beton C25/30", spec: "C25/30, Cl 0.20, Dmax 32, C3", unit: "m³", listPrice: 165, kbobPrice: 156, material: "beton" },
  { key: "stahl", label: "Bewehrungsstahl B500B", spec: "B500B, Ring / Stäbe", unit: "t", listPrice: 1180, kbobPrice: 1120, material: "stahl" },
  { key: "kies", label: "Koffer- / Wandkies 0/45", spec: "Ungebrochen 0/45", unit: "t", listPrice: 42, kbobPrice: 39, material: "kies" },
];

const BASE_POOL: Record<string, number> = { beton: 180, stahl: 90, kies: 240 };

function chf(value: number, decimals = 2) {
  return new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function tierForVolume(volume: number) {
  return (
    TIERS.find((t) => volume >= t.min && (t.max === null || volume <= t.max)) ??
    TIERS[0]
  );
}

/* -------------------------------------------------------------------------- */
/*  Atoms                                                                      */
/* -------------------------------------------------------------------------- */

function SpecPill({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {children}
    </span>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: "green" | "brand" | "neutral" }) {
  const color = accent === "green" ? "text-emerald" : accent === "brand" ? "text-brand" : "text-slate-900";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className={cn("mt-1.5 text-xl font-semibold tabular-nums", color)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
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
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={p.key} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
                active && "bg-brand/10 text-brand",
                done && "bg-emerald/10 text-emerald",
                !active && !done && "bg-slate-100 text-slate-400",
              )}
            >
              <p.icon className="h-3.5 w-3.5" />
              {p.label}
            </span>
            {i < PHASES.length - 1 && (
              <span className={cn("h-px w-4", i < idx ? "bg-emerald/40" : "bg-slate-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Preistreppe({ activeTier, unit }: { activeTier: number; unit: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TIERS.map((t) => {
        const active = t.tier === activeTier;
        const reached = t.tier <= activeTier;
        const range = t.max === null ? `${t.min}+ ${unit}` : `${t.min}–${t.max} ${unit}`;
        return (
          <motion.div
            key={t.tier}
            animate={{ scale: active ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "flex flex-col justify-end rounded-lg border p-3 transition-colors",
              active ? "border-emerald/50 bg-emerald/10" : reached ? "border-slate-300 bg-slate-100" : "border-slate-200 bg-slate-50",
            )}
            style={{ minHeight: `${64 + t.tier * 26}px` }}
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Tier {t.tier}</div>
            <div className={cn("text-2xl font-semibold", active ? "text-emerald" : "text-slate-700")}>{t.discount}%</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{range}</div>
          </motion.div>
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
  const [qty, setQty] = useState(50); // deine Menge

  const material = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[0];
  const { unit, listPrice, kbobPrice } = material;
  const base = BASE_POOL[material.key] ?? 180;
  const total = base + Math.max(0, qty);

  const calc = useMemo(() => {
    const tier = tierForVolume(total);
    const customerDiscount = tier.discount;
    const supplierDiscount = customerDiscount + PLATFORM_FEE_PCT;
    const customerUnitPrice = listPrice * (1 - customerDiscount / 100);
    const feeUnit = listPrice * (PLATFORM_FEE_PCT / 100);
    const savingsUnit = kbobPrice - customerUnitPrice; // Ersparnis vs. KBOB
    const totalSavings = savingsUnit * total;
    const yourSavings = savingsUnit * Math.max(0, qty);

    const nextTier = TIERS.find((t) => t.tier === tier.tier + 1);
    const toNext = nextTier ? { needed: Math.max(0, nextTier.min - total), disc: nextTier.discount, tier: nextTier.tier } : null;
    const progress = Math.min(100, (total / SCALE_MAX) * 100);

    return { tier, customerDiscount, supplierDiscount, customerUnitPrice, feeUnit, savingsUnit, totalSavings, yourSavings, toNext, progress };
  }, [total, qty, listPrice, kbobPrice]);

  return (
    <section className={cn(CARD, "p-5 sm:p-7")}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Smart Bündel · Preistreppe</h2>
            <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">OPEN</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <SpecPill icon={FileText}>{material.spec}</SpecPill>
            <SpecPill icon={MapPin}>Raum Zürich / Limmattal · ≤ 25 km</SpecPill>
            <SpecPill icon={CalendarClock}>Einbau Q4 2026</SpecPill>
          </div>
        </div>
        <PhaseStepper current="OPEN" />
      </div>

      {/* Material */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Material</span>
        <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">
          {MATERIALS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMaterialKey(m.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                m.key === materialKey ? "bg-brand text-white shadow-sm shadow-brand/30" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume selector */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          {/* Input */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Deine Menge ({unit})
            </label>
            <div className="mt-1 inline-flex items-center rounded-lg border border-slate-200 bg-white">
              <button type="button" onClick={() => setQty((q) => Math.max(0, q - 10))} className="grid h-11 w-11 place-items-center rounded-l-xl text-slate-500 transition-colors hover:bg-slate-100" aria-label="weniger">
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={0}
                value={qty}
                onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
                className="w-24 border-x border-slate-200 bg-transparent px-2 py-2 text-center text-lg font-semibold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" onClick={() => setQty((q) => q + 10)} className="grid h-11 w-11 place-items-center rounded-r-xl text-slate-500 transition-colors hover:bg-slate-100" aria-label="mehr">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="text-sm text-slate-500">
            <div>
              Aktuelles Pool­volumen: <span className="font-semibold text-slate-700">{chf(base, 0)} {unit}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Neues Poolvolumen</span>
              <motion.span key={total} initial={{ opacity: 0.4, y: -2 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-slate-900">
                {chf(total, 0)}
              </motion.span>
              <span className="text-sm text-slate-500">{unit}</span>
            </div>
          </div>

          {/* Tier badge */}
          <div className="text-right">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Erreichter Tier</div>
            <motion.div key={calc.tier.tier} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-1 text-3xl font-bold text-emerald">
              {calc.tier.discount}%
            </motion.div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald/70"
              animate={{ width: `${calc.progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0</span><span>100</span><span>300</span><span>500+</span>
          </div>
        </div>

        {calc.toNext ? (
          <p className="mt-3 text-sm text-slate-600">
            Noch <span className="font-semibold text-slate-900">{chf(calc.toNext.needed, 0)} {unit}</span> bis Tier {calc.toNext.tier} ({calc.toNext.disc}% Rabatt).
          </p>
        ) : (
          <p className="mt-3 text-sm font-medium text-emerald">Höchste Rabattstufe erreicht — Tier 3 (20%).</p>
        )}
      </div>

      {/* Preistreppe */}
      <div className="mt-6">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">Preistreppe</div>
        <Preistreppe activeTier={calc.tier.tier} unit={unit} />
        <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
          Garantierter Tier-Rabatt: Alle Teilnehmer erhalten den bei Pool-Abschluss erreichten Endrabatt — unabhängig vom Beitrittszeitpunkt.
        </p>
      </div>

      {/* Monetarisierung */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            <Coins className="h-3.5 w-3.5" /> Monetarisierung (2.25 % Plattform-Marge)
          </div>
          <Link href="/kbob" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-600">
            <LineChart className="h-3.5 w-3.5" /> KBOB-Vergleich
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Endkunden-Rabatt" value={`${calc.customerDiscount}%`} sub={`ab Listenpreis CHF ${chf(listPrice)}`} accent="green" />
          <Stat label="Bid-Ziel Lieferant" value={`${chf(calc.supplierDiscount)}%`} sub={`= Kundenrabatt + ${PLATFORM_FEE_PCT}%`} accent="brand" />
          <Stat label="Kundenpreis" value={`CHF ${chf(calc.customerUnitPrice)}`} sub={`pro ${unit}`} />
          <Stat label="Plattform-Gebühr" value={`CHF ${chf(calc.feeUnit)}`} sub={`pro ${unit} (${PLATFORM_FEE_PCT}%)`} />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Ersparnis pro {unit}</div>
            <div className="mt-1 text-lg font-semibold text-emerald">CHF {chf(calc.savingsUnit)}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">vs. KBOB CHF {chf(kbobPrice)}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Deine Ersparnis</div>
            <motion.div key={Math.round(calc.yourSavings)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-1 text-lg font-semibold text-slate-900">
              CHF {chf(calc.yourSavings, 0)}
            </motion.div>
            <div className="mt-0.5 text-[11px] text-slate-500">auf {chf(Math.max(0, qty), 0)} {unit}</div>
          </div>
          <div className="rounded-lg border border-emerald/30 bg-emerald/5 p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
              <TrendingDown className="h-3.5 w-3.5 text-emerald" /> Gesamtersparnis Pool
            </div>
            <motion.div key={Math.round(calc.totalSavings)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-1 text-lg font-semibold text-emerald">
              CHF {chf(calc.totalSavings, 0)}
            </motion.div>
            <div className="mt-0.5 text-[11px] text-slate-500">auf {chf(total, 0)} {unit}</div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-[11px] text-slate-400">
        Nach Ablauf der Sammelphase geht das Bündel in die Sealed-Bid-Phase: Lieferanten bieten auf das gesamte Poolvolumen; der günstigste Bid gegenüber dem KBOB-Referenzpreis erhält den Zuschlag.
      </p>
    </section>
  );
}
