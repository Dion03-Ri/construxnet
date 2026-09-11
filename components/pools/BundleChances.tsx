"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useBundles } from "@/lib/bundles";
import { chf } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * „Bündel-Chancen" — die Liste offener Bündel der eigenen Region.
 *
 * Steht an mehreren Stellen, deshalb liegt sie hier und nicht in einer
 * der Seiten.
 *
 * Zwei Formen: schmal (`wide={false}`) für eine Schiene, breit für den
 * Feed. Breit heisst nicht nur „mehr Platz" — die Angaben, die schmal
 * untereinander stehen müssen, stehen dann nebeneinander in Spalten, und
 * der Füllstandsbalken bekommt die Länge, die ihn erst lesbar macht.
 */

export type PoolChance = {
  id: string;
  material: string;
  region: string;
  vol: string;
  /** Füllstand des Bündels in Prozent. */
  pct: number;
  /** Garantierte Untergrenze in Prozent. */
  disc: number;
};

/*
 * Hier standen drei erfundene Bündel: Beton Zürich −12 %, Armierungsstahl
 * Bern −12 %, Kies Nordwestschweiz −20 %. Zwei Dinge stimmten daran nicht.
 * Die Sätze gibt es nicht — die Staffel reicht bis 10 %, nicht bis 20 %;
 * und Bewehrungsstahl ist gar nicht bündelbar. Ein Kunde, der das auf
 * seiner Startseite liest und danach ein echtes Bündel mit 6 % sieht,
 * hält die Plattform für den Rückschritt, nicht die Attrappe für falsch.
 *
 * Jetzt kommen die Zeilen aus `bundles`. Ist keines offen, steht das da.
 */
export default function BundleChances({
  className,
  wide = false,
}: {
  className?: string;
  /** Breite Form: Angaben nebeneinander statt untereinander. */
  wide?: boolean;
}) {
  const { bundles, loading } = useBundles();

  // Die vollsten zuerst: wo am meisten liegt, lohnt sich das Mitmachen am
  // ehesten. „Füllstand" misst gegen die Zielmenge des Bündels.
  const pools: PoolChance[] = bundles
    .filter((b) => b.status === "OPEN")
    .sort((a, b) => b.current_volume - a.current_volume)
    .slice(0, 3)
    .map((b) => ({
      id: b.id,
      material: b.material_label ?? b.title,
      region: b.region,
      vol: `${chf(b.current_volume)} ${b.unit}`,
      pct: b.target_volume > 0 ? Math.min(100, Math.round((b.current_volume / b.target_volume) * 100)) : 0,
      disc: Number(b.current_discount_pct),
    }));

  return (
    <div className={cn("border-t border-white/[0.12]", className)}>
      <div className="flex items-baseline justify-between pb-3 pt-5">
        <h3 className={cn("font-bold tracking-tight text-white", wide ? "text-[15px]" : "text-[14px]")}>
          Bündel-Chancen
        </h3>
        <span className="text-[11px] text-white/[0.56]">deine Region</span>
      </div>

      {loading || pools.length === 0 ? (
        <p className="border-t border-white/[0.12] py-5 text-[13px] leading-relaxed text-white/[0.56]">
          {loading
            ? "Bündel werden geladen …"
            : "Gerade ist kein Bündel in der Sammelphase. Wer einen Bedarf meldet, eröffnet eines."}
        </p>
      ) : wide ? (
        <ul className="border-t border-white/[0.12]">
          {pools.map((p) => (
            <li key={p.id}>
              <Link
                href="/pools"
                className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-x-6 gap-y-2 border-b border-white/[0.12] py-3.5 transition-colors hover:bg-white/[0.03] lg:grid-cols-[15rem_20rem_minmax(0,1fr)_auto]"
              >
                <span className="truncate text-[14px] font-semibold text-white">{p.material}</span>

                {/* Der Balken hat auf breiten Schirmen eine feste Länge. Liesse
                    man ihn mitwachsen, wäre er bei 1760 px ein Meter Strich mit
                    drei Wörtern daneben — genau der Streifen, den die Seite
                    nicht haben soll. Auf schmalen Schirmen steht er unter der
                    ganzen Zeile. */}
                <span className="order-last col-span-2 block h-[3px] overflow-hidden rounded-full bg-white/[0.10] lg:order-none lg:col-span-1">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${p.pct}%` }} />
                </span>

                <span className="col-span-2 text-[12px] text-white/[0.56] lg:hidden">
                  {p.region} · {p.vol}
                </span>

                {/* Der Rest hängt rechts am Rand statt in der Mitte zu
                    schweben; feste Zellenbreiten halten die Zahlen der drei
                    Zeilen untereinander. */}
                <span className="col-start-2 row-start-1 whitespace-nowrap text-right text-[13px] font-bold tabular-nums text-brand lg:hidden">
                  mind. {p.disc} %
                </span>
                <span className="hidden lg:col-start-4 lg:flex lg:items-baseline lg:justify-end lg:gap-9">
                  <span className="w-[11rem] truncate text-right text-[12px] text-white/[0.56]">
                    {p.region} · {p.vol}
                  </span>
                  <span className="w-[4.5rem] text-right text-[12px] tabular-nums text-white/[0.56]">
                    {p.pct} % voll
                  </span>
                  <span className="w-[5.5rem] whitespace-nowrap text-right text-[13.5px] font-bold tabular-nums text-brand">
                    mind. {p.disc} %
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-white/[0.12] border-t border-white/[0.12]">
          {pools.map((p) => (
            <li key={p.id}>
              <Link href="/pools" className="-mx-2 block rounded-lg px-2 py-3.5 transition-colors hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-white">{p.material}</span>
                  <span className="shrink-0 whitespace-nowrap text-[13px] font-bold tabular-nums text-brand">
                    mind. {p.disc} %
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-white/[0.56]">
                  {p.region} · {p.vol}
                </div>
                <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${p.pct}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/pools"
        className={cn(
          "flex items-center gap-1 py-3.5 text-[12.5px] font-semibold text-white/[0.72] transition-colors hover:text-brand",
          wide ? "justify-start" : "justify-center border-t border-white/[0.12]",
        )}
      >
        Alle Smart Pools <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
