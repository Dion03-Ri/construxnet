"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Package, Map as MapIcon, Truck, Info } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { CANTON_CENTROID } from "@/data/chMap";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Row = {
  canton: string | null;
  supply_materials: string[] | null;
  delivery_radius_km: number | null;
  show_on_map: boolean;
};

function Panel({
  title,
  hint,
  icon: Icon,
  children,
}: {
  title: string;
  hint?: string;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(CARD, "p-5")}>
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-brand" /> {title}
      </h3>
      {hint && <p className="mt-0.5 text-[12px] text-slate-500">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Balkenliste mit Anteil am Maximum. */
function BarList({
  items,
  emptyText,
}: {
  items: { label: string; count: number }[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="py-3 text-[12.5px] leading-relaxed text-slate-400">{emptyText}</p>;
  }
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
            <span className="truncate text-slate-600">{i.label}</span>
            <span className="shrink-0 font-semibold text-slate-900">{i.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(i.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MapWidgets() {
  const supabase = useSupabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("companies")
      .select("canton, supply_materials, delivery_radius_km, show_on_map")
      .eq("role", "SUPPLIER");
    setRows((data ?? []) as Row[]);
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const materials = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      for (const m of r.supply_materials ?? []) {
        const key = m.trim();
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rows]);

  const cantons = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      if (!r.canton) continue;
      counts.set(r.canton, (counts.get(r.canton) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([code, count]) => ({
        label: CANTON_CENTROID[code]?.label ?? code,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rows]);

  const radius = useMemo(() => {
    const values = rows
      .map((r) => r.delivery_radius_km)
      .filter((v): v is number => typeof v === "number" && v > 0)
      .sort((a, b) => a - b);
    if (values.length === 0) return null;
    const median = values[Math.floor(values.length / 2)];
    return { median, min: values[0], max: values[values.length - 1], n: values.length };
  }, [rows]);

  const onMap = rows.filter((r) => r.show_on_map).length;

  if (!loaded) {
    return (
      <div className={cn(CARD, "grid place-items-center py-16 text-slate-400")}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn(CARD, "px-5 py-4")}>
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="pr-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Baustoffwerke
            </div>
            <div className="mt-0.5 text-2xl font-bold text-slate-900">{rows.length}</div>
          </div>
          <div className="pl-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              davon auf der Karte
            </div>
            <div className="mt-0.5 text-2xl font-bold text-slate-900">{onMap}</div>
          </div>
        </div>
        <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-slate-400">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Die Auswertungen unten zählen alle registrierten Baustoffwerke — auch
          die, die ihren Standort nicht auf der Karte zeigen.
        </p>
      </div>

      <Panel
        title="Welche Baustoffe angeboten werden"
        hint="Wie viele Werke das jeweilige Material im Sortiment haben."
        icon={Package}
      >
        <BarList
          items={materials}
          emptyText="Noch hat kein Werk sein Sortiment hinterlegt. Sobald Lieferanten ihr Profil ausfüllen, steht hier, was im Netz verfügbar ist."
        />
      </Panel>

      <Panel title="Verteilung nach Kanton" icon={MapIcon}>
        <BarList
          items={cantons}
          emptyText="Noch keine Kantonsangaben in den Profilen."
        />
      </Panel>

      <Panel title="Liefergebiet" icon={Truck}>
        {radius ? (
          <div className="text-[13px] text-slate-600">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{radius.median}</span>
              <span className="text-slate-500">km im Median</span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-slate-500">
              Spannweite {radius.min}–{radius.max} km, aus {radius.n} Profil
              {radius.n === 1 ? "" : "en"} mit Angabe.
            </p>
          </div>
        ) : (
          <p className="py-1 text-[12.5px] leading-relaxed text-slate-400">
            Noch hat kein Werk einen Lieferradius angegeben.
          </p>
        )}
      </Panel>
    </div>
  );
}
