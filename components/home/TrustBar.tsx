import { cn } from "@/lib/utils";
import { EYEBROW } from "@/lib/ui";

/**
 * Vertrauensanker unter dem Hero.
 *
 * Das Vorbild (Revolut) zeigt an dieser Stelle Nutzerzahlen und Auszeichnungen.
 * Beides haben wir vor dem Start nicht — und erfundene Zahlen wären das
 * Gegenteil von Vertrauen. Also stehen hier die vier Dinge, die nachprüfbar
 * sind: die Preisbasis, das Vertragswerk, die Prüfung der Firmen und der
 * Ort der Daten.
 *
 * Sobald es echte Zahlen gibt, tritt hier eine Zahlenreihe daneben.
 */
const ANCHORS = [
  {
    k: "KBOB",
    t: "Preisbasis des Bundes",
    d: "Jedes Angebot ist gegen den offiziellen Referenzpreis messbar.",
  },
  {
    k: "SIA 118",
    t: "Schweizer Vertragswerk",
    d: "Zuschläge laufen über die übliche Norm, nicht über Eigenbau.",
  },
  {
    k: "CHE",
    t: "Firmen verifiziert",
    d: "Handelsregister-Nummer geprüft, keine anonymen Anbieter.",
  },
  {
    k: "CH",
    t: "Daten in der Schweiz",
    d: "Betrieb und Ablage unter Schweizer Recht.",
  },
];

export default function TrustBar() {
  return (
    <section className="border-y border-white/[0.07] bg-navy-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <span className={cn(EYEBROW, "block")}>Worauf du dich stützen kannst</span>

        <dl className="mt-9 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {ANCHORS.map((a) => (
            <div key={a.k} className="border-t border-white/15 pt-5">
              <dt className="font-display text-[22px] font-bold leading-none tracking-tight text-brand">
                {a.k}
              </dt>
              <dd className="mt-4">
                <div className="text-[15px] font-bold text-white">{a.t}</div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">{a.d}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
