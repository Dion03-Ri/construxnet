export const dynamic = "force-dynamic";

export const metadata = { title: "Zugang · ConstruxNet" };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-2xl font-extrabold tracking-tight text-white">
          Construx<span className="text-brand">Net</span>
        </div>
        <p className="mt-6 text-[13px] leading-relaxed text-white/55">
          Diese Umgebung befindet sich im Aufbau und ist noch nicht öffentlich.
          Bitte gib das Zugangs-Passwort ein.
        </p>

        <form action="/api/preview" method="POST" className="mt-6">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Passwort"
            className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-brand/60"
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-navy-900 transition-colors hover:bg-brand-500"
          >
            Zugang
          </button>
          {error ? (
            <p className="mt-3 text-[13px] font-medium text-rose-400">Falsches Passwort.</p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
