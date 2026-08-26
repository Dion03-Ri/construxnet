"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, ShieldCheck } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import {
  CH_PATH,
  CH_VIEWBOX,
  CANTON_XY,
  DEMO_DISTRIBUTION,
  GEO_KPIS,
} from "@/data/chMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Agg = { canton: string; total: number; suppliers: number; verified: number };

export default function SupplierMap() {
  const supabase = useSupabaseBrowser();
  const [aggs, setAggs] = useState<Agg[]>([]);
  const [demo, setDemo] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("companies")
      .select("canton, role, verified")
      .neq("role", "ADMIN");
    const rows = (data ?? []) as { canton: string | null; role: string; verified: boolean }[];
    const map = new Map<string, Agg>();
    for (const r of rows) {
      if (!r.canton || !CANTON_XY[r.canton]) continue;
      const a = map.get(r.canton) ?? { canton: r.canton, total: 0, suppliers: 0, verified: 0 };
      a.total += 1;
      if (r.role === "SUPPLIER") a.suppliers += 1;
      if (r.verified) a.verified += 1;
      map.set(r.canton, a);
    }
    const list = [...map.values()];
    if (list.reduce((s, a) => s + a.total, 0) < 5) {
      setAggs(
        Object.entries(DEMO_DISTRIBUTION).map(([canton, total]) => ({
          canton,
          total,
          suppliers: Math.round(total * 0.6),
          verified: Math.round(total * 0.8),
        })),
      );
      setDemo(true);
    } else {
      setAggs(list);
      setDemo(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const maxTotal = useMemo(() => Math.max(1, ...aggs.map((a) => a.total)), [aggs]);
  const totalFirms = aggs.reduce((s, a) => s + a.total, 0);
  const hovered = aggs.find((a) => a.canton === hover);

  function radius(total: number) {
    return 7 + (total / maxTotal) * 18;
  }

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {/* KPI callouts */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
        {GEO_KPIS.map((k) => (
          <div key={k.label} className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              {k.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 sm:text-2xl">{k.value}</span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald">
                <TrendingUp className="h-3 w-3" />
                {k.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white p-3 sm:p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-brand" />
            Lieferanten-Netz Schweiz
          </h3>
          <span className="text-xs text-slate-400">
            {totalFirms} Firmen · {aggs.length} Kantone{demo ? " · Demo" : ""}
          </span>
        </div>

        <div className="relative">
          <svg viewBox={CH_VIEWBOX} className="h-auto w-full">
            <path d={CH_PATH} fill="#EEF2F7" stroke="#CBD5E1" strokeWidth={2} />
            {aggs.map((a) => {
              const hub = CANTON_XY[a.canton];
              if (!hub) return null;
              const r = radius(a.total);
              const isHover = hover === a.canton;
              return (
                <g
                  key={a.canton}
                  transform={`translate(${hub.x} ${hub.y})`}
                  onMouseEnter={() => setHover(a.canton)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  <motion.circle
                    r={r}
                    fill="#D99000"
                    fillOpacity={isHover ? 0.35 : 0.18}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                  <circle r={5} fill="#D99000" stroke="#fff" strokeWidth={2} />
                  {a.total >= maxTotal * 0.5 && (
                    <text
                      y={-r - 6}
                      textAnchor="middle"
                      className="fill-slate-600 text-[13px] font-semibold"
                    >
                      {hub.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hovered && (
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-cardhover">
              <div className="text-sm font-semibold text-slate-900">
                {CANTON_XY[hovered.canton]?.label}
              </div>
              <div className="mt-1 flex gap-4 text-xs text-slate-500">
                <span>
                  <b className="text-slate-900">{hovered.total}</b> Firmen
                </span>
                <span>
                  <b className="text-brand">{hovered.suppliers}</b> Lieferanten
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald" />
                  {hovered.verified}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
