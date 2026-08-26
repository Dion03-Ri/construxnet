import KbobChart from "@/components/KbobChart";
import KbobKpis from "@/components/kbob/KbobKpis";
import MarketSignals from "@/components/kbob/MarketSignals";

export const metadata = {
  title: "KBOB Index · ConstruxNet",
  description: "KBOB-Preisindex vs. Smart-Pool-Durchschnittspreis",
};

export default function KbobPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          KBOB Preisindex &amp; Marktanalyse
        </h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Offizieller KBOB-Preisindex im Vergleich zum ConstruxNet
          Smart-Pool-Durchschnittspreis — nach Material und Region.
        </p>
      </header>

      {/* KPI-Reihe */}
      <KbobKpis />

      {/* Chart + Signale */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <KbobChart />
        <MarketSignals />
      </div>
    </main>
  );
}
