import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LEGAL, isOpen } from "@/data/legal";
import { COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

/** Ein noch nicht gesetzter Wert — sichtbar, nicht versteckt. */
export function Fill({ value }: { value: string }) {
  if (!isOpen(value)) return <>{value}</>;
  return (
    <span
      title="Diese Angabe fehlt noch"
      className="rounded border border-brand/40 bg-brand-50 px-1.5 py-0.5 text-[0.9em] font-semibold text-brand-700"
    >
      {value.replace(/^\[\[|\]\]$/g, "")}
    </span>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-9 text-[17px] font-bold tracking-tight text-slate-900">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-[14.5px] font-semibold text-slate-900">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-[1.7] text-slate-700">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 space-y-2 text-[15px] leading-[1.7] text-slate-700">{children}</ul>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-brand" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Kleine Fussnote auf ein Gesetz — belegt, worauf sich ein Abschnitt stützt. */
export function Ref({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] text-slate-500"> ({children})</span>;
}

const NAV = [
  { href: "/impressum", label: "Impressum" },
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
];

export default function LegalPage({
  title,
  lead,
  active,
  children,
}: {
  title: string;
  lead: string;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <div className={COLUMN}>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/[0.56] transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Zur Startseite
      </Link>

      {/* Ein Rechtstext ist der reinste Fall von Papier: nichts als
          Fliesstext, den jemand von oben bis unten liest. Auf schwarzem
          Grund ist das nach zwei Absätzen anstrengend.

          Das Kopfband ist schwarz, wie bei „Profil bearbeiten" — die
          Beschaffung und das Firmenprofil tragen Navy. Der Wechsel ist
          Absicht: eine Schablone, die auf jeder Seite gleich aussieht,
          ist genau das, was eine Oberfläche erzeugt wirken lässt.

          Das Raster im alten Kopf ist weg. Ein Millimeterpapier-Muster
          hinter einer Überschrift zeigt nichts. */}
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white text-slate-900">
        <header className="bg-black px-6 py-7 text-white sm:px-9 sm:py-9">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Rechtliches
          </span>
          <h1 className="mt-3 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/[0.72]">{lead}</p>
          <p className="mt-4 text-[12px] text-white/[0.5]">Stand: {LEGAL.stand}</p>

          {/* Die drei Rechtsseiten als Reiterzeile im Band selbst — sie
              gehören zusammen und brauchen keine eigene Knopfleiste. */}
          <nav className="no-scrollbar -mb-px mt-7 flex gap-6 overflow-x-auto border-b border-white/[0.12]">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13.5px] font-semibold transition-colors",
                  active === n.href
                    ? "border-brand text-white"
                    : "border-transparent text-white/[0.56] hover:text-white",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>

        <article className="px-6 py-8 sm:px-9 sm:py-10 [&>*:first-child]:mt-0">{children}</article>
      </div>
      </div>
    </main>
  );
}
