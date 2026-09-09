import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Das Blatt mit Kopfband — die Form, in der Seiten stehen, auf denen
 * gelesen und gearbeitet wird.
 *
 * Die Regel steht in `lib/ui.ts`: wo gelesen und geschrieben wird, ist
 * Papier; wo Zahlen und Markt stehen, ist es dunkel. Beschaffung und
 * „Profil bearbeiten" hatten die Form schon von Hand — sie kam vor der
 * dritten und vierten Seite genau einmal zu oft abgeschrieben.
 *
 * Das Kopfband wechselt zwischen Navy und Schwarz. Das ist kein
 * Geschmack, sondern der Rhythmus, den der Nutzer wollte: eine Form, die
 * auf jeder Seite in derselben Farbe erscheint, ist eine Schablone — und
 * eine Schablone ist genau das, was eine Oberflaeche erzeugt wirken
 * laesst. Wer eine Seite ergaenzt, nimmt die Farbe, die die
 * Nachbarseite nicht hat.
 *
 * Belegt: Beschaffung Navy · Profil bearbeiten Schwarz · Firmenprofil
 * Navy · Fristen Navy · Empfangene Anfragen Schwarz ·
 * Benachrichtigungen Navy · Lieferscheine Schwarz.
 */
export default function SheetPage({
  band = "navy",
  eyebrow,
  title,
  lead,
  back,
  wide = false,
  children,
}: {
  band?: "navy" | "black";
  eyebrow: string;
  title: string;
  lead?: string;
  /** Rücksprung über dem Blatt — Ziel und Beschriftung. */
  back?: { href: string; label: string };
  /** Ohne Spaltenbreite: für Inhalte, die die Breite brauchen. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const navy = band === "navy";
  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <div className={wide ? undefined : COLUMN}>
        {back && (
          <Link
            href={back.href}
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/[0.56] transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" /> {back.label}
          </Link>
        )}

        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white text-slate-900">
          <header
            className={cn(
              "px-6 py-7 text-white sm:px-9 sm:py-9",
              navy ? "bg-accent-600" : "bg-black",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.16em]",
                navy ? "text-brand-100" : "text-brand",
              )}
            >
              {eyebrow}
            </span>
            <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
              {title}
            </h1>
            {lead && (
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/[0.72]">{lead}</p>
            )}
          </header>

          <div className="px-6 py-7 sm:px-9 sm:py-9">{children}</div>
        </div>
      </div>
    </main>
  );
}
