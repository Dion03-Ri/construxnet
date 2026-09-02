"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { MapPin, ShieldCheck, Factory, Info, Loader2, Eye, EyeOff } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { setMapConsent } from "@/app/map/actions";
import { CANTON_CENTROID, CITY_GAZETTEER } from "@/data/chMap";
import type { MapPoint } from "@/components/map/LeafletMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

// Leaflet nutzt `window` beim Import → nur clientseitig laden.
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[340px] place-items-center bg-slate-100 text-slate-400">
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

export default function SupplierMap({
  isSupplier,
  myConsent,
}: {
  /** Nur Baustoffwerke können sich selbst auf die Karte setzen. */
  isSupplier: boolean;
  myConsent: boolean;
}) {
  const supabase = useSupabaseBrowser();
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(myConsent);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    // Nur Firmen, die dem Karteneintrag zugestimmt haben.
    const { data } = await supabase
      .from("companies")
      .select("id, company_name, city, canton, verified")
      .eq("role", "SUPPLIER")
      .eq("show_on_map", true);
    setSuppliers((data ?? []) as SupplierRow[]);
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleConsent() {
    const next = !consent;
    setConsent(next);
    startTransition(async () => {
      const res = await setMapConsent(next);
      if (res.error) setConsent(!next);
      else await load();
    });
  }

  const points = useMemo(() => placeSuppliers(suppliers), [suppliers]);
  const verified = suppliers.filter((s) => s.verified).length;
  const cantons = new Set(suppliers.map((s) => s.canton).filter(Boolean)).size;
  const empty = loaded && points.length === 0;

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-brand" /> Lieferanten in der Schweiz
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {loaded
              ? points.length === 0
                ? "Noch niemand auf der Karte"
                : `${points.length} Standort${points.length === 1 ? "" : "e"} · ${verified} verifiziert · ${cantons} Kanton${cantons === 1 ? "" : "e"}`
              : "lädt …"}
          </p>
        </div>

        {isSupplier && (
          <button
            type="button"
            onClick={toggleConsent}
            disabled={pending}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-60",
              consent
                ? "bg-brand/10 text-brand-700 hover:bg-brand/15"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50",
            )}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : consent ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {consent ? "Auf der Karte sichtbar" : "Auf der Karte zeigen"}
          </button>
        )}
      </div>

      <div className="relative">
        <LeafletMap points={points} />

        {empty && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-sm rounded-lg border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-cardhover backdrop-blur">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                <Factory className="h-5 w-5" />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-slate-900">
                Noch keine Standorte freigegeben
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                Auf der Karte steht nur, wer ausdrücklich zugestimmt hat. Sobald
                ein Baustoffwerk sich freischaltet, erscheint es hier
                automatisch an seinem Standort.
                {isSupplier && !consent && " Du kannst das oben rechts für dich einschalten."}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="flex items-start gap-1.5 px-4 py-2.5 text-[11px] leading-relaxed text-slate-400 sm:px-5">
        {verified > 0 ? (
          <>
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-brand" />
            Gold = verifiziert, Navy = registriert. Zoomen über die Schaltflächen
            links oben — Scrollen bewegt die Seite.
          </>
        ) : (
          <>
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            Eingetragen ist nur, wer zugestimmt hat. Zoomen über die
            Schaltflächen links oben — Scrollen bewegt die Seite.
          </>
        )}
      </p>
    </div>
  );
}
