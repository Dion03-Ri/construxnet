import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Kopfband des Feeds.
 *
 * Links das Gemessene, rechts das Anklickbare.
 *
 * Hier stand vorher eine Profilkarte mit Logo, Firmenname, Rolle und Ort —
 * an der prominentesten Stelle der Seite Angaben, die man über die eigene
 * Firma bereits weiss. Die gehören ins Dashboard und stehen dort auch.
 *
 * Die Verweise sind bewusst keine Liste mit Symbolen und Rahmen, sondern
 * eine Wolke: verschiedene Grössen, leicht versetzte Höhen, aber eine
 * Schrift, eine Farbe und ein Verhalten. Ohne diese Einschränkung wird aus
 * „durcheinander" sofort „unordentlich".
 *
 * „Verbindungen" ist als Verweis gestrichen — es führte an dieselbe Stelle
 * wie „Beschaffungspartner finden". Als Zahl bleibt es, das ist ein
 * Bestand und kein zweiter Weg zum selben Ort.
 */

export type FeedStat = {
  href: string;
  /** Schon fertig formatiert — „48", „17 Std". */
  value: string;
  label: string;
};

const LINKS: {
  href: string;
  label: string;
  /** Schriftgrad und Höhenversatz sind von Hand gesetzt, nicht gewürfelt:
   *  gross steht, was oft gebraucht wird. Der Versatz gilt erst ab `lg` —
   *  auf einer schmalen Spalte bricht die Wolke um, und versetzte Zeilen
   *  laufen dann ineinander. */
  size: string;
  shift: string;
  badge?: number;
}[] = [
  { href: "/messages", label: "Nachrichten", size: "text-[21px]", shift: "" },
  { href: "/termine", label: "Fristen", size: "text-[15px]", shift: "lg:translate-y-[7px]" },
  { href: "/network", label: "Beschaffungspartner finden", size: "text-[18px]", shift: "lg:-translate-y-[5px]" },
  { href: "/network/requests", label: "Empfangene Anfragen", size: "text-[14px]", shift: "lg:translate-y-[9px]" },
  { href: "/pools/saved", label: "Gespeicherte Pools", size: "text-[16px]", shift: "lg:-translate-y-[2px]" },
];

export default function FeedHead({
  stats,
  badges = {},
}: {
  stats: FeedStat[];
  /** Zahlen an einzelnen Verweisen, nach Adresse. */
  badges?: Record<string, number>;
}) {
  return (
    <div className="flex flex-col gap-9 border-b border-white/[0.12] pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap gap-x-11 gap-y-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group block">
            <div className="font-display text-[34px] font-medium leading-none tabular-nums text-white transition-colors group-hover:text-brand">
              {s.value}
            </div>
            <div className="mt-2 text-[12.5px] text-white/[0.56]">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex max-w-[560px] flex-wrap items-baseline gap-x-8 gap-y-3 lg:gap-y-1 lg:justify-end">
        {LINKS.map((l) => {
          const n = badges[l.href];
          return (
            <Link
              key={l.label}
              href={l.href}
              className={cn(
                "inline-flex items-baseline gap-1.5 font-medium text-white/[0.56] transition-colors hover:text-brand",
                l.size,
                l.shift,
              )}
            >
              {l.label}
              {n ? <span className="text-[11px] font-bold tabular-nums text-brand">{n}</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
