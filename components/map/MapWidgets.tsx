"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  SPEND_BY_CATEGORY,
  SUPPLIER_DISTRIBUTION,
  INVOICE_DISCOUNT,
} from "@/data/chMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

function chf(v: number) {
  return "CHF " + new Intl.NumberFormat("de-CH").format(v);
}

function MiniSpark({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 60},${20 - ((v - min) / span) * 18 - 1}`)
    .join(" ");
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-16">
      <polyline points={pts} fill="none" stroke="#10B981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MapWidgets() {
  return (
    <div className="space-y-4">
      {/* Spend by Category */}
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Ausgaben nach Kategorie</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 font-medium">Kategorie</th>
                <th className="pb-2 font-medium">Ausgaben</th>
                <th className="hidden pb-2 font-medium sm:table-cell">Trans.</th>
                <th className="hidden pb-2 font-medium sm:table-cell">Lief.</th>
                <th className="pb-2 text-right font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPEND_BY_CATEGORY.map((r) => (
                <tr key={r.category}>
                  <td className="py-2.5 font-medium text-slate-800">{r.category}</td>
                  <td className="py-2.5 tabular-nums text-slate-600">{chf(r.spend)}</td>
                  <td className="hidden py-2.5 tabular-nums text-slate-500 sm:table-cell">{r.tx}</td>
                  <td className="hidden py-2.5 tabular-nums text-slate-500 sm:table-cell">{r.suppliers}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end">
                      <MiniSpark values={r.trend} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Supplier distribution */}
        <div className={cn(CARD, "p-5")}>
          <h3 className="text-[15px] font-semibold text-slate-900">Lieferanten-Verteilung</h3>
          <ul className="mt-4 space-y-3">
            {SUPPLIER_DISTRIBUTION.map((d) => (
              <li key={d.region}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="text-slate-600">{d.region}</span>
                  <span className="font-semibold text-slate-900">{d.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${d.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Invoice & discount */}
        <div className={cn(CARD, "p-5")}>
          <h3 className="text-[15px] font-semibold text-slate-900">Volumen &amp; Rabatt</h3>
          <p className="text-xs text-slate-400">Monatlich · Ø Rabatt 3.6 %</p>
          <div className="mt-3 h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={INVOICE_DISCOUNT} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" vertical={false} />
                <XAxis dataKey="m" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 24px -6px rgba(15,23,42,0.12)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" name="Volumen" fill="#254D7A" radius={[4, 4, 0, 0]} barSize={14} />
                <Line dataKey="discount" name="Rabatt %" stroke="#D99000" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
