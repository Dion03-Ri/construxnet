"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from "recharts";
import {
  LayoutDashboard,
  ShoppingCart,
  Gavel,
  FileText,
  BarChart3,
  Settings,
  Search,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Link2,
  Clock,
  Check,
  ChevronRight,
  Lock,
  Building2,
  UploadCloud,
  Trash2,
  Plus,
  Minus,
  Calculator,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { PROC_MATERIALS, PROC_CATEGORIES, tierForVolume, type ProcMaterial, type ProcCategory } from "@/data/procurement";
import kbobData from "@/data/kbobData.json";

const C = {
  brand: "#D99000",
  accent: "#254D7A",
  navy: "#1B3A5C",
  slate: "#94A3B8",
  slateLight: "#E2E8F0",
};

function chf(v: number, d = 0) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

/* -------------------------------------------------------------------------- */
/*  Daten                                                                     */
/* -------------------------------------------------------------------------- */

type Kpi = { label: string; value: string; delta: number };

const KPIS: Record<"buyer" | "supplier", Kpi[]> = {
  buyer: [
    { label: "Beschaffungsvolumen (12 Mt.)", value: "CHF 4.2 Mio.", delta: 12.4 },
    { label: "Bestellungen (12 Mt.)", value: "1'847", delta: 8.1 },
    { label: "Ø Ersparnis (Pools)", value: "13.8 %", delta: 2.3 },
    { label: "Offene Ausschreibungen", value: "7", delta: -1.2 },
  ],
  supplier: [
    { label: "Zugesprochenes Volumen (12 Mt.)", value: "CHF 3.7 Mio.", delta: 9.6 },
    { label: "Gewonnene Zuschläge (12 Mt.)", value: "24", delta: 6.4 },
    { label: "Aktive Gebote", value: "12", delta: 4.1 },
    { label: "Plattform-Gebühr (Jahr)", value: "CHF 82'400", delta: -0.8 },
  ],
};

// Monatlich (nicht wöchentlich) — realistische Bestellfrequenz.
const MONTH_VOL = [
  { m: "Jan", v: 280 }, { m: "Feb", v: 340 }, { m: "Mär", v: 310 }, { m: "Apr", v: 420 },
  { m: "Mai", v: 390 }, { m: "Jun", v: 460 }, { m: "Jul", v: 430 }, { m: "Aug", v: 510 },
  { m: "Sep", v: 480 }, { m: "Okt", v: 540 }, { m: "Nov", v: 500 }, { m: "Dez", v: 360 },
]; // Tausend CHF

const REV_COST = [
  { m: "Q1", umsatz: 1.02, kosten: 0.74 },
  { m: "Q2", umsatz: 1.18, kosten: 0.80 },
  { m: "Q3", umsatz: 1.24, kosten: 0.83 },
  { m: "Q4", umsatz: 1.36, kosten: 0.86 },
];

const PLANNED = [
  { name: "Beton C25/30", amount: 220_000, pct: 74, color: C.brand },
  { name: "Armierungsstahl B500B", amount: 180_000, pct: 67, color: C.accent },
  { name: "Koffer-/Wandkies", amount: 96_000, pct: 70, color: C.navy },
  { name: "Transport / Diesel", amount: 62_000, pct: 52, color: C.slate },
];

const DONUT = [
  { name: "Beton", value: 40, color: C.brand },
  { name: "Armierungsstahl", value: 34, color: C.accent },
  { name: "Kies", value: 18, color: C.navy },
  { name: "Transport", value: 8, color: C.slate },
];

const ORDERS = [
  { id: "#1543", material: "Beton C25/30", amount: "CHF 145'200", date: "12. Feb", status: "In Arbeit" },
  { id: "#1521", material: "Armierungsstahl", amount: "CHF 75'300", date: "3. Feb", status: "In Arbeit" },
  { id: "#1498", material: "Koffer-/Wandkies", amount: "CHF 23'900", date: "24. Jan", status: "Abgeschlossen" },
  { id: "#1466", material: "Transportbeton", amount: "CHF 61'100", date: "9. Jan", status: "Abgeschlossen" },
];

const CONTRACTS = [
  { no: "CNX-2026-0142", material: "Beton C25/30", vol: "180 m³", price: "145.20", status: "Aktiv" },
  { no: "CNX-2026-0119", material: "Koffer-/Wandkies 0/45", vol: "300 t", price: "33.15", status: "Abgeschlossen" },
  { no: "CNX-2026-0098", material: "Bewehrungsstahl B500B", vol: "42 t", price: "1'108.00", status: "Aktiv" },
];

const POOLS = [
  { material: "Beton C25/30", region: "Zürich", vol: 230, target: 300, tier: 2, disc: 12, deadline: "4 Tage", coupled: "Stahl B500B", unit: "m³" },
  { material: "Bewehrungsstahl B500B", region: "Bern", vol: 48, target: 60, tier: 2, disc: 12, deadline: "9 Tage", coupled: null, unit: "t" },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", vol: 320, target: 301, tier: 3, disc: 20, deadline: "2 Tage", coupled: null, unit: "t" },
];

const NAV_ALL = [
  { key: "workspace", label: "Beschaffung", icon: Search },
  { key: "overview", label: "Übersicht", icon: LayoutDashboard },
  { key: "orders", label: "Bestellungen", icon: ShoppingCart, badge: 7 },
  { key: "tenders", label: "Ausschreibungen", icon: Gavel, badge: 3, supplierOnly: true },
  { key: "contracts", label: "SIA-118 Verträge", icon: FileText },
  { key: "reports", label: "Berichte", icon: BarChart3 },
  { key: "settings", label: "Einstellungen", icon: Settings },
];

// Baustellen-Auswahl (Workspace-Kontext) — vorerst lokal, noch nicht an eine
// eigene Projekt-Tabelle angebunden.
const PROJECTS = [
  { id: "p1", name: "Neubau MFH Zürich-West", city: "Zürich" },
  { id: "p2", name: "Sanierung EFH Bächli", city: "Bern" },
  { id: "p3", name: "Gewerbebau Halle 4", city: "Aarau" },
];

type CartItem = { key: string; label: string; unit: string; kbobPrice: number; qty: number };

/* -------------------------------------------------------------------------- */
/*  Kleinteile                                                                */
/* -------------------------------------------------------------------------- */

function KpiCard({ k }: { k: Kpi }) {
  const up = k.delta >= 0;
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="text-[13px] font-medium text-slate-500">{k.label}</div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{k.value}</div>
        <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", up ? "text-accent" : "text-rose-500")}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(k.delta)}%
        </span>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">ggü. Vorjahr</div>
    </div>
  );
}

function PoolRow({ p }: { p: (typeof POOLS)[number] }) {
  const pct = Math.min(100, Math.round((p.vol / p.target) * 100));
  return (
    <Link href="/pools" className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{p.material}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{p.region}</span>
          {p.coupled && (
            <span className={badge("navy", true)}>
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
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <span className={badge("gold", true)}>Tier {p.tier} · {p.disc}%</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>{chf(p.vol)} / {chf(p.target)} {p.unit}</span>
        <span className="font-medium text-brand">Pool öffnen →</span>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panels                                                                    */
/* -------------------------------------------------------------------------- */

function OverviewPanel({ role }: { role: "buyer" | "supplier" }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/[0.06] px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <p className="text-[13px] text-slate-700">
          <b>3 aktive Hinweise</b> · 2 Pools erreichen bald die Deadline, 1 Ausschreibung schliesst in 2 Tagen.
        </p>
        <Link href="/pools" className="ml-auto hidden shrink-0 items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-600 sm:inline-flex">
          Ansehen <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {KPIS[role].map((k) => (
          <KpiCard key={k.label} k={k} />
        ))}
      </div>

      <div className={cn(CARD, "p-5")}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900">Aktive Pool-Teilnahmen</h3>
          <Link href="/pools" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-600">
            Alle Bündel <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {POOLS.map((p) => <PoolRow key={p.material} p={p} />)}
        </div>
      </div>

      <OrdersPanel />
    </div>
  );
}

function OrdersPanel() {
  return (
    <div className={cn(CARD, "p-5")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">Letzte Bestellungen</h3>
        <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500">letzte 60 Tage</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-2 font-medium">ID</th>
              <th className="pb-2 font-medium">Material</th>
              <th className="pb-2 font-medium">Betrag</th>
              <th className="hidden pb-2 font-medium sm:table-cell">Datum</th>
              <th className="pb-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ORDERS.map((o) => (
              <tr key={o.id}>
                <td className="py-2.5 font-semibold text-slate-800">{o.id}</td>
                <td className="py-2.5 text-slate-600">{o.material}</td>
                <td className="py-2.5 tabular-nums text-slate-700">{o.amount}</td>
                <td className="hidden py-2.5 text-slate-500 sm:table-cell">{o.date}</td>
                <td className="py-2.5 text-right">
                  <span className={badge(o.status === "Abgeschlossen" ? "accent" : "gold", true)}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RevCostTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-cardhover">
      <div className="mb-1 font-semibold text-slate-900">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name === "umsatz" ? "Umsatz" : "Kosten"}: <b className="text-slate-900">CHF {p.value} Mio.</b>
        </div>
      ))}
    </div>
  );
}

function ReportsPanel() {
  const totalRev = REV_COST.reduce((s, r) => s + r.umsatz, 0);
  const totalCost = REV_COST.reduce((s, r) => s + r.kosten, 0);
  const margin = (((totalRev - totalCost) / totalRev) * 100).toFixed(1);
  return (
    <div className="space-y-4">
      {/* Monatliches Beschaffungsvolumen */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-slate-500">Beschaffungsvolumen · letzte 12 Monate</div>
            <div className="text-2xl font-bold text-slate-900">CHF 4.20 Mio.</div>
          </div>
          <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500">12 Monate</span>
        </div>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTH_VOL} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.slateLight} strokeDasharray="3 3" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
              <YAxis tickFormatter={(v) => `${v}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
              <Tooltip cursor={{ fill: "rgba(217,144,0,0.06)" }} formatter={(v: number) => [`CHF ${chf(v * 1000)}`, "Volumen"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={C.brand} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Umsatz vs Kosten */}
        <div className={cn(CARD, "p-5")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-slate-900">Umsatz vs. Kosten (2026)</h3>
            <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
              <ArrowUpRight className="h-3.5 w-3.5" /> {margin}% Marge
            </span>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REV_COST} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barGap={4}>
                <CartesianGrid vertical={false} stroke={C.slateLight} strokeDasharray="3 3" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
                <YAxis tickFormatter={(v) => `${v}M`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
                <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={<RevCostTooltip />} />
                <Bar dataKey="umsatz" radius={[4, 4, 0, 0]} fill={C.brand} maxBarSize={26} />
                <Bar dataKey="kosten" radius={[4, 4, 0, 0]} fill={C.slateLight} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ausgaben-Verteilung */}
        <div className={cn(CARD, "p-5")}>
          <div className="text-[15px] font-semibold text-slate-900">Ausgaben nach Kategorie</div>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DONUT} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={3} stroke="none">
                    {DONUT.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900">40%</div>
                  <div className="text-[10px] text-slate-400">Beton</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-2">
              {DONUT.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} /> {d.name}
                  </span>
                  <span className="font-semibold text-slate-900">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Geplante Ausgaben */}
      <div className={cn(CARD, "p-5")}>
        <div className="text-[15px] font-semibold text-slate-900">Geplante Ausgaben (Quartal)</div>
        <div className="mt-4 space-y-4">
          {PLANNED.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-slate-700">{p.name}</span>
                <span className="text-slate-400">CHF {chf(p.amount)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex flex-1 gap-[3px]">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <span key={i} className="h-3.5 flex-1 rounded-[1px]" style={{ background: i < Math.round((p.pct / 100) * 32) ? p.color : C.slateLight }} />
                  ))}
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-slate-500">{p.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TendersPanel() {
  const [bids, setBids] = useState<Record<string, string>>({});
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const list = [
    { id: "t1", material: "Beton C25/30", region: "Zürich", vol: "230 m³", kbob: 156, unit: "m³" },
    { id: "t2", material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", vol: "320 t", kbob: 39, unit: "t" },
    { id: "t3", material: "Bewehrungsstahl B500B", region: "Bern", vol: "60 t", kbob: 1120, unit: "t" },
  ];
  function submit(id: string) {
    if (!draft) return;
    setBids((b) => ({ ...b, [id]: draft }));
    setOpenForm(null);
    setDraft("");
  }
  return (
    <div className={cn(CARD, "p-5")}>
      <h3 className="text-[15px] font-semibold text-slate-900">Offene Ausschreibungen (Sealed-Bid)</h3>
      <p className="mt-0.5 text-[13px] text-slate-500">Gebündelte Bedarfe, auf die du als Baustoffwerk bieten kannst.</p>
      <div className="mt-4 space-y-3">
        {list.map((t) => {
          const done = bids[t.id];
          return (
            <div key={t.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-900">{t.material}</div>
                  <div className="text-[11px] text-slate-500">{t.region} · {t.vol} · KBOB-Ref CHF {chf(t.kbob)}/{t.unit}</div>
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    <Check className="h-3.5 w-3.5" /> Gebot CHF {done}
                  </span>
                ) : (
                  <button type="button" onClick={() => { setOpenForm(openForm === t.id ? null : t.id); setDraft(""); }} className="rounded-md bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
                    Gebot abgeben
                  </button>
                )}
              </div>
              <AnimatePresence>
                {openForm === t.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5">
                        <span className="text-[11px] text-slate-400">CHF</span>
                        <input value={draft} onChange={(e) => setDraft(e.target.value)} type="number" placeholder={`Preis/${t.unit}`} className="w-28 bg-transparent text-sm text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                      <button type="button" onClick={() => submit(t.id)} disabled={!draft} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
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
  );
}

function ContractsPanel() {
  return (
    <div className="space-y-4">
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Aktive Pool-Teilnahmen</h3>
        <div className="mt-4 space-y-3">
          {POOLS.map((p) => <PoolRow key={p.material} p={p} />)}
        </div>
      </div>

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
              {CONTRACTS.map((c) => (
                <tr key={c.no}>
                  <td className="py-2.5 font-medium text-slate-800">{c.no}</td>
                  <td className="py-2.5 text-slate-600">{c.material}</td>
                  <td className="hidden py-2.5 text-slate-500 sm:table-cell">{c.vol}</td>
                  <td className="py-2.5 tabular-nums text-slate-600">{c.price}</td>
                  <td className="py-2.5 text-right">
                    <span className={badge(c.status === "Aktiv" ? "accent" : "slate", true)}>{c.status}</span>
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
/*  Beschaffungs-Workspace: KI-Suche, PDF-Dropzone, Material-Tabelle          */
/* -------------------------------------------------------------------------- */

function WorkspacePanel({ onAdd }: { onAdd: (m: ProcMaterial) => void }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"ALL" | ProcCategory>("ALL");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROC_MATERIALS.filter((m) => {
      if (cat !== "ALL" && m.category !== cat) return false;
      if (!q) return true;
      return (
        m.label.toLowerCase().includes(q) ||
        m.sia.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (f) setFileName(f.name);
  }

  return (
    <div className="space-y-4">
      {/* Suche + Ausschreibung hochladen */}
      <div className={cn(CARD, "p-4")}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Material, SIA-Norm oder Bedarf beschreiben …"
              className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as "ALL" | ProcCategory)}
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand"
          >
            <option value="ALL">Alle Kategorien</option>
            {PROC_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className={cn(
            "mt-3 flex cursor-pointer items-center justify-center gap-2.5 rounded-md border border-dashed px-4 py-4 text-center text-[13px] transition-colors",
            dragOver ? "border-brand bg-brand/5 text-brand" : "border-slate-300 text-slate-500 hover:border-brand/40 hover:text-brand",
          )}
        >
          <UploadCloud className="h-4 w-4 shrink-0" />
          {fileName ? (
            <span className="flex items-center gap-2 truncate font-medium text-slate-700">
              {fileName}
              <button type="button" onClick={(e) => { e.preventDefault(); setFileName(null); }} className="text-slate-400 hover:text-rose-500">
                ✕
              </button>
            </span>
          ) : (
            <span>Leistungsverzeichnis / Ausschreibung als PDF hierher ziehen oder klicken</span>
          )}
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>

      {/* Material-Tabelle */}
      <div className={cn(CARD, "overflow-hidden p-0")}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-[15px] font-semibold text-slate-900">Material-Katalog</h3>
          <span className="text-[11px] text-slate-400">{results.length} von {PROC_MATERIALS.length}</span>
        </div>
        <div className="max-h-[440px] overflow-y-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-white">
              <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-4 pb-2 pt-3 font-medium">Material</th>
                <th className="hidden px-2 pb-2 pt-3 font-medium sm:table-cell">Spezifikation</th>
                <th className="px-2 pb-2 pt-3 font-medium">KBOB CHF/Einheit</th>
                <th className="px-4 pb-2 pt-3 text-right font-medium">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((m) => (
                <tr key={m.key}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800">{m.label}</div>
                    <div className="text-[11px] text-slate-400">{m.category}</div>
                  </td>
                  <td className="hidden px-2 py-2.5 text-[12px] text-slate-500 sm:table-cell">{m.sia}</td>
                  <td className="px-2 py-2.5 tabular-nums text-slate-700">{chf(m.kbobPrice, m.kbobPrice % 1 ? 2 : 0)} / {m.unit}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onAdd(m)}
                      className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
                    >
                      <Plus className="h-3.5 w-3.5" /> Warenkorb
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Keine Treffer.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rechte Spalte: Warenkorb, Kostenübersicht, Quick Tools                    */
/* -------------------------------------------------------------------------- */

function CartPanel({
  cart,
  onQty,
  onRemove,
}: {
  cart: CartItem[];
  onQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}) {
  const subtotal = cart.reduce((s, c) => s + c.qty * c.kbobPrice, 0);
  const savings = cart.reduce((s, c) => s + c.qty * c.kbobPrice * (tierForVolume(c.qty).discount / 100), 0);

  return (
    <div className={cn(CARD, "p-4")}>
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Warenkorb</h3>
        {cart.length > 0 && <span className={badge("gold", true)}>{cart.length}</span>}
      </div>

      {cart.length === 0 ? (
        <p className="mt-3 text-[13px] text-slate-400">Noch keine Materialien gewählt.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {cart.map((c) => (
            <div key={c.key} className="rounded-md border border-slate-200 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium leading-tight text-slate-800">{c.label}</span>
                <button type="button" onClick={() => onRemove(c.key)} className="shrink-0 text-slate-300 hover:text-rose-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-1">
                  <button type="button" onClick={() => onQty(c.key, Math.max(1, c.qty - 1))} className="text-slate-400 hover:text-slate-700">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-12 text-center text-[12px] tabular-nums text-slate-700">{c.qty} {c.unit}</span>
                  <button type="button" onClick={() => onQty(c.key, c.qty + 1)} className="text-slate-400 hover:text-slate-700">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-[12px] font-semibold tabular-nums text-slate-700">CHF {chf(c.qty * c.kbobPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-[13px] text-slate-500">
          <span>Zwischensumme (KBOB)</span>
          <span className="font-medium text-slate-800">CHF {chf(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px] text-accent">
          <span>Geschätzter Mindestvorteil</span>
          <span className="font-semibold">− CHF {chf(savings)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-sm">
          <span className="font-semibold text-slate-900">Zielpreis (indikativ)</span>
          <span className="font-bold text-slate-900">CHF {chf(subtotal - savings)}</span>
        </div>
      </div>

      {cart.length > 0 ? (
        <Link
          href="/beschaffung"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Bedarf einreichen
        </Link>
      ) : (
        <span className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
          Bedarf einreichen
        </span>
      )}
    </div>
  );
}

type KbobMaterials = Record<
  string,
  { label: string; unit: string; regions: Record<string, { period: string; kbob: number }[]> }
>;

function QuickToolsPanel() {
  const [area, setArea] = useState("");
  const [waste, setWaste] = useState("8");
  const areaNum = parseFloat(area.replace(",", "."));
  const wasteNum = parseFloat(waste.replace(",", "."));
  const result = Number.isFinite(areaNum) && Number.isFinite(wasteNum) ? areaNum * (1 + wasteNum / 100) : null;

  const materials = (kbobData as { materials: KbobMaterials }).materials;
  const beton = materials["beton"];
  const points = beton?.regions?.["zuerich"] ?? [];
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const delta = last && prev ? ((last.kbob - prev.kbob) / prev.kbob) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className={cn(CARD, "p-4")}>
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-slate-500">
          <Calculator className="h-3.5 w-3.5" /> Mengen-/Verschnittrechner
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-slate-400">Menge / Fläche</label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              type="text"
              inputMode="decimal"
              placeholder="0"
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Verschnitt %</label>
            <input
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              type="text"
              inputMode="decimal"
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-[13px]">
          <span className="text-slate-500">Bestellmenge</span>
          <span className="font-semibold text-slate-900">
            {result !== null ? result.toLocaleString("de-CH", { maximumFractionDigits: 2 }) : "–"}
          </span>
        </div>
      </div>

      <div className={cn(CARD, "p-4")}>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-slate-500">
            <Coins className="h-3.5 w-3.5" /> KBOB-Index
          </h3>
          <Link href="/kbob" className="text-[11px] font-semibold text-brand hover:underline">Details →</Link>
        </div>
        {last ? (
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-[11px] text-slate-400">{beton.label} · Zürich</div>
              <div className="text-xl font-bold tabular-nums text-slate-900">CHF {chf(last.kbob, 2)}</div>
            </div>
            <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-semibold", delta >= 0 ? "text-accent" : "text-rose-500")}>
              {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-slate-400">Keine Daten.</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shell                                                                     */
/* -------------------------------------------------------------------------- */

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function DashboardShell({ company }: { company: Company }) {
  const isSupplier = company.role === "SUPPLIER";
  const role: "buyer" | "supplier" = isSupplier ? "supplier" : "buyer";

  const nav = NAV_ALL.filter((n) => !n.supplierOnly || isSupplier);
  const [view, setView] = useState("workspace");
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const title = nav.find((n) => n.key === view)?.label ?? "Beschaffung";

  function addToCart(m: ProcMaterial) {
    setCart((prev) => {
      const existing = prev.find((c) => c.key === m.key);
      if (existing) return prev.map((c) => (c.key === m.key ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { key: m.key, label: m.label, unit: m.unit, kbobPrice: m.kbobPrice, qty: 1 }];
    });
  }
  function updateQty(key: string, qty: number) {
    setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty } : c)));
  }
  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      {/* Linke Spalte: Navigation & Projekt-Auswahl */}
      <aside className={cn(CARD, "h-fit overflow-hidden")}>
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-3 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-brand to-brand-600 text-sm font-bold text-white">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(company.company_name)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-slate-900">{company.company_name}</div>
            <div className="truncate text-[11px] text-slate-400">{isSupplier ? "Baustoffwerk / Lieferant" : "Bauunternehmen"}</div>
          </div>
        </div>

        {!isSupplier && (
          <div className="border-b border-slate-200 px-3 py-3">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Building2 className="h-3 w-3" /> Baustelle / Projekt
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-[13px] text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.city}</option>
              ))}
            </select>
          </div>
        )}

        <nav className="px-2 py-3">
          {nav.map((n) => {
            const active = view === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setView(n.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge && (
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", active ? "bg-brand text-white" : "bg-rose-100 text-rose-600")}>
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!isSupplier && (
          <div className="border-t border-slate-200 px-3 py-3">
            <div className="flex items-start gap-2 rounded-md bg-slate-100 p-2.5 text-[11px] text-slate-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Als Bauunternehmen beschaffst du. Gebote auf Ausschreibungen sind Baustoffwerken vorbehalten.</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mittlere Spalte: Arbeitsbereich */}
      <div className={cn(CARD, "min-w-0 overflow-hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          <div className="flex items-center gap-2">
            <Link href="/kbob" className="hidden items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:border-brand/40 hover:text-brand sm:inline-flex">
              <Coins className="h-3.5 w-3.5 text-accent" /> KBOB-Index
            </Link>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {view === "workspace" && <WorkspacePanel onAdd={addToCart} />}
              {view === "overview" && <OverviewPanel role={role} />}
              {view === "orders" && <OrdersPanel />}
              {view === "tenders" && isSupplier && <TendersPanel />}
              {view === "contracts" && <ContractsPanel />}
              {view === "reports" && <ReportsPanel />}
              {view === "settings" && (
                <div className={cn(CARD, "p-6 text-sm text-slate-500")}>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Settings className="h-4 w-4" /> Einstellungen
                  </div>
                  <p className="mt-2">
                    Firmenprofil, Kontaktdaten und Benachrichtigungen verwaltest du über dein{" "}
                    <Link href={`/company/${company.id}`} className="font-medium text-brand hover:underline">Firmenprofil</Link>.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Rechte Spalte: Warenkorb, Kosten & Quick Tools */}
      <aside className="space-y-4">
        <CartPanel cart={cart} onQty={updateQty} onRemove={removeFromCart} />
        <QuickToolsPanel />
      </aside>
    </div>
  );
}
