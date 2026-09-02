import { Layers } from "lucide-react";
import OpenPools from "@/components/pools/OpenPools";
import BundleEnginePanel from "@/components/pools/BundleEnginePanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Smart Pools · Obtanet",
  description: "Offene, gebündelte Bedarfe der Schweizer Baubranche — beitreten und sparen",
};

export default function PoolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Kopf in der Sprache der übrigen Seiten: dunkles Panel mit Raster und Gold */}
      <header className="relative mb-6 overflow-hidden rounded-xl border border-white/10 bg-navy-900 p-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <Layers className="h-3.5 w-3.5" /> Smart Pools
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Offene, gebündelte Bedarfe in deiner Region
          </h1>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-white/55">
            Melde deinen Materialbedarf und tritt einem Bündel bei. In der{" "}
            <b className="font-semibold text-white/85">Sammelphase</b> wächst das Volumen — je
            grösser es wird, desto höher der garantierte Mindestvorteil. Im{" "}
            <b className="font-semibold text-white/85">Sealed-Bid</b> geben die Werke verdeckte
            Angebote gegen den KBOB-Referenzpreis ab; das beste erhält den Zuschlag und kann die
            Garantie übertreffen.
          </p>
          <p className="mt-2.5 text-[12.5px] text-white/40">
            Wird das Zielvolumen bis zur Frist nicht erreicht, wird das Bündel aufgelöst — es
            entsteht keine Verpflichtung.
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
