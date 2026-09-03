"use client";

import { useMemo, useState } from "react";
import {
  Package,
  Eye,
  EyeOff,
  Merge,
  Trash2,
  Loader2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import {
  STATUS_LABEL,
  toProcMaterial,
  type CustomMaterial,
  type CustomStatus,
} from "@/lib/customMaterials";
import { matchMaterial, WORTH_SHOWING } from "@/lib/materialMatch";
import { PROC_MATERIALS, type ProcMaterial } from "@/data/procurement";
import { PANEL } from "@/lib/ui";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<CustomStatus, string> = {
  PRIVATE: "bg-white/10 text-white/70",
  SHARED: "bg-brand/15 text-brand-700",
  MERGED: "bg-navy-100 text-navy-700",
};

/**
 * Dublettenverdacht für ein eigenes Material.
 *
 * Geprüft wird gegen den festen Katalog UND gegen alles, was andere Firmen
 * freigegeben haben — genau dort entstehen die Doppelungen, die Bündel
 * zerreissen. Zwei Nummern für dasselbe Material heissen zwei Töpfe, und
 * keiner erreicht die Rabattstufe.
 */
function duplicatesFor(m: CustomMaterial, comparable: ProcMaterial[]) {
  return matchMaterial(`${m.label} ${m.sia ?? ""}`, 3, comparable)
    .filter((r) => r.score >= WORTH_SHOWING && r.material.id !== m.material_id)
    .map((r) => ({ material: r.material, reason: r.reason }));
}

export default function MaterialsPanel({
  rows,
  mine,
  loading,
  error,
  reload,
}: {
  rows: CustomMaterial[];
  mine: CustomMaterial[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}) {
  const supabase = useSupabaseBrowser();
  const [busy, setBusy] = useState<string | null>(null);
  const [mergeFor, setMergeFor] = useState<CustomMaterial | null>(null);

  /** Alles, wogegen sich eine Dublette prüfen lässt: Katalog + fremde Freigaben. */
  const comparable = useMemo<ProcMaterial[]>(
    () => [
      ...PROC_MATERIALS,
      ...rows
        .filter((r) => r.status === "SHARED" && !mine.some((x) => x.id === r.id))
        .map(toProcMaterial),
    ],
    [rows, mine],
  );

  async function setStatus(m: CustomMaterial, status: CustomStatus) {
    setBusy(m.id);
    await supabase.from("custom_materials").update({ status }).eq("id", m.id);
    setBusy(null);
    reload();
  }

  async function merge(m: CustomMaterial, target: ProcMaterial) {
    setBusy(m.id);
    await supabase
      .from("custom_materials")
      .update({ status: "MERGED", merged_into: target.id })
      .eq("id", m.id);
    setBusy(null);
    setMergeFor(null);
    reload();
  }

  async function remove(m: CustomMaterial) {
    if (!confirm(`„${m.label}" (${m.material_id}) löschen?`)) return;
    setBusy(m.id);
    await supabase.from("custom_materials").delete().eq("id", m.id);
    setBusy(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Eigene Materialien</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-white/55">
          Positionen, die du selbst erfasst hast. Freigegebene sind für andere
          Firmen sichtbar — erst dadurch lässt sich darauf bündeln. Was doppelt
          erfasst wurde, legst du hier zusammen.
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-md border border-brand/25 bg-brand/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-brand">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Materialien konnten nicht geladen werden. Falls die Migration
          <code className="mx-1 rounded bg-brand/15 px-1">15_custom_materials.sql</code>
          noch nicht eingespielt ist, hol das im Supabase-SQL-Editor nach.
        </p>
      )}

      {loading ? (
        <div className={cn(PANEL, "grid place-items-center py-16 text-white/40")}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : mine.length === 0 ? (
        <div className={cn(PANEL, "px-6 py-12 text-center")}>
          <Package className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-3 text-[15px] font-semibold text-white/90">
            Noch nichts eigenes erfasst
          </p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-white/55">
            Wenn im Beschaffungsformular ein Material fehlt, erfasst du es dort
            unter „Weiteres Material". Es bekommt eine Materialnummer und
            erscheint danach hier.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((m) => {
            const dupes = m.status === "MERGED" ? [] : duplicatesFor(m, comparable);
            const working = busy === m.id;
            return (
              <div key={m.id} className={cn(PANEL, "p-4")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-bold text-white">{m.label}</h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-white/55">
                      <span className="font-mono text-[11px] tracking-tight text-brand-700">
                        {m.material_id}
                      </span>
                      <span>{m.category}</span>
                      <span>
                        {m.price ? `CHF ${m.price} / ${m.unit}` : `pro ${m.unit}`}
                      </span>
                    </p>
                    {m.sia && (
                      <p className="mt-0.5 truncate text-[11.5px] text-white/40">{m.sia}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLE[m.status],
                    )}
                  >
                    {STATUS_LABEL[m.status]}
                  </span>
                </div>

                {m.status === "MERGED" && m.merged_into && (
                  <p className="mt-2 text-[12.5px] text-white/55">
                    Aufgegangen in{" "}
                    <span className="font-mono text-[11px] text-brand-700">{m.merged_into}</span>.
                    Neuer Bedarf gehört dorthin.
                  </p>
                )}

                {dupes.length > 0 && (
                  <div className="mt-3 rounded-md border border-brand/25 bg-brand/10 px-3 py-2.5">
                    <p className="flex items-start gap-1.5 text-[12px] font-semibold text-brand">
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                      Das könnte dasselbe sein wie:
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {dupes.map((d) => (
                        <li key={d.material.id} className="text-[12px] text-brand/80">
                          · {d.material.label}{" "}
                          <span className="font-mono text-[10.5px]">{d.material.id}</span>{" "}
                          <span className="text-brand/50">({d.reason})</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-brand/70">
                      Zwei Nummern für dasselbe Material heisst zwei Bündel — und
                      keines erreicht die Rabattstufe.
                    </p>
                  </div>
                )}

                {m.status !== "MERGED" && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-3">
                    <button
                      type="button"
                      onClick={() => setStatus(m, m.status === "SHARED" ? "PRIVATE" : "SHARED")}
                      disabled={working}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-50",
                        m.status === "SHARED"
                          ? "bg-brand/10 text-brand-700 hover:bg-brand/15"
                          : "border border-white/[0.16] text-white/70 hover:bg-white/[0.05]",
                      )}
                    >
                      {working ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : m.status === "SHARED" ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      {m.status === "SHARED" ? "Freigegeben" : "Freigeben"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMergeFor(m)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-white/70 transition-colors hover:bg-white/[0.07]"
                    >
                      <Merge className="h-3.5 w-3.5" /> Zusammenlegen
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(m)}
                      disabled={working}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-white/40 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Löschen
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mergeFor && (
        <MergeModal
          material={mergeFor}
          candidates={comparable}
          onClose={() => setMergeFor(null)}
          onMerge={(t) => merge(mergeFor, t)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Zusammenlegen                                                             */
/* -------------------------------------------------------------------------- */

function MergeModal({
  material,
  candidates,
  onClose,
  onMerge,
}: {
  material: CustomMaterial;
  candidates: ProcMaterial[];
  onClose: () => void;
  onMerge: (target: ProcMaterial) => void;
}) {
  const [query, setQuery] = useState(material.label);

  const results = useMemo(
    () =>
      matchMaterial(query, 8)
        .filter((r) => r.material.id !== material.material_id)
        .map((r) => r.material)
        .concat(
          candidates.filter(
            (c) =>
              c.id !== material.material_id &&
              c.label.toLowerCase().includes(query.trim().toLowerCase()),
          ),
        )
        .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
        .slice(0, 8),
    [query, candidates, material.material_id],
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B1522] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
              <Merge className="h-4 w-4 text-brand" /> Zusammenlegen
            </h3>
            <p className="mt-0.5 truncate text-[12.5px] text-white/55">
              {material.label} · {material.material_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white/75"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Zielmaterial suchen …"
            className="w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-brand focus:bg-[#0B1522]"
          />

          <ul className="max-h-64 overflow-y-auto rounded-md border border-white/[0.08]">
            {results.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onMerge(m)}
                  className="flex w-full items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2 text-left last:border-b-0 hover:bg-white/[0.05]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-white/90">
                      {m.label}
                    </span>
                    <span className="block font-mono text-[10.5px] text-white/40">{m.id}</span>
                  </span>
                  <span className="shrink-0 text-[11.5px] font-semibold text-brand">wählen</span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-3 py-4 text-center text-[12.5px] text-white/40">Kein Treffer.</li>
            )}
          </ul>

          <p className="flex items-start gap-2 rounded-md bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-white/55">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-white/40" />
            Dein Material verschwindet aus der Auswahl und zeigt künftig auf die
            gewählte Nummer. Bestehende Anfragen bleiben unverändert — sie tragen
            die Nummer, die zum Zeitpunkt der Anfrage galt.
          </p>
        </div>
      </div>
    </div>
  );
}
