import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import KbobChart from "@/components/KbobChart";
import KbobKpis from "@/components/kbob/KbobKpis";
import MarketSignals from "@/components/kbob/MarketSignals";

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
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            KBOB Preisindex &amp; Marktanalyse
          </h1>
          <p className="mt-1 max-w-2xl text-slate-500">
            Offizieller KBOB-Preisindex im Vergleich zum ConstruxNet
            Smart-Pool-Durchschnittspreis — nach Material und Region.
          </p>
        </div>
        <Link
          href="/map"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-card transition-colors hover:border-brand/40 hover:text-brand"
        >
          <MapIcon className="h-4 w-4" />
          Geo-Dashboard
        </Link>
      </header>

      {/* KPI-Reihe */}
      <KbobKpis />

      {/* Chart + Signale */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <KbobChart initialMaterial={material} />
        <MarketSignals />
      </div>
    </main>
  );
}
