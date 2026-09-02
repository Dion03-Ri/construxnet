"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Info,
  Truck,
  X,
  Building2,
  Handshake,
  Loader2,
  Package,
  UploadCloud,
  Trash2,
  Plus,
  Minus,
  Calculator,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useProjects, projectLabel } from "@/lib/projects";
import ProjectsPanel from "@/components/dashboard/ProjectsPanel";
import RequestsPanel from "@/components/dashboard/RequestsPanel";
import MaterialsPanel from "@/components/dashboard/MaterialsPanel";
import TendersPanel from "@/components/dashboard/TendersPanel";
import { useCustomMaterials } from "@/lib/customMaterials";
import { useBundles, nextStep, deadlineLabel, hoursLeft, type Bundle } from "@/lib/bundles";
import { useDirectRequests, isLive } from "@/lib/directRequests";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { matchesMaterial, PROC_CATEGORIES, tierForVolume, type ProcMaterial, type ProcCategory } from "@/data/procurement";
import kbobData from "@/data/kbobData.json";

/** Feine Raster-Textur der dunklen Panels — identisch zu Feed und Startseite. */
const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

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

/** Ausgaben nach Kategorie — Top 5 plus Sammelposten, Details im Fenster. */
const SPEND_TOP = [
  { name: "Beton", amount: 412_000 },
  { name: "Bewehrungsstahl", amount: 268_000 },
  { name: "Kies & Aushub", amount: 154_000 },
  { name: "Zement & Bindemittel", amount: 96_000 },
  { name: "Dämmung", amount: 61_000 },
];
const SPEND_REST = [
  { name: "Belag & Asphalt", amount: 38_000 },
  { name: "Mauerwerk", amount: 24_000 },
  { name: "Entwässerung & Rohre", amount: 17_000 },
  { name: "Holz", amount: 12_000 },
  { name: "Bauchemie", amount: 7_400 },
];

type Order = {
  id: string;
  /** Obtanet-Materialnummer, z. B. OB-BET-001. */
  materialId: string;
  material: string;
  sia: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  date: string;
  status: string;
  contract: string | null;
};

const ORDERS: Order[] = [
  { id: "OBT-1543", materialId: "OB-BET-001", material: "Beton C25/30", sia: "SN EN 206 · C25/30 · XC3", qty: 1000, unit: "m³", unitPrice: 145.2, amount: 145_200, date: "12.02.2026", status: "In Arbeit", contract: "OBT-2026-0142" },
  { id: "OBT-1521", materialId: "OB-BST-001", material: "Bewehrungsstahl B500B", sia: "SN EN 10080 · B500B", qty: 68, unit: "t", unitPrice: 1107.35, amount: 75_300, date: "03.02.2026", status: "In Arbeit", contract: "OBT-2026-0098" },
  { id: "OBT-1498", materialId: "OB-KAR-001", material: "Koffer-/Wandkies 0/45", sia: "SN 670 119 · 0/45", qty: 721, unit: "t", unitPrice: 33.15, amount: 23_900, date: "24.01.2026", status: "Abgeschlossen", contract: "OBT-2026-0119" },
  { id: "OBT-1466", materialId: "OB-BET-001", material: "Transportbeton C25/30", sia: "SN EN 206 · C25/30", qty: 421, unit: "m³", unitPrice: 145.2, amount: 61_100, date: "09.01.2026", status: "Abgeschlossen", contract: null },
];

const CONTRACTS = [
  { no: "OBT-2026-0142", material: "Beton C25/30", vol: "180 m³", price: "145.20", status: "Aktiv" },
  { no: "OBT-2026-0119", material: "Koffer-/Wandkies 0/45", vol: "300 t", price: "33.15", status: "Abgeschlossen" },
  { no: "OBT-2026-0098", material: "Bewehrungsstahl B500B", vol: "42 t", price: "1'108.00", status: "Aktiv" },
];

const NAV_ALL = [
  { key: "workspace", label: "Beschaffung", icon: Search },
  { key: "overview", label: "Übersicht", icon: LayoutDashboard },
  { key: "projects", label: "Projekte", icon: Building2, buyerOnly: true },
  { key: "requests", label: "Direktanfragen", icon: Handshake },
  { key: "materials", label: "Eigene Materialien", icon: Package },
  { key: "orders", label: "Bestellungen", icon: ShoppingCart, badge: 7 },
  { key: "tenders", label: "Ausschreibungen", icon: Gavel, badge: 3, supplierOnly: true },
  { key: "contracts", label: "SIA-118 Verträge", icon: FileText },
  { key: "reports", label: "Berichte", icon: BarChart3 },
  { key: "settings", label: "Einstellungen", icon: Settings },
];

type CartItem = { key: string; id: string; label: string; unit: string; kbobPrice: number; qty: number };

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

/**
 * Eine eigene Bündel-Teilnahme.
 *
 * Der Balken misst gegen die nächste erreichbare Stufe, nicht gegen ein
 * fernes Endziel — sichtbar ist, was als Nächstes drin liegt.
 */
function PoolRow({ b, myVolume }: { b: Bundle; myVolume: number }) {
  const step = nextStep(b.current_volume);
  const goal = step?.at ?? b.current_volume;
  const pct = Math.min(100, Math.round((b.current_volume / (goal || 1)) * 100));

  return (
    <Link href="/pools" className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-900">{b.material_label ?? b.title}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{b.region}</span>
          {b.status === "SEALED_BIDDING" && (
            <span className={badge("navy", true)}>
              <Gavel className="h-3 w-3" /> Ausschreibung läuft
            </span>
          )}
          {b.status === "AWARDED" && (
            <span className={badge("gold", true)}>
              <Check className="h-3 w-3" /> vergeben
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" /> {deadlineLabel(b.bid_deadline ?? b.deadline)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <span className={badge("gold", true)}>Stufe {b.current_tier} · mind. {b.current_discount_pct}%</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-[11px] text-slate-500">
        <span>
          {chf(b.current_volume)} {b.unit} gesamt · davon deine {chf(myVolume)} {b.unit}
        </span>
        {b.status === "AWARDED" && b.awarded_price != null ? (
          <span className="font-semibold text-brand">
            Zuschlag CHF {chf(b.awarded_price, 2)}/{b.unit}
          </span>
        ) : step ? (
          <span>noch {chf(step.at - b.current_volume)} {b.unit} bis mind. {step.discount}%</span>
        ) : (
          <span>höchste Stufe erreicht</span>
        )}
      </div>
    </Link>
  );
}

/**
 * Die eigenen laufenden Bündel — gemeinsam genutzt von Übersicht und
 * Verträgen, damit beide dieselbe Wahrheit zeigen.
 */
function MyBundles({ limit }: { limit?: number }) {
  const { bundles, mine, loading } = useBundles();
  const volumes = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of mine) m.set(p.bundle_id, Number(p.requested_volume));
    return m;
  }, [mine]);

  const list = bundles.filter((b) => volumes.has(b.id)).slice(0, limit ?? 99);

  if (loading) {
    return (
      <div className="grid place-items-center py-10 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
        <p className="text-[13px] font-semibold text-slate-700">Du bist noch in keinem Bündel</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-slate-500">
          Bündel entstehen aus gemeldetem Bedarf. Meldest du deinen, kommst du
          entweder einem laufenden dazu oder startest ein neues.
        </p>
        <Link
          href="/beschaffung"
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand-500"
        >
          Bedarf melden
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((b) => (
        <PoolRow key={b.id} b={b} myVolume={volumes.get(b.id) ?? 0} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panels                                                                    */
/* -------------------------------------------------------------------------- */

function OverviewPanel({ role }: { role: "buyer" | "supplier" }) {
  const isSupplier = role === "supplier";
  const { bundles, mine } = useBundles();

  // Was heute Aufmerksamkeit braucht — aus echten Daten, keine Platzhalter.
  const myIds = new Set(mine.map((m) => m.bundle_id));
  const myBundles = bundles.filter((b) => myIds.has(b.id));
  const soonClosing = myBundles.filter(
    (b) => b.status === "OPEN" && hoursLeft(b.deadline) < 120,
  );
  const inBidding = myBundles.filter((b) => b.status === "SEALED_BIDDING");
  const awarded = myBundles.filter((b) => b.status === "AWARDED");

  const openTasks = [
    soonClosing.length > 0 && {
      icon: Clock,
      text: `${soonClosing.length} deiner Bündel ${soonClosing.length === 1 ? "schliesst" : "schliessen"} in den nächsten Tagen — jede zusätzliche Menge zählt noch`,
      href: "/pools",
      cta: "Bündel ansehen",
    },
    inBidding.length > 0 && {
      icon: Gavel,
      text: `${inBidding.length} ${inBidding.length === 1 ? "Bündel ist" : "Bündel sind"} in der Ausschreibung — die Werke bieten verdeckt`,
      href: "/pools",
      cta: "Stand ansehen",
    },
    awarded.length > 0 && {
      icon: FileText,
      text: `${awarded.length} ${awarded.length === 1 ? "Bündel wurde" : "Bündel wurden"} vergeben — Vertrag nach SIA-118 liegt bereit`,
      href: "/pools",
      cta: "Ergebnis ansehen",
    },
  ].filter(Boolean) as { icon: typeof Gavel; text: string; href: string; cta: string }[];

  return (
    <div className="space-y-4">
      {/* Offene Punkte */}
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-[15px] font-bold text-slate-900">Das braucht deine Aufmerksamkeit</h3>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Offene Punkte aus Bündeln, Verträgen und Lieferungen.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {openTasks.map((t) => (
            <li key={t.text} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-brand">
                <t.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-[13.5px] text-slate-700">{t.text}</span>
              <Link
                href={t.href}
                className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand"
              >
                {t.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Laufende Bündel — hier kann man noch Menge einbringen */}
      <div className={cn(CARD, "p-5")}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Deine laufenden Bündel</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Solange die Sammelphase läuft, zählt jede zusätzliche Menge.
            </p>
          </div>
          <Link href="/pools" className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-600">
            Alle Bündel <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MyBundles limit={3} />
      </div>

      {isSupplier && (
        <div className={cn(CARD, "flex items-center gap-3 p-5")}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-brand">
            <Gavel className="h-4 w-4" />
          </span>
          <p className="flex-1 text-[13.5px] text-slate-700">
            Offene Ausschreibungen warten auf dein Gebot.
          </p>
          <span className="text-[12.5px] text-slate-400">Reiter „Ausschreibungen"</span>
        </div>
      )}
    </div>
  );
}

/**
 * Erzeugt ein druckfertiges Bestelldokument in einem eigenen Fenster.
 * Der Browser übernimmt das Speichern als PDF — dafür braucht es weder eine
 * zusätzliche Bibliothek noch einen Server.
 */
function printOrder(o: Order, companyName: string) {
  const w = window.open("", "_blank", "width=820,height=1000");
  if (!w) return;

  // Alles, was aus der Datenbank kommt, wird maskiert. Der Firmenname ist
  // vom Nutzer erfasst; ohne Maskierung landet er ungeprüft als HTML im
  // Druckfenster — eine Firma namens "<script>…" würde dort ausgeführt.
  const esc = (v: string) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#64748B">${k}</td><td style="padding:6px 0;text-align:right;font-weight:600">${v}</td></tr>`;
  w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>Bestellung ${esc(o.id)}</title>
<style>
  *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;margin:0;padding:48px}
  h1{font-size:22px;margin:0 0 2px} .sub{color:#64748B;font-size:13px;margin-bottom:28px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0F2238;padding-bottom:16px;margin-bottom:24px}
  .brand{font-size:18px;font-weight:800;letter-spacing:-.02em} .brand span{color:#D99000}
  table{width:100%;border-collapse:collapse;font-size:13px}
  .box{border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-bottom:16px}
  .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8;margin-bottom:10px;font-weight:700}
  .total{border-top:2px solid #0F2238;margin-top:8px;padding-top:10px;font-size:16px;font-weight:800;display:flex;justify-content:space-between}
  .foot{margin-top:32px;font-size:11px;color:#94A3B8;line-height:1.6}
  @media print{body{padding:24px}}
</style></head><body>
<div class="head">
  <div><div class="brand">Obta<span>net</span></div><div class="sub" style="margin:2px 0 0">Schweizer Baubranche</div></div>
  <div style="text-align:right"><h1>Bestellung ${esc(o.id)}</h1><div class="sub" style="margin:0">${esc(o.date)} · ${esc(o.status)}</div></div>
</div>
<div class="box"><div class="lbl">Besteller</div><div style="font-weight:600">${esc(companyName)}</div></div>
<div class="box"><div class="lbl">Position</div><table>
  ${row("Materialnummer", esc(o.materialId))}
  ${row("Material", esc(o.material))}
  ${row("Spezifikation", esc(o.sia))}
  ${row("Menge", `${chf(o.qty)} ${esc(o.unit)}`)}
  ${row("Preis pro Einheit", `CHF ${chf(o.unitPrice, 2)}`)}
</table>
<div class="total"><span>Bestellwert</span><span>CHF ${chf(o.amount)}</span></div></div>
${o.contract ? `<div class="box"><div class="lbl">Vertrag</div><table>${row("SIA-118-Vertrag", esc(o.contract))}</table></div>` : ""}
<div class="foot">
  Erzeugt über Obtanet am ${new Date().toLocaleDateString("de-CH")}.<br>
  Preisbasis ist der KBOB-Referenzpreis; massgebend ist der zugehörige SIA-118-Vertrag.
</div>
</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function OrdersPanel({ companyName }: { companyName: string }) {
  return (
    <div className={cn(CARD, "p-5")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-slate-900">Bestellungen</h3>
        <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500">letzte 60 Tage</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-2 font-medium">Nummer</th>
              <th className="pb-2 font-medium">Material</th>
              <th className="pb-2 text-right font-medium">Betrag</th>
              <th className="hidden pb-2 font-medium sm:table-cell">Datum</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 text-right font-medium">Beleg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ORDERS.map((o) => (
              <tr key={o.id}>
                <td className="py-2.5 font-semibold text-slate-800">{o.id}</td>
                <td className="py-2.5 text-slate-600">
                  {o.material}
                  <div className="font-mono text-[10.5px] tracking-tight text-brand-700">{o.materialId}</div>
                  <div className="text-[11px] text-slate-400">{chf(o.qty)} {o.unit}</div>
                </td>
                <td className="py-2.5 text-right tabular-nums text-slate-700">CHF {chf(o.amount)}</td>
                <td className="hidden py-2.5 text-slate-500 sm:table-cell">{o.date}</td>
                <td className="py-2.5">
                  <span className={badge(o.status === "Abgeschlossen" ? "slate" : "gold", true)}>{o.status}</span>
                </td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => printOrder(o, companyName)}
                    title="Als PDF speichern"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Ausgaben nach Kategorie — Top 5, Rest als Sammelposten mit Detailfenster. */
function SpendByCategory() {
  const [showAll, setShowAll] = useState(false);
  const restTotal = SPEND_REST.reduce((a, b) => a + b.amount, 0);
  const rows = [...SPEND_TOP, { name: "Sonstige", amount: restTotal }];
  const max = Math.max(...rows.map((r) => r.amount));

  return (
    <>
      <div className={cn(CARD, "p-5")}>
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900">Ausgaben nach Kategorie</h3>
          <span className="text-[11.5px] text-slate-400">letzte 12 Monate</span>
        </div>
        <ul className="mt-3 space-y-2">
          {rows.map((r) => {
            const isRest = r.name === "Sonstige";
            const body = (
              <>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className={cn("font-medium", isRest ? "text-slate-500" : "text-slate-700")}>
                    {r.name}
                    {isRest && <span className="ml-1 text-[11px] text-slate-400">({SPEND_REST.length} Kategorien)</span>}
                  </span>
                  <span className="tabular-nums text-slate-500">CHF {chf(r.amount)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", isRest ? "bg-slate-300" : "bg-brand")}
                    style={{ width: `${(r.amount / max) * 100}%` }}
                  />
                </div>
              </>
            );
            return isRest ? (
              <li key={r.name}>
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full rounded-md px-1 py-1 text-left transition-colors hover:bg-slate-50"
                >
                  {body}
                  <span className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand">
                    Alle Kategorien anzeigen <ChevronRight className="h-3 w-3" />
                  </span>
                </button>
              </li>
            ) : (
              <li key={r.name} className="px-1">{body}</li>
            );
          })}
        </ul>
      </div>

      {showAll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setShowAll(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <h3 className="text-[15px] font-bold text-slate-900">Alle Kategorien</h3>
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Schliessen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              {[...SPEND_TOP, ...SPEND_REST]
                .sort((a, b) => b.amount - a.amount)
                .map((r) => (
                  <li key={r.name} className="flex items-center justify-between px-5 py-2.5 text-[13px]">
                    <span className="text-slate-700">{r.name}</span>
                    <span className="tabular-nums font-medium text-slate-900">CHF {chf(r.amount)}</span>
                  </li>
                ))}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-[13px]">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold tabular-nums text-slate-900">
                CHF {chf([...SPEND_TOP, ...SPEND_REST].reduce((a, b) => a + b.amount, 0))}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/** Kennzahlen — schlichte Zahlen statt weiterer Diagramme. */
function ReportStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="text-[12.5px] text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-slate-400">{hint}</div>
    </div>
  );
}

function ReportsPanel({ role }: { role: "buyer" | "supplier" }) {
  const total = MONTH_VOL.reduce((a, b) => a + b.v, 0) * 1000;
  const isSupplier = role === "supplier";

  return (
    <div className="space-y-4">
      {/* Die drei Kennzahlen, die vorher in der Übersicht standen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportStat
          label={isSupplier ? "Zugesprochenes Volumen" : "Beschaffungsvolumen"}
          value={`CHF ${chf(total)}`}
          hint="letzte 12 Monate"
        />
        <ReportStat label="Bestellungen" value="1'847" hint="letzte 12 Monate" />
        <ReportStat label="Ø Mindestvorteil" value="13.8 %" hint="über alle Bündel" />
      </div>

      {/* Das einzige grosse Diagramm */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Beschaffungsvolumen</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">Monatlich, letzte 12 Monate</p>
          </div>
          <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500">12 Monate</span>
        </div>
        <div className="mt-4 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTH_VOL} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.slateLight} strokeDasharray="3 3" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
              <YAxis tickFormatter={(v) => `${v}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.slate }} />
              <Tooltip
                cursor={{ fill: "rgba(217,144,0,0.06)" }}
                formatter={(v: number) => [`CHF ${chf(v * 1000)}`, "Volumen"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
              />
              <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={C.brand} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nebenschauplatz, bewusst kleiner gehalten */}
      <SpendByCategory />
    </div>
  );
}

function ContractsPanel() {
  return (
    <div className="space-y-4">
      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-semibold text-slate-900">Aktive Pool-Teilnahmen</h3>
        <div className="mt-4 space-y-3">
          <MyBundles />
        </div>
      </div>

      <div className={cn(CARD, "p-5")}>
        <h3 className="text-[15px] font-bold text-slate-900">SIA-118 Verträge</h3>
        <div className="mt-2 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-[12.5px] leading-relaxed text-slate-600">
            <b className="text-slate-800">Wofür das gut ist:</b> SIA-118 ist die Schweizer Norm für
            Bauverträge. Sie regelt Fristen, Mängelhaftung, Zahlungspläne und Verzug einheitlich,
            damit nicht jede Firma eigene Verträge aufsetzen muss. Kommt über Obtanet ein Zuschlag
            zustande, entsteht daraus automatisch ein fertiger, rechtlich sauberer Vertrag —
            statt dass ihr das zu zweit aushandelt.
          </p>
        </div>
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

function WorkspacePanel({
  onAdd,
  catalog,
}: {
  onAdd: (m: ProcMaterial) => void;
  /** Fester Katalog plus eigene und freigegebene Materialien. */
  catalog: ProcMaterial[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"ALL" | ProcCategory>("ALL");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((m) => {
      if (cat !== "ALL" && m.category !== cat) return false;
      if (!q) return true;
      return (
        matchesMaterial(m, q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [query, cat, catalog]);

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
              placeholder="Material, Nummer (OB-BET-001) oder SIA-Norm …"
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
          <span className="text-[11px] text-slate-400">{results.length} von {catalog.length}</span>
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
  projectId,
  projectName,
}: {
  cart: CartItem[];
  onQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  projectId: string;
  projectName: string | null;
}) {
  // Warenkorb und gewählte Baustelle wandern als Parameter ins Formular,
  // damit dort nichts noch einmal eingetippt werden muss.
  const handoff = new URLSearchParams();
  if (cart.length) {
    handoff.set("material", cart.map((c) => c.key).join(","));
    handoff.set("menge", String(cart[0].qty));
  }
  if (projectId) handoff.set("projekt", projectId);
  const href = `/beschaffung${handoff.toString() ? `?${handoff}` : ""}`;

  const subtotal = cart.reduce((s, c) => s + c.qty * c.kbobPrice, 0);
  const savings = cart.reduce((s, c) => s + c.qty * c.kbobPrice * (tierForVolume(c.qty).discount / 100), 0);

  return (
    <div className={cn(CARD, "p-4")}>
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Warenkorb</h3>
        {cart.length > 0 && <span className={badge("gold", true)}>{cart.length}</span>}
      </div>
      {projectName && (
        <p className="mt-1 truncate text-[11.5px] text-slate-400">für {projectName}</p>
      )}

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
          href={href}
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

  const nav = NAV_ALL.filter(
    (n) => (!n.supplierOnly || isSupplier) && (!n.buyerOnly || !isSupplier),
  );
  // Direktsprung aus dem Profilmenue: /dashboard?view=settings
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const [view, setView] = useState(
    requestedView && NAV_ALL.some((n) => n.key === requestedView)
      ? requestedView
      : "workspace",
  );
  const supabase = useSupabaseBrowser();
  const { projects, loading: projectsLoading, error: projectsError, reload: reloadProjects } =
    useProjects();
  // "" = keiner Baustelle zugeordnet. Bewusst erlaubt: nicht jede
  // Bestellung gehört zu einem Projekt (Lager, Werkhof, Kleinbedarf).
  const [projectId, setProjectId] = useState("");
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useDirectRequests();
  const openRequests = requests.filter((r) => isLive(r.status)).length;
  const {
    rows: materialRows,
    mine: myMaterials,
    catalog: fullCatalog,
    loading: materialsLoading,
    error: materialsError,
    reload: reloadMaterials,
  } = useCustomMaterials(company.id);

  // Wie viele Bestellungen hängen an welcher Baustelle? Wird für die
  // Projektkarten gebraucht.
  const loadOrderCounts = useCallback(async () => {
    const { data } = await supabase
      .from("bundle_participations")
      .select("project_id")
      .not("project_id", "is", null);
    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { project_id: string }[]) {
      counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
    }
    setOrderCounts(counts);
  }, [supabase]);

  useEffect(() => {
    void loadOrderCounts();
  }, [loadOrderCounts]);

  // Verschwindet die gewählte Baustelle (gelöscht, abgeschlossen), fällt
  // die Auswahl sauber zurück statt auf eine tote ID zu zeigen.
  useEffect(() => {
    if (projectId && !projects.some((p) => p.id === projectId)) setProjectId("");
  }, [projects, projectId]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const title = nav.find((n) => n.key === view)?.label ?? "Beschaffung";

  function addToCart(m: ProcMaterial) {
    setCart((prev) => {
      const existing = prev.find((c) => c.key === m.key);
      if (existing) return prev.map((c) => (c.key === m.key ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { key: m.key, id: m.id, label: m.label, unit: m.unit, kbobPrice: m.kbobPrice, qty: 1 }];
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
      <aside className="relative h-fit overflow-hidden rounded-xl border border-white/10 bg-navy-900 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
        <div className="relative flex items-center gap-2.5 border-b border-white/10 px-3 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-brand to-brand-600 text-sm font-bold text-white">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(company.company_name)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{company.company_name}</div>
            <div className="truncate text-[11px] text-white/40">{isSupplier ? "Baustoffwerk / Lieferant" : "Bauunternehmen"}</div>
          </div>
        </div>

        {!isSupplier && (
          <div className="relative border-b border-white/10 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <Building2 className="h-3 w-3" /> Baustelle / Projekt
              </label>
              <button
                type="button"
                onClick={() => setView("projects")}
                className="text-[11px] font-semibold text-brand transition-colors hover:text-brand-400"
              >
                Verwalten
              </button>
            </div>
            {projects.length === 0 ? (
              <button
                type="button"
                onClick={() => setView("projects")}
                className="mt-1.5 flex w-full items-center gap-1.5 rounded-md border border-dashed border-white/20 px-2.5 py-2 text-[12.5px] text-white/50 transition-colors hover:border-brand/50 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                {projectsLoading ? "Wird geladen …" : "Erste Baustelle anlegen"}
              </button>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-navy-800 px-2.5 py-2 text-[13px] text-white outline-none focus:border-brand"
              >
                <option value="">Keine Baustelle</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{projectLabel(p)}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <nav className="relative px-2 py-3">
          {nav.map((n) => {
            const active = view === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setView(n.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-brand/15 text-brand" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
                {(n.key === "requests" ? openRequests > 0 : !!n.badge) && (
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", active ? "bg-brand text-navy-900" : "bg-white/10 text-white/70")}>
                    {n.key === "requests" ? openRequests : n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!isSupplier && (
          <div className="relative border-t border-white/10 px-3 py-3">
            <div className="flex items-start gap-2 rounded-md bg-white/[0.04] p-2.5 text-[11px] text-white/50">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
              <span>Als Bauunternehmen beschaffst du. Gebote auf Ausschreibungen sind Baustoffwerken vorbehalten.</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mittlere Spalte: Arbeitsbereich */}
      <div className={cn(CARD, "min-w-0 overflow-hidden")}>
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-navy-900 px-4 py-3 text-white sm:px-6">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
          <h2 className="relative text-lg font-bold tracking-tight">{title}</h2>
          <Link
            href="/kbob"
            className="relative hidden items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-brand/50 hover:text-brand sm:inline-flex"
          >
            <Coins className="h-3.5 w-3.5" /> KBOB-Index
          </Link>
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {view === "workspace" && <WorkspacePanel onAdd={addToCart} catalog={fullCatalog} />}
              {view === "overview" && <OverviewPanel role={role} />}
              {view === "requests" && (
                <RequestsPanel
                  myCompanyId={company.id}
                  isSupplier={isSupplier}
                  requests={requests}
                  loading={requestsLoading}
                  error={requestsError}
                  reload={reloadRequests}
                />
              )}
              {view === "materials" && (
                <MaterialsPanel
                  rows={materialRows}
                  mine={myMaterials}
                  loading={materialsLoading}
                  error={materialsError}
                  reload={reloadMaterials}
                />
              )}
              {view === "projects" && !isSupplier && (
                <ProjectsPanel
                  companyId={company.id}
                  projects={projects}
                  loading={projectsLoading}
                  error={projectsError}
                  reload={() => { reloadProjects(); void loadOrderCounts(); }}
                  orderCounts={orderCounts}
                />
              )}
              {view === "orders" && <OrdersPanel companyName={company.company_name} />}
              {view === "tenders" && isSupplier && <TendersPanel />}
              {view === "contracts" && <ContractsPanel />}
              {view === "reports" && <ReportsPanel role={role} />}
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
        <CartPanel
          cart={cart}
          onQty={updateQty}
          onRemove={removeFromCart}
          projectId={projectId}
          projectName={projects.find((p) => p.id === projectId)?.name ?? null}
        />
        <QuickToolsPanel />
      </aside>
    </div>
  );
}
