"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ShoppingCart,
  Handshake,
  Loader2,
} from "lucide-react";
import kbobData from "@/data/kbobData.json";
import { useOwnPurchases, averageDelta, type Purchase } from "@/lib/kbobPurchases";
import { PANEL } from "@/lib/ui";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Daten                                                                     */
/* -------------------------------------------------------------------------- */

type PricePoint = { period: string; kbob: number };

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

const data = kbobData as unknown as KbobData;

const MATERIAL_KEYS = Object.keys(data.materials);
const REGION_KEYS = Object.keys(data.regions);
const RANGE_KEYS = Object.keys(data.timeRanges);

/** Womit man dieses Material tatsächlich beschafft. */
const PROCURE_LINK: Record<string, string> = {
  beton: "beton-25",
  stahl: "stahl-b500b",
  kies: "kies-045",
  transport: "",
};

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

/* -------------------------------------------------------------------------- */
/*  Formatierung                                                              */
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

/** "2021-Q1" → "Q1 '21" */
function shortPeriod(period: string) {
  const [year, q] = period.split("-");
  return `${q} '${year.slice(2)}`;
}

function pct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)} %`;
}

/* -------------------------------------------------------------------------- */
/*  Kleinteile                                                                */
/* -------------------------------------------------------------------------- */

function Trend({ value, invert }: { value: number; invert?: boolean }) {
  // Bei Preisen ist "runter" gut, bei Ersparnis "rauf". invert dreht das um.
  const good = invert ? value >= 0 : value <= 0;
  const Icon = value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[13px] font-semibold",
        value === 0 ? "text-white/40" : good ? "text-brand-700" : "text-rose-300",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {pct(value)}
    </span>
  );
}

function Segmented({
  options,
  value,
  onChange,
  dark,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-md p-0.5",
        dark ? "bg-white/10" : "border border-white/[0.08]",
      )}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              active
                ? dark
                  ? "bg-brand text-navy-900"
                  : "bg-navy-900 text-white"
                : dark
                  ? "text-white/60 hover:text-white"
                  : "text-white/55 hover:bg-white/[0.07]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type Row = PricePoint & { own?: number };

function ChartTooltip({
  active,
  payload,
  unit,
}: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  const delta = row.own != null ? ((row.own - row.kbob) / row.kbob) * 100 : null;

  return (
    <div className="rounded-md border border-white/[0.08] bg-[#0B1522] px-3 py-2 shadow-cardhover">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {shortPeriod(row.period)}
      </div>
      <div className="mt-1 text-[13px] text-white/70">
        Referenz <b className="text-white">CHF {chf(row.kbob)}</b> / {unit}
      </div>
      {row.own != null && (
        <div className="mt-0.5 text-[13px] text-white/70">
          Dein Einkauf <b className="text-brand-700">CHF {chf(row.own)}</b> / {unit}
          {delta !== null && (
            <span className={cn("ml-1.5 font-semibold", delta <= 0 ? "text-brand-700" : "text-rose-300")}>
              ({pct(delta)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="mt-1">{children}</div>
      {hint && <div className="mt-0.5 text-[11px] text-white/40">{hint}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Eigene Käufe                                                              */
/* -------------------------------------------------------------------------- */

function OwnPurchases({
  purchases,
  loading,
  unit,
  materialKey,
}: {
  purchases: Purchase[];
  loading: boolean;
  unit: string;
  materialKey: string;
}) {
  const procureKey = PROCURE_LINK[materialKey];

  return (
    <div className={cn(PANEL, "overflow-hidden")}>
      <div className="border-b border-white/[0.08] px-5 py-3.5">
        <h3 className="text-[15px] font-semibold text-white">Deine Abschlüsse</h3>
        <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">
          Angenommene Angebote in dieser Warengruppe und im gewählten Zeitraum,
          gemessen am Referenzpreis zum Zeitpunkt der Anfrage. Bündel-Teilnahmen
          sind nicht dabei — dort wird noch kein Abschlusspreis erfasst.
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-10 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="px-5 py-6 text-center">
          <p className="text-[13px] font-semibold text-white/90">
            Kein Abschluss in dieser Gruppe
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-white/55">
            Sobald du ein Angebot annimmst, erscheint es hier und in der Kurve —
            so siehst du, wie du gegenüber der Referenz gefahren bist.
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            {procureKey && (
              <Link
                href={`/beschaffung?material=${procureKey}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Bedarf einreichen
              </Link>
            )}
            <Link
              href="/network"
              className="inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-[12.5px] font-semibold text-white/70 transition-colors hover:bg-white/[0.07]"
            >
              <Handshake className="h-3.5 w-3.5" /> Lieferant direkt anfragen
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {[...purchases].reverse().map((p) => {
            const delta =
              p.reference && p.reference > 0
                ? ((p.unitPrice - p.reference) / p.reference) * 100
                : null;
            return (
              <li key={p.id} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-white/90">
                    {p.materialLabel}
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-white">
                    CHF {chf(p.unitPrice)}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[11.5px] text-white/40">
                  <span>{shortPeriod(p.period)}</span>
                  <span>
                    {chf(p.quantity, 0)} {p.unit}
                  </span>
                  <span className="truncate">{p.supplier}</span>
                  {delta !== null && (
                    <span
                      className={cn(
                        "font-semibold",
                        delta <= 0 ? "text-brand-700" : "text-rose-300",
                      )}
                    >
                      {pct(delta)} zur Referenz
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/*  Abschlüsse ausserhalb der Index-Gruppen                                    */
/* -------------------------------------------------------------------------- */

/**
 * Der Index führt vier Warengruppen, der Materialkatalog über dreissig
 * Positionen. Dämmung, Mauerwerk, Holz, Asphalt, Rohre und Bauchemie haben
 * keine Reihe — die Abschlüsse dürfen deswegen aber nicht unsichtbar
 * werden. Der Vergleich zum Referenzpreis funktioniert hier trotzdem, weil
 * er bei jeder Anfrage einzeln festgehalten wird.
 */
function OtherPurchases({ purchases }: { purchases: Purchase[] }) {
  if (purchases.length === 0) return null;
  const avg = averageDelta(purchases);

  return (
    <div className={cn(PANEL, "overflow-hidden")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.08] px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold text-white">
            Abschlüsse ohne Index-Reihe
          </h3>
          <p className="mt-0.5 max-w-xl text-[12px] leading-relaxed text-white/55">
            Für Dämmung, Mauerwerk, Holz, Asphalt, Rohre und Bauchemie führt
            der Index keine Kurve. Der Abstand zum Referenzpreis stimmt
            trotzdem — er wird bei jeder Anfrage einzeln festgehalten.
          </p>
        </div>
        {avg !== null && (
          <div className="shrink-0 text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Ø zur Referenz
            </div>
            <Trend value={avg} />
          </div>
        )}
      </div>

      <ul className="divide-y divide-white/[0.06]">
        {[...purchases].reverse().map((p) => {
          const delta =
            p.reference && p.reference > 0
              ? ((p.unitPrice - p.reference) / p.reference) * 100
              : null;
          return (
            <li key={p.id} className="px-5 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-white/90">
                  {p.materialLabel}
                </span>
                <span className="shrink-0 text-[13px] font-bold text-white">
                  CHF {chf(p.unitPrice)} / {p.unit}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[11.5px] text-white/40">
                <span>{shortPeriod(p.period)}</span>
                <span>
                  {chf(p.quantity, 0)} {p.unit}
                </span>
                <span className="truncate">{p.supplier}</span>
                {delta !== null && (
                  <span
                    className={cn(
                      "font-semibold",
                      delta <= 0 ? "text-brand-700" : "text-rose-300",
                    )}
                  >
                    {pct(delta)} zur Referenz
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hauptkomponente                                                           */
/* -------------------------------------------------------------------------- */

export default function KbobChart({ initialMaterial }: { initialMaterial?: string }) {
  const [material, setMaterial] = useState(
    initialMaterial && MATERIAL_KEYS.includes(initialMaterial)
      ? initialMaterial
      : MATERIAL_KEYS[0],
  );
  const [region, setRegion] = useState(REGION_KEYS[0]);
  const [range, setRange] = useState<string>("3J");

  const entry = data.materials[material];
  const unit = entry.unit;
  const { purchases: allPurchases, loading } = useOwnPurchases();

  const periodsInRange = useMemo(() => {
    const full = entry.regions[region];
    const count = data.timeRanges[range] ?? full.length;
    return new Set(full.slice(Math.max(0, full.length - count)).map((p) => p.period));
  }, [entry, region, range]);

  // Nur was zur gewählten Warengruppe UND in den gewählten Zeitraum
  // gehört. Sonst zeigt die Kurve etwas anderes als die Zahl daneben.
  const purchases = useMemo(
    () => allPurchases.filter((p) => p.group === material && periodsInRange.has(p.period)),
    [allPurchases, material, periodsInRange],
  );
  const avgDelta = useMemo(() => averageDelta(purchases), [purchases]);

  const chartData = useMemo<Row[]>(() => {
    const full = entry.regions[region];
    const count = data.timeRanges[range] ?? full.length;
    const slice = full.slice(Math.max(0, full.length - count));

    // Eigene Abschlüsse auf die Quartalspunkte legen. Mehrere Käufe im
    // selben Quartal werden gemittelt — die Kurve zeigt einen Punkt.
    const byPeriod = new Map<string, number[]>();
    for (const p of purchases) {
      const arr = byPeriod.get(p.period) ?? [];
      arr.push(p.unitPrice);
      byPeriod.set(p.period, arr);
    }

    return slice.map((pt) => {
      const own = byPeriod.get(pt.period);
      return {
        period: pt.period,
        kbob: pt.kbob,
        own: own ? own.reduce((a, b) => a + b, 0) / own.length : undefined,
      };
    });
  }, [entry, region, range, purchases]);

  const stats = useMemo(() => {
    const n = chartData.length;
    const last = chartData[n - 1];
    const prev = chartData[n - 2] ?? last;
    const first = chartData[0];
    return {
      current: last.kbob,
      quarter: ((last.kbob - prev.kbob) / prev.kbob) * 100,
      range: ((last.kbob - first.kbob) / first.kbob) * 100,
    };
  }, [chartData]);

  const tickInterval = Math.max(0, Math.floor(chartData.length / 7) - 1);
  const ownPoints = chartData.filter((r) => r.own != null).length;

  return (
    <div className="space-y-4">
      {/* Kopfleiste: Material, Region, Zeitraum */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-900 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
        <div className="relative px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {MATERIAL_KEYS.map((k) => {
              const active = k === material;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMaterial(k)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-brand text-navy-900"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {data.materials[k].label}
                </button>
              );
            })}
          </div>

          <p className="mt-2.5 text-[12px] text-white/40">{entry.spec}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Region
              </span>
              <Segmented
                dark
                options={REGION_KEYS.map((k) => ({ key: k, label: data.regions[k] }))}
                value={region}
                onChange={setRegion}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Zeitraum
              </span>
              <Segmented
                dark
                options={RANGE_KEYS.map((k) => ({ key: k, label: k }))}
                value={range}
                onChange={setRange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Zahlen */}
      <div className={cn(PANEL, "grid grid-cols-1 divide-y divide-white/[0.07] sm:grid-cols-3 sm:divide-x sm:divide-y-0")}>
        <Stat label="Referenzpreis" hint={`${data.regions[region]} · Stand ${data.meta.updated}`}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-white">
              CHF {chf(stats.current)}
            </span>
            <span className="text-sm text-white/55">/ {unit}</span>
          </div>
        </Stat>
        <Stat label="Gegenüber Vorquartal">
          <span className="text-2xl font-bold">
            <Trend value={stats.quarter} />
          </span>
        </Stat>
        <Stat
          label="Deine Abschlüsse zur Referenz"
          hint={
            avgDelta === null
              ? `kein Abschluss im Zeitraum ${range}`
              : `${purchases.length} Abschluss${purchases.length === 1 ? "" : "e"} im Zeitraum ${range}, nach Auftragswert gewichtet`
          }
        >
          {avgDelta === null ? (
            <span className="text-2xl font-bold tracking-tight text-white/25">—</span>
          ) : (
            <span className="text-2xl font-bold">
              <Trend value={avgDelta} />
            </span>
          )}
        </Stat>
      </div>

      {/* Kurve */}
      <div className={cn(PANEL, "p-5 sm:p-6")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-white">
            {entry.label} · {data.regions[region]}
          </h2>
          <div className="flex items-center gap-3 text-[11.5px] text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-navy-700" /> Referenzpreis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand ring-2 ring-brand/25" />
              Deine Abschlüsse
            </span>
          </div>
        </div>

        <div className="mt-4 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={shortPeriod}
                interval={tickInterval}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<ChartTooltip unit={unit} />} />
              <Line
                type="monotone"
                dataKey="kbob"
                name="Referenzpreis"
                stroke="#254D7A"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Scatter dataKey="own" name="Deine Abschlüsse" fill="#D99000" shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {ownPoints === 0 && !loading && (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-white/[0.03] px-3 py-2.5 text-[12px] leading-relaxed text-white/55">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-white/40" />
            In der Kurve steht bisher nur die Referenz. Sobald du ein Angebot
            annimmst, kommt dein tatsächlicher Preis als Punkt dazu — dann
            zeigt die Grafik, ob du über oder unter der Referenz eingekauft
            hast.
          </p>
        )}
      </div>

      <OwnPurchases
        purchases={purchases}
        loading={loading}
        unit={unit}
        materialKey={material}
      />

      <OtherPurchases purchases={allPurchases.filter((p) => p.group === null)} />
    </div>
  );
}
