import { cn } from "@/lib/utils";
import { SHELL } from "@/lib/ui";

/**
 * Vertrauensanker unter dem Hero — als schmaler Streifen, nicht als Raster.
 *
 * Vorher standen die vier Punkte als Vierspalter mit Haarlinie oben, jeder
 * mit Kürzel, Titel und Erklärsatz. Dasselbe Raster benutzten auch der
 * Ablauf, die Smart Pools und die Preisstufen — vier Abschnitte, eine
 * Form, gleiche Abstände. Genau das lässt eine Seite gebaut statt
 * entworfen aussehen.
 *
 * Jetzt ist es ein Streifen: vier Kürzel in einer Zeile, getrennt durch
 * senkrechte Haarlinien, dahinter je drei Wörter. Er ist flach, dicht und
 * kurz — und damit das Gegenteil des grossen Hero darüber und der beiden
 * hohen Karten darunter. Der Wechsel der Höhen macht den Rhythmus.
 *
 * Das Vorbild (Revolut) zeigt hier Nutzerzahlen. Die haben wir vor dem
 * Start nicht, und erfundene Zahlen wären das Gegenteil von Vertrauen.
 * Also das, was nachprüfbar ist.
 */
const ANCHORS = [
  { k: "KBOB", t: "Preisbasis des Bundes" },
  { k: "SIA 118", t: "Schweizer Vertragswerk" },
  { k: "CHE", t: "Firmen verifiziert" },
  { k: "CH", t: "Daten in der Schweiz" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-white/[0.07] bg-navy-950 text-white">
      <div className={cn(SHELL, "py-8 sm:py-10")}>
        <dl className="grid grid-cols-2 gap-y-7 sm:grid-cols-4 sm:gap-y-0">
          {ANCHORS.map((a, i) => (
            <div
              key={a.k}
              className={cn(
                "min-w-0",
                i > 0 && "sm:border-l sm:border-white/[0.12] sm:pl-6",
                i < ANCHORS.length - 1 && "sm:pr-6",
                i % 2 === 1 && "border-l border-white/[0.12] pl-5 sm:pl-6",
              )}
            >
              <dt className="font-display text-[19px] font-bold leading-none tracking-tight text-brand sm:text-[21px]">
                {a.k}
              </dt>
              <dd className="mt-2 text-[12.5px] leading-snug text-white/45">{a.t}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
