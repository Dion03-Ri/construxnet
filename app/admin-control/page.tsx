import { Gauge, Construction } from "lucide-react";

export const metadata = {
  title: "Control Center",
  description: "Gap-Closer Control Center",
  robots: { index: false, follow: false },
};

const MODULES = [
  {
    title: "Pools nahe Schwelle",
    text: "Aktive Pools bei 90–95 % zur nächsten Tier-Stufe.",
  },
  {
    title: "Gap-Closer Alerts",
    text: "One-Click-Benachrichtigung an Schlüssellieferanten.",
  },
  {
    title: "Plattform-Kennzahlen",
    text: "Volumen, Abschlüsse und Kommissionen im Überblick.",
  },
  {
    title: "Pool-Verwaltung",
    text: "Deadlines, Regionen und Tier-Ziele konfigurieren.",
  },
];

export default function AdminControlPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
          <Gauge className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gap-Closer Control Center
          </h1>
          <p className="mt-2 max-w-2xl text-white/55">
            Interner Admin-Bereich — Pools nahe der nächsten Rabattschwelle
            überwachen und gezielt aktivieren.
          </p>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand/90">
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die folgenden Module folgen in den nächsten Iterationen.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <div
            key={m.title}
            className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.03] p-5"
          >
            <h3 className="font-semibold text-white/75">{m.title}</h3>
            <p className="mt-1.5 text-sm text-white/55">{m.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
