"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Factory,
  Package,
  FileText,
  Link2,
  TrendingDown,
  Gavel,
  Coins,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

function chf(v: number, d = 0) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

/* -------------------------------------------------------------------------- */
/*  Buyer cockpit                                                             */
/* -------------------------------------------------------------------------- */

const BUYER_POOLS = [
  { material: "Beton C25/30", region: "Zürich", vol: 230, target: 300, tier: 2, disc: 12, deadline: "4 Tage", coupled: "Stahl B500B" },
  { material: "Bewehrungsstahl B500B", region: "Bern", vol: 48, target: 60, tier: 2, disc: 12, deadline: "9 Tage", coupled: null },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", vol: 320, target: 301, tier: 3, disc: 20, deadline: "2 Tage", coupled: null },
];

const BUYER_CONTRACTS = [
  { no: "CNX-2026-0142", material: "Beton C25/30", vol: "180 m³", price: "145.20", status: "Aktiv" },
  { no: "CNX-2026-0119", material: "Koffer-/Wandkies 0/45", vol: "300 t", price: "33.15", status: "Abgeschlossen" },
  { no: "CNX-2026-0098", material: "Bewehrungsstahl B500B", vol: "42 t", price: "1'108.00", status: "Aktiv" },
];

function BuyerCockpit() {
  const activePools = BUYER_POOLS.length;
  const avgSaving = 13.8;
  const openContracts = BUYER_CONTRACTS.filter((c) => c.status === "Aktiv").length;

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aktive Pools", value: activePools, icon: Package, tone: "text-brand bg-brand/10" },
          { label: "Ø Ersparnis", value: `${avgSaving}%`, icon: TrendingDown, tone: "text-emerald bg-emerald/10" },
          { label: "Offene Verträge", value: openContracts, icon: FileText, tone: "text-accent bg-accent/10" },
        ].map((k) => (
          <div key={k.label} className={cn(CARD, "p-4")}>
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", k.tone)}>
              <k.icon className="h-4 w-4" />
            </span>
            <div className="mt-2 text-2xl font-bold text-slate-900">{k.value}</div>
            <div className="text-[11px] text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Active pool enrollments */}
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Aktive Pool-Teilnahmen</h3>
        <div className="mt-4 space-y-4">
          {BUYER_POOLS.map((p) => {
            const pct = Math.min(100, Math.round((p.vol / p.target) * 100));
            return (
              <div key={p.material} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{p.material}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{p.region}</span>
                    {p.coupled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                        <Link2 className="h-3 w-3" /> Koppelung: {p.coupled}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> {p.deadline}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald/70" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald/10 px-2 py-0.5 text-[11px] font-semibold text-emerald">
                    Tier {p.tier} · {p.disc}%
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{chf(p.vol)} / {chf(p.target)} {p.material.includes("Beton") ? "m³" : "t"}</span>
                  <Link href="/pools" className="font-medium text-brand hover:text-brand-600">Pool öffnen →</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIA contracts */}
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">SIA-118 Verträge</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 font-medium">Vertrag</th>
                <th className="pb-2 font-medium">Material</th>
                <th className="hidden pb-2 font-medium sm:table-cell">Menge</th>
                <th className="pb-2 font-medium">CHF/Einheit</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BUYER_CONTRACTS.map((c) => (
                <tr key={c.no}>
                  <td className="py-2.5 font-medium text-slate-800">{c.no}</td>
                  <td className="py-2.5 text-slate-600">{c.material}</td>
                  <td className="hidden py-2.5 text-slate-500 sm:table-cell">{c.vol}</td>
                  <td className="py-2.5 tabular-nums text-slate-600">{c.price}</td>
                  <td className="py-2.5 text-right">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", c.status === "Aktiv" ? "bg-emerald/10 text-emerald" : "bg-slate-100 text-slate-500")}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Supplier cockpit                                                          */
/* -------------------------------------------------------------------------- */

const TENDERS = [
  { id: "t1", material: "Beton C25/30", region: "Zürich", vol: "230 m³", kbob: 156, unit: "m³" },
  { id: "t2", material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", vol: "320 t", kbob: 39, unit: "t" },
  { id: "t3", material: "Bewehrungsstahl B500B", region: "Bern", vol: "60 t", kbob: 1120, unit: "t" },
];

const OWN_BIDS = [
  { material: "Beton C25/30", price: "145.20", status: "Eingereicht" },
  { material: "Bewehrungsstahl B500B", price: "1'108.00", status: "Gewonnen" },
  { material: "Kies 0/45", price: "34.50", status: "Verloren" },
];

function SupplierCockpit() {
  const [bids, setBids] = useState<Record<string, string>>({});
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function submit(id: string) {
    if (!draft) return;
    setBids((b) => ({ ...b, [id]: draft }));
    setOpenForm(null);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      {/* Commission */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={cn(CARD, "p-4")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"><Coins className="h-4 w-4" /></span>
          <div className="mt-2 text-2xl font-bold text-slate-900">CHF {chf(8420)}</div>
          <div className="text-[11px] text-slate-500">Plattform-Gebühr diesen Monat (2.25 %)</div>
        </div>
        <div className={cn(CARD, "p-4")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10 text-emerald"><Gavel className="h-4 w-4" /></span>
          <div className="mt-2 text-2xl font-bold text-slate-900">2 / 5</div>
          <div className="text-[11px] text-slate-500">Gewonnene Zuschläge (Monat)</div>
        </div>
        <div className={cn(CARD, "p-4")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><Package className="h-4 w-4" /></span>
          <div className="mt-2 text-2xl font-bold text-slate-900">CHF {chf(374000)}</div>
          <div className="text-[11px] text-slate-500">Zugesprochenes Volumen YTD</div>
        </div>
      </div>

      {/* Open tenders */}
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Offene Ausschreibungen (Sealed-Bid)</h3>
        <div className="mt-4 space-y-3">
          {TENDERS.map((t) => {
            const done = bids[t.id];
            return (
              <div key={t.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-900">{t.material}</div>
                    <div className="text-[11px] text-slate-500">{t.region} · {t.vol} · KBOB-Ref CHF {chf(t.kbob)}/{t.unit}</div>
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
                      <Check className="h-3.5 w-3.5" /> Gebot CHF {done}
                    </span>
                  ) : (
                    <button type="button" onClick={() => { setOpenForm(openForm === t.id ? null : t.id); setDraft(""); }} className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
                      Gebot abgeben
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {openForm === t.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5">
                          <span className="text-[11px] text-slate-400">CHF</span>
                          <input value={draft} onChange={(e) => setDraft(e.target.value)} type="number" placeholder={`Preis/${t.unit}`} className="w-28 bg-transparent text-sm text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        <button type="button" onClick={() => submit(t.id)} disabled={!draft} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                          Sealed-Bid einreichen
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Own bids */}
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Eigene Gebote</h3>
        <ul className="mt-3 divide-y divide-slate-100">
          {OWN_BIDS.map((b) => (
            <li key={b.material} className="flex items-center justify-between py-2.5 text-[13px]">
              <span className="font-medium text-slate-800">{b.material}</span>
              <span className="tabular-nums text-slate-600">CHF {b.price}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", b.status === "Gewonnen" ? "bg-emerald/10 text-emerald" : b.status === "Verloren" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500")}>
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tabs                                                                      */
/* -------------------------------------------------------------------------- */

const TABS = [
  { key: "buyer", label: "Bauunternehmer", icon: Building2 },
  { key: "supplier", label: "Baustoffwerk", icon: Factory },
];

export default function DashboardTabs() {
  const [active, setActive] = useState("buyer");

  return (
    <div>
      <div role="tablist" className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-card">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active === t.key ? "bg-brand text-white shadow-sm shadow-brand/30" : "text-slate-500 hover:text-slate-900",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {active === "buyer" ? <BuyerCockpit /> : <SupplierCockpit />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
