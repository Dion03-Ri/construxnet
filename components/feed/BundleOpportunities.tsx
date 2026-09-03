import Link from "next/link";
import { TrendingDown, ChevronRight } from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Rechte Schiene des Feeds.
 *
 * Die Bündel-Chancen sind hell wie der übrige eingeloggte Bereich. Dunkel
 * bleibt allein die KBOB-Karte: EIN dunkler Anker je Seite lenkt den Blick
 * auf die Zahl, die zählt — zehn dunkle Kästen lenken ihn nirgendwohin.
 */

type Pool = { material: string; region: string; vol: string; pct: number; disc: number };

const POOLS: Pool[] = [
  { material: "Beton C25/30", region: "Zürich", vol: "230 m³", pct: 77, disc: 12 },
  { material: "Armierungsstahl B500B", region: "Bern", vol: "48 t", pct: 80, disc: 12 },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", vol: "320 t", pct: 96, disc: 20 },
];

// Ruhige KBOB-Sparkline (12 Monate, normiert 0..1)
const SPARK = [0.42, 0.5, 0.46, 0.58, 0.54, 0.62, 0.59, 0.66, 0.63, 0.71, 0.68, 0.74];

function Sparkline() {
  const w = 240;
  const h = 44;
  const step = w / (SPARK.length - 1);
  const pts = SPARK.map((v, i) => `${i * step},${h - v * (h - 6) - 3}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-11 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D99000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D99000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spk)" />
      <polyline points={pts} fill="none" stroke="#D99000" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={h - SPARK[SPARK.length - 1] * (h - 6) - 3} r="2.5" fill="#D99000" />
    </svg>
  );
}

export default function BundleOpportunities() {
  return (
    <div className="space-y-4">
      {/* Bündel-Chancen */}
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="flex items-baseline justify-between px-5 pb-3 pt-4">
          <h3 className="text-[14px] font-bold tracking-tight text-slate-900">Bündel-Chancen</h3>
          <span className="text-[11px] text-slate-400">deine Region</span>
        </div>
        <ul className="divide-y divide-slate-200 border-t border-slate-200">
          {POOLS.map((p) => (
            <li key={p.material}>
              <Link href="/pools" className="block px-5 py-3.5 transition-colors hover:bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-slate-900">{p.material}</span>
                  <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-brand">
                    −{p.disc}%
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-slate-400">{p.region} · {p.vol}</div>
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${p.pct}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/pools"
          className="flex items-center justify-center gap-1 border-t border-slate-200 py-3 text-[12.5px] font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          Alle Smart Pools <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Markt / KBOB — der eine dunkle Anker der Seite */}
      <div className="rounded-2xl border border-white/[0.08] bg-navy-950 p-5 text-white shadow-card">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[14px] font-bold tracking-tight text-white">KBOB-Markt</h3>
          <Link href="/kbob" className="text-[11.5px] font-semibold text-brand hover:underline">
            Index
          </Link>
        </div>
        <div className="mt-1 text-[11.5px] text-white/40">Beton C25/30 · Referenzpreis</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-[34px] font-bold leading-none tabular-nums text-white">
            156.–
          </span>
          <span className="text-[12px] text-white/40">CHF / m³</span>
        </div>
        <Sparkline />
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[12.5px]">
          <span className="inline-flex items-center gap-1.5 text-white/55">
            <TrendingDown className="h-3.5 w-3.5 text-brand" /> Ø Pool-Preis
          </span>
          <span className="font-bold tabular-nums text-brand">−13.8 %</span>
        </div>
      </div>
    </div>
  );
}
