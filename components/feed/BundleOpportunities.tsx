import Link from "next/link";
import { Layers, TrendingDown, ChevronRight, LineChart } from "lucide-react";

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
      <div className="overflow-hidden rounded-lg border border-white/10 bg-navy-900 text-white shadow-card">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-white">
            <Layers className="h-4 w-4 text-brand" /> Bündel-Chancen
          </h3>
          <span className="text-[11px] text-white/40">deine Region</span>
        </div>
        <ul className="divide-y divide-white/[0.07]">
          {POOLS.map((p) => (
            <li key={p.material}>
              <Link href="/pools" className="block px-4 py-3 transition-colors hover:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-white">{p.material}</span>
                  <span className="shrink-0 rounded-sm border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand">
                    −{p.disc}%
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">{p.region} · {p.vol}</div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${p.pct}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/pools"
          className="flex items-center justify-center gap-1 border-t border-white/10 py-2.5 text-[12px] font-semibold text-white/70 transition-colors hover:text-brand"
        >
          Alle Smart Pools <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Markt / KBOB-Mini */}
      <div className="rounded-lg border border-white/10 bg-navy-900 p-4 text-white shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-white">
            <LineChart className="h-4 w-4 text-brand" /> KBOB-Markt
          </h3>
          <Link href="/kbob" className="text-[11px] font-semibold text-brand hover:underline">Index</Link>
        </div>
        <div className="mt-1 text-[11px] text-white/45">Beton C25/30 · Referenzpreis</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">CHF 156.–</span>
          <span className="text-[11px] text-white/40">/ m³</span>
        </div>
        <Sparkline />
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[12px]">
          <span className="inline-flex items-center gap-1 text-white/55">
            <TrendingDown className="h-3.5 w-3.5 text-brand" /> Ø Pool-Preis
          </span>
          <span className="font-bold text-brand">−13.8 %</span>
        </div>
      </div>
    </div>
  );
}
