import KbobChart from "@/components/KbobChart";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          ConstruxNet
        </h1>
        <p className="mt-2 text-neutral-400">
          Smart Bündelung für Schweizer Baumaterialien — Preistransparenz KBOB
          vs. Smart Pool.
        </p>
      </header>

      <KbobChart />
    </main>
  );
}
