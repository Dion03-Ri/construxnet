import { Construction } from "lucide-react";
import { D_MD, EYEBROW, COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Control Center",
  description: "Gap-Closer Control Center",
  robots: { index: false, follow: false },
};

const MODULES = [
  {
    title: "Pools nahe Schwelle",
    text: "Bündel kurz vor Ausschreibungsstart — Teilnehmer und Deadline.",
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
    text: "Deadlines, Regionen und Mindestteilnehmer konfigurieren.",
  },
];

export default function AdminControlPage() {
  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <div className={COLUMN}>
      <header className="mb-8 border-b border-white/[0.12] pb-8">
        <span className={cn(EYEBROW, "block")}>Intern</span>
        <h1 className={cn(D_MD, "mt-3 text-white")}>Gap-Closer Control Center</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/[0.56]">
          Pools nahe der nächsten Rabattschwelle überwachen und gezielt aktivieren.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand/90">
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die folgenden Module folgen in den nächsten Iterationen.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <div
            key={m.title}
            className="rounded-lg border border-dashed border-white/[0.12] bg-white/[0.03] p-5"
          >
            <h3 className="font-semibold text-white/[0.72]">{m.title}</h3>
            <p className="mt-1.5 text-sm text-white/[0.72]">{m.text}</p>
          </div>
        ))}
      </div>
      </div>
    </main>
  );
}
