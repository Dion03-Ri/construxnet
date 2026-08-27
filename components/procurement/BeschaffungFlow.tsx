"use client";

import { useMemo, useRef, useState } from "react";
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
  Sparkles,
  ShieldCheck,
  X,
  TrendingDown,
  Send,
  Search,
  PenLine,
} from "lucide-react";
import {
  PROC_MATERIALS,
  PROC_CATEGORIES,
  PROC_REGIONS,
  PROC_TIERS,
  DELIVERY_WINDOWS,
  tierForVolume,
  type ProcMaterial,
} from "@/data/procurement";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

function chf(v: number, d = 0) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

const STEPS = ["Material & SIA", "Menge & Lieferung", "Smart Pool", "Übersicht"];

export default function BeschaffungFlow({ initialMaterial }: { initialMaterial?: string }) {
  const preset = PROC_MATERIALS.find((m) => m.key === initialMaterial);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Step 1
  const [materialKey, setMaterialKey] = useState<string>(preset?.key ?? "");
  const [sia, setSia] = useState(preset?.sia ?? "");
  const [file, setFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Material-Browsing
  const [matQuery, setMatQuery] = useState("");
  const [matCat, setMatCat] = useState<string>("ALL");

  // „Weiteres Material" (frei)
  const [customMode, setCustomMode] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Step 2
  const [qty, setQty] = useState("");
  const [window, setWindow] = useState<string>(DELIVERY_WINDOWS[0]);
  const [region, setRegion] = useState<string>(PROC_REGIONS[0]);
  const [site, setSite] = useState("");

  // Step 3
  const [pool, setPool] = useState(true);

  const material: ProcMaterial | undefined = customMode
    ? customLabel.trim()
      ? {
          key: "custom",
          label: customLabel.trim(),
          sia: sia,
          unit: customUnit.trim() || "Einheit",
          kbobPrice: Number(customPrice) || 0,
          category: "Beton",
        }
      : undefined
    : PROC_MATERIALS.find((m) => m.key === materialKey);
  const qtyNum = Number(qty) || 0;

  const filteredMaterials = useMemo(() => {
    const q = matQuery.trim().toLowerCase();
    return PROC_MATERIALS.filter((m) => {
      if (matCat !== "ALL" && m.category !== matCat) return false;
      if (!q) return true;
      return m.label.toLowerCase().includes(q) || m.sia.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    });
  }, [matQuery, matCat]);

  const calc = useMemo(() => {
    if (!material || qtyNum <= 0) return null;
    const tier = tierForVolume(qtyNum);
    const discount = pool ? tier.discount : 0;
    const unitPrice = material.kbobPrice * (1 - discount / 100);
    const savingsUnit = material.kbobPrice - unitPrice;
    const totalSavings = savingsUnit * qtyNum;
    const totalCost = unitPrice * qtyNum;
    return { tier, discount, unitPrice, savingsUnit, totalSavings, totalCost };
  }, [material, qtyNum, pool]);

  const reference = useMemo(
    () => "CNX-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 8999),
    [],
  );

  function pickMaterial(m: ProcMaterial) {
    setCustomMode(false);
    setMaterialKey(m.key);
    setSia(m.sia);
  }

  function enableCustom() {
    setCustomMode(true);
    setMaterialKey("");
    setSia("");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f.name);
  }

  const canNext =
    step === 0 ? !!material : step === 1 ? qtyNum > 0 : true;

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else setDone(true);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn(CARD, "p-8 text-center")}>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-accent/10 text-accent">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Bedarf gemeldet</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Deine Materialanfrage wurde erfasst. Referenz{" "}
          <span className="font-semibold text-slate-900">{reference}</span>.
          {pool
            ? " Wir bündeln sie mit passenden Anfragen in deiner Region und benachrichtigen dich, sobald der Smart Pool einen Tier-Rabatt erreicht."
            : " Passende Baustoffwerke werden zur Angebotsabgabe eingeladen."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/pools" className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
            <Layers className="h-4 w-4" /> Zu meinen Smart Pools
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Zum Dashboard
          </Link>
          <button
            type="button"
            onClick={() => { setDone(false); setStep(0); setMaterialKey(""); setSia(""); setQty(""); setFile(null); setSite(""); setCustomMode(false); setCustomLabel(""); setCustomUnit(""); setCustomPrice(""); setMatQuery(""); setMatCat("ALL"); }}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
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
        <div className={cn(CARD, "mb-6 p-4")}>
          <ol className="flex items-center">
            {STEPS.map((label, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li key={label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md text-[13px] font-bold",
                        state === "done" && "bg-accent text-white",
                        state === "active" && "bg-brand text-white",
                        state === "todo" && "border border-slate-300 bg-white text-slate-400",
                      )}
                    >
                      {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "hidden text-[13px] font-medium sm:block",
                        state === "todo" ? "text-slate-400" : "text-slate-900",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className={cn("mx-2 h-[2px] flex-1", i < step ? "bg-accent" : "bg-slate-200")} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className={cn(CARD, "p-5 sm:p-6")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              {/* Step 1 */}
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Welches Material brauchst du?</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Wähle aus dem Katalog oder erfasse ein eigenes Material — die SIA-Spezifikation wird vorbefüllt und ist editierbar.</p>

                  {/* Suche + Kategorie-Filter */}
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={matQuery}
                        onChange={(e) => setMatQuery(e.target.value)}
                        placeholder="Material suchen (z. B. Beton, Stahl, Dämmung …)"
                        className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatCat("ALL")}
                      className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors", matCat === "ALL" ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-500 hover:text-slate-900")}
                    >
                      Alle
                    </button>
                    {PROC_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setMatCat(c)}
                        className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors", matCat === c ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-500 hover:text-slate-900")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid max-h-[340px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {filteredMaterials.map((m) => {
                      const active = !customMode && m.key === materialKey;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => pickMaterial(m)}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                            active ? "border-brand bg-brand/[0.04] ring-1 ring-brand/30" : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md", active ? "bg-brand text-white" : "bg-slate-100 text-slate-500")}>
                            <Boxes className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
                              {m.label}
                              {active && <Check className="h-4 w-4 text-brand" />}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-slate-400">{m.sia}</span>
                            <span className="mt-1 inline-block text-[11px] text-slate-500">KBOB-Ref CHF {chf(m.kbobPrice)}/{m.unit}</span>
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

                  {/* Weiteres Material (frei) */}
                  <button
                    type="button"
                    onClick={enableCustom}
                    className={cn(
                      "mt-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      customMode ? "border-brand bg-brand/[0.04] ring-1 ring-brand/30" : "border-dashed border-slate-300 hover:border-brand hover:text-brand",
                    )}
                  >
                    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", customMode ? "bg-brand text-white" : "bg-slate-100 text-slate-500")}>
                      <PenLine className="h-4 w-4" />
                    </span>
                    <span className="text-[14px] font-semibold text-slate-900">
                      Weiteres Material erfassen
                      <span className="ml-1 text-[12px] font-normal text-slate-400">— nicht im Katalog? Frei eingeben.</span>
                    </span>
                  </button>

                  {customMode && (
                    <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-brand/25 bg-brand/[0.03] p-3 sm:grid-cols-3">
                      <div className="sm:col-span-3">
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Material-Bezeichnung *</label>
                        <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="z. B. Faserbeton, Naturstein, Spezialmörtel …" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Einheit</label>
                        <input value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} placeholder="m³, t, m², Stk …" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">KBOB-/Richtpreis pro Einheit (optional)</label>
                        <input value={customPrice} onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="CHF" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30" />
                      </div>
                    </div>
                  )}

                  {material && (
                    <div className="mt-4">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        SIA- / Normspezifikation
                      </label>
                      <input
                        value={sia}
                        onChange={(e) => setSia(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
                      />
                    </div>
                  )}

                  {/* Scan / Foto */}
                  <div className="mt-4">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Bedarf per Foto / Datei melden (optional)
                    </label>
                    {file ? (
                      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-brand" />
                        <span className="min-w-0 flex-1 truncate text-slate-700">{file}</span>
                        <span className={badge("accent", true)}>erkannt</span>
                        <button type="button" onClick={() => setFile(null)} className="rounded p-1 text-slate-400 hover:bg-slate-200">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500 transition-colors hover:border-brand hover:text-brand"
                      >
                        <Upload className="h-4 w-4" />
                        Lieferschein, Plan oder Foto hochladen — wir lesen Material & Menge aus
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onFile} />
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 1 && material && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Menge, Lieferung & Standort</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Für <span className="font-medium text-slate-700">{material.label}</span></p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Boxes className="mr-1 inline h-3.5 w-3.5" /> Menge
                      </label>
                      <div className="flex items-center rounded-md border border-slate-300 bg-slate-50 focus-within:border-brand focus-within:bg-white focus-within:ring-1 focus-within:ring-brand/30">
                        <input
                          value={qty}
                          onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))}
                          inputMode="decimal"
                          placeholder="z. B. 230"
                          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                        <span className="px-3 text-sm font-medium text-slate-400">{material.unit}</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <CalendarClock className="mr-1 inline h-3.5 w-3.5" /> Lieferzeitraum
                      </label>
                      <select
                        value={window}
                        onChange={(e) => setWindow(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
                      >
                        {DELIVERY_WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <MapPin className="mr-1 inline h-3.5 w-3.5" /> Region
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
                      >
                        {PROC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Baustelle / Standort (optional)
                      </label>
                      <input
                        value={site}
                        onChange={(e) => setSite(e.target.value)}
                        placeholder="z. B. Überbauung Bern-West"
                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 2 && material && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Smart Pool aktivieren?</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Bündeln ist ein Zusatz — kein Pflichtschritt.</p>

                  <button
                    type="button"
                    onClick={() => setPool((v) => !v)}
                    className={cn(
                      "mt-4 flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      pool ? "border-accent bg-accent/[0.05] ring-1 ring-accent/30" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border", pool ? "border-accent bg-accent text-white" : "border-slate-300 bg-white")}>
                      {pool && <Check className="h-4 w-4" />}
                    </span>
                    <span>
                      <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                        <Sparkles className="h-4 w-4 text-accent" /> Smart Pool aktivieren
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">
                        Bündle deine Bestellung mit anderen Bauunternehmen in deiner Region und erhalte
                        automatisch bis zu <b className="text-accent">20 % Rabatt</b> — garantierter Tier-Rabatt
                        für alle Teilnehmer, unabhängig vom Beitrittszeitpunkt.
                      </span>
                    </span>
                  </button>

                  {/* Tier-Preview — 5 Rabattstufen */}
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {PROC_TIERS.map((t) => {
                      const active = pool && calc?.tier.tier === t.tier;
                      const range = t.max === null ? `${t.min}+` : `${t.min}–${t.max}`;
                      return (
                        <div
                          key={t.tier}
                          className={cn(
                            "rounded-lg border p-3 text-center",
                            active ? "border-accent bg-accent/[0.06]" : "border-slate-200 bg-white",
                          )}
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tier {t.tier}</div>
                          <div className={cn("mt-0.5 text-xl font-bold", active ? "text-accent" : "text-slate-900")}>{t.discount}%</div>
                          <div className="text-[11px] text-slate-400">{range} {material.unit}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 3 && material && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Übersicht & Absenden</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Prüfe deine Angaben und melde den Bedarf.</p>

                  <dl className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {[
                      ["Material", material.label],
                      ["SIA-Spezifikation", sia],
                      ["Menge", `${chf(qtyNum)} ${material.unit}`],
                      ["Lieferzeitraum", window],
                      ["Region", region],
                      ["Baustelle", site || "—"],
                      ["Beleg", file || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
                        <dt className="text-slate-500">{k}</dt>
                        <dd className="text-right font-medium text-slate-900">{v}</dd>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="text-slate-500">Smart Pool</dt>
                      <dd>
                        {pool
                          ? <span className={badge("accent", true)}><Sparkles className="h-3 w-3" /> aktiviert</span>
                          : <span className={badge("slate", true)}>Einzelbestellung</span>}
                      </dd>
                    </div>
                  </dl>

                  {calc && pool && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/[0.05] p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                        <TrendingDown className="h-5 w-5" />
                      </span>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-900">
                          Geschätzte Ersparnis: CHF {chf(calc.totalSavings)} ({calc.discount}% · Tier {calc.tier.tier})
                        </div>
                        <div className="text-slate-500">
                          Effektivpreis CHF {chf(calc.unitPrice, 2)}/{material.unit} statt KBOB CHF {chf(material.kbobPrice)}/{material.unit}
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
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Zurück
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === STEPS.length - 1 ? (<><Send className="h-4 w-4" /> Bedarf melden</>) : (<>Weiter <ChevronRight className="h-4 w-4" /></>)}
            </button>
          </div>
        </div>
      </div>

      {/* Rechte Info-Rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-[72px] space-y-4">
          <div className={cn(CARD, "p-4")}>
            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-brand" /> So läuft's ab
            </h3>
            <ol className="mt-3 space-y-3">
              {[
                "Bedarf melden — Material, Menge, Region",
                "Optional bündeln — Smart Pool aktivieren",
                "Angebot & Zuschlag — Sealed-Bid der Werke",
                "Liefern & SIA-118-Vertrag",
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5 text-[13px] text-slate-600">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-slate-100 text-[11px] font-bold text-slate-500">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>

          {calc && (
            <div className={cn(CARD, "p-4")}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live-Kalkulation</div>
              <div className="mt-2 space-y-1.5 text-sm">
                <Row k="Menge" v={`${chf(qtyNum)} ${material?.unit ?? ""}`} />
                <Row k="Rabatt" v={pool ? `${calc.discount}% (Tier ${calc.tier.tier})` : "—"} />
                <Row k="Effektivpreis" v={`CHF ${chf(calc.unitPrice, 2)}`} />
                <div className="my-1 border-t border-slate-100" />
                <Row k="Bestellwert" v={`CHF ${chf(calc.totalCost)}`} bold />
                <Row k="Ersparnis" v={`CHF ${chf(calc.totalSavings)}`} accent />
              </div>
            </div>
          )}

          <div className={cn(CARD, "bg-gradient-to-br from-brand/5 to-accent/5 p-4")}>
            <p className="text-[13px] leading-relaxed text-slate-600">
              Schon Mitglieder in deiner Region? <Link href="/network" className="font-semibold text-brand hover:underline">Netzwerk ansehen</Link> und direkt verhandeln.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v, bold, accent }: { k: string; v: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{k}</span>
      <span className={cn("tabular-nums", accent ? "font-semibold text-accent" : bold ? "font-bold text-slate-900" : "text-slate-700")}>{v}</span>
    </div>
  );
}
