import type { PhotoSlot as Slot } from "@/data/media";

/**
 * Ein Bildplatz, der auch ohne Bild etwas taugt.
 *
 * Liegt ein Bild vor, steht es da. Liegt keins vor, steht kein toter grauer
 * Kasten da, sondern der Platz in richtiger Grösse mit der Beschreibung, was
 * dorthin gehört und wonach man sucht. So lässt sich die Seite beurteilen,
 * bevor das Material gefunden ist — und wer sucht, weiss wonach.
 */
export default function PhotoSlot({
  slot,
  className = "",
}: {
  slot: Slot;
  className?: string;
}) {
  if (slot.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slot.src}
        alt={slot.alt}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col justify-between bg-white/10 p-4 ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg,transparent 0 9px,rgba(15,23,42,0.05) 9px 10px)",
      }}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
        Bildplatz
      </span>
      <div>
        <p className="text-[12.5px] font-semibold leading-snug text-white/70">{slot.alt}</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">Suche: {slot.search}</p>
      </div>
    </div>
  );
}
