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
import { chf as chfRaw } from "@/lib/format";
import { useRabattstufen } from "@/lib/rabatt";
const chf = (value: number, decimals = 2) => chfRaw(value, decimals);

/* -------------------------------------------------------------------------- */
/*  Business config                                                            */
/* -------------------------------------------------------------------------- */

const PLATFORM_FEE_PCT = 2.25;

/*
 * Die Staffel steht NICHT mehr hier.
 *
 * Bis vor Kurzem rechnete dieser Rechner mit einer eigenen Kurve: 5 % ab
 * dem ersten Kubikmeter, 20 % ab 500 — gestaffelt nach Poolvolumen. Beides
 * war falsch. Der garantierte Mindestrabatt hängt am Bestellwert der
 * einzelnen Firma in CHF, nicht an der Menge und nicht am Volumen des
 * Bündels; und er reicht bis 10 %, nicht bis 20 %. Ein öffentlicher
 * Rechner, der mehr verspricht als die Plattform garantiert, ist kein
 * Rechner, sondern ein Versprechen, das später jemand einlösen muss.
 *
 * Die Zahlen kommen jetzt aus `rabattstufen` — derselben Tabelle, aus der
 * auch der Bedarfs-Flow und die Datenbank selbst rechnen.
 */

/** Achsenbereich des Diagramms in CHF (logarithmisch). */
const SCALE_MIN = 1_000;
const SCALE_MAX = 1_000_000;

/** 5'000 → "5'000", 1'000'000 → "1 Mio." — kurz genug für eine Achse. */
function achsenLabel(v: number) {
  return v >= 1_000_000 ? `${v / 1_000_000} Mio.` : chfRaw(v, 0);
}

type Material = {
  key: string;
  label: string;
  spec: string;
  unit: string;
  listPrice: number;
  kbobPrice: number;
  material: string;
  /** Muss auf `rabattstufen.material_category` passen. */
  category: string;
};

const MATERIALS: Material[] = [
  { key: "beton", label: "Beton C25/30", spec: "SN EN 206 · C25/30 · Cl 0.20 · Dmax 32", unit: "m³", listPrice: 165, kbobPrice: 156, material: "beton", category: "Beton" },
  { key: "stahl", label: "Bewehrungsstahl B500B", spec: "SIA 262 · B500B · Ring / Stäbe", unit: "t", listPrice: 1180, kbobPrice: 1120, material: "stahl", category: "Bewehrung & Stahl" },
  { key: "kies", label: "Koffer-/Wandkies 0/45", spec: "SN 670 · ungebrochen 0/45", unit: "t", listPrice: 42, kbobPrice: 39, material: "kies", category: "Kies, Aushub & Recycling" },
];

const BASE_POOL: Record<string, number> = { beton: 180, stahl: 90, kies: 240 };


/* -------------------------------------------------------------------------- */
/*  Chart: garantierter Mindestrabatt über dem eigenen Bestellwert             */
/* -------------------------------------------------------------------------- */

function CurveTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { v: number; d: number };
  return (
    <div className="rounded-md border border-white/15 bg-black px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-semibold">Bestellwert CHF {chfRaw(p.v, 0)}</div>
      <div className="text-brand">mind. {p.d}% garantiert</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Atoms (dunkel)                                                             */
/* -------------------------------------------------------------------------- */

function SpecPill({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/5 px-2.5 py-1 text-xs text-white/[0.72]">
      <Icon className="h-3.5 w-3.5 text-white/[0.56]" />
      {children}
    </span>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone?: "gold" | "white" }) {
  return (
    <div className="rounded-md border border-white/[0.12] bg-white/[0.03] p-3.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">{label}</div>
      <div className={cn("mt-1 text-lg font-bold tabular-nums", tone === "gold" ? "text-brand" : "text-white")}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-white/[0.56]">{sub}</div>}
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
                done && "bg-white/10 text-white/[0.72]",
                !active && !done && "text-white/[0.5]",
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
  const { unit, listPrice, kbobPrice, category } = material;
  const base = BASE_POOL[material.key] ?? 180;
  const total = base + Math.max(0, qty);

  const { stufen, laden: stufenLaden, meinMindestrabatt, buendelbar } = useRabattstufen();

  /** Der eigene Bestellwert — daran hängt die Garantie, nicht am Pool. */
  const bestellwert = Math.max(0, qty) * kbobPrice;
  const bündelbar = buendelbar(category);

  /** Die Treppe dieser Kategorie, logarithmisch abgetastet. */
  const curve = useMemo(() => {
    const eigene = stufen
      .filter((t) => t.material_category === category)
      .sort((a, b) => Number(a.ab_chf) - Number(b.ab_chf));
    if (!eigene.length) return [];
    const wertBei = (v: number) => {
      let d = 0;
      for (const t of eigene) if (v >= Number(t.ab_chf)) d = Number(t.rabatt_pct);
      return d;
    };
    const pts: { v: number; d: number }[] = [];
    const schritte = 120;
    for (let i = 0; i <= schritte; i++) {
      const v = SCALE_MIN * Math.pow(SCALE_MAX / SCALE_MIN, i / schritte);
      pts.push({ v, d: wertBei(v) });
    }
    // Die Schwellen selbst als Stützpunkte, damit die Treppe exakt dort
    // springt, wo sie es tut, und nicht beim nächsten Abtastpunkt.
    for (const t of eigene) {
      const v = Number(t.ab_chf);
      if (v >= SCALE_MIN && v <= SCALE_MAX) pts.push({ v, d: Number(t.rabatt_pct) });
    }
    return pts.sort((a, b) => a.v - b.v);
  }, [stufen, category]);

  const calc = useMemo(() => {
    const garantie = meinMindestrabatt(category, bestellwert);
    const customerDiscount = garantie ?? 0;
    const supplierDiscount = customerDiscount + PLATFORM_FEE_PCT;
    const customerUnitPrice = listPrice * (1 - customerDiscount / 100);
    const feeUnit = listPrice * (PLATFORM_FEE_PCT / 100);
    const savingsUnit = kbobPrice - customerUnitPrice;
    const yourSavings = savingsUnit * Math.max(0, qty);
    // Die nächste Schwelle dieser Kategorie — in CHF, nicht in Kubikmetern.
    const naechste = stufen
      .filter((t) => t.material_category === category && Number(t.ab_chf) > bestellwert)
      .sort((a, b) => Number(a.ab_chf) - Number(b.ab_chf))[0];
    const toNext = naechste
      ? { fehlt: Number(naechste.ab_chf) - bestellwert, disc: Number(naechste.rabatt_pct) }
      : null;
    return { garantie, customerDiscount, supplierDiscount, customerUnitPrice, feeUnit, savingsUnit, yourSavings, toNext };
  }, [category, bestellwert, listPrice, kbobPrice, qty, meinMindestrabatt, stufen]);

  return (
    <section className="overflow-hidden rounded-lg border border-white/[0.12] bg-navy-900 text-white shadow-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/[0.12] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-2.5">
          {/* Ein Schichten-Symbol neben „Smart Bündel" sagt nichts, was die
              Überschrift nicht schon sagt. */}
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">Smart Bündel · {material.label}</h2>
            <p className="text-[12px] text-white/[0.56]">Raum Zürich / Limmattal · ≤ 25 km · Einbau Q4 2026</p>
          </div>
        </div>
        <PhaseStepper current="OPEN" />
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Steuerung */}
        <div>
          {/* Material */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">Material</div>
          <div className="mt-2 inline-flex flex-wrap gap-1 rounded-md border border-white/[0.12] bg-white/5 p-1">
            {MATERIALS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMaterialKey(m.key)}
                className={cn(
                  "rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors",
                  m.key === materialKey ? "bg-brand text-navy-900" : "text-white/[0.72] hover:text-white",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Menge + Volumen */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">Deine Menge ({unit})</div>
              <div className="mt-2 inline-flex items-center rounded-md border border-white/15 bg-white/[0.04]">
                <button type="button" onClick={() => setQty((q) => Math.max(0, q - 10))} className="grid h-10 w-10 place-items-center text-white/[0.72] transition-colors hover:bg-white/5" aria-label="weniger">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20 border-x border-white/15 bg-transparent px-2 py-2 text-center text-lg font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button type="button" onClick={() => setQty((q) => q + 10)} className="grid h-10 w-10 place-items-center text-white/[0.72] transition-colors hover:bg-white/5" aria-label="mehr">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">Dein Bestellwert</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <motion.span key={Math.round(bestellwert)} initial={{ opacity: 0.4, y: -2 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold tabular-nums text-white">
                  CHF {chf(bestellwert, 0)}
                </motion.span>
              </div>
              <div className="mt-0.5 text-[11px] text-white/[0.56]">
                {chf(Math.max(0, qty), 0)} {unit} · Pool aktuell {chf(total, 0)} {unit}
              </div>
            </div>
          </div>

          {/* Rabatt-Kurve */}
          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">
                Mindestrabatt über deinem Bestellwert
              </div>
              <div className="text-[11px] text-white/[0.56]">
                aktuell{" "}
                <span className="font-bold text-brand">
                  {calc.garantie != null ? `${calc.garantie}%` : "—"}
                </span>
              </div>
            </div>
            <div className="h-36 rounded-md border border-white/[0.12] bg-white/[0.02] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
                  <defs>
                    <linearGradient id="dcurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D99000" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#D99000" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
                  {/* Die Schwellen liegen zwischen 5'000 und 1 Mio. CHF — auf
                      einer linearen Achse waere die halbe Treppe in den ersten
                      Pixeln zusammengedraengt. Darum logarithmisch, mit
                      beschrifteten Stuetzstellen. */}
                  <XAxis
                    dataKey="v"
                    type="number"
                    scale="log"
                    domain={[SCALE_MIN, SCALE_MAX]}
                    allowDataOverflow
                    tickFormatter={achsenLabel}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,.4)" }}
                    ticks={[1_000, 10_000, 100_000, 1_000_000]}
                  />
                  <YAxis dataKey="d" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,.4)" }} domain={[0, 12]} ticks={[0, 5, 10]} />
                  <Tooltip content={<CurveTooltip />} cursor={{ stroke: "rgba(255,255,255,.2)" }} />
                  <Area type="stepAfter" dataKey="d" stroke="#D99000" strokeWidth={2} fill="url(#dcurve)" />
                  {bestellwert >= SCALE_MIN && (
                    <ReferenceLine x={Math.min(bestellwert, SCALE_MAX)} stroke="#E6A417" strokeDasharray="3 3" />
                  )}
                  {bestellwert >= SCALE_MIN && calc.garantie != null && (
                    <ReferenceDot x={Math.min(bestellwert, SCALE_MAX)} y={calc.garantie} r={4} fill="#E6A417" stroke="#08111E" strokeWidth={2} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {calc.toNext ? (
              <p className="mt-2 text-[12px] text-white/[0.72]">
                Noch <span className="font-semibold text-white">CHF {chf(calc.toNext.fehlt, 0)}</span> in{" "}
                {category} bis {calc.toNext.disc}% — die Staffel zählt deinen Bestellwert, nicht das
                Volumen des Bündels.
              </p>
            ) : calc.garantie != null ? (
              <p className="mt-2 text-[12px] font-medium text-brand">
                Höchste Stufe erreicht: {calc.garantie}% garantiert.
              </p>
            ) : null}
          </div>
        </div>

        {/* Ergebnis */}
        <div className="lg:border-l lg:border-white/[0.12] lg:pl-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">Dein aktueller Vorteil</div>
          <div className="mt-1 flex items-baseline gap-2">
            <motion.span key={calc.customerDiscount} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-bold tabular-nums text-brand">
              {calc.garantie != null ? `${calc.garantie}%` : "—"}
            </motion.span>
            <span className="text-sm text-white/[0.56]">Rabatt</span>
          </div>
          <div className="mt-1 inline-flex items-start gap-1.5 text-[12px] text-white/[0.72]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            {stufenLaden
              ? "Staffel wird geladen"
              : !bündelbar
                ? `${category} wird einzeln verhandelt — keine Mengengarantie`
                : calc.garantie != null
                  ? "dein garantierter Mindestrabatt"
                  : "noch unter der Einstiegsschwelle"}
          </div>

          {stufenLaden ? null : calc.garantie != null ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Metric label="Höchstpreis" value={`CHF ${chf(calc.customerUnitPrice)}`} sub={`pro ${unit}`} />
                <Metric label="Ersparnis / Einheit" value={`CHF ${chf(calc.savingsUnit)}`} sub={`vs. KBOB ${chf(kbobPrice)}`} tone="gold" />
              </div>
              <div className="mt-2.5 rounded-md border border-brand/25 bg-brand/[0.06] p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/[0.56]">
                  <TrendingDown className="h-3.5 w-3.5 text-brand" /> Deine Ersparnis, mindestens
                </div>
                <motion.div key={Math.round(calc.yourSavings)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-1 text-2xl font-bold tabular-nums text-brand">
                  CHF {chf(calc.yourSavings, 0)}
                </motion.div>
                {/* Kein „Pool spart total" mehr: was die anderen Teilnehmer
                    sparen, hängt an deren eigenem Bestellwert. Eine Summe
                    darüber wäre eine erfundene Zahl. */}
                <div className="text-[11px] text-white/[0.56]">auf {chf(Math.max(0, qty), 0)} {unit} · vs. KBOB</div>
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-md border border-white/[0.12] p-3.5 text-[12px] leading-relaxed text-white/[0.56]">
              {!bündelbar
                ? `Für ${category} führen wir keine Mengenstaffel. Der Bedarf geht trotzdem in die Ausschreibung — nur ohne zugesicherte Untergrenze.`
                : "Unterhalb der Einstiegsschwelle sichern wir keinen Prozentsatz zu. Der Bedarf geht trotzdem in die Ausschreibung — die Werke bieten, was sie bieten wollen."}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            <SpecPill icon={FileText}>{material.spec}</SpecPill>
            <SpecPill icon={MapPin}>Raum Zürich</SpecPill>
            <SpecPill icon={CalendarClock}>Q4 2026</SpecPill>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/beschaffung" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand/100">
              <Layers className="h-4 w-4" /> Diesem Pool beitreten
            </Link>
            <Link href={`/kbob?material=${material.material}`} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-3 py-2.5 text-sm font-semibold text-white/[0.72] transition-colors hover:bg-white/5">
              <LineChart className="h-4 w-4" /> KBOB
            </Link>
          </div>
        </div>
      </div>

      <p className="border-t border-white/[0.12] px-5 py-3 text-[11px] text-white/[0.5] sm:px-7">
        Monetarisierung: {PLATFORM_FEE_PCT}% Plattform-Marge im Lieferanten-Bid
        {calc.garantie != null && ` (${calc.supplierDiscount.toFixed(2)}% = Kundenrabatt + Marge)`}.
        Nach der Sammelphase bieten Lieferanten verdeckt auf das Bündel — ganz oder auf einen Teil
        der Baustellen. Die Untergrenze des Bündels ist der höchste individuelle Anspruch seiner
        Teilnehmer; darunter wird geboten, darüber nicht.
      </p>
    </section>
  );
}
