import BundleEngine from "@/components/BundleEngine";

export const metadata = {
  title: "Smart Pools · ConstruxNet",
  description: "Smart Pools Explorer — Preistreppe und 2.25 %-Marge",
};

export default function PoolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Smart Pools Explorer
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Optional beim Materialbestellen aktivierbar: Bedarf wird nach
          SIA-Spezifikation, Geo-Fence und Lieferfenster gebündelt. Mehr Volumen
          senkt den Preis über die Preistreppe — der erreichte Tier-Rabatt gilt
          garantiert für alle Teilnehmer.
        </p>
      </header>

      <BundleEngine />
    </main>
  );
}
