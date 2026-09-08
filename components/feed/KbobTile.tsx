import Link from "next/link";
import kbobData from "@/data/kbobData.json";
import { TILE } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Der Referenzpreis als Kachel.
 *
 * Stand vorher unten in der rechten Schiene, unter den Bündel-Chancen.
 * Jetzt steht sie neben ihnen: beide beantworten dieselbe Frage — lohnt es
 * sich gerade —, und nebeneinander liest man sie zusammen statt
 * nacheinander.
 *
 * Die Zahl kommt aus `data/kbobData.json`, derselben Reihe wie unter
 * /kbob. Sie stand einmal fest im Code und sah damit aus wie eine Messung,
 * die keine war.
 */

const REGION = "zuerich";
const MATERIAL = "beton";

const entry = kbobData.materials[MATERIAL];
const series = entry.regions[REGION];
/** Die letzten zwei Jahre — genug für den Verlauf, ohne die Kurve zu quetschen. */
const recent = series.slice(-8);
const last = recent[recent.length - 1];
const prev = recent[recent.length - 2] ?? last;
const change = ((last.kbob - prev.kbob) / prev.kbob) * 100;

function Sparkline() {
  const w = 240;
  const h = 40;
  const vals = recent.map((r) => r.kbob);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const step = w / (vals.length - 1);
  const pts = vals.map((v, i) => `${i * step},${h - ((v - min) / span) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-10 w-full" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke="#D99000"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function KbobTile({ className }: { className?: string }) {
  return (
    <div className={cn(TILE, "p-5", className)}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[14px] font-bold tracking-tight text-white">Referenzpreis</h3>
        <Link href="/kbob" className="text-[11.5px] font-semibold text-brand hover:underline">
          Verlauf
        </Link>
      </div>
      <div className="mt-1 text-[11.5px] text-white/[0.56]">
        {entry.label} · {kbobData.regions[REGION]}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[32px] font-bold leading-none tabular-nums text-white">
          {last.kbob.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[12px] text-white/[0.56]">CHF / {entry.unit}</span>
      </div>

      <Sparkline />

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.12] pt-3 text-[12.5px]">
        <span className="text-white/[0.56]">gegenüber Vorquartal</span>
        <span
          className={
            change <= 0 ? "font-bold tabular-nums text-brand" : "font-bold tabular-nums text-rose-300"
          }
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(1)} %
        </span>
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-white/[0.5]">
        Stand {kbobData.meta.updated}. Nachgebildete Reihe am KBOB-Preisindex, keine amtliche
        Publikation.
      </p>
    </div>
  );
}
