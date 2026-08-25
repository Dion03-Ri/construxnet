import KbobChart from "@/components/KbobChart";

export const metadata = {
  title: "Preise · ConstruxNet",
  description: "KBOB-Preisindex vs. Smart-Pool-Durchschnittspreis",
};

export default function PreisePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Preistransparenz
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Offizieller KBOB-Preisindex im Vergleich zum ConstruxNet
          Smart-Pool-Durchschnittspreis — nach Material und Region.
        </p>
      </header>

      <KbobChart />
    </main>
  );
}
