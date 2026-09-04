import { cn } from "@/lib/utils";

/**
 * Die Massband-Linie — das Erkennungszeichen von Obtanet.
 *
 * Sie ersetzt den Rahmen. Wo bisher eine Karte mit runden Ecken und Rand
 * stand, steht jetzt eine Linie mit feinen Strichen wie auf einer
 * Nivellierlatte: alle acht Pixel ein kurzer, alle vierzig ein langer in
 * Gold. Sie trennt und ordnet, ohne einzusperren.
 *
 * Warum das und nicht irgendein Zierstrich: sie kommt aus dem Handwerk,
 * um das es hier geht. Ein Bauführer erkennt sie sofort, und keine andere
 * Plattform hat sie. Das ist der Unterschied zwischen einer Seite, die
 * nach Baukasten aussieht, und einer mit eigener Handschrift.
 *
 * `dense` für Datenlisten (engere Teilung), sonst die weite Teilung.
 */
export default function TickRule({
  className,
  dense = false,
}: {
  className?: string;
  dense?: boolean;
}) {
  const short = dense ? 6 : 8;
  const long = dense ? 30 : 40;

  return (
    <div className={cn("relative h-2.5 w-full", className)} aria-hidden>
      {/* Grundlinie */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.14]" />
      {/* Kurze Striche */}
      <div
        className="absolute inset-x-0 bottom-0 h-[5px]"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, rgba(255,255,255,0.16) 0 1px, transparent 1px ${short}px)`,
        }}
      />
      {/* Lange Striche in Gold */}
      <div
        className="absolute inset-x-0 bottom-0 h-2.5"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, rgba(217,144,0,0.75) 0 1px, transparent 1px ${long}px)`,
        }}
      />
    </div>
  );
}
