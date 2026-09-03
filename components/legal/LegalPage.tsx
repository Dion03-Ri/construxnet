import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { LEGAL, isOpen } from "@/data/legal";
import { PANEL } from "@/lib/ui";
import { cn } from "@/lib/utils";

/** Ein noch nicht gesetzter Wert — sichtbar, nicht versteckt. */
export function Fill({ value }: { value: string }) {
  if (!isOpen(value)) return <>{value}</>;
  return (
    <span
      title="Diese Angabe fehlt noch"
      className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[0.9em] font-semibold text-brand-700"
    >
      {value.replace(/^\[\[|\]\]$/g, "")}
    </span>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-[17px] font-bold tracking-tight text-white">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 text-[14.5px] font-semibold text-white">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2.5 text-[14px] leading-relaxed text-white/70">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-2.5 space-y-1.5 text-[14px] leading-relaxed text-white/70">{children}</ul>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Kleine Fussnote auf ein Gesetz — belegt, worauf sich ein Abschnitt stützt. */
export function Ref({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] text-white/40"> ({children})</span>;
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
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/55 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Zur Startseite
      </Link>

      <header className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-900 p-5 text-white sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <Scale className="h-5 w-5 text-brand" /> {title}
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{lead}</p>
          <p className="mt-2 text-[12px] text-white/40">Stand: {LEGAL.stand}</p>
        </div>
      </header>

      <nav className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              active === n.href
                ? "bg-navy-900 text-white"
                : "border border-white/[0.08] bg-[#0B1522] text-white/55 hover:border-white/[0.16] hover:text-white",
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <article className={cn(PANEL, "mt-4 p-5 sm:p-7")}>{children}</article>
    </main>
  );
}
