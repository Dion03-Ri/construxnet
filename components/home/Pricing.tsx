import Link from "next/link";
import { Check } from "lucide-react";
import { BTN_OUTLINE_DARK, D_MD, EYEBROW, LEAD, SECTION, SHELL } from "@/lib/ui";
import { PLANS } from "@/data/plans";
import { cn } from "@/lib/utils";

/**
 * Preisübersicht — nach dem Vorbild von Linear.
 *
 * Alle drei Stufen stehen gleichwertig da — keine ist hervorgehoben.
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

/**
 * Die Stufen kommen aus `data/plans.ts` — derselben Datei, aus der die
 * Kontoseite liest. Vorher stand die Liste hier ein zweites Mal; zwei
 * Listen fuer dieselben drei Stufen laufen auseinander, sobald sich eine
 * Zeile aendert.
 */
const TIERS = PLANS.map((p) => ({
  name: p.name,
  price: String(p.price),
  unit: p.unit,
  note: p.note,
  features: p.features,
  /** Der Weg ist fuer alle derselbe: /konto. Wer nicht angemeldet ist,
   *  wird dort ohnehin durch Anmeldung und Onboarding geschickt. */
  cta: p.key === "FREE" ? "Kostenlos starten" : `${p.name} wählen`,
  href: "/konto",
}));
export default function Pricing() {
  return (
    <section id="preise" className="border-t border-white/[0.12] bg-black">
      <div className={cn(SHELL, SECTION)}>
        <div className="max-w-2xl">
          <span className={EYEBROW}>Preise</span>
          <h2 className={cn(D_MD, "mt-5 text-white")}>
            Was Obtanet kostet.
          </h2>
          <p className={cn(LEAD, "mt-6 text-white/[0.72]")}>
            Das Netzwerk ist gratis. Bezahlt wird für das Bündeln.
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
                i > 0 && "border-t border-white/[0.12] lg:border-l lg:border-t-0 lg:pl-10",
                i < TIERS.length - 1 && "lg:pr-10",
                i === 0 && "pt-0",
              )}
            >
              <h3 className="text-[22px] font-bold tracking-tight text-white">{t.name}</h3>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-[15px] font-semibold text-white/[0.56]">CHF</span>
                <span className="font-display text-[52px] font-bold leading-none tabular-nums text-white">
                  {t.price}
                </span>
                {t.unit && <span className="text-[13.5px] text-white/[0.56]">{t.unit}</span>}
              </div>

              <p className="mt-5 text-[13.5px] leading-relaxed text-white/[0.56]">{t.note}</p>

              <Link
                href={t.href}
                className={cn(BTN_OUTLINE_DARK, "mt-7 w-full lg:w-auto")}
              >
                {t.cta}
              </Link>

              <ul className="mt-10 space-y-3.5 border-t border-white/[0.12] pt-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/[0.72]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 text-[12.5px] text-white/[0.5]">
          Preise exkl. MwSt. Die Vermittlungsgebühr auf abgeschlossene Bündel ist
          im Abo nicht enthalten und wird pro Abschluss ausgewiesen.
        </p>
      </div>
    </section>
  );
}
