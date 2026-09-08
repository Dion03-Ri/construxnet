import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import kbobData from "@/data/kbobData.json";
import { cn } from "@/lib/utils";
import { chfAuto as chf } from "@/lib/format";

type Point = { period: string; kbob: number };
type Data = {
  meta: { updated: string };
  regions: Record<string, string>;
  materials: Record<string, { label: string; unit: string; regions: Record<string, Point[]> }>;
};

const data = kbobData as unknown as Data;


/**
 * Alle Warengruppen nebeneinander — beantwortet die Frage, wo es gerade
 * teurer wird, ohne dass man vier Mal umschalten muss.
 */
export default function GroupOverview() {
  const regionKeys = Object.keys(data.regions);

  return (
    <div className="border-t border-white/[0.08]">
      <div className="pb-5 pt-5">
        <h3 className="text-[15px] font-bold tracking-tight text-white">
          Alle Warengruppen im Überblick
        </h3>
        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-white/40">
          Referenzpreis und Veränderung zum Vorquartal, Stand {data.meta.updated}.
          Mehr Reihen führt der Index nicht — für alle übrigen Materialien
          zählt der Referenzpreis aus der jeweiligen Anfrage.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-y border-white/[0.08] text-[10.5px] uppercase tracking-[0.12em] text-white/30">
              <th className="py-2.5 pr-3 font-semibold">Warengruppe</th>
              {regionKeys.map((r) => (
                <th key={r} className="px-3 py-2.5 text-right font-semibold">
                  {data.regions[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {Object.entries(data.materials).map(([key, m]) => (
              <tr key={key}>
                <td className="py-3.5 pr-3">
                  <div className="font-semibold text-white">{m.label}</div>
                  <div className="text-[11px] text-white/40">CHF / {m.unit}</div>
                </td>
                {regionKeys.map((r) => {
                  const series = m.regions[r];
                  const last = series[series.length - 1];
                  const prev = series[series.length - 2] ?? last;
                  const change = ((last.kbob - prev.kbob) / prev.kbob) * 100;
                  const Icon = change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown;
                  return (
                    <td key={r} className="whitespace-nowrap px-3 py-3.5 text-right">
                      <div className="font-semibold tabular-nums text-white">
                        {chf(last.kbob)}
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold",
                          change === 0
                            ? "text-white/40"
                            : change > 0
                              ? "text-rose-300"
                              : "text-brand",
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {change > 0 ? "+" : ""}
                        {change.toFixed(1)} %
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
