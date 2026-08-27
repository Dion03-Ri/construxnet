"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Factory, Info } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import {
  CH_OUTLINE,
  CH_VIEWBOX,
  CH_CITIES,
  CANTON_CENTROID,
  CITY_GAZETTEER,
  projectLngLat,
} from "@/data/chMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type SupplierRow = {
  id: string;
  company_name: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
};

type Point = SupplierRow & { x: number; y: number };

/** Bringt einen Lieferanten anhand Stadt (genau) bzw. Kanton (grob) auf die
 *  Karte. Mehrere Firmen am selben Ort werden leicht auseinandergezogen. */
function placeSuppliers(rows: SupplierRow[]): Point[] {
  const used = new Map<string, number>();
  const out: Point[] = [];
  for (const r of rows) {
    const cityKey = (r.city ?? "").trim().toLowerCase();
    const geo =
      CITY_GAZETTEER[cityKey] ??
      (r.canton && CANTON_CENTROID[r.canton]
        ? { lng: CANTON_CENTROID[r.canton].lng, lat: CANTON_CENTROID[r.canton].lat }
        : null);
    if (!geo) continue;
    const key = `${geo.lng},${geo.lat}`;
    const n = used.get(key) ?? 0;
    used.set(key, n + 1);
    // kleine Spirale gegen Überlappung
    const angle = n * 2.399;
    const rad = n === 0 ? 0 : 8 + n * 3;
    const { x, y } = projectLngLat(geo.lng, geo.lat);
    out.push({ ...r, x: x + Math.cos(angle) * rad, y: y + Math.sin(angle) * rad });
  }
  return out;
}

export default function SupplierMap() {
  const supabase = useSupabaseBrowser();
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, company_name, city, canton, verified")
      .eq("role", "SUPPLIER");
    setSuppliers((data ?? []) as SupplierRow[]);
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const points = useMemo(() => placeSuppliers(suppliers), [suppliers]);
  const verified = suppliers.filter((s) => s.verified).length;
  const cantons = new Set(suppliers.map((s) => s.canton).filter(Boolean)).size;
  const empty = loaded && suppliers.length === 0;
  const hovered = points.find((p) => p.id === hover);

  const kpis = [
    { label: "Lieferanten", value: loaded ? suppliers.length : "—" },
    { label: "Verifiziert", value: loaded ? verified : "—" },
    { label: "Kantone abgedeckt", value: loaded ? cantons : "—" },
  ];

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {/* KPI-Leiste — echte Zahlen aus der Datenbank */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
        {kpis.map((k) => (
          <div key={k.label} className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              {k.label}
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="relative bg-gradient-to-b from-slate-50 to-white p-3 sm:p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-brand" />
            Lieferanten-Netz Schweiz
          </h3>
          <span className="text-xs text-slate-400">
            {loaded ? `${suppliers.length} Lieferanten registriert` : "lädt …"}
          </span>
        </div>

        <div className="relative">
          <svg viewBox={CH_VIEWBOX} className="h-auto w-full">
            {/* echter Landesumriss */}
            <path
              d={CH_OUTLINE}
              fill="#F1F5F9"
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {/* Orientierungsstädte (dezent) */}
            {CH_CITIES.map((c) => {
              const { x, y } = projectLngLat(c.lng, c.lat);
              return (
                <g key={c.name}>
                  <circle cx={x} cy={y} r={2} fill="#CBD5E1" />
                  <text
                    x={x + 5}
                    y={y + 3}
                    className="fill-slate-400 text-[11px]"
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}

            {/* registrierte Lieferanten als Punkte */}
            {points.map((p) => {
              const isHover = hover === p.id;
              return (
                <g
                  key={p.id}
                  transform={`translate(${p.x} ${p.y})`}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  <motion.circle
                    r={isHover ? 16 : 11}
                    fill="#D99000"
                    fillOpacity={0.18}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                  <circle r={5.5} fill="#D99000" stroke="#fff" strokeWidth={2} />
                  {p.verified && <circle r={2} fill="#fff" />}
                </g>
              );
            })}
          </svg>

          {/* Leerzustand: echter Umriss bleibt sichtbar, davor der Hinweis */}
          {empty && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="pointer-events-auto max-w-xs rounded-lg border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-cardhover backdrop-blur">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                  <Factory className="h-5 w-5" />
                </span>
                <p className="mt-2.5 text-sm font-semibold text-slate-900">
                  Noch keine Lieferanten auf der Karte
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  Sobald sich Baustoffwerke registrieren, erscheinen sie hier an ihrem Standort — bereit zum Verknüpfen und Bündeln.
                </p>
              </div>
            </div>
          )}

          {/* Tooltip für einen gehoverten Lieferanten */}
          {hovered && (
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-cardhover">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                {hovered.company_name}
                {hovered.verified && <ShieldCheck className="h-3.5 w-3.5 text-accent" />}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {[hovered.city, hovered.canton].filter(Boolean).join(" · ") || "Standort offen"}
              </div>
            </div>
          )}
        </div>

        {!empty && loaded && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="h-3.5 w-3.5" />
            Punkte zeigen registrierte Baustoffwerke an ihrem Standort. Weiss markiert = verifiziert.
          </p>
        )}
      </div>
    </div>
  );
}
