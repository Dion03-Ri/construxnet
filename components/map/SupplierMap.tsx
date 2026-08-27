"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, ShieldCheck, Factory, Info, Loader2 } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { CANTON_CENTROID, CITY_GAZETTEER } from "@/data/chMap";
import type { MapPoint } from "@/components/map/LeafletMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

// Leaflet nutzt `window` beim Import → nur clientseitig laden.
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[480px] place-items-center bg-slate-100 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  ),
});

type SupplierRow = {
  id: string;
  company_name: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
};

/** Bringt einen Lieferanten anhand Stadt (genau) bzw. Kanton (grob) auf echte
 *  Koordinaten; Mehrfachbelegungen werden leicht auseinandergezogen. */
function placeSuppliers(rows: SupplierRow[]): MapPoint[] {
  const used = new Map<string, number>();
  const out: MapPoint[] = [];
  for (const r of rows) {
    const cityKey = (r.city ?? "").trim().toLowerCase();
    const geo =
      CITY_GAZETTEER[cityKey] ??
      (r.canton && CANTON_CENTROID[r.canton]
        ? { lat: CANTON_CENTROID[r.canton].lat, lng: CANTON_CENTROID[r.canton].lng }
        : null);
    if (!geo) continue;
    const key = `${geo.lat},${geo.lng}`;
    const n = used.get(key) ?? 0;
    used.set(key, n + 1);
    const jitter = n === 0 ? 0 : 0.02 * n;
    const angle = n * 2.399;
    out.push({
      id: r.id,
      name: r.company_name,
      city: r.city,
      canton: r.canton,
      verified: r.verified,
      lat: geo.lat + Math.sin(angle) * jitter,
      lng: geo.lng + Math.cos(angle) * jitter,
    });
  }
  return out;
}

export default function SupplierMap() {
  const supabase = useSupabaseBrowser();
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loaded, setLoaded] = useState(false);

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
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{k.label}</div>
            <div className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          <MapPin className="h-4 w-4 text-brand" /> Lieferanten-Netz Schweiz
        </h3>
        <span className="text-xs text-slate-400">
          {loaded ? `${suppliers.length} Lieferanten registriert` : "lädt …"}
        </span>
      </div>

      {/* Echte, interaktive Karte (OpenStreetMap) */}
      <div className="relative">
        <LeafletMap points={points} />

        {empty && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-xs rounded-lg border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-cardhover backdrop-blur">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                <Factory className="h-5 w-5" />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-slate-900">Noch keine Lieferanten auf der Karte</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                Sobald sich Baustoffwerke registrieren, erscheinen sie hier an ihrem Standort — bereit zum Verknüpfen und Bündeln.
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] text-slate-400 sm:px-5">
        {suppliers.some((s) => s.verified) ? (
          <><ShieldCheck className="h-3.5 w-3.5 text-brand" /> Gold = verifiziert · Navy = registriert. Zoome heraus für die ganze Welt, hinein für Details.</>
        ) : (
          <><Info className="h-3.5 w-3.5" /> Karte auf die Schweiz zentriert — herauszoomen zeigt die ganze Welt.</>
        )}
      </p>
    </div>
  );
}
