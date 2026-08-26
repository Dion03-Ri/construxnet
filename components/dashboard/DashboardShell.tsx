"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  ChevronsUpDown,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Factory,
  Sparkles,
  Coins,
  Link2,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const C = {
  brand: "#D99000",
  emerald: "#10B981",
  accent: "#1B3A5C",
  slate: "#94A3B8",
  slateLight: "#E2E8F0",
};

function chf(v: number, d = 0) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

/* -------------------------------------------------------------------------- */
/*  Daten                                                                     */
/* -------------------------------------------------------------------------- */

type Kpi = {
  label: string;
  value: string;
  delta: number;
  series: number[];
  color: string;
};

const KPIS: Record<"buyer" | "supplier", Kpi[]> = {
  buyer: [
    { label: "Beschaffungsvolumen", value: "CHF 4.2 Mio.", delta: 12.4, series: [18, 22, 20, 26, 24, 30, 34], color: C.brand },
    { label: "Aktive Bestellungen", value: "1'847", delta: 8.1, series: [12, 14, 13, 16, 18, 17, 21], color: C.accent },
    { label: "Ø Ersparnis (Pools)", value: "13.8 %", delta: 2.3, series: [9, 10, 11, 10, 12, 13, 14], color: C.emerald },
    { label: "Offene Ausschreibungen", value: "7", delta: -1.2, series: [10, 9, 11, 8, 9, 7, 7], color: C.slate },
  ],
  supplier: [
    { label: "Zugesprochenes Volumen", value: "CHF 3.7 Mio.", delta: 9.6, series: [14, 16, 15, 19, 22, 24, 27], color: C.brand },
    { label: "Gewonnene Zuschläge", value: "24", delta: 6.4, series: [8, 9, 11, 10, 12, 13, 15], color: C.emerald },
    { label: "Aktive Gebote", value: "12", delta: 4.1, series: [6, 7, 6, 8, 9, 10, 12], color: C.accent },
    { label: "Plattform-Gebühr", value: "CHF 8'420", delta: -0.8, series: [9, 8, 9, 8, 8, 8, 8], color: C.slate },
  ],
};

const WEEK_BARS = [
  { d: "Mo", v: 18000 },
  { d: "Di", v: 24000 },
  { d: "Mi", v: 15000 },
  { d: "Do", v: 29000 },
  { d: "Fr", v: 21000 },
  { d: "Sa", v: 26000 },
  { d: "So", v: 12000 },
];

const PLANNED = [
  { name: "Beton C25/30", amount: 220_000, pct: 74, color: C.brand },
  { name: "Armierungsstahl B500B", amount: 180_000, pct: 67, color: C.accent },
  { name: "Koffer-/Wandkies", amount: 96_000, pct: 70, color: C.emerald },
  { name: "Transport / Diesel", amount: 62_000, pct: 52, color: C.slate },
];

const DONUT = [
  { name: "Beton", value: 40, color: C.brand },
  { name: "Armierungsstahl", value: 34, color: C.accent },
  { name: "Kies", value: 18, color: C.emerald },
  { name: "Transport", value: 8, color: C.slate },
];

const DELIVERABLES = [
  { label: "Anfragen", v: 34, color: C.slate },
  { label: "Angebote", v: 46, color: C.accent },
  { label: "Bestellungen", v: 38, color: C.brand },
];

const REV_COST = [
  { m: "Jan", umsatz: 3.2, kosten: 2.3 },
  { m: "Feb", umsatz: 3.6, kosten: 2.5 },
  { m: "Mär", umsatz: 4.0, kosten: 2.6 },
  { m: "Apr", umsatz: 3.5, kosten: 2.6 },
  { m: "Mai", umsatz: 3.6, kosten: 2.4 },
  { m: "Jun", umsatz: 4.3, kosten: 2.8 },
  { m: "Jul", umsatz: 3.9, kosten: 2.6 },
  { m: "Aug", umsatz: 4.1, kosten: 2.7 },
];

const ORDERS = [
  { id: "#1543", material: "Beton C25/30", amount: "CHF 145'200", date: "12. Feb · 13:40", status: "In Arbeit" },
  { id: "#1576", material: "Armierungsstahl", amount: "CHF 75'300", date: "12. Feb · 18:32", status: "In Arbeit" },
  { id: "#1553", material: "Koffer-/Wandkies", amount: "CHF 23'900", date: "11. Feb · 09:24", status: "Abgeschlossen" },
  { id: "#1548", material: "Transportbeton", amount: "CHF 61'100", date: "10. Feb · 16:05", status: "Abgeschlossen" },
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

const NAV = [
  { key: "overview", label: "Übersicht", icon: LayoutDashboard },
  { key: "orders", label: "Bestellungen", icon: ShoppingCart, badge: 7 },
  { key: "tenders", label: "Ausschreibungen", icon: Gavel, badge: 3 },
  { key: "contracts", label: "SIA-118 Verträge", icon: FileText },
  { key: "reports", label: "Berichte", icon: BarChart3 },
  { key: "settings", label: "Einstellungen", icon: Settings },
];

/* -------------------------------------------------------------------------- */
/*  Kleinteile                                                                */
/* -------------------------------------------------------------------------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={38}>
      <LineChart data={d} margin={{ top: 4, bottom: 2, left: 0, right: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KpiCard({ k }: { k: Kpi }) {
  const up = k.delta >= 0;
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="text-[13px] font-medium text-slate-500">{k.label}</div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{k.value}</div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-semibold",
            up ? "text-emerald" : "text-rose-500",
          )}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(k.delta)}%
        </span>
      </div>
      <div className="mt-2 -mx-1">
        <Sparkline data={k.series} color={k.color} />
      </div>
    </div>
  );
}

function RevCostTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-cardhover">
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

/* -------------------------------------------------------------------------- */
/*  Panels                                                                    */
/* -------------------------------------------------------------------------- */

function OverviewPanel({ role }: { role: "buyer" | "supplier" }) {
  const totalRev = REV_COST.reduce((s, r) => s + r.umsatz, 0);
  const totalCost = REV_COST.reduce((s, r) => s + r.kosten, 0);
  const margin = (((totalRev - totalCost) / totalRev) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Alert-Banner (Bild 3) */}
      <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/[0.06] px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <p className="text-[13px] text-slate-700">
          <b>3 aktive Hinweise</b> erfordern deine Aufmerksamkeit · 2 Pools erreichen bald die Deadline,
          1 Ausschreibung schliesst in 2 Tagen.
        </p>
        <Link href="/pools" className="ml-auto hidden shrink-0 items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-600 sm:inline-flex">
          Ansehen <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI-Reihe */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {KPIS[role].map((k) => (
          <KpiCard key={k.label} k={k} />
        ))}
      </div>

      {/* Reihe: Wochen-Balken + Geplante Ausgaben */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className={cn(CARD, "p-5")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-slate-500">
                {role === "buyer" ? "Beschaffungsvolumen" : "Auftragsvolumen"} · diese Woche
              </div>
              <div className="text-2xl font-bold text-slate-900">CHF {chf(145_000)}</div>
            </div>
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500">Diese Woche</span>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK_BARS} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.slateLight} strokeDasharray="3 3" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
                <Tooltip
                  cursor={{ fill: "rgba(249,115,22,0.06)" }}
                  formatter={(v: number) => [`CHF ${chf(v)}`, "Volumen"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} fill={C.brand} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(CARD, "p-5")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-slate-500">Geplante Ausgaben</div>
              <div className="text-2xl font-bold text-slate-900">CHF {chf(558_000)}</div>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {PLANNED.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="text-slate-400">CHF {chf(p.amount)}</span>
                </div>
                {/* Tick-Bar wie Bild 2 */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex flex-1 gap-[3px]">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-3.5 flex-1 rounded-[1px]"
                        style={{
                          background: i < Math.round((p.pct / 100) * 32) ? p.color : C.slateLight,
                        }}
                      />
                    ))}
                  </div>
                  <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-slate-500">{p.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reihe: Donut + Deliverables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={cn(CARD, "p-5")}>
          <div className="text-[13px] text-slate-500">Ausgaben-Verteilung</div>
          <div className="text-2xl font-bold text-slate-900">CHF {chf(558_000)}</div>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DONUT} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={3} stroke="none">
                    {DONUT.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">40%</div>
                  <div className="text-[10px] text-slate-400">Beton</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-2">
              {DONUT.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-semibold text-slate-900">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={cn(CARD, "p-5")}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-slate-500">Vorgänge diese Woche</div>
            <span className="text-2xl font-bold text-slate-900">118</span>
          </div>
          <div className="mt-5 space-y-4">
            {DELIVERABLES.map((d) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="text-slate-600">{d.label}</span>
                  <span className="font-semibold text-slate-900">{d.v}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(d.v / 50) * 100}%`, background: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue vs Cost (Bild 3) */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-slate-900">Umsatz vs. Kosten (2026)</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald">
            <ArrowUpRight className="h-3.5 w-3.5" /> {margin}% Marge
          </span>
        </div>
        <div className="mt-1.5 flex gap-6 text-[13px]">
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.brand }} /> Umsatz
            <b className="text-slate-900">CHF {totalRev.toFixed(1)} Mio.</b>
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.slateLight }} /> Kosten
            <b className="text-slate-900">CHF {totalCost.toFixed(1)} Mio.</b>
          </span>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REV_COST} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke={C.slateLight} strokeDasharray="3 3" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
              <YAxis tickFormatter={(v) => `${v}M`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={<RevCostTooltip />} />
              <Bar dataKey="umsatz" radius={[5, 5, 0, 0]} fill={C.brand} maxBarSize={22} />
              <Bar dataKey="kosten" radius={[5, 5, 0, 0]} fill={C.slateLight} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders + Promo (Bild 2) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <OrdersPanel compact />
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-navy-900 via-navy-800 to-navy p-6 text-white shadow-cardhover">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-emerald/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> ConstruxNet KI
            </span>
            <h3 className="mt-3 text-xl font-bold leading-tight">
              Automatisiere deine Beschaffung mit Smart Pools
            </h3>
            <p className="mt-1.5 text-[13px] text-white/70">
              Bündle Bedarf automatisch nach Region & KBOB-Referenz und sichere dir Tier-Rabatte bis 20 %.
            </p>
            <Link
              href="/pools"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition-transform hover:scale-[1.02]"
            >
              Jetzt bündeln <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({ compact }: { compact?: boolean }) {
  return (
    <div className={cn(CARD, "p-5")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">Bestellungen</h3>
        <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500">Diese Woche</span>
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
            {(compact ? ORDERS.slice(0, 4) : ORDERS).map((o) => (
              <tr key={o.id}>
                <td className="py-2.5 font-semibold text-slate-800">{o.id}</td>
                <td className="py-2.5 text-slate-600">{o.material}</td>
                <td className="py-2.5 tabular-nums text-slate-700">{o.amount}</td>
                <td className="hidden py-2.5 text-slate-500 sm:table-cell">{o.date}</td>
                <td className="py-2.5 text-right">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      o.status === "Abgeschlossen" ? "bg-emerald/10 text-emerald" : "bg-brand/10 text-brand",
                    )}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  );
}

function ContractsPanel() {
  return (
    <div className="space-y-4">
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Aktive Pool-Teilnahmen</h3>
        <div className="mt-4 space-y-4">
          {POOLS.map((p) => {
            const pct = Math.min(100, Math.round((p.vol / p.target) * 100));
            return (
              <div key={p.material} className="rounded-lg border border-slate-200 p-4">
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
                  <span>{chf(p.vol)} / {chf(p.target)} {p.unit}</span>
                  <Link href="/pools" className="font-medium text-brand hover:text-brand-600">Pool öffnen →</Link>
                </div>
              </div>
            );
          })}
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
/*  Shell                                                                     */
/* -------------------------------------------------------------------------- */

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function DashboardShell({ company }: { company: Company }) {
  const [view, setView] = useState("overview");
  const [role, setRole] = useState<"buyer" | "supplier">(
    company.role === "SUPPLIER" ? "supplier" : "buyer",
  );

  const title =
    NAV.find((n) => n.key === view)?.label ?? "Übersicht";

  return (
    <div className={cn(CARD, "grid grid-cols-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]")}>
      {/* Sidebar */}
      <aside className="border-b border-slate-200 bg-slate-50/60 lg:border-b-0 lg:border-r">
        {/* Workspace-Header */}
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
            <div className="truncate text-[11px] text-slate-400">
              {role === "buyer" ? "Bauunternehmen" : "Baustoffwerk"}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </div>

        {/* Suche */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Suchen …"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 pb-3">
          {NAV.map((n) => {
            const active = view === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setView(n.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", active ? "bg-brand text-white" : "bg-rose-100 text-rose-600")}>
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rollen-Umschalter */}
        <div className="border-t border-slate-200 px-3 py-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ansicht</div>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                role === "buyer" ? "bg-brand text-white" : "text-slate-500 hover:text-slate-900",
              )}
            >
              <Building2 className="h-3.5 w-3.5" /> Bau
            </button>
            <button
              type="button"
              onClick={() => setRole("supplier")}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                role === "supplier" ? "bg-brand text-white" : "text-slate-500 hover:text-slate-900",
              )}
            >
              <Factory className="h-3.5 w-3.5" /> Werk
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 bg-slate-50/30">
        {/* Topbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 sm:inline-flex">
              <Coins className="h-3.5 w-3.5 text-emerald" /> KBOB-Index aktuell
            </span>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + role}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {view === "overview" && <OverviewPanel role={role} />}
              {view === "orders" && <OrdersPanel />}
              {view === "tenders" && <TendersPanel />}
              {view === "contracts" && <ContractsPanel />}
              {view === "reports" && <OverviewPanel role={role} />}
              {view === "settings" && (
                <div className={cn(CARD, "p-6 text-sm text-slate-500")}>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Settings className="h-4 w-4" /> Einstellungen
                  </div>
                  <p className="mt-2">Firmenprofil, Kontaktdaten und Benachrichtigungen verwaltest du über dein{" "}
                    <Link href={`/company/${company.id}`} className="font-medium text-brand hover:underline">Firmenprofil</Link>.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
