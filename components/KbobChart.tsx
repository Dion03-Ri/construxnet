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
import { cn } from "@/lib/utils";
import { chf as chfFixed, decimalsFor as decimalsForShared } from "@/lib/format";
const chf = (value: number, decimals?: number) => chfFixed(value, decimals ?? decimalsForShared(value));

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


/* -------------------------------------------------------------------------- */
/*  Formatierung                                                              */
/* -------------------------------------------------------------------------- */


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

function Trend({
  value,
  invert,
  big,
}: {
  value: number;
  invert?: boolean;
  /** Für die drei Kennzahlen oben: gleiche Grösse wie der Referenzpreis. */
  big?: boolean;
}) {
  // Bei Preisen ist "runter" gut, bei Ersparnis "rauf". invert dreht das um.
  const good = invert ? value >= 0 : value <= 0;
  const Icon = value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold",
        big
          ? "gap-2 font-display text-[30px] leading-none tabular-nums"
          : "gap-1 text-[13px]",
        value === 0 ? "text-white/40" : good ? "text-brand" : "text-rose-300",
      )}
    >
      <Icon className={big ? "h-5 w-5" : "h-3.5 w-3.5"} />
      {pct(value)}
    </span>
  );
}

/**
 * Eine Auswahl als Wortreihe, nicht als Knopfleiste.
 *
 * Vorher lag jede Auswahl in einem gefuellten Kaestchen, das seinerseits in
 * einem umrandeten Kaestchen sass — zwei Raender fuer vier Woerter. Jetzt
 * traegt der aktive Eintrag eine Goldkante unten, genau wie die Reiter
 * darueber. `dark` bleibt in der Signatur, damit die Aufrufstellen
 * unveraendert bleiben.
 */
function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
  dark?: boolean;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "border-b-2 pb-0.5 text-[12.5px] font-semibold transition-colors",
              active
                ? "border-brand text-white"
                : "border-transparent text-white/40 hover:text-white",
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
          Dein Einkauf <b className="text-brand">CHF {chf(row.own)}</b> / {unit}
          {delta !== null && (
            <span className={cn("ml-1.5 font-semibold", delta <= 0 ? "text-brand" : "text-rose-300")}>
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
    <div className="border-t border-white/[0.08] py-5 first:border-t-0 first:pt-0 sm:border-l sm:border-t-0 sm:py-0 sm:pl-8 sm:first:border-l-0 sm:first:pl-0">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/30">
        {label}
      </div>
      <div className="mt-2.5">{children}</div>
      {hint && <div className="mt-2 text-[11px] leading-relaxed text-white/35">{hint}</div>}
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
    <div className="border-t border-white/[0.08]">
      <div className="pb-4 pt-5">
        <h3 className="text-[15px] font-semibold text-white">Deine Abschlüsse</h3>
        <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">
          Angenommene Angebote in dieser Warengruppe und im gewählten Zeitraum,
          gemessen am Referenzpreis zum Zeitpunkt der Anfrage. Bündel-Teilnahmen
          sind nicht dabei — dort wird noch kein Abschlusspreis erfasst.
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-14 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="border-t border-white/[0.08] py-8">
          <p className="text-[14px] font-bold tracking-tight text-white">
            Kein Abschluss in dieser Gruppe
          </p>
          <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-white/40">
            Sobald du ein Angebot annimmst, erscheint es hier und in der Kurve —
            so siehst du, wie du gegenüber der Referenz gefahren bist.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            {procureKey && (
              <Link
                href={`/beschaffung?material=${procureKey}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Bedarf einreichen
              </Link>
            )}
            <Link
              href="/network"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
            >
              <Handshake className="h-3.5 w-3.5" /> Lieferant direkt anfragen
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.07] border-t border-white/[0.08]">
          {[...purchases].reverse().map((p) => {
            const delta =
              p.reference && p.reference > 0
                ? ((p.unitPrice - p.reference) / p.reference) * 100
                : null;
            return (
              <li key={p.id} className="py-3.5">
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
                        delta <= 0 ? "text-brand" : "text-rose-300",
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
    <div className="border-t border-white/[0.08]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 pt-5">
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

      <ul className="divide-y divide-white/[0.07] border-t border-white/[0.08]">
        {[...purchases].reverse().map((p) => {
          const delta =
            p.reference && p.reference > 0
              ? ((p.unitPrice - p.reference) / p.reference) * 100
              : null;
          return (
            <li key={p.id} className="py-3.5">
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
                      delta <= 0 ? "text-brand" : "text-rose-300",
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
    <div className="space-y-8">
      {/* Kopfleiste: Material, Region, Zeitraum.

          Vorher ein dunkles Panel mit Raster und gefuellten Goldknoepfen.
          Ein Kasten mit Rasterhintergrund ueber einer Kurve, die selbst schon
          ein Raster hat — das war ein Muster zu viel. Jetzt traegt der aktive
          Reiter eine Goldkante unten, wie ueberall sonst. */}
      <div>
        <div className="-mb-px flex gap-6 overflow-x-auto border-b border-white/[0.08]">
          {MATERIAL_KEYS.map((k) => {
            const active = k === material;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setMaterial(k)}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13.5px] font-semibold transition-colors",
                  active
                    ? "border-brand text-white"
                    : "border-transparent text-white/45 hover:text-white",
                )}
              >
                {data.materials[k].label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4">
          <p className="text-[12px] text-white/35">{entry.spec}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/30">
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
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/30">
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

      {/* Zahlen */}
      <div className="grid grid-cols-1 border-t border-white/[0.08] pt-6 sm:grid-cols-3">
        <Stat label="Referenzpreis" hint={`${data.regions[region]} · Stand ${data.meta.updated}`}>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[30px] font-bold leading-none tabular-nums text-white">
              {chf(stats.current)}
            </span>
            <span className="text-[13px] text-white/40">CHF / {unit}</span>
          </div>
        </Stat>
        <Stat label="Gegenüber Vorquartal">
          <Trend value={stats.quarter} big />
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
            <span className="font-display text-[30px] font-bold leading-none text-white/20">—</span>
          ) : (
            <Trend value={avgDelta} big />
          )}
        </Stat>
      </div>

      {/* Kurve */}
      <div className="border-t border-white/[0.08] pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-white">
            {entry.label} · {data.regions[region]}
          </h2>
          <div className="flex items-center gap-3 text-[11.5px] text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-[#5B87C2]" /> Referenzpreis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand ring-2 ring-brand/25" />
              Deine Abschlüsse
            </span>
          </div>
        </div>

        <div className="mt-4 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 28, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
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
                stroke="#5B87C2"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Scatter dataKey="own" name="Deine Abschlüsse" fill="#D99000" shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {ownPoints === 0 && !loading && (
          <p className="mt-4 flex items-start gap-2 border-l-2 border-white/[0.12] pl-3 text-[12px] leading-relaxed text-white/45">
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
