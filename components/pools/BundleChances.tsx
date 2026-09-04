import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PANEL } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * „Bündel-Chancen" — die Liste offener Bündel der eigenen Region.
 *
 * Steht an zwei Stellen: in der rechten Schiene des Feeds und als
 * Ausschnitt auf der Startseite. Deshalb liegt sie hier und nicht in
 * einer der beiden Dateien.
 *
 * Der Grund für die Zweitverwendung: die Startseite zeigte an dieser
 * Stelle eine gezeichnete Erklärgrafik. Ein echter Ausschnitt aus der
 * Anwendung überzeugt mehr — er zeigt, was jemand nach der Anmeldung
 * wirklich sieht, statt eine Illustration davon.
 */

export type PoolChance = {
  material: string;
  region: string;
  vol: string;
  /** Füllstand des Bündels in Prozent. */
  pct: number;
  /** Garantierter Mindestvorteil in Prozent. */
  disc: number;
};

export const POOL_CHANCES: PoolChance[] = [
  { material: "Beton C25/30", region: "Zürich", vol: "230 m³", pct: 77, disc: 12 },
  { material: "Armierungsstahl B500B", region: "Bern", vol: "48 t", pct: 80, disc: 12 },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", vol: "320 t", pct: 96, disc: 20 },
];

export default function BundleChances({
  pools = POOL_CHANCES,
  className,
}: {
  pools?: PoolChance[];
  className?: string;
}) {
  return (
    <div className={cn(PANEL, "overflow-hidden", className)}>
      <div className="flex items-baseline justify-between px-5 pb-3 pt-4">
        <h3 className="text-[14px] font-bold tracking-tight text-white">Bündel-Chancen</h3>
        <span className="text-[11px] text-white/40">deine Region</span>
      </div>
      <ul className="divide-y divide-white/[0.07] border-t border-white/[0.08]">
        {pools.map((p) => (
          <li key={p.material}>
            <Link href="/pools" className="block px-5 py-3.5 transition-colors hover:bg-white/[0.05]">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-white">{p.material}</span>
                <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-brand">
                  −{p.disc}%
                </span>
              </div>
              <div className="mt-1 text-[11.5px] text-white/40">
                {p.region} · {p.vol}
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand" style={{ width: `${p.pct}%` }} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/pools"
        className="flex items-center justify-center gap-1 border-t border-white/[0.08] py-3 text-[12.5px] font-semibold text-white/55 transition-colors hover:text-brand"
      >
        Alle Smart Pools <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
