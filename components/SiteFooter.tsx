import Link from "next/link";
import { SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Der Fuss der oeffentlichen Seiten.
 *
 * Stand vorher als Block direkt in `app/page.tsx`. Seit es eine zweite
 * oeffentliche Seite gibt (/so-funktioniert-es), waere er dort ein zweites
 * Mal abgeschrieben worden — also einmal hier.
 *
 * Ohne eigene Rechtszeile am unteren Rand: die liefert `AppShell` fuer
 * alle Seiten. Auf der Startseite standen dadurch bisher zwei
 * Copyright-Zeilen uebereinander.
 */
const COLS: { h: string; links: [string, string][] }[] = [
  {
    h: "Plattform",
    links: [
      ["So funktioniert es", "/so-funktioniert-es"],
      ["Feed", "/feed"],
      ["Netzwerk", "/network"],
      ["Smart Pools", "/pools"],
      ["KBOB Index", "/kbob"],
    ],
  },
  {
    h: "Beschaffung",
    links: [
      ["Bedarf melden", "/beschaffung"],
      ["Nachrichten", "/messages"],
      ["Dashboard", "/dashboard"],
    ],
  },
  { h: "Konto", links: [["Registrieren", "/sign-up"], ["Login", "/sign-in"]] },
  {
    h: "Rechtliches",
    links: [["Impressum", "/impressum"], ["AGB", "/agb"], ["Datenschutz", "/datenschutz"]],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.12] bg-[#16181a]">
      <div className={cn(SHELL, "grid grid-cols-2 gap-8 py-12 md:grid-cols-5")}>
        <div className="col-span-2 md:col-span-1">
          {/* Die echte Wortmarke, kein Symbolkaestchen mit Text daneben:
              dessen Flex-Abstand lief sichtbar zwischen „Obta" und „net". */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-hell.png" alt="Obtanet" className="h-7 w-auto" />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/[0.72]">
            Das B2B-Netzwerk der Schweizer Baubranche — vernetzen, bündeln, sparen.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.h}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/[0.56]">{col.h}</div>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] text-white/[0.72] transition-colors hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
