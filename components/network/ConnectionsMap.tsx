"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Building2 } from "lucide-react";
import { CH_PATH, CH_VIEWBOX, CANTON_XY } from "@/data/chMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

export type MapCompany = {
  id: string;
  company_name: string;
  canton: string | null;
  city: string | null;
  role: string;
  verified: boolean;
};

type Node = {
  canton: string;
  companies: MapCompany[];
  suppliers: number;
};

export default function ConnectionsMap({
  companies,
  demo,
}: {
  companies: MapCompany[];
  demo: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const nodes = useMemo<Node[]>(() => {
    const map = new Map<string, Node>();
    for (const c of companies) {
      if (!c.canton || !CANTON_XY[c.canton]) continue;
      const n = map.get(c.canton) ?? { canton: c.canton, companies: [], suppliers: 0 };
      n.companies.push(c);
      if (c.role === "SUPPLIER") n.suppliers += 1;
      map.set(c.canton, n);
    }
    return [...map.values()];
  }, [companies]);

  const maxCount = Math.max(1, ...nodes.map((n) => n.companies.length));
  const hovered = nodes.find((n) => n.canton === hover);
  const totalCantons = nodes.length;

  function radius(count: number) {
    return 8 + (count / maxCount) * 16;
  }

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          <MapPin className="h-4 w-4 text-brand" />
          Dein Netzwerk auf der Karte
        </h3>
        <span className="text-xs text-slate-400">
          {companies.length} Firmen · {totalCantons} Kantone{demo ? " · Demo" : ""}
        </span>
      </div>

      <div className="relative bg-gradient-to-b from-slate-50 to-white p-3 sm:p-5">
        <svg viewBox={CH_VIEWBOX} className="h-auto w-full">
          <defs>
            <radialGradient id="glow-brand" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D99000" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#D99000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-emerald" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path d={CH_PATH} fill="#EEF2F7" stroke="#CBD5E1" strokeWidth={2} />

          {nodes.map((n, i) => {
            const hub = CANTON_XY[n.canton];
            if (!hub) return null;
            const r = radius(n.companies.length);
            const supplierMajority = n.suppliers >= n.companies.length / 2;
            const fill = supplierMajority ? "url(#glow-brand)" : "url(#glow-emerald)";
            const dot = supplierMajority ? "#D99000" : "#10B981";
            const isHover = hover === n.canton;
            return (
              <g
                key={n.canton}
                transform={`translate(${hub.x} ${hub.y})`}
                onMouseEnter={() => setHover(n.canton)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                {/* Pulsierender Glow */}
                <motion.circle
                  r={r * 1.8}
                  fill={fill}
                  initial={{ scale: 0.6, opacity: 0.4 }}
                  animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                />
                <circle r={r} fill={dot} fillOpacity={isHover ? 0.3 : 0.16} />
                <circle r={5.5} fill={dot} stroke="#fff" strokeWidth={2} />
                <text
                  y={-r - 7}
                  textAnchor="middle"
                  className={cn(
                    "text-[13px] font-semibold",
                    isHover ? "fill-slate-900" : "fill-slate-500",
                  )}
                >
                  {hub.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-[240px] rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-cardhover">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Building2 className="h-3.5 w-3.5 text-brand" />
              {CANTON_XY[hovered.canton]?.label}
            </div>
            <ul className="mt-1.5 space-y-1">
              {hovered.companies.slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="truncate">{c.company_name}</span>
                  {c.verified && <ShieldCheck className="h-3 w-3 shrink-0 text-emerald" />}
                </li>
              ))}
              {hovered.companies.length > 4 && (
                <li className="text-[11px] text-slate-400">
                  + {hovered.companies.length - 4} weitere
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Legende */}
        <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Lieferanten
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald" /> Bauunternehmen
          </span>
        </div>
      </div>
    </div>
  );
}
