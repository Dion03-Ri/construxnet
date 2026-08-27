import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import KbobChart from "@/components/KbobChart";
import KbobKpis from "@/components/kbob/KbobKpis";
import MarketSignals from "@/components/kbob/MarketSignals";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "KBOB Index · ConstruxNet",
  description: "KBOB-Preisindex vs. Smart-Pool-Durchschnittspreis",
};

export default async function KbobPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string }>;
}) {
  const { material } = await searchParams;
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Referenz-Index</span>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            KBOB Preisindex
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Der offizielle Schweizer Baupreis-Referenzindex — Grundlage für jede
            faire Angebotsbewertung. ConstruxNet vergleicht ihn laufend mit den real
            erzielten Smart-Pool-Preisen.
          </p>
        </div>
        <Link
          href="/map"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand/40 hover:text-brand"
        >
          <MapIcon className="h-4 w-4" />
          Geo-Dashboard
        </Link>
      </header>

      {/* KPI-Leiste */}
      <KbobKpis />

      {/* Chart (Hauptelement) + Signale */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <KbobChart initialMaterial={material} />
        <MarketSignals />
      </div>
    </main>
  );
}
