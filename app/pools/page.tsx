import { Layers, Calculator } from "lucide-react";
import OpenPools from "@/components/pools/OpenPools";
import BundleEngine from "@/components/BundleEngine";

export const metadata = {
  title: "Smart Pools · ConstruxNet",
  description: "Offene, gebündelte Bedarfe der Schweizer Baubranche — beitreten und sparen",
};

export default function PoolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <Layers className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Smart Pools</h1>
          <p className="text-sm text-slate-500">
            Offene, gebündelte Bedarfe in deiner Region — melde deinen Materialbedarf und tritt bei.
          </p>
        </div>
      </header>

      {/* Hauptinhalt: offene Bündel mit Countdown */}
      <OpenPools />

      {/* Zusatztool: Rabatt-Rechner */}
      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Calculator className="h-4 w-4" /> Zusatztool · Rabatt-Rechner
        </div>
        <BundleEngine />
      </section>
    </main>
  );
}
