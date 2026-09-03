"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, ShieldCheck, Info, Loader2, Eye, EyeOff, RefreshCw, Building2, Factory, Users,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { setMapConsent, refreshMapLocation, type MapLocation } from "@/app/map/actions";
import { CANTON_CENTROID, CITY_GAZETTEER } from "@/data/chMap";
import type { MapPoint } from "@/components/map/LeafletMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

// Leaflet nutzt `window` beim Import → nur clientseitig laden.
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center bg-slate-100 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  ),
});

type CompanyRow = {
  id: string;
  company_name: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
  role: string;
  lat: number | null;
  lng: number | null;
  geo_label: string | null;
};

const ROLE_TABS = [
  { key: "ALL", label: "Alle", icon: Users },
  { key: "SUPPLIER", label: "Baustoffwerke", icon: Factory },
  { key: "BUYER", label: "Bauunternehmen", icon: Building2 },
];

/**
 * Firmen auf Koordinaten bringen.
 *
 * Erste Wahl sind die beim Zustimmen ermittelten echten Koordinaten. Fehlen
 * sie — etwa weil die Adresse unvollständig ist —, greift die grobe
 * Einordnung nach Ort bzw. Kanton. Solche Punkte werden als „ungefähr"
 * gekennzeichnet, statt eine Genauigkeit vorzutäuschen, die es nicht gibt.
 */
function toPoints(rows: CompanyRow[]): MapPoint[] {
  const used = new Map<string, number>();
  const out: MapPoint[] = [];

  for (const r of rows) {
    let lat = r.lat;
    let lng = r.lng;
    let exact = lat !== null && lng !== null;

    if (!exact) {
      const cityKey = (r.city ?? "").trim().toLowerCase();
      const geo =
        CITY_GAZETTEER[cityKey] ??
        (r.canton && CANTON_CENTROID[r.canton]
          ? { lat: CANTON_CENTROID[r.canton].lat, lng: CANTON_CENTROID[r.canton].lng }
          : null);
      if (!geo) continue;
      lat = geo.lat;
      lng = geo.lng;
      exact = false;
    }

    // Firmen am selben groben Punkt leicht auseinanderziehen, damit nicht
    // eine Nadel fünf andere verdeckt. Echte Koordinaten bleiben unberührt.
    let dLat = 0;
    let dLng = 0;
    if (!exact) {
      const key = `${lat},${lng}`;
      const n = used.get(key) ?? 0;
      used.set(key, n + 1);
      if (n > 0) {
        const angle = n * 2.399;
        dLat = Math.sin(angle) * 0.02 * n;
        dLng = Math.cos(angle) * 0.02 * n;
      }
    }

    out.push({
      id: r.id,
      name: r.company_name,
      city: r.city,
      canton: r.canton,
      verified: r.verified,
      role: r.role,
      exact,
      label: r.geo_label,
      lat: lat! + dLat,
      lng: lng! + dLng,
    });
  }
  return out;
}

export default function SupplierMap({
  myConsent,
  myLocation,
}: {
  myConsent: boolean;
  /** Zuletzt ermittelter eigener Standort — für die Rückmeldung im Kopf. */
  myLocation: MapLocation;
}) {
  const supabase = useSupabaseBrowser();
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(myConsent);
  const [location, setLocation] = useState<MapLocation>(myLocation);
  const [note, setNote] = useState<string | null>(null);
  const [role, setRole] = useState("ALL");
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    // Nur Firmen, die dem Karteneintrag zugestimmt haben.
    const { data } = await supabase
      .from("companies")
      .select("id, company_name, city, canton, verified, role, lat, lng, geo_label")
      .eq("show_on_map", true);
    if (data) setRows(data as CompanyRow[]);
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleConsent() {
    const next = !consent;
    setConsent(next);
    setNote(null);
    startTransition(async () => {
      const res = await setMapConsent(next);
      if (res.error) {
        setConsent(!next);
        setNote(res.error);
        return;
      }
      if (res.location) setLocation(res.location);
      if (next && res.location && res.location.lat === null) {
        setNote(
          "Zustimmung gespeichert, aber zu deiner Adresse wurde kein genauer Punkt gefunden. " +
            "Ergänze Strasse, PLZ und Ort im Firmenprofil und tippe dann auf „Standort neu ermitteln“.",
        );
      }
      await load();
    });
  }

  function refresh() {
    setNote(null);
    startTransition(async () => {
      const res = await refreshMapLocation();
      if (res.error) setNote(res.error);
      else if (res.location) {
        setLocation(res.location);
        setNote(null);
      }
      await load();
    });
  }

  const visible = useMemo(
    () => (role === "ALL" ? rows : rows.filter((r) => r.role === role)),
    [rows, role],
  );
  const points = useMemo(() => toPoints(visible), [visible]);
  const exact = points.filter((p) => p.exact).length;
  const cantons = new Set(visible.map((s) => s.canton).filter(Boolean)).size;
  const empty = loaded && points.length === 0;

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-brand" /> Firmen in der Schweiz
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {loaded
              ? points.length === 0
                ? "Noch niemand auf der Karte"
                : `${points.length} Standort${points.length === 1 ? "" : "e"} · ${exact} genau verortet · ${cantons} Kanton${cantons === 1 ? "" : "e"}`
              : "lädt …"}
          </p>
        </div>

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
      </div>

      {/* Eigener Stand: was steht wo, und wie korrigiert man es */}
      {consent && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 sm:px-5">
          <p className="min-w-0 flex-1 text-[12px] text-slate-500">
            {location.lat !== null ? (
              <>
                Dein Standort: <span className="font-medium text-slate-700">{location.label}</span>
              </>
            ) : (
              "Für deine Firma wurde noch kein genauer Punkt gefunden — sie steht grob bei Ort bzw. Kanton."
            )}
          </p>
          <button
            type="button"
            onClick={refresh}
            disabled={pending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", pending && "animate-spin")} />
            Standort neu ermitteln
          </button>
        </div>
      )}

      {note && (
        <p className="border-b border-slate-100 bg-brand/5 px-4 py-2.5 text-[12px] leading-relaxed text-brand-700 sm:px-5">
          {note}
        </p>
      )}

      {/* Rollenfilter */}
      <div className="no-scrollbar flex gap-1.5 border-b border-slate-100 px-4 py-2.5 sm:px-5">
        {ROLE_TABS.map((t) => {
          const count = t.key === "ALL" ? rows.length : rows.filter((r) => r.role === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setRole(t.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                role === t.key
                  ? "bg-navy-900 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10.5px] font-bold",
                  role === t.key ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* `isolate`: Leaflet zeichnet seine Ebenen mit z-index 400+. Ohne
          eigenen Stapelkontext liegen die Nadeln sonst ueber der festen
          Navigation am unteren Rand des Telefons. */}
      <div className="relative isolate">
        <LeafletMap points={points} />

        {empty && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-sm rounded-lg border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-cardhover backdrop-blur">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-slate-900">
                {rows.length === 0 ? "Noch keine Standorte freigegeben" : "Keine Firma in dieser Auswahl"}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                Auf der Karte steht nur, wer ausdrücklich zugestimmt hat. Wer
                zustimmt, wird sofort anhand seiner Adresse verortet und
                erscheint hier.
                {!consent && " Du kannst das oben rechts für dich einschalten."}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="flex items-start gap-1.5 px-4 py-2.5 text-[11px] leading-relaxed text-slate-400 sm:px-5">
        {exact > 0 ? (
          <>
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-brand" />
            Gold = Baustoffwerk, Navy = Bauunternehmen; grosse Punkte sind
            verifiziert, blasse stehen nur ungefähr. Standorte kommen aus der
            amtlichen Adresssuche von swisstopo. Zoomen über die Schaltflächen
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
