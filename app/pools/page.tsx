import { Layers } from "lucide-react";
import OpenPools from "@/components/pools/OpenPools";
import BundleEnginePanel from "@/components/pools/BundleEnginePanel";

export const dynamic = "force-dynamic";

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

      {/* Zusatztool: Rabatt-Rechner — klein, per Vollbild-Icon aufklappbar */}
      <section className="mt-10">
        <BundleEnginePanel />
      </section>
    </main>
  );
}
