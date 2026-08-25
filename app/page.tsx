import Link from "next/link";
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  FileText,
  ScanLine,
  TrendingDown,
  Building2,
  Factory,
  Gauge,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Smart Pools",
    text: "Regionale Bündelung von Materialbedarf (Beton, Armierungsstahl, Kies) zu Grossmengen — für Volumenrabatte bis 20 %.",
  },
  {
    icon: ShieldCheck,
    title: "WEKO-konform",
    text: "Strikte Anonymität: Teilnehmer sehen nur aggregierte Poolvolumen, nie einzelne Mitbewerber.",
  },
  {
    icon: FileText,
    title: "SIA-118 Verträge",
    text: "Automatisierte Vertragsgenerierung nach Schweizer Norm bei Pool-Abschluss.",
  },
  {
    icon: ScanLine,
    title: "Lieferschein-OCR",
    text: "Lieferscheine fotografieren, automatisch erfassen und mit Vertrag abgleichen.",
  },
];

const ROLES = [
  {
    href: "/buyer",
    icon: Building2,
    title: "Bauunternehmer",
    text: "Pools beitreten, Tier-Fortschritt verfolgen, Lieferscheine erfassen.",
  },
  {
    href: "/supplier",
    icon: Factory,
    title: "Lieferant",
    text: "Regionale Bündel-Ausschreibungen, Sealed-Bid-Gebote, Kapazitätsplanung.",
  },
  {
    href: "/admin",
    icon: Gauge,
    title: "Admin / Gap-Closer",
    text: "Pools nahe der Schwelle überwachen und gezielt aktivieren.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300">
          <TrendingDown className="h-3.5 w-3.5 text-pool-green" />
          Volumenrabatte für den Schweizer Bau
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-neutral-50 sm:text-6xl">
          Baumaterial gemeinsam einkaufen.{" "}
          <span className="text-kbob-blue">Günstiger bauen.</span>
        </h1>
        <p className="max-w-2xl text-lg text-neutral-400">
          ConstruxNet bündelt den Materialbedarf Schweizer Bauunternehmen zu
          regionalen Smart Pools — für Grossmengenrabatte, die sonst nur
          Konzernen offenstehen. WEKO-konform, anonym, mit automatischer
          SIA-118-Vertragsabwicklung.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/preise"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-kbob-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-kbob-blue/30 transition-colors hover:bg-kbob-blue/90"
          >
            Preisvergleich ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/buyer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-neutral-100 transition-colors hover:bg-white/10"
          >
            Als Bauunternehmer starten
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kbob-blue/15 text-kbob-blue">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold text-neutral-100">{f.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-400">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Roles */}
      <section className="py-20 sm:py-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-100">
          Drei Rollen, eine Plattform
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-neutral-400">
          Jeder Marktteilnehmer erhält sein eigenes Cockpit.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:border-kbob-blue/40 hover:bg-white/[0.08]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-neutral-100">
                <r.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 flex items-center gap-1.5 font-semibold text-neutral-100">
                {r.title}
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </h3>
              <p className="mt-1.5 text-sm text-neutral-400">{r.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-neutral-600">
        ConstruxNet — Smart Bündelung für Schweizer Baumaterialien
      </footer>
    </main>
  );
}
