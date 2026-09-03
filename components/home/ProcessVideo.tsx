import { PROCESS_VIDEO_URL, PROCESS_VIDEO_POSTER, PROCESS_VIDEO_LABEL } from "@/data/media";

/**
 * Das Ablauf-Video unter den vier Schritten.
 *
 * Bewusst ein einfaches <video> mit Bedienelementen und ohne Autostart: ein
 * Video, das von selbst losläuft, ist auf einer Geschäftsseite eher Störung
 * als Hilfe — und mobil kostet es fremde Daten.
 *
 * `preload="metadata"` lädt nur die Kopfdaten, nicht das ganze Video; das
 * Standbild kommt aus `poster`. Der Rahmen hat ein festes Seitenverhältnis
 * und `object-cover`: das Bild füllt ihn immer aus, notfalls werden die
 * Seiten beschnitten — kein schwarzer Balken, kein Springen beim Laden.
 *
 * Ohne hinterlegte Adresse wird nichts gerendert.
 */
export default function ProcessVideo() {
  if (!PROCESS_VIDEO_URL) return null;

  return (
    <figure className="mx-auto mt-6 max-w-4xl sm:mt-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#08111C] sm:rounded-[28px]">
        <video
          controls
          preload="metadata"
          playsInline
          poster={PROCESS_VIDEO_POSTER || undefined}
          aria-label={PROCESS_VIDEO_LABEL}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={PROCESS_VIDEO_URL} type="video/mp4" />
          Dein Browser kann dieses Video nicht abspielen.{" "}
          <a href={PROCESS_VIDEO_URL} className="underline">
            Video herunterladen
          </a>
        </video>
      </div>
      <figcaption className="mt-2.5 text-center text-[12px] text-slate-400">
        {PROCESS_VIDEO_LABEL}
      </figcaption>
    </figure>
  );
}
