"use client";

import { useMemo, useRef, useState } from "react";
import { useProjects, projectLabel } from "@/lib/projects";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Layers,
  Upload,
  FileText,
  MapPin,
  CalendarClock,
  Boxes,
  ShieldCheck,
  X,
  TrendingDown,
  Send,
  Search,
  PenLine,
  Plus,
  Trash2,
  Gavel,
} from "lucide-react";
import {
  PROC_MATERIALS,
  PROC_CATEGORIES,
  PROC_REGIONS,
  DELIVERY_WINDOWS,
  tierForVolume,
  matchesMaterial,
  ownMaterialId,
  type ProcMaterial,
  type ProcCategory,
} from "@/data/procurement";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

function chf(v: number, d = 0) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

const STEPS = ["Materialien", "Mengen & Lieferung", "Smart Pool", "Übersicht"];

/** Eine Position im Bedarf — ein Material mit eigener Menge und SIA-Angabe. */
type Position = {
  key: string;
  id: string;
  label: string;
  sia: string;
  unit: string;
  kbobPrice: number;
  category: ProcCategory;
  qty: string;
  /** true = im Formular neu erfasst, noch nicht im gemeinsamen Katalog gespeichert */
  isNew?: boolean;
};

function toPosition(m: ProcMaterial, qty = ""): Position {
  return { key: m.key, id: m.id, label: m.label, sia: m.sia, unit: m.unit, kbobPrice: m.kbobPrice, category: m.category, qty };
}

export default function BeschaffungFlow({
  initialMaterial,
  initialQty,
  initialProject,
}: {
  initialMaterial?: string;
  initialQty?: string;
  /** Vorausgewählte Baustelle, z. B. aus dem Warenkorb im Dashboard. */
  initialProject?: string;
}) {
  const { projects, loading: projectsLoading } = useProjects();
  // Vorauswahl aus der URL (z. B. „Pool beitreten" aus dem Feed):
  // ?material=beton-25,stahl-b500b&menge=120
  const presetPositions = useMemo(() => {
    if (!initialMaterial) return [];
    return initialMaterial
      .split(",")
      // Sowohl der interne Schlüssel als auch die Materialnummer sind
      // erlaubt: ?material=beton-25 und ?material=OB-BET-001 landen beide
      // richtig. Nummern werden abgetippt, Schlüssel kommen aus Links.
      .map((k) => {
        const t = k.trim();
        return (
          PROC_MATERIALS.find((m) => m.key === t) ??
          PROC_MATERIALS.find((m) => m.id === t.toUpperCase())
        );
      })
      .filter((m): m is ProcMaterial => !!m)
      .map((m, i) => toPosition(m, i === 0 ? (initialQty ?? "") : ""));
  }, [initialMaterial, initialQty]);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Mehrfachauswahl: alle gewählten Materialien
  const [positions, setPositions] = useState<Position[]>(presetPositions);

  // Im Formular neu erfasste Materialien — werden dem Katalog dieser Sitzung hinzugefügt
  const [customMaterials, setCustomMaterials] = useState<ProcMaterial[]>([]);

  // Material-Browsing
  const [matQuery, setMatQuery] = useState("");
  const [matCat, setMatCat] = useState<string>("ALL");

  // Modal „Weiteres Material erfassen"
  const [modalOpen, setModalOpen] = useState(false);

  // Belege
  const [files, setFiles] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Lieferung (gilt für alle Positionen)
  const [deliveryWindow, setDeliveryWindow] = useState<string>(DELIVERY_WINDOWS[0]);
  const [region, setRegion] = useState<string>(PROC_REGIONS[0]);
  const [site, setSite] = useState("");
  const [projectId, setProjectId] = useState(initialProject ?? "");
  const project = projects.find((p) => p.id === projectId) ?? null;
  // Baustelle im Klartext für Zusammenfassung und Übermittlung: entweder
  // das gewählte Projekt oder — wenn noch keins angelegt ist — der Text
  // aus dem Ersatzfeld.
  const siteLabel = project ? projectLabel(project) : site;

  // Smart Pool
  const [pool, setPool] = useState(true);

  const catalog = useMemo(() => [...customMaterials, ...PROC_MATERIALS], [customMaterials]);

  const filteredMaterials = useMemo(() => {
    const q = matQuery.trim().toLowerCase();
    return catalog.filter((m) => {
      if (matCat !== "ALL" && m.category !== matCat) return false;
      if (!q) return true;
      // Bezeichnung, Norm und Materialnummer — dazu die Kategorie, damit
      // "Dämmung" als Suchbegriff weiterhin die ganze Gruppe bringt.
      return matchesMaterial(m, q) || m.category.toLowerCase().includes(q);
    });
  }, [catalog, matQuery, matCat]);

  const selectedKeys = useMemo(() => new Set(positions.map((p) => p.key)), [positions]);

  /** Kalkulation je Position — Tier hängt an der Menge der einzelnen Position. */
  const lines = useMemo(
    () =>
      positions.map((p) => {
        const qty = Number(p.qty) || 0;
        const tier = tierForVolume(qty);
        const discount = pool ? tier.discount : 0;
        const unitPrice = p.kbobPrice * (1 - discount / 100);
        return {
          pos: p,
          qty,
          tier,
          discount,
          unitPrice,
          cost: unitPrice * qty,
          savings: (p.kbobPrice - unitPrice) * qty,
        };
      }),
    [positions, pool],
  );

  const totals = useMemo(
    () => ({
      cost: lines.reduce((s, l) => s + l.cost, 0),
      savings: lines.reduce((s, l) => s + l.savings, 0),
      filled: lines.filter((l) => l.qty > 0).length,
    }),
    [lines],
  );

  const reference = useMemo(
    () => "OBT-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 8999),
    [],
  );

  function toggleMaterial(m: ProcMaterial) {
    setPositions((prev) =>
      prev.some((p) => p.key === m.key) ? prev.filter((p) => p.key !== m.key) : [...prev, toPosition(m)],
    );
  }
  function removePosition(key: string) {
    setPositions((prev) => prev.filter((p) => p.key !== key));
  }
  function updatePosition(key: string, patch: Partial<Position>) {
    setPositions((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  /** Neues Material aus dem Modal: in den Katalog aufnehmen und direkt auswählen. */
  function addCustomMaterial(m: ProcMaterial) {
    setCustomMaterials((prev) => [m, ...prev]);
    setPositions((prev) => [...prev, { ...toPosition(m), isNew: true }]);
    setModalOpen(false);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(e.target.files ?? []).map((f) => f.name);
    if (names.length) setFiles((prev) => [...prev, ...names]);
    e.target.value = "";
  }

  const canNext = step === 0 ? positions.length > 0 : step === 1 ? totals.filled === positions.length : true;

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else setDone(true);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }
  function reset() {
    setDone(false);
    setStep(0);
    setPositions([]);
    setFiles([]);
    setSite("");
    setMatQuery("");
    setMatCat("ALL");
  }

  /* ------------------------------ Abschluss ------------------------------ */
  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn(CARD, "p-8 text-center")}>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-brand/15 text-brand">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Bedarf gemeldet</h2>
        <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">
          {positions.length === 1 ? "Deine Materialanfrage wurde erfasst" : `${positions.length} Positionen wurden erfasst`}
          . Referenz <span className="font-semibold text-slate-900">{reference}</span>.
          {pool
            ? " Jede Position wird einem passenden Pool ihrer Materialart und Region zugeordnet — daraus entstehen separate Bündel."
            : " Passende Baustoffwerke werden zur Angebotsabgabe eingeladen."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/pools" className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500">
            <Layers className="h-4 w-4" /> Zu meinen Smart Pools
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Zum Dashboard
          </Link>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Weiteren Bedarf melden
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {/* Stepper */}
        <div className={cn(CARD, "mb-4 p-4")}>
          <ol className="flex items-center">
            {STEPS.map((label, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li key={label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md text-[13px] font-bold",
                        state === "done" && "bg-navy-900 text-brand",
                        state === "active" && "bg-brand text-navy-900",
                        state === "todo" && "border border-slate-300 bg-white text-slate-400",
                      )}
                    >
                      {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={cn("hidden text-[13px] font-medium sm:block", state === "todo" ? "text-slate-400" : "text-slate-900")}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <span className={cn("mx-2 h-[2px] flex-1", i < step ? "bg-brand" : "bg-slate-200")} />}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Ausgewählte Materialien — immer zuoberst, damit die Übersicht bleibt */}
        {positions.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-navy-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                Ausgewählt · {positions.length} {positions.length === 1 ? "Material" : "Materialien"}
              </div>
              {positions.length > 1 && (
                <span className="rounded border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10.5px] font-semibold text-brand">
                  wird in separate Pools aufgeteilt
                </span>
              )}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {positions.map((p) => (
                <span key={p.key} className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.06] py-1 pl-2.5 pr-1.5 text-[12.5px]">
                  <span className="font-medium">{p.label}</span>
                  {Number(p.qty) > 0 && <span className="text-brand">{chf(Number(p.qty))} {p.unit}</span>}
                  {p.isNew && <span className="rounded bg-brand/20 px-1 text-[10px] font-bold text-brand">NEU</span>}
                  <button type="button" onClick={() => removePosition(p.key)} className="rounded p-0.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={cn(CARD, "p-5 sm:p-6")}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
              {/* ---------------------- Step 1: Materialien ---------------------- */}
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Welche Materialien brauchst du?</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Mehrfachauswahl möglich — jede Position wird später ihrem eigenen Pool zugeordnet.
                  </p>

                  <div className="relative mt-4">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={matQuery}
                      onChange={(e) => setMatQuery(e.target.value)}
                      placeholder="Material oder Nummer suchen (z. B. Beton, OB-BET-001 …)"
                      className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatCat("ALL")}
                      className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors", matCat === "ALL" ? "bg-navy-900 text-white" : "border border-slate-200 bg-white text-slate-500 hover:text-slate-900")}
                    >
                      Alle
                    </button>
                    {PROC_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setMatCat(c)}
                        className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors", matCat === c ? "bg-navy-900 text-white" : "border border-slate-200 bg-white text-slate-500 hover:text-slate-900")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid max-h-[360px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {filteredMaterials.map((m) => {
                      const active = selectedKeys.has(m.key);
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => toggleMaterial(m)}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                            active ? "border-brand bg-brand/[0.05] ring-1 ring-brand/30" : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border", active ? "border-brand bg-brand text-navy-900" : "border-slate-300 bg-white")}>
                            {active && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-slate-900">{m.label}</span>
                            <span className="mt-0.5 block font-mono text-[10.5px] tracking-tight text-brand-700">{m.id}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-slate-400">{m.sia}</span>
                            <span className="mt-1 inline-block text-[11px] text-slate-500">
                              KBOB-Ref CHF {chf(m.kbobPrice)}/{m.unit}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {filteredMaterials.length === 0 && (
                      <p className="col-span-full py-6 text-center text-[13px] text-slate-400">
                        Kein Katalog-Treffer — erfasse es unten als „Weiteres Material".
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 p-3 text-left transition-colors hover:border-brand hover:bg-brand/[0.03]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500">
                      <PenLine className="h-4 w-4" />
                    </span>
                    <span className="text-[14px] font-semibold text-slate-900">
                      Weiteres Material erfassen
                      <span className="ml-1 text-[12px] font-normal text-slate-400">— nicht im Katalog? Hier hinzufügen.</span>
                    </span>
                    <Plus className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
                  </button>

                  {/* Belege */}
                  <div className="mt-5">
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Pläne, Lieferscheine oder Fotos (optional)
                    </label>
                    {files.length > 0 && (
                      <ul className="mb-2 space-y-1.5">
                        {files.map((f, i) => (
                          <li key={`${f}-${i}`} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                            <FileText className="h-4 w-4 shrink-0 text-brand" />
                            <span className="min-w-0 flex-1 truncate text-slate-700">{f}</span>
                            <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="rounded p-1 text-slate-400 hover:bg-slate-200">
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3.5 text-sm text-slate-500 transition-colors hover:border-brand hover:text-brand"
                    >
                      <Upload className="h-4 w-4" /> Datei hinzufügen
                    </button>
                    <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={onFile} />
                    <p className="mt-1.5 text-[11.5px] text-slate-400">
                      Die Dateien werden dem Bedarf angehängt. Automatisches Auslesen von Material und Menge ist in Arbeit.
                    </p>
                  </div>
                </div>
              )}

              {/* ------------------ Step 2: Mengen & Lieferung ------------------ */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Mengen, Lieferung & Standort</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Gib je Material die benötigte Menge an.</p>

                  <div className="mt-4 space-y-2">
                    {positions.map((p) => (
                      <div key={p.key} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-slate-900">{p.label}</div>
                            <div className="font-mono text-[10.5px] tracking-tight text-brand-700">{p.id}</div>
                            <div className="truncate text-[11px] text-slate-400">{p.sia}</div>
                          </div>
                          <div className="flex w-[170px] shrink-0 items-center rounded-md border border-slate-300 bg-slate-50 focus-within:border-brand focus-within:bg-white focus-within:ring-1 focus-within:ring-brand/30">
                            <input
                              value={p.qty}
                              onChange={(e) => updatePosition(p.key, { qty: e.target.value.replace(/[^0-9.]/g, "") })}
                              inputMode="decimal"
                              placeholder="Menge"
                              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                            />
                            <span className="px-2.5 text-sm font-medium text-slate-400">{p.unit}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SIA</label>
                          <input
                            value={p.sia}
                            onChange={(e) => updatePosition(p.key, { sia: e.target.value })}
                            className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12.5px] text-slate-700 outline-none focus:border-brand focus:bg-white"
                          />
                          <button type="button" onClick={() => removePosition(p.key)} className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <CalendarClock className="mr-1 inline h-3.5 w-3.5" /> Lieferzeitraum
                      </label>
                      <select value={deliveryWindow} onChange={(e) => setDeliveryWindow(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white">
                        {DELIVERY_WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <MapPin className="mr-1 inline h-3.5 w-3.5" /> Region
                      </label>
                      <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white">
                        {PROC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Baustelle (optional)</label>
                      {projects.length > 0 ? (
                        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white">
                          <option value="">Keiner Baustelle zuordnen</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{projectLabel(p)}</option>
                          ))}
                        </select>
                      ) : (
                        <input value={site} onChange={(e) => setSite(e.target.value)} placeholder={projectsLoading ? "Wird geladen …" : "z. B. Überbauung Bern-West"} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white" />
                      )}
                      {projects.length === 0 && !projectsLoading && (
                        <p className="mt-1 text-[11.5px] text-slate-400">
                          Baustellen legst du im{" "}
                          <Link href="/dashboard" className="font-semibold text-brand hover:underline">Dashboard unter „Projekte"</Link>{" "}
                          an — dann kannst du hier direkt auswählen.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------- Step 3: Smart Pool ---------------------- */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Smart Pool aktivieren?</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Bündeln ist ein Zusatz — kein Pflichtschritt.</p>

                  <button
                    type="button"
                    onClick={() => setPool((v) => !v)}
                    className={cn(
                      "mt-4 flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      pool ? "border-brand bg-brand/[0.05] ring-1 ring-brand/30" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border", pool ? "border-brand bg-brand text-navy-900" : "border-slate-300 bg-white")}>
                      {pool && <Check className="h-4 w-4" />}
                    </span>
                    <span>
                      <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                        <Layers className="h-4 w-4 text-brand" /> Bedarf bündeln
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">
                        Jede Position wird mit gleichen Bedarfen deiner Region zu einem grösseren Volumen
                        zusammengelegt. Die Baustoffwerke geben darauf verdeckte Angebote (Sealed-Bid) ab —
                        das beste Angebot gegenüber dem KBOB-Referenzpreis erhält den Zuschlag. Je grösser
                        das gebündelte Volumen, desto höher der garantierte Netto-Mindestvorteil.
                      </span>
                    </span>
                  </button>

                  {/* Erwarteter Vorteil je Position */}
                  {pool && (
                    <div className="mt-4 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Erwarteter Mindestvorteil je Position
                      </div>
                      {lines.map((l) => (
                        <div key={l.pos.key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-[13.5px] font-semibold text-slate-900">{l.pos.label}</div>
                            <div className="text-[11px] text-slate-400">{chf(l.qty)} {l.pos.unit} · Stufe {l.tier.tier}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[15px] font-bold text-brand">{l.discount} %</div>
                            <div className="text-[11px] text-slate-400">mind. CHF {chf(l.savings)}</div>
                          </div>
                        </div>
                      ))}
                      <p className="flex items-start gap-2 pt-1 text-[11.5px] leading-relaxed text-slate-400">
                        <Gavel className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                        Garantierter Mindestwert — das beste Sealed-Bid-Angebot kann darüber liegen. Die
                        Rabattstufen werden aktuell überarbeitet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ----------------------- Step 4: Übersicht ---------------------- */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Übersicht & Absenden</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Prüfe deine Angaben und melde den Bedarf.</p>

                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-slate-50">
                        <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                          <th className="px-3.5 py-2 font-medium">Material</th>
                          <th className="px-2 py-2 font-medium">Menge</th>
                          <th className="px-2 py-2 text-right font-medium">KBOB</th>
                          {pool && <th className="px-3.5 py-2 text-right font-medium">Mindestvorteil</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lines.map((l) => (
                          <tr key={l.pos.key}>
                            <td className="px-3.5 py-2.5">
                              <div className="font-semibold text-slate-900">{l.pos.label}</div>
                              <div className="font-mono text-[10.5px] tracking-tight text-brand-700">{l.pos.id}</div>
                              <div className="truncate text-[11px] text-slate-400">{l.pos.sia}</div>
                            </td>
                            <td className="px-2 py-2.5 tabular-nums text-slate-600">{chf(l.qty)} {l.pos.unit}</td>
                            <td className="px-2 py-2.5 text-right tabular-nums text-slate-500">CHF {chf(l.pos.kbobPrice)}</td>
                            {pool && (
                              <td className="px-3.5 py-2.5 text-right">
                                <span className="font-semibold text-brand">{l.discount} %</span>
                                <div className="text-[11px] text-slate-400">CHF {chf(l.savings)}</div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <dl className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {[
                      ["Lieferzeitraum", deliveryWindow],
                      ["Region", region],
                      ["Baustelle", siteLabel || "—"],
                      ["Belege", files.length ? files.join(", ") : "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
                        <dt className="text-slate-500">{k}</dt>
                        <dd className="text-right font-medium text-slate-900">{v}</dd>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="text-slate-500">Bündelung</dt>
                      <dd>
                        {pool
                          ? <span className={badge("gold", true)}><Layers className="h-3 w-3" /> aktiviert</span>
                          : <span className={badge("slate", true)}>Einzelbestellung</span>}
                      </dd>
                    </div>
                  </dl>

                  {pool && totals.savings > 0 && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/10 bg-navy-900 p-4 text-white">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/15 text-brand">
                        <TrendingDown className="h-5 w-5" />
                      </span>
                      <div className="text-sm">
                        <div className="font-semibold">Garantierter Mindestvorteil: CHF {chf(totals.savings)}</div>
                        <div className="text-white/50">
                          Über {positions.length} {positions.length === 1 ? "Position" : "Positionen"} · Bestellwert CHF {chf(totals.cost)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Zurück
            </button>
            <div className="flex items-center gap-3">
              {step === 1 && totals.filled < positions.length && (
                <span className="text-[12px] text-slate-400">Menge bei allen Positionen nötig</span>
              )}
              <button type="button" onClick={next} disabled={!canNext} className="inline-flex items-center gap-1.5 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50">
                {step === STEPS.length - 1 ? (<><Send className="h-4 w-4" /> Bedarf melden</>) : (<>Weiter <ChevronRight className="h-4 w-4" /></>)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rechte Info-Rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-[72px] space-y-4">
          <div className={cn(CARD, "p-4")}>
            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-brand" /> So läuft&apos;s ab
            </h3>
            <ol className="mt-3 space-y-3">
              {[
                "Materialien wählen — Mehrfachauswahl möglich",
                "Mengen, Lieferzeitraum und Region angeben",
                "Optional bündeln — je Material ein eigener Pool",
                "Sealed-Bid der Werke, Zuschlag, SIA-118-Vertrag",
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5 text-[13px] text-slate-600">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-slate-100 text-[11px] font-bold text-slate-500">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>

          {totals.filled > 0 && (
            <div className={cn(CARD, "p-4")}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live-Kalkulation</div>
              <div className="mt-2 space-y-1.5 text-sm">
                <Row k="Positionen" v={String(positions.length)} />
                <Row k="Bündelung" v={pool ? "aktiv" : "—"} />
                <div className="my-1 border-t border-slate-100" />
                <Row k="Bestellwert" v={`CHF ${chf(totals.cost)}`} bold />
                <Row k="Mindestvorteil" v={`CHF ${chf(totals.savings)}`} accent />
              </div>
            </div>
          )}

          <div className={cn(CARD, "p-4")}>
            <p className="text-[13px] leading-relaxed text-slate-600">
              Schon Mitglieder in deiner Region?{" "}
              <Link href="/network" className="font-semibold text-brand hover:underline">Netzwerk ansehen</Link> und direkt verhandeln.
            </p>
          </div>
        </div>
      </aside>

      {modalOpen && (
        <CustomMaterialModal
          onClose={() => setModalOpen(false)}
          onAdd={addCustomMaterial}
          existing={catalog}
          ownCount={customMaterials.length}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal: eigenes Material erfassen                                          */
/* -------------------------------------------------------------------------- */

function CustomMaterialModal({
  onClose,
  onAdd,
  existing,
  ownCount,
}: {
  onClose: () => void;
  onAdd: (m: ProcMaterial) => void;
  existing: ProcMaterial[];
  /** Wie viele eigene Materialien es schon gibt — für die Nummerierung. */
  ownCount: number;
}) {
  const [label, setLabel] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [sia, setSia] = useState("");
  const [category, setCategory] = useState<ProcCategory>(PROC_CATEGORIES[0]);

  // Einfache Dublettenprüfung über den Namen, damit der Katalog sauber bleibt.
  const similar = useMemo(() => {
    const q = label.trim().toLowerCase();
    if (q.length < 3) return [];
    return existing.filter((m) => m.label.toLowerCase().includes(q) || q.includes(m.label.toLowerCase())).slice(0, 3);
  }, [label, existing]);

  const valid = label.trim().length >= 2 && unit.trim().length >= 1;

  function submit() {
    if (!valid) return;
    onAdd({
      key: "custom-" + label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) + "-" + Date.now().toString(36),
      id: ownMaterialId(ownCount),
      label: label.trim(),
      sia: sia.trim() || "Freie Erfassung — Spezifikation offen",
      unit: unit.trim(),
      kbobPrice: Number(price) || 0,
      category,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
            <PenLine className="h-4 w-4 text-brand" /> Weiteres Material erfassen
          </h3>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 px-5 py-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bezeichnung *</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
              placeholder="z. B. Faserbeton, Naturstein, Spezialmörtel …"
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
            />
            {similar.length > 0 && (
              <div className="mt-2 rounded-md border border-brand/25 bg-brand/[0.05] px-3 py-2">
                <div className="text-[11.5px] font-semibold text-slate-700">Ähnliches gibt es schon im Katalog:</div>
                <ul className="mt-1 space-y-0.5">
                  {similar.map((m) => (
                    <li key={m.key} className="text-[12px] text-slate-500">· {m.label}</li>
                  ))}
                </ul>
                <div className="mt-1 text-[11px] text-slate-400">
                  Bitte prüfen, damit nicht dasselbe Material doppelt entsteht.
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Einheit *</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="m³, t, m², Stk" className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Richtpreis (optional)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="CHF pro Einheit" className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kategorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ProcCategory)} className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white">
              {PROC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">SIA-/Normspezifikation (optional)</label>
            <input value={sia} onChange={(e) => setSia(e.target.value)} placeholder="z. B. SN EN 206 · C30/37" className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white" />
          </div>

          <p className="text-[11.5px] leading-relaxed text-slate-400">
            Das Material wird direkt ausgewählt und erscheint in deinem Katalog. Die Freigabe für
            andere Firmen (damit sie demselben Bündel beitreten können) und der Abgleich gegen
            bestehende Einträge folgen mit der Katalog-Anbindung.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-md px-3.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200">
            Abbrechen
          </button>
          <button type="button" onClick={submit} disabled={!valid} className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" /> Hinzufügen & auswählen
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ k, v, bold, accent }: { k: string; v: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{k}</span>
      <span className={cn("tabular-nums", accent ? "font-semibold text-brand" : bold ? "font-bold text-slate-900" : "text-slate-700")}>{v}</span>
    </div>
  );
}
