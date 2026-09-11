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
  ShieldCheck,
  Trophy,
  Factory,
  Receipt,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useProjects, projectLabel } from "@/lib/projects";
import ProjectsPanel from "@/components/dashboard/ProjectsPanel";
import RequestsPanel from "@/components/dashboard/RequestsPanel";
import MeineGebotePanel from "@/components/dashboard/MeineGebotePanel";
import ZuschlaegePanel from "@/components/dashboard/ZuschlaegePanel";
import LieferprofilPanel from "@/components/dashboard/LieferprofilPanel";
import AbrechnungPanel from "@/components/dashboard/AbrechnungPanel";
import LieferantenkontoPanel from "@/components/dashboard/LieferantenkontoPanel";
import MaterialsPanel from "@/components/dashboard/MaterialsPanel";
import TendersPanel from "@/components/dashboard/TendersPanel";
import { useCustomMaterials } from "@/lib/customMaterials";
import { useKennzahlen, type Bestellung, type Kennzahl, type KategorieWert } from "@/lib/kennzahlen";
import { useBundles, deadlineLabel, hoursLeft, type Bundle } from "@/lib/bundles";
import { useDirectRequests, isLive } from "@/lib/directRequests";
import { cn } from "@/lib/utils";
import { matchesMaterial, PROC_CATEGORIES, type ProcMaterial, type ProcCategory } from "@/data/procurement";
import { useRabattstufen } from "@/lib/rabatt";
import kbobData from "@/data/kbobData.json";
import { chf } from "@/lib/format";


const C = {
  brand: "#D99000",
  accent: "#254D7A",
  navy: "#1B3A5C",
  slate: "#94A3B8",
  slateLight: "#E2E8F0",
};


/* -------------------------------------------------------------------------- */
/*  Daten                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Hier standen die erfundenen Zahlen des Dashboards: KPIS („CHF 4.2
 * Mio.", „1'847 Bestellungen", „13.8 % Ersparnis"), MONTH_VOL,
 * SPEND_TOP/SPEND_REST, vier ORDERS mit PDF-Knopf und drei CONTRACTS.
 *
 * Sie standen bei JEDEM Konto — auch bei einem frisch angelegten, das
 * noch nichts bestellt hat. Das ist schlimmer als eine leere Seite: eine
 * leere Seite sagt „hier ist noch nichts", eine erfundene Zahl sagt „so
 * steht es um dich". Und beim Testen liess sich nicht mehr unterscheiden,
 * ob eine Bestellung angekommen ist oder ob man die Attrappe ansieht.
 *
 * Alles kommt jetzt aus `lib/kennzahlen.ts`, also aus echten Zeilen.
 */

type Order = Bestellung;

const NAV_ALL = [
  { key: "workspace", label: "Beschaffung", icon: Search, buyerOnly: true },
  { key: "overview", label: "Übersicht", icon: LayoutDashboard },
  { key: "projects", label: "Projekte", icon: Building2, buyerOnly: true },
  { key: "requests", label: "Direktanfragen", icon: Handshake },
  { key: "materials", label: "Eigene Materialien", icon: Package },
  // Keine Zahlen an diesen beiden. Hier standen fest verdrahtete 7 und 3 —
  // sie zeigten dieselbe Zahl bei einem leeren Konto wie bei einem vollen.
  // Eine erfundene Zahl ist schlimmer als keine: man richtet sich danach.
  // Sobald es eine echte Quelle gibt, kommt sie hier hin.
  { key: "orders", label: "Bestellungen", icon: ShoppingCart, buyerOnly: true },
  { key: "tenders", label: "Ausschreibungen", icon: Gavel, supplierOnly: true },
  { key: "gebote", label: "Meine Gebote", icon: Gavel, supplierOnly: true },
  { key: "zuschlaege", label: "Zugeschlagen", icon: Trophy, supplierOnly: true },
  { key: "lieferprofil", label: "Lieferprofil", icon: Factory, supplierOnly: true },
  { key: "abrechnung", label: "Abrechnung", icon: Receipt, supplierOnly: true },
  { key: "lieferantenkonto", label: "Lieferantenkonto", icon: ShieldCheck, supplierOnly: true },
  { key: "contracts", label: "SIA-118 Verträge", icon: FileText },
  { key: "reports", label: "Berichte", icon: BarChart3 },
  { key: "settings", label: "Einstellungen", icon: Settings },
];

type CartItem = { key: string; id: string; label: string; unit: string; kbobPrice: number; qty: number; category: ProcCategory };

/* -------------------------------------------------------------------------- */
/*  Kleinteile                                                                */
/* -------------------------------------------------------------------------- */

/*
 * Der Vergleich „ggü. Vorjahr" ist weg. Er stand fest verdrahtet an jeder
 * Kachel — auch an einem Konto, das noch kein Vorjahr hat. Sobald zwölf
 * Monate echte Zeilen da sind, kann er zurückkommen; bis dahin steht
 * lieber nichts als ein Pfeil, der etwas behauptet.
 */
function KpiCard({ k }: { k: Kennzahl }) {
  return (
    <div className="border-t border-white/[0.12] pt-5">
      <div className="text-[13px] font-medium text-white/[0.72]">{k.label}</div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-white">{k.value}</div>
        {k.delta != null && (
          <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", k.delta >= 0 ? "text-brand" : "text-rose-500")}>
            {k.delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(k.delta)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Eine eigene Bündel-Teilnahme.
 *
 * Früher stand hier ein Balken „noch X m³ bis Stufe Y". Den gibt es nicht
 * mehr: die garantierte Untergrenze eines Bündels ist der höchste
 * individuelle Anspruch seiner Teilnehmer, nicht eine Funktion der
 * Gesamtmenge. Mehr Menge macht das Bündel für die Werke attraktiver —
 * was dabei herausspringt, entscheidet die verdeckte Ausschreibung, nicht
 * eine Staffel.
 */
function PoolRow({ b, myVolume }: { b: Bundle; myVolume: number }) {

  return (
    <Link href="/pools" className="block rounded-lg border border-white/[0.12] p-4 transition-colors hover:border-brand/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-white">{b.material_label ?? b.title}</span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white/[0.72]">{b.region}</span>
          {b.status === "SEALED_BIDDING" && (
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.56]">
              <Gavel className="h-3 w-3" /> Ausschreibung läuft
            </span>
          )}
          {b.status === "AWARDED" && (
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand">
              <Check className="h-3 w-3" /> vergeben
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-white/[0.72]">
          <Clock className="h-3.5 w-3.5" /> {deadlineLabel(b.bid_deadline ?? b.deadline)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-white/[0.56]">Garantierte Untergrenze</span>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand">mind. {b.current_discount_pct}%</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-[11px] text-white/[0.72]">
        <span>
          {chf(b.current_volume)} {b.unit} gesamt · davon deine {chf(myVolume)} {b.unit}
        </span>
        {b.status === "AWARDED" && b.awarded_price != null ? (
          <span className="font-semibold text-brand">
            Zuschlag CHF {chf(b.awarded_price, 2)}/{b.unit}
          </span>
        ) : (
          <span>{b.participant_count} {b.participant_count === 1 ? "Firma" : "Firmen"} im Bündel</span>
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
      <div className="grid place-items-center py-10 text-white/[0.56]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.12] px-4 py-8 text-center">
        <p className="text-[13px] font-semibold text-white/[0.72]">Du bist noch in keinem Bündel</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-white/[0.72]">
          Bündel entstehen aus gemeldetem Bedarf. Meldest du deinen, kommst du
          entweder einem laufenden dazu oder startest ein neues.
        </p>
        <Link
          href="/beschaffung"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-navy-950 transition-colors hover:bg-brand-600"
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
  const { kennzahlen } = useKennzahlen(role);

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
      {/* Die vier Kennzahlen — dieselbe Quelle wie unter „Berichte". Wo
          nichts ist, steht ein Strich und keine Null: eine Null liest sich
          wie ein gemessener Wert. */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-4">
        {kennzahlen.map((k) => (
          <KpiCard key={k.label} k={k} />
        ))}
      </div>

      {/* Offene Punkte */}
      <div className="border-t border-white/[0.12]">
        <div className="border-b border-white/[0.06] px-5 py-3.5">
          <h3 className="text-[15px] font-bold text-white">Das braucht deine Aufmerksamkeit</h3>
          <p className="mt-0.5 text-[12.5px] text-white/[0.72]">
            Offene Punkte aus Bündeln, Verträgen und Lieferungen.
          </p>
        </div>
        {openTasks.length === 0 && (
          <p className="px-5 py-4 text-[13px] leading-relaxed text-white/[0.56]">
            Im Moment nichts. Sobald ein Bündel auf die Frist zuläuft, in die
            Ausschreibung geht oder vergeben wird, steht es hier.
          </p>
        )}
        <ul className="divide-y divide-white/[0.12]">
          {openTasks.map((t) => (
            <li key={t.text} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-brand">
                <t.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-[13.5px] text-white/[0.72]">{t.text}</span>
              <Link
                href={t.href}
                className="shrink-0 rounded-md border border-white/[0.12] px-3 py-1.5 text-[12.5px] font-semibold text-white/[0.72] transition-colors hover:border-brand/40 hover:text-brand"
              >
                {t.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Laufende Bündel — hier kann man noch Menge einbringen */}
      <div className="border-t border-white/[0.12] pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-white">Deine laufenden Bündel</h3>
            <p className="mt-0.5 text-[12.5px] text-white/[0.72]">
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
        <div className="flex items-center gap-3 border-t border-white/[0.12] pt-6">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-brand">
            <Gavel className="h-4 w-4" />
          </span>
          <p className="flex-1 text-[13.5px] text-white/[0.72]">
            Offene Ausschreibungen warten auf dein Gebot.
          </p>
          <span className="text-[12.5px] text-white/[0.56]">Reiter „Ausschreibungen"</span>
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
<title>Bestellung ${esc(o.nummer)}</title>
<style>
  *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;margin:0;padding:48px}
  h1{font-size:22px;margin:0 0 2px} .sub{color:#64748B;font-size:13px;margin-bottom:28px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0F2238;padding-bottom:16px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  .box{border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-bottom:16px}
  .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8;margin-bottom:10px;font-weight:700}
  .total{border-top:2px solid #0F2238;margin-top:8px;padding-top:10px;font-size:16px;font-weight:800;display:flex;justify-content:space-between}
  .foot{margin-top:32px;font-size:11px;color:#94A3B8;line-height:1.6}
  @media print{body{padding:24px}}
</style></head><body>
<div class="head">
  <div><img src="${window.location.origin}/logo-dunkel.png" alt="Obtanet" style="height:26px;width:auto;display:block"><div class="sub" style="margin:6px 0 0">Schweizer Baubranche</div></div>
  <div style="text-align:right"><h1>Bestellung ${esc(o.nummer)}</h1><div class="sub" style="margin:0">${esc(o.datum)} · ${esc(o.status)}</div></div>
</div>
<div class="box"><div class="lbl">Besteller</div><div style="font-weight:600">${esc(companyName)}</div></div>
<div class="box"><div class="lbl">Position</div><table>
  ${o.materialId ? row("Materialnummer", esc(o.materialId)) : ""}
  ${row("Material", esc(o.material))}
  ${row("Spezifikation", esc(o.sia))}
  ${row("Menge", `${chf(o.menge)} ${esc(o.einheit)}`)}
  ${o.einzelpreis != null ? row("Preis pro Einheit", `CHF ${chf(o.einzelpreis, 2)}`) : ""}
</table>
${o.betrag != null ? `<div class="total"><span>Bestellwert</span><span>CHF ${chf(o.betrag)}</span></div>` : ""}</div>
${o.vertrag ? `<div class="box"><div class="lbl">Vertrag</div><table>${row("SIA-118-Vertrag", esc(o.vertrag))}</table></div>` : ""}
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
  const { bestellungen, laden } = useKennzahlen("buyer");

  if (laden) {
    return (
      <div className="border-t border-white/[0.12] pt-6 text-[13px] text-white/[0.56]">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Bestellungen werden geladen …
      </div>
    );
  }

  if (bestellungen.length === 0) {
    return (
      <div className="border-t border-white/[0.12] pt-6">
        <h3 className="text-[15px] font-bold text-white">Bestellungen</h3>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/[0.56]">
          Noch keine. Eine Bestellung entsteht, wenn ein Bündel, an dem du
          beteiligt bist, einem Werk zugeschlagen wird — bis dahin steht der
          Bedarf unter „Beschaffung".
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-white/[0.12] pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-white">Bestellungen</h3>
        <span className="rounded-md border border-white/[0.12] px-2.5 py-1 text-xs text-white/[0.72]">
          {bestellungen.length} {bestellungen.length === 1 ? "Zuschlag" : "Zuschläge"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-white/[0.56]">
              <th className="pb-2 font-medium">Nummer</th>
              <th className="pb-2 font-medium">Material</th>
              <th className="pb-2 text-right font-medium">Betrag</th>
              <th className="hidden pb-2 font-medium sm:table-cell">Datum</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 text-right font-medium">Beleg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.12]">
            {bestellungen.map((o) => (
              <tr key={o.bundleId}>
                <td className="py-2.5 font-semibold text-white/90">{o.nummer}</td>
                <td className="py-2.5 text-white/[0.72]">
                  {o.material}
                  {o.materialId && <div className="font-mono text-[10.5px] tracking-tight text-brand-700">{o.materialId}</div>}
                  <div className="text-[11px] text-white/[0.56]">{chf(o.menge)} {o.einheit}</div>
                </td>
                <td className="py-2.5 text-right tabular-nums text-white/[0.72]">
                  {o.betrag != null ? `CHF ${chf(o.betrag)}` : "—"}
                </td>
                <td className="hidden py-2.5 text-white/[0.72] sm:table-cell">{o.datum}</td>
                <td className="py-2.5">
                  <span className={cn("inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]", o.status === "Abgeschlossen" ? "text-white/[0.5]" : "text-brand")}>{o.status}</span>
                </td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => printOrder(o, companyName)}
                    title="Als PDF speichern"
                    className="inline-flex items-center gap-1 rounded-md border border-white/[0.12] px-2.5 py-1.5 text-[12px] font-semibold text-white/[0.72] transition-colors hover:border-brand/40 hover:text-brand"
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

/**
 * Ausgaben nach Materialkategorie — aus zugeschlagenen Bündeln.
 *
 * Vorher standen hier zehn feste Kategorien mit festen Beträgen, dazu ein
 * Fenster „alle Kategorien". Echte Kategorien sind wenige: nur die, in
 * denen diese Firma tatsächlich einen Zuschlag hat. Für fünf Zeilen
 * braucht es weder einen Sammelposten noch ein Fenster.
 */
function SpendByCategory({ zeilen }: { zeilen: KategorieWert[] }) {
  if (zeilen.length === 0) {
    return (
      <div className="border-t border-white/[0.12] pt-6">
        <h3 className="text-[14px] font-bold text-white">Ausgaben nach Kategorie</h3>
        <p className="mt-2 text-[12.5px] text-white/[0.56]">
          Noch keine zugeschlagenen Bündel.
        </p>
      </div>
    );
  }

  const max = Math.max(...zeilen.map((r) => r.amount));

  return (
    <div className="border-t border-white/[0.12] pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Ausgaben nach Kategorie</h3>
        <span className="text-[11.5px] text-white/[0.56]">zugeschlagen</span>
      </div>
      <ul className="mt-3 space-y-2">
        {zeilen.map((r) => (
          <li key={r.name} className="px-1">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate font-medium text-white/[0.72]">{r.name}</span>
              <span className="shrink-0 tabular-nums text-white/[0.72]">CHF {chf(r.amount)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(r.amount / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Kennzahlen — schlichte Zahlen statt weiterer Diagramme. */
function ReportStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border-t border-white/[0.12] pt-5">
      <div className="text-[12.5px] text-white/[0.72]">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-white/[0.56]">{hint}</div>
    </div>
  );
}

function ReportsPanel({ role }: { role: "buyer" | "supplier" }) {
  const { kennzahlen, monatsVolumen, nachKategorie, laden } = useKennzahlen(role);
  const isSupplier = role === "supplier";
  const total = monatsVolumen.reduce((a, b) => a + b.v, 0) * 1000;
  const hatVerlauf = monatsVolumen.some((m) => m.v > 0);

  if (laden) {
    return (
      <div className="border-t border-white/[0.12] pt-6 text-[13px] text-white/[0.56]">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Berichte werden geladen …
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dieselben Kennzahlen wie in der Übersicht — eine Quelle, damit
          nicht zwei Seiten dieselbe Frage verschieden beantworten. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kennzahlen.map((k) => (
          <ReportStat key={k.label} label={k.label} value={k.value} hint="alle Zuschläge" />
        ))}
      </div>

      <div className="border-t border-white/[0.12] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-white">
              {isSupplier ? "Zugesprochenes Volumen" : "Beschaffungsvolumen"}
            </h3>
            <p className="mt-0.5 text-[12.5px] text-white/[0.72]">Monatlich, letzte 12 Monate</p>
          </div>
          <span className="rounded-md border border-white/[0.12] px-2.5 py-1 text-xs text-white/[0.72]">
            CHF {chf(total)}
          </span>
        </div>
        {hatVerlauf ? (
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monatsVolumen} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
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
        ) : (
          /* Ein Balkendiagramm aus zwölf Nullen sieht aus wie ein Fehler.
             Solange nichts zugeschlagen ist, steht hier ein Satz. */
          <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-white/[0.56]">
            Noch kein Verlauf. Sobald ein Bündel zugeschlagen ist, erscheint es
            hier im Monat des Zuschlags.
          </p>
        )}
      </div>

      {!isSupplier && <SpendByCategory zeilen={nachKategorie} />}
    </div>
  );
}

function ContractsPanel() {
  const { vertraege, laden } = useKennzahlen("buyer");

  return (
    <div className="space-y-4">
      <div className="border-t border-white/[0.12] pt-6">
        <h3 className="text-[15px] font-semibold text-white">Aktive Pool-Teilnahmen</h3>
        <div className="mt-4 space-y-3">
          <MyBundles />
        </div>
      </div>

      <div className="border-t border-white/[0.12] pt-6">
        <h3 className="text-[15px] font-bold text-white">SIA-118 Verträge</h3>
        <div className="mt-2 flex items-start gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.03] p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/[0.56]" />
          <p className="text-[12.5px] leading-relaxed text-white/[0.72]">
            <b className="text-white/90">Wofür das gut ist:</b> SIA-118 ist die Schweizer Norm für
            Bauverträge. Sie regelt Fristen, Mängelhaftung, Zahlungspläne und Verzug einheitlich,
            damit nicht jede Firma eigene Verträge aufsetzen muss. Kommt über Obtanet ein Zuschlag
            zustande, entsteht daraus automatisch ein fertiger, rechtlich sauberer Vertrag —
            statt dass ihr das zu zweit aushandelt.
          </p>
        </div>
        {laden ? (
          <p className="mt-3 text-[13px] text-white/[0.56]">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Verträge werden geladen …
          </p>
        ) : vertraege.length === 0 ? (
          /* Kein Beispielvertrag als Platzhalter. Wer hier drei erfundene
             Nummern sieht, hält das Verfahren für erprobt, obwohl noch
             kein einziger Zuschlag durchgelaufen ist. */
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/[0.56]">
            Noch keine. Ein Vertrag entsteht mit dem Zuschlag — vorher gibt es
            nichts zu unterschreiben.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-white/[0.56]">
                  <th className="pb-2 font-medium">Vertrag</th>
                  <th className="pb-2 font-medium">Material</th>
                  <th className="hidden pb-2 font-medium sm:table-cell">Menge</th>
                  <th className="pb-2 font-medium">CHF/Einheit</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.12]">
                {vertraege.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 font-medium text-white/90">{c.nummer}</td>
                    <td className="py-2.5 text-white/[0.72]">{c.material}</td>
                    <td className="hidden py-2.5 tabular-nums text-white/[0.72] sm:table-cell">
                      {chf(c.menge)} {c.einheit}
                    </td>
                    <td className="py-2.5 tabular-nums text-white/[0.72]">{chf(c.preis, 2)}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn("inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]", c.status === "Aktiv" ? "text-brand" : "text-white/[0.5]")}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      <div className="border-t border-white/[0.12] pt-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.56]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Material, Nummer (OB-BET-001) oder SIA-Norm …"
              className="w-full rounded-md border border-white/[0.16] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/[0.56] outline-none focus:border-brand focus:bg-[#16181a] focus:ring-1 focus:ring-brand/30"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as "ALL" | ProcCategory)}
            className="select-dark rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2.5 text-sm text-white/[0.72] outline-none focus:border-brand"
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
            dragOver ? "border-brand bg-brand/5 text-brand" : "border-white/[0.16] text-white/[0.72] hover:border-brand/40 hover:text-brand",
          )}
        >
          <UploadCloud className="h-4 w-4 shrink-0" />
          {fileName ? (
            <span className="flex items-center gap-2 truncate font-medium text-white/[0.72]">
              {fileName}
              <button type="button" onClick={(e) => { e.preventDefault(); setFileName(null); }} className="text-white/[0.56] hover:text-rose-500">
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
      <div className="border-t border-white/[0.12]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <h3 className="text-[15px] font-semibold text-white">Material-Katalog</h3>
          <span className="text-[11px] text-white/[0.56]">{results.length} von {catalog.length}</span>
        </div>
        <div className="max-h-[440px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-[#16181a]">
              <tr className="text-[11px] uppercase tracking-wider text-white/[0.56]">
                <th className="px-4 pb-2 pt-3 font-medium">Material</th>
                <th className="hidden px-2 pb-2 pt-3 font-medium sm:table-cell">Spezifikation</th>
                <th className="px-2 pb-2 pt-3 font-medium">
                  <span className="sm:hidden">KBOB</span>
                  <span className="hidden sm:inline">KBOB CHF/Einheit</span>
                </th>
                <th className="px-4 pb-2 pt-3 text-right font-medium">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.12]">
              {results.map((m) => (
                <tr key={m.key}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-white/90">{m.label}</div>
                    <div className="text-[11px] text-white/[0.56]">{m.category}</div>
                  </td>
                  <td className="hidden px-2 py-2.5 text-[12px] text-white/[0.72] sm:table-cell">{m.sia}</td>
                  <td className="px-2 py-2.5 tabular-nums text-white/[0.72]">{chf(m.kbobPrice, m.kbobPrice % 1 ? 2 : 0)} / {m.unit}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onAdd(m)}
                      aria-label={`${m.label} in den Warenkorb`}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand/35 px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-navy-950"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Warenkorb</span>
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/[0.56]">Keine Treffer.</td>
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

  // Die Staffel kommt aus der Datenbank, nicht aus dem Quelltext, und sie
  // gilt je Materialkategorie. Massgebend ist der Bestellwert dieser Firma
  // in dieser Kategorie — nicht die Stückzahl und nicht das Bündelvolumen.
  const { meinMindestrabatt, laden: stufenLaden } = useRabattstufen();

  const wertJeKategorie = new Map<string, number>();
  for (const c of cart) {
    wertJeKategorie.set(c.category, (wertJeKategorie.get(c.category) ?? 0) + c.qty * c.kbobPrice);
  }
  /** Garantierter Prozentsatz für eine Position, oder null ohne Garantie. */
  function garantieFuer(c: CartItem): number | null {
    return meinMindestrabatt(c.category, wertJeKategorie.get(c.category) ?? 0);
  }

  const subtotal = cart.reduce((s, c) => s + c.qty * c.kbobPrice, 0);
  const savings = cart.reduce((s, c) => s + c.qty * c.kbobPrice * ((garantieFuer(c) ?? 0) / 100), 0);
  const ohneGarantie = cart.some((c) => garantieFuer(c) === null);

  return (
    <div className="border-t border-white/[0.12] pt-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-white/[0.72]">Warenkorb</h3>
        {cart.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10.5px] font-bold tabular-nums text-navy-950">{cart.length}</span>}
      </div>
      {projectName && (
        <p className="mt-1 truncate text-[11.5px] text-white/[0.56]">für {projectName}</p>
      )}

      {cart.length === 0 ? (
        <p className="mt-3 text-[13px] text-white/[0.56]">Noch keine Materialien gewählt.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {cart.map((c) => (
            <div key={c.key} className="rounded-md border border-white/[0.12] p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium leading-tight text-white/90">{c.label}</span>
                <button type="button" onClick={() => onRemove(c.key)} className="shrink-0 text-white/[0.4] hover:text-rose-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] px-1.5 py-1">
                  <button type="button" onClick={() => onQty(c.key, Math.max(1, c.qty - 1))} className="text-white/[0.56] hover:text-white/[0.72]">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-12 text-center text-[12px] tabular-nums text-white/[0.72]">{c.qty} {c.unit}</span>
                  <button type="button" onClick={() => onQty(c.key, c.qty + 1)} className="text-white/[0.56] hover:text-white/[0.72]">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-[12px] font-semibold tabular-nums text-white/[0.72]">CHF {chf(c.qty * c.kbobPrice)}</span>
              </div>
              {/* Der garantierte Mindestrabatt steht direkt an der Position:
                  wer 10 m³ Beton eingibt, sieht sofort, was für Beton in
                  dieser Grössenordnung zugesichert ist. */}
              {!stufenLaden && (
                <div className="mt-1.5 flex items-baseline justify-between gap-2 text-[11px]">
                  {garantieFuer(c) != null ? (
                    <>
                      <span className="text-brand">mind. {garantieFuer(c)} % garantiert</span>
                      <span className="tabular-nums text-white/[0.56]">
                        − CHF {chf((c.qty * c.kbobPrice * (garantieFuer(c) as number)) / 100)}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/[0.4]">noch keine Mengengarantie</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[13px] text-white/[0.72]">
          <span>Zwischensumme (KBOB)</span>
          <span className="font-medium text-white/90">CHF {chf(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px] text-brand">
          <span>Garantierter Mindestvorteil</span>
          <span className="font-semibold">− CHF {chf(savings)}</span>
        </div>
        {ohneGarantie && (
          <p className="text-[11px] leading-relaxed text-white/[0.4]">
            Für einzelne Positionen greift die Mengengarantie noch nicht. In der
            verdeckten Ausschreibung bieten die Werke trotzdem darunter.
          </p>
        )}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-1.5 text-sm">
          <span className="font-semibold text-white">Zielpreis (indikativ)</span>
          <span className="font-bold text-white">CHF {chf(subtotal - savings)}</span>
        </div>
      </div>

      {cart.length > 0 ? (
        <Link
          href={href}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-600"
        >
          Bedarf einreichen
        </Link>
      ) : (
        <span className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white/[0.56]">
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
      <div className="border-t border-white/[0.12] pt-5">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-white/[0.72]">
          <Calculator className="h-3.5 w-3.5" /> Mengen-/Verschnittrechner
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-white/[0.56]">Menge / Fläche</label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              type="text"
              inputMode="decimal"
              placeholder="0"
              className="mt-1 w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-2.5 py-1.5 text-sm text-white outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/[0.56]">Verschnitt %</label>
            <input
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              type="text"
              inputMode="decimal"
              className="mt-1 w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-2.5 py-1.5 text-sm text-white outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2 text-[13px]">
          <span className="text-white/[0.72]">Bestellmenge</span>
          <span className="font-semibold text-white">
            {result !== null ? result.toLocaleString("de-CH", { maximumFractionDigits: 2 }) : "–"}
          </span>
        </div>
      </div>

      <div className="border-t border-white/[0.12] pt-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-white/[0.72]">
            <Coins className="h-3.5 w-3.5" /> KBOB-Index
          </h3>
          <Link href="/kbob" className="text-[11px] font-semibold text-brand hover:underline">Details →</Link>
        </div>
        {last ? (
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-[11px] text-white/[0.56]">{beton.label} · Zürich</div>
              <div className="text-xl font-bold tabular-nums text-white">CHF {chf(last.kbob, 2)}</div>
            </div>
            <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-semibold", delta >= 0 ? "text-brand" : "text-rose-500")}>
              {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-white/[0.56]">Keine Daten.</p>
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
  // „Beschaffung" ist Besteller-Sache. Ein Werk landete darauf sonst auf
  // einer Seite, die es gar nicht sehen darf — und suchte den Rest.
  const [view, setView] = useState(
    requestedView && NAV_ALL.some((n) => n.key === requestedView)
      ? requestedView
      : isSupplier
        ? "tenders"
        : "workspace",
  );
  // Ein Reiter, den diese Rolle nicht hat, zeigt sonst eine leere Flaeche.
  useEffect(() => {
    if (!nav.some((n) => n.key === view)) setView(isSupplier ? "tenders" : "workspace");
  }, [nav, view, isSupplier]);

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
      return [...prev, { key: m.key, id: m.id, label: m.label, unit: m.unit, kbobPrice: m.kbobPrice, qty: 1, category: m.category }];
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
      {/* Handy: kompakte Kopfzeile + waagrechte Tab-Leiste statt der Seitenspalte.
          Damit steht der Inhalt sofort oben und nicht erst nach einem Bildschirm Navigation. */}
      <div className="relative border-b border-white/[0.12] pb-5 text-white lg:hidden">
        <div className="relative flex items-center gap-2.5 px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-brand to-brand-600 text-[11px] font-bold text-white">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(company.company_name)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{company.company_name}</div>
            <div className="truncate text-[11px] text-white/[0.56]">
              {isSupplier ? "Baustoffwerk / Lieferant" : "Bauunternehmen"}
            </div>
          </div>
          {!isSupplier &&
            (projects.length === 0 ? (
              <button
                type="button"
                onClick={() => setView("projects")}
                className="flex shrink-0 items-center gap-1 rounded-md border border-dashed border-white/20 px-2 py-1.5 text-[11.5px] font-medium text-white/[0.72]"
              >
                <Plus className="h-3.5 w-3.5" /> Baustelle
              </button>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                aria-label="Baustelle / Projekt"
                className="select-dark w-[38%] shrink-0 truncate rounded-md border border-white/15 bg-navy-800 px-2 py-1.5 text-[12px] text-white outline-none focus:border-brand"
              >
                <option value="">Keine Baustelle</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{projectLabel(p)}</option>
                ))}
              </select>
            ))}
        </div>
        <div className="no-scrollbar relative flex gap-1.5 overflow-x-auto border-t border-white/[0.12] px-3 py-2">
          {nav.map((n) => {
            const active = view === n.key;
            // Nur „Direktanfragen" trägt eine Zahl, und die ist gezählt, nicht gesetzt.
            const count = n.key === "requests" ? openRequests : 0;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setView(n.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                  active ? "bg-brand text-navy-900" : "bg-white/[0.06] text-white/[0.72]",
                )}
              >
                <n.icon className="h-3.5 w-3.5 shrink-0" />
                {n.label}
                {n.key === "requests" && openRequests > 0 && (
                  <span
                    className={cn(
                      "rounded px-1 text-[10px] font-semibold",
                      active ? "bg-navy-900/20 text-navy-900" : "bg-white/15 text-white/80",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Linke Spalte: Navigation & Projekt-Auswahl (ab lg) */}
      <aside className="relative hidden h-fit border-r border-white/[0.12] pr-6 text-white lg:block">
        <div className="relative flex items-center gap-2.5 border-b border-white/[0.12] px-3 py-3">
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
            <div className="truncate text-[11px] text-white/[0.56]">{isSupplier ? "Baustoffwerk / Lieferant" : "Bauunternehmen"}</div>
          </div>
        </div>

        {!isSupplier && (
          <div className="relative border-b border-white/[0.12] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
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
                className="mt-1.5 flex w-full items-center gap-1.5 rounded-md border border-dashed border-white/20 px-2.5 py-2 text-[12.5px] text-white/[0.56] transition-colors hover:border-brand/50 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                {projectsLoading ? "Wird geladen …" : "Erste Baustelle anlegen"}
              </button>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="select-dark mt-1.5 w-full rounded-md border border-white/15 bg-navy-800 px-2.5 py-2 text-[13px] text-white outline-none focus:border-brand"
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
                  active ? "bg-brand/15 text-brand" : "text-white/[0.72] hover:bg-white/5 hover:text-white",
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
                {n.key === "requests" && openRequests > 0 && (
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", active ? "bg-brand text-navy-900" : "bg-white/10 text-white/[0.72]")}>
                    {openRequests}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!isSupplier && (
          <div className="relative border-t border-white/[0.12] px-3 py-3">
            <div className="flex items-start gap-2 rounded-md bg-white/[0.04] p-2.5 text-[11px] text-white/[0.56]">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/[0.56]" />
              <span>Als Bauunternehmen beschaffst du. Gebote auf Ausschreibungen sind Baustoffwerken vorbehalten.</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mittlere Spalte: Arbeitsbereich */}
      <div className="min-w-0 border-t border-white/[0.12]">
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.12] bg-navy-900 px-4 py-3 text-white sm:px-6">
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
              {view === "gebote" && isSupplier && <MeineGebotePanel />}
              {view === "zuschlaege" && isSupplier && <ZuschlaegePanel />}
              {view === "lieferprofil" && isSupplier && <LieferprofilPanel />}
              {view === "abrechnung" && isSupplier && <AbrechnungPanel />}
              {view === "lieferantenkonto" && isSupplier && <LieferantenkontoPanel />}
              {view === "contracts" && <ContractsPanel />}
              {view === "reports" && <ReportsPanel role={role} />}
              {view === "settings" && (
                <div className="border-t border-white/[0.12] py-8 text-sm text-white/[0.72]">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Settings className="h-4 w-4" /> Einstellungen
                  </div>
                  <p className="mt-2">
                    Firmenname, Adresse, Kontaktdaten{isSupplier ? " und Liefer-Profil" : ""} bearbeitest du
                    im Firmenprofil.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-semibold text-navy-950 transition-colors hover:bg-brand-600"
                    >
                      Profil bearbeiten
                    </Link>
                    <Link
                      href={`/company/${company.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] px-4 py-2 text-[13px] font-semibold text-white/[0.72] transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      Profil ansehen
                    </Link>
                  </div>
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
