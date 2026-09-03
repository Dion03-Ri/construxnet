import { getBypassPassword } from "@/lib/preview";

export const dynamic = "force-dynamic";

export const metadata = { title: "Zugang · Obtanet" };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  // Ohne konfiguriertes Passwort gibt es keinen Zugang. Das gehört gesagt,
  // sonst probiert jemand minutenlang ein Passwort, das nirgends hinterlegt
  // ist — der frühere feste Standardwert im Code ist entfernt.
  const configured = getBypassPassword() !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-2xl font-extrabold tracking-tight text-white">
          Obta<span className="text-brand">net</span>
        </div>
        <p className="mt-6 text-[13px] leading-relaxed text-white/55">
          Diese Umgebung befindet sich im Aufbau und ist noch nicht öffentlich.
          Bitte gib das Zugangs-Passwort ein.
        </p>

        {!configured ? (
          <p className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] leading-relaxed text-amber-200">
            Es ist kein Zugangs-Passwort hinterlegt. Solange die Variable
            <code className="mx-1 rounded bg-black/30 px-1">PREVIEW_PASSWORD</code>
            in der Umgebung fehlt, kommt niemand hinein — auch nicht mit leerer
            Eingabe.
          </p>
        ) : (
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
            className="mt-3 w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-navy-900 transition-colors hover:bg-brand/100"
          >
            Zugang
          </button>
          {error ? (
            <p className="mt-3 text-[13px] font-medium text-rose-400">Falsches Passwort.</p>
          ) : null}
        </form>
        )}
      </div>
    </main>
  );
}
