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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Gauge className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Gap-Closer Control Center
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Interner Admin-Bereich — Pools nahe der nächsten Rabattschwelle
            überwachen und gezielt aktivieren.
          </p>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand/90">
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die folgenden Module folgen in den nächsten Iterationen.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <div
            key={m.title}
            className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5"
          >
            <h3 className="font-semibold text-slate-700">{m.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{m.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
