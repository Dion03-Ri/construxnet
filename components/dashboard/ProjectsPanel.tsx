"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Plus,
  MapPin,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Loader2,
  Info,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import {
  PROJECT_STATUS_LABEL,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNED: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-brand/15 text-brand-700",
  PAUSED: "bg-amber-100 text-amber-700",
  DONE: "bg-navy-100 text-navy-700",
};

const STATUS_ORDER: ProjectStatus[] = ["ACTIVE", "PLANNED", "PAUSED", "DONE"];

function chf(v: number) {
  return v.toLocaleString("de-CH", { maximumFractionDigits: 0 });
}

function dateCH(s: string | null) {
  if (!s) return null;
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

type Draft = {
  name: string;
  street: string;
  zip: string;
  city: string;
  canton: string;
  starts_on: string;
  ends_on: string;
  budget: string;
  status: ProjectStatus;
  note: string;
};

const EMPTY: Draft = {
  name: "",
  street: "",
  zip: "",
  city: "",
  canton: "",
  starts_on: "",
  ends_on: "",
  budget: "",
  status: "ACTIVE",
  note: "",
};

function toDraft(p: Project): Draft {
  return {
    name: p.name,
    street: p.street ?? "",
    zip: p.zip ?? "",
    city: p.city ?? "",
    canton: p.canton ?? "",
    starts_on: p.starts_on ?? "",
    ends_on: p.ends_on ?? "",
    budget: p.budget != null ? String(p.budget) : "",
    status: p.status,
    note: p.note ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/*  Formular                                                                  */
/* -------------------------------------------------------------------------- */

const FIELD =
  "w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white";
const LABEL =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

function ProjectModal({
  companyId,
  existing,
  onClose,
  onSaved,
}: {
  companyId: string;
  existing: Project | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = useSupabaseBrowser();
  const [d, setD] = useState<Draft>(existing ? toDraft(existing) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  const valid = d.name.trim().length > 1;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);

    const row = {
      company_id: companyId,
      name: d.name.trim(),
      street: d.street.trim() || null,
      zip: d.zip.trim() || null,
      city: d.city.trim() || null,
      canton: d.canton.trim() || null,
      starts_on: d.starts_on || null,
      ends_on: d.ends_on || null,
      budget: d.budget ? Number(d.budget) : null,
      status: d.status,
      note: d.note.trim() || null,
    };

    const { error: err } = existing
      ? await supabase.from("projects").update(row).eq("id", existing.id)
      : await supabase.from("projects").insert(row);

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              <Building2 className="h-4 w-4 text-brand" />
              {existing ? "Baustelle bearbeiten" : "Neue Baustelle"}
            </h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Nur du siehst dieses Projekt. Lieferanten sehen es nicht.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 px-5 py-4">
          <div>
            <label className={LABEL}>Bezeichnung *</label>
            <input
              value={d.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
              placeholder="z. B. Neubau MFH Seefeld"
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL}>Strasse / Nr.</label>
            <input
              value={d.street}
              onChange={(e) => set("street", e.target.value)}
              placeholder="Baustellenadresse"
              className={FIELD}
            />
          </div>

          <div className="grid grid-cols-[90px_1fr_90px] gap-3">
            <div>
              <label className={LABEL}>PLZ</label>
              <input value={d.zip} onChange={(e) => set("zip", e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Ort</label>
              <input value={d.city} onChange={(e) => set("city", e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Kanton</label>
              <input
                value={d.canton}
                onChange={(e) => set("canton", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="ZH"
                className={FIELD}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Baustart</label>
              <input type="date" value={d.starts_on} onChange={(e) => set("starts_on", e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Bauende</label>
              <input type="date" value={d.ends_on} onChange={(e) => set("ends_on", e.target.value)} className={FIELD} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Materialbudget (CHF)</label>
              <input
                value={d.budget}
                onChange={(e) => set("budget", e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="optional"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select
                value={d.status}
                onChange={(e) => set("status", e.target.value as ProjectStatus)}
                className={FIELD}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL}>Notiz</label>
            <textarea
              value={d.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
              placeholder="Abladestelle, Zufahrt, Ansprechperson …"
              className={cn(FIELD, "resize-none")}
            />
          </div>

          {error && <p className="text-[12.5px] font-medium text-rose-600">{error}</p>}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500",
              (!valid || saving) && "cursor-not-allowed opacity-50",
            )}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {existing ? "Speichern" : "Baustelle anlegen"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel                                                                     */
/* -------------------------------------------------------------------------- */

export default function ProjectsPanel({
  companyId,
  projects,
  loading,
  error,
  reload,
  orderCounts,
}: {
  companyId: string;
  projects: Project[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Anzahl zugeordneter Bestellungen je Projekt-ID. */
  orderCounts: Record<string, number>;
}) {
  const supabase = useSupabaseBrowser();
  const [modal, setModal] = useState<{ open: boolean; existing: Project | null }>({
    open: false,
    existing: null,
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...projects].sort(
        (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      ),
    [projects],
  );

  async function remove(p: Project) {
    const count = orderCounts[p.id] ?? 0;
    const msg =
      count > 0
        ? `„${p.name}" löschen? ${count} Bestellung${count === 1 ? "" : "en"} bleibt bestehen, verliert aber die Zuordnung.`
        : `„${p.name}" löschen?`;
    if (!confirm(msg)) return;
    setBusyId(p.id);
    await supabase.from("projects").delete().eq("id", p.id);
    setBusyId(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Projekte &amp; Baustellen</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Jede Bestellung gehört zu einer Baustelle. So siehst du später, wohin
            welches Material und welche Kosten gegangen sind.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ open: true, existing: null })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
        >
          <Plus className="h-4 w-4" /> Neue Baustelle
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-800">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Projekte konnten nicht geladen werden. Falls die Datenbank-Migration
          <code className="mx-1 rounded bg-amber-100 px-1">10_projects.sql</code>
          noch nicht eingespielt ist, hol das im Supabase-SQL-Editor nach.
        </p>
      )}

      {loading ? (
        <div className={cn(CARD, "grid place-items-center py-16 text-slate-400")}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className={cn(CARD, "px-6 py-12 text-center")}>
          <Building2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-[15px] font-semibold text-slate-800">
            Noch keine Baustelle angelegt
          </p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500">
            Leg deine erste Baustelle an. Danach kannst du beim Materialbedarf
            direkt auswählen, wofür bestellt wird — und in den Berichten nach
            Projekt auswerten.
          </p>
          <button
            type="button"
            onClick={() => setModal({ open: true, existing: null })}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" /> Erste Baustelle anlegen
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((p) => {
            const count = orderCounts[p.id] ?? 0;
            const from = dateCH(p.starts_on);
            const to = dateCH(p.ends_on);
            return (
              <div key={p.id} className={cn(CARD, "flex flex-col p-4")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14.5px] font-bold text-slate-900">{p.name}</h3>
                    {(p.street || p.city) && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {[p.street, [p.zip, p.city].filter(Boolean).join(" ")]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLE[p.status],
                    )}
                  >
                    {PROJECT_STATUS_LABEL[p.status]}
                  </span>
                </div>

                {(from || to) && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    {from ?? "offen"} – {to ?? "offen"}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[12.5px]">
                  <span className="text-slate-500">
                    Bestellungen{" "}
                    <b className="text-slate-800">{count}</b>
                  </span>
                  {p.budget != null && (
                    <span className="text-slate-500">
                      Budget <b className="text-slate-800">CHF {chf(p.budget)}</b>
                    </span>
                  )}
                </div>

                {p.note && (
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
                    {p.note}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-1 pt-3">
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, existing: p })}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    disabled={busyId === p.id}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Löschen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <ProjectModal
            companyId={companyId}
            existing={modal.existing}
            onClose={() => setModal({ open: false, existing: null })}
            onSaved={reload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
