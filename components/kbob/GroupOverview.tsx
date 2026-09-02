import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import kbobData from "@/data/kbobData.json";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Point = { period: string; kbob: number };
type Data = {
  meta: { updated: string };
  regions: Record<string, string>;
  materials: Record<string, { label: string; unit: string; regions: Record<string, Point[]> }>;
};

const data = kbobData as unknown as Data;

function chf(v: number) {
  const d = v >= 300 ? 0 : v >= 10 ? 2 : 3;
  return new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(v);
}

/**
 * Alle Warengruppen nebeneinander — beantwortet die Frage, wo es gerade
 * teurer wird, ohne dass man vier Mal umschalten muss.
 */
export default function GroupOverview() {
  const regionKeys = Object.keys(data.regions);

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="border-b border-slate-200 px-5 py-3.5">
        <h3 className="text-[15px] font-semibold text-slate-900">
          Alle Warengruppen im Überblick
        </h3>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Referenzpreis und Veränderung zum Vorquartal, Stand {data.meta.updated}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-5 py-2 font-medium">Warengruppe</th>
              {regionKeys.map((r) => (
                <th key={r} className="px-3 py-2 text-right font-medium">
                  {data.regions[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(data.materials).map(([key, m]) => (
              <tr key={key}>
                <td className="px-5 py-3">
                  <div className="font-semibold text-slate-800">{m.label}</div>
                  <div className="text-[11px] text-slate-400">CHF / {m.unit}</div>
                </td>
                {regionKeys.map((r) => {
                  const series = m.regions[r];
                  const last = series[series.length - 1];
                  const prev = series[series.length - 2] ?? last;
                  const change = ((last.kbob - prev.kbob) / prev.kbob) * 100;
                  const Icon = change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown;
                  return (
                    <td key={r} className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="font-semibold tabular-nums text-slate-900">
                        {chf(last.kbob)}
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold",
                          change === 0
                            ? "text-slate-400"
                            : change > 0
                              ? "text-rose-600"
                              : "text-brand-700",
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
