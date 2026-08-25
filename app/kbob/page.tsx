import KbobChart from "@/components/KbobChart";

export const metadata = {
  title: "KBOB Index · ConstruxNet",
  description: "KBOB-Preisindex vs. Smart-Pool-Durchschnittspreis",
};

export default function KbobPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          KBOB Preisindex
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Offizieller KBOB-Preisindex im Vergleich zum ConstruxNet
          Smart-Pool-Durchschnittspreis — nach Material und Region.
        </p>
      </header>

      <KbobChart />
    </main>
  );
}
