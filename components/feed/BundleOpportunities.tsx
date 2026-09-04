import Link from "next/link";
import { TrendingDown } from "lucide-react";
import BundleChances from "@/components/pools/BundleChances";


/**
 * Rechte Schiene des Feeds.
 *
 * Die Bündel-Chancen sind hell wie der übrige eingeloggte Bereich. Dunkel
 * bleibt allein die KBOB-Karte: EIN dunkler Anker je Seite lenkt den Blick
 * auf die Zahl, die zählt — zehn dunkle Kästen lenken ihn nirgendwohin.
 */

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
      <BundleChances />

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
