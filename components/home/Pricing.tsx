import Link from "next/link";
import { Check } from "lucide-react";
import { D_MD, LEAD, EYEBROW, SECTION, BTN_GOLD, BTN_OUTLINE_DARK } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Preisübersicht — nach dem Vorbild von Linear.
 *
 * Kein Kästchen um die Stufen. Sie stehen nebeneinander auf derselben
 * Fläche und werden nur durch eine senkrechte Haarlinie getrennt. Das ist
 * der Unterschied zu einer Baukastenseite: dort bekommt jede Stufe eine
 * eigene Karte mit Rand und Schatten, hier trägt die Ordnung allein die
 * Linie und der Abstand.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  ACHTUNG — DIE ZAHLEN SIND PLATZHALTER
 *  0 / 79 / 189 sind Testwerte zum Ansehen des Aufbaus, ausdrücklich
 *  so vereinbart. Sie sind NICHT bestätigt und dürfen nicht in Werbung,
 *  AGB oder Verträge übernommen werden, bevor das Preismodell steht.
 *  Siehe CLAUDE.md, Punkt 0 der Launch-Liste.
 * ═══════════════════════════════════════════════════════════════════
 */

type Tier = {
  name: string;
  price: string;
  unit?: string;
  note: string;
  cta: string;
  href: string;
  /** Nur EINE Stufe wird hervorgehoben — sonst hebt sich keine ab. */
  featured?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Gratis",
    price: "0",
    note: "Für Firmen, die das Netzwerk kennenlernen.",
    cta: "Kostenlos starten",
    href: "/sign-up",
    features: [
      "Firmenprofil mit CHE-Verifizierung",
      "Netzwerk, Verbindungen und Nachrichten",
      "KBOB-Referenzpreise ansehen",
      "Teilnahme an einem Smart Pool",
    ],
  },
  {
    name: "Pro",
    price: "79",
    unit: "pro Monat",
    note: "Für Baufirmen, die regelmässig einkaufen.",
    cta: "Pro wählen",
    href: "/sign-up",
    featured: true,
    features: [
      "Alles aus Gratis",
      "Unbegrenzt Smart Pools",
      "Eigene Ausschreibungen im Sealed-Bid",
      "Preisverlauf und eigene Abschlüsse",
      "SIA-118-Vertragswerk",
      "Lieferschein-Abgleich",
    ],
  },
  {
    name: "Enterprise",
    price: "189",
    unit: "pro Monat",
    note: "Für Gruppen mit mehreren Niederlassungen.",
    cta: "Vertrieb kontaktieren",
    href: "/sign-up",
    features: [
      "Alles aus Pro",
      "Mehrere Niederlassungen unter einem Konto",
      "KI-Materialabgleich für Ausschreibungen",
      "Schnittstelle zur eigenen ERP",
      "Fester Ansprechpartner",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="preise" className="border-t border-white/[0.08] bg-[#040810]">
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", SECTION)}>
        <div className="max-w-2xl">
          <span className={EYEBROW}>Preise</span>
          <h2 className={cn(D_MD, "mt-5 text-white")}>
            Erst zahlen, wenn du sparst.
          </h2>
          <p className={cn(LEAD, "mt-6 text-white/55")}>
            Das Netzwerk ist gratis. Bezahlt wird für das Bündeln — und der
            Mindestvorteil steht vorher fest.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-y-14 lg:mt-20 lg:grid-cols-3 lg:gap-y-0">
          {TIERS.map((t, i) => (
            <div
              key={t.name}
              className={cn(
                // Nur senkrechte Haarlinien zwischen den Stufen — kein Rahmen
                // um sie herum. Auf dem Handy wird daraus eine waagrechte.
                "pt-14 lg:pt-0",
                i > 0 && "border-t border-white/[0.08] lg:border-l lg:border-t-0 lg:pl-10",
                i < TIERS.length - 1 && "lg:pr-10",
                i === 0 && "pt-0",
              )}
            >
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-[22px] font-bold tracking-tight text-white">{t.name}</h3>
                {t.featured && (
                  <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-navy-950">
                    Empfohlen
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-[15px] font-semibold text-white/45">CHF</span>
                <span
                  className={cn(
                    "font-display text-[52px] font-bold leading-none tabular-nums",
                    t.featured ? "text-brand" : "text-white",
                  )}
                >
                  {t.price}
                </span>
                {t.unit && <span className="text-[13.5px] text-white/40">{t.unit}</span>}
              </div>

              <p className="mt-5 text-[13.5px] leading-relaxed text-white/45">{t.note}</p>

              <Link
                href={t.href}
                className={cn(t.featured ? BTN_GOLD : BTN_OUTLINE_DARK, "mt-7 w-full lg:w-auto")}
              >
                {t.cta}
              </Link>

              <ul className="mt-10 space-y-3.5 border-t border-white/[0.08] pt-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 text-[12.5px] text-white/35">
          Preise exkl. MwSt. Die Vermittlungsgebühr auf abgeschlossene Bündel ist
          im Abo nicht enthalten und wird pro Abschluss ausgewiesen.
        </p>
      </div>
    </section>
  );
}
