"use client";

import { useMemo, useState } from "react";
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
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Business config                                                            */
/* -------------------------------------------------------------------------- */

const PLATFORM_FEE_PCT = 2.25;

/** Volumen-Preistreppe (Spec Abschnitt B). max=null => offenes oberes Ende. */
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
  /** Listenpreis Werk (netto, vor Rabatt) */
  listPrice: number;
};

const MATERIALS: Material[] = [
  {
    key: "beton",
    label: "Beton C25/30",
    spec: "C25/30, Cl 0.20, Dmax 32, C3",
    unit: "m³",
    listPrice: 165,
  },
  {
    key: "stahl",
    label: "Bewehrungsstahl B500B",
    spec: "B500B, Ring / Stäbe",
    unit: "t",
    listPrice: 1180,
  },
  {
    key: "kies",
    label: "Koffer- / Wandkies 0/45",
    spec: "Ungebrochen 0/45",
    unit: "t",
    listPrice: 42,
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

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
/*  Small UI atoms                                                             */
/* -------------------------------------------------------------------------- */

function SpecPill({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300">
      <Icon className="h-3.5 w-3.5 text-neutral-400" />
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: "green" | "blue" | "neutral";
}) {
  const color =
    accent === "green"
      ? "text-pool-green"
      : accent === "blue"
        ? "text-kbob-blue"
        : "text-neutral-50";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className={cn("mt-1.5 text-xl font-semibold", color)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Phase stepper                                                              */
/* -------------------------------------------------------------------------- */

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
                active && "bg-kbob-blue/15 text-kbob-blue",
                done && "bg-pool-green/10 text-pool-green",
                !active && !done && "bg-white/5 text-neutral-500",
              )}
            >
              <p.icon className="h-3.5 w-3.5" />
              {p.label}
            </span>
            {i < PHASES.length - 1 && (
              <span
                className={cn(
                  "h-px w-4",
                  i < idx ? "bg-pool-green/40" : "bg-white/10",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Preistreppe (staircase)                                                    */
/* -------------------------------------------------------------------------- */

function Preistreppe({
  activeTier,
  unit,
}: {
  activeTier: number;
  unit: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TIERS.map((t) => {
        const active = t.tier === activeTier;
        const reached = t.tier <= activeTier;
        const range =
          t.max === null ? `${t.min}+ ${unit}` : `${t.min}–${t.max} ${unit}`;
        return (
          <div
            key={t.tier}
            className={cn(
              "flex flex-col justify-end rounded-xl border p-3 transition-colors",
              active
                ? "border-pool-green/50 bg-pool-green/10"
                : reached
                  ? "border-white/15 bg-white/[0.06]"
                  : "border-white/10 bg-white/[0.02]",
            )}
            style={{ minHeight: `${64 + t.tier * 26}px` }}
          >
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">
              Tier {t.tier}
            </div>
            <div
              className={cn(
                "text-2xl font-semibold",
                active ? "text-pool-green" : "text-neutral-200",
              )}
            >
              {t.discount}%
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500">{range}</div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function BundleEngine() {
  const [materialKey, setMaterialKey] = useState(MATERIALS[0].key);
  const [volume, setVolume] = useState(180);

  const material = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[0];
  const listPrice = material.listPrice;
  const unit = material.unit;

  const calc = useMemo(() => {
    const tier = tierForVolume(volume);
    const customerDiscount = tier.discount; // garantierter Endkundenrabatt
    const supplierDiscount = customerDiscount + PLATFORM_FEE_PCT; // Bid-Ziel Werk

    const customerUnitPrice = listPrice * (1 - customerDiscount / 100);
    const savingsUnit = listPrice - customerUnitPrice;
    const feeUnit = listPrice * (PLATFORM_FEE_PCT / 100);

    const totalList = listPrice * volume;
    const totalCustomer = customerUnitPrice * volume;
    const totalSavings = savingsUnit * volume;
    const totalFee = feeUnit * volume;

    // Fortschritt zur nächsten Tier-Stufe
    const nextTier = TIERS.find((t) => t.tier === tier.tier + 1);
    let toNext: { needed: number; target: number } | null = null;
    if (nextTier) {
      const target = nextTier.min;
      toNext = { needed: Math.max(0, target - volume), target };
    }

    return {
      tier,
      customerDiscount,
      supplierDiscount,
      customerUnitPrice,
      savingsUnit,
      feeUnit,
      totalList,
      totalCustomer,
      totalSavings,
      totalFee,
      toNext,
    };
  }, [listPrice, volume]);

  return (
    <section className="w-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-100">
              Smart Bündel · Preistreppe
            </h2>
            <span className="rounded-full bg-kbob-blue/15 px-2 py-0.5 text-[11px] font-medium text-kbob-blue">
              OPEN
            </span>
          </div>
          {/* 3 Pflicht-Gruppierungsparameter (Spec B) */}
          <div className="mt-3 flex flex-wrap gap-2">
            <SpecPill icon={FileText}>{material.spec}</SpecPill>
            <SpecPill icon={MapPin}>Raum Zürich / Limmattal · ≤ 25 km</SpecPill>
            <SpecPill icon={CalendarClock}>Einbau Q4 2026</SpecPill>
          </div>
        </div>
        <PhaseStepper current="OPEN" />
      </div>

      {/* Material selector */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Material
        </span>
        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          {MATERIALS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMaterialKey(m.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                m.key === materialKey
                  ? "bg-kbob-blue text-white shadow-sm shadow-kbob-blue/30"
                  : "text-neutral-400 hover:text-neutral-100",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume control */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Aktuelles Poolvolumen
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-neutral-50">
                {chf(volume, 0)}
              </span>
              <span className="text-sm text-neutral-500">{unit}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Erreichter Tier
            </div>
            <div className="mt-1 text-3xl font-semibold text-pool-green">
              {calc.tier.discount}%
            </div>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={550}
          step={5}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mt-4 w-full cursor-pointer"
          style={{ accentColor: "#10B981" }}
          aria-label="Poolvolumen"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-600">
          <span>0</span>
          <span>100</span>
          <span>300</span>
          <span>500+</span>
        </div>

        {calc.toNext ? (
          <p className="mt-3 text-sm text-neutral-400">
            Noch{" "}
            <span className="font-semibold text-neutral-100">
              {chf(calc.toNext.needed, 0)} {unit}
            </span>{" "}
            bis Tier {calc.tier.tier + 1} (
            {TIERS.find((t) => t.tier === calc.tier.tier + 1)?.discount}%
            Rabatt).
          </p>
        ) : (
          <p className="mt-3 text-sm text-pool-green">
            Höchste Rabattstufe erreicht — Tier 3 (20%).
          </p>
        )}
      </div>

      {/* Preistreppe */}
      <div className="mt-6">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Preistreppe
        </div>
        <Preistreppe activeTier={calc.tier.tier} unit={unit} />
        <p className="mt-3 flex items-start gap-2 text-xs text-neutral-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pool-green" />
          Garantierter Tier-Rabatt: Alle Teilnehmer erhalten den bei
          Pool-Abschluss erreichten Endrabatt — unabhängig vom Beitrittszeitpunkt.
        </p>
      </div>

      {/* Monetarisierung / Margin */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          <Coins className="h-3.5 w-3.5" />
          Monetarisierung (2.25 % Plattform-Marge)
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Endkunden-Rabatt"
            value={`${calc.customerDiscount}%`}
            sub={`ab Listenpreis CHF ${chf(listPrice)}`}
            accent="green"
          />
          <Stat
            label="Bid-Ziel Lieferant"
            value={`${chf(calc.supplierDiscount, 2)}%`}
            sub={`= Kundenrabatt + ${PLATFORM_FEE_PCT}%`}
            accent="blue"
          />
          <Stat
            label="Kundenpreis"
            value={`CHF ${chf(calc.customerUnitPrice)}`}
            sub={`pro ${unit} · −CHF ${chf(calc.savingsUnit)}`}
          />
          <Stat
            label="Plattform-Gebühr"
            value={`CHF ${chf(calc.feeUnit)}`}
            sub={`pro ${unit} (${PLATFORM_FEE_PCT}%)`}
          />
        </div>

        {/* Totals */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">
              Poolwert (Kundenpreis)
            </div>
            <div className="mt-1 text-lg font-semibold text-neutral-50">
              CHF {chf(calc.totalCustomer, 0)}
            </div>
          </div>
          <div className="rounded-xl border border-pool-green/30 bg-pool-green/5 p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500">
              <TrendingDown className="h-3.5 w-3.5 text-pool-green" />
              Ersparnis Pool total
            </div>
            <div className="mt-1 text-lg font-semibold text-pool-green">
              CHF {chf(calc.totalSavings, 0)}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500">
              Plattform-Umsatz
            </div>
            <div className="mt-1 text-lg font-semibold text-kbob-blue">
              CHF {chf(calc.totalFee, 0)}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 text-[11px] text-neutral-600">
        <Circle className="mt-0.5 h-3 w-3 shrink-0" />
        Nach Ablauf der Sammelphase geht das Bündel in die Sealed-Bid-Phase:
        Lieferanten bieten auf das gesamte Poolvolumen; der günstigste Bid
        gegenüber dem KBOB-Referenzpreis erhält den Zuschlag.
      </p>
    </section>
  );
}
