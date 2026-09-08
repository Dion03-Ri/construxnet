"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS_VIDEO_URL, PROCESS_VIDEO_POSTER, PROCESS_VIDEO_LABEL } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * Der Ablauf als Video mit Kapiteln.
 *
 * Aufbau: links die vier Schritte als anklickbare Kapitel, rechts das
 * Video — gross, über den rechten Spaltenrand hinauslaufend. Die linke
 * Kante des Videos wird weich ausgeblendet, damit dort keine harte
 * Schnittkante gegen die Textspalte steht; das Bild wird nach links hin
 * immer weniger und geht in den Seitengrund über.
 *
 * Der Ausschnitt macht die Liste funktional statt dekorativ: ein Klick auf
 * „03 Sealed-Bid" springt im Video an die Stelle, und beim Abspielen
 * markiert sich das laufende Kapitel selbst. So arbeitet Stripe mit seinen
 * Produktvideos.
 *
 * Rahmen nach Revolut-Mass: 20 px Radius, kein Rand, kein Schatten —
 * Tiefe kommt aus der Fläche, nicht aus einer Linie.
 *
 * Ohne hinterlegte Videoadresse fällt der Baustein auf die reine Liste
 * zurück. Die Startseite funktioniert also, bevor das Video existiert.
 */

export type Chapter = {
  /** Überschrift des Schritts. */
  t: string;
  /** Ein Satz dazu. */
  d: string;
  /** Sekunde im Video, an der dieser Schritt beginnt. */
  at?: number;
};

export default function ProcessVideo({ chapters }: { chapters: Chapter[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const hasVideo = Boolean(PROCESS_VIDEO_URL);

  // Laufendes Kapitel mitführen. Ohne Zeitmarken bleibt es beim ersten.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      let i = 0;
      chapters.forEach((c, k) => {
        if (typeof c.at === "number" && v.currentTime >= c.at) i = k;
      });
      setActive(i);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [chapters]);

  function jump(i: number) {
    const v = ref.current;
    const at = chapters[i]?.at;
    setActive(i);
    if (v && typeof at === "number") {
      v.currentTime = at;
      void v.play().catch(() => undefined);
    }
  }

  const list = (
    <ol className={cn("relative z-10", hasVideo && "lg:max-w-sm")}>
      {chapters.map((c, i) => {
        const on = hasVideo && i === active;
        return (
          <li key={c.t}>
            <button
              type="button"
              onClick={() => jump(i)}
              disabled={!hasVideo}
              className={cn(
                "flex w-full items-baseline gap-5 border-t border-white/[0.12] py-6 text-left transition-colors",
                hasVideo ? "cursor-pointer hover:bg-white/[0.03]" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "font-display text-[26px] font-medium tabular-nums leading-none transition-colors sm:text-[30px]",
                  on ? "text-brand" : hasVideo ? "text-white/[0.4]" : "text-brand",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-[18px] font-semibold leading-snug tracking-tight transition-colors sm:text-[20px]",
                    on || !hasVideo ? "text-white" : "text-white/[0.72]",
                  )}
                >
                  {c.t}
                </span>
                <span className="mt-1.5 block text-[14px] leading-relaxed text-white/[0.56]">
                  {c.d}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  if (!hasVideo) return <div className="mt-14 border-b border-white/[0.12] lg:mt-16">{list}</div>;

  return (
    <div className="mt-14 grid grid-cols-1 items-center gap-y-10 lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-x-4">
      <div className="border-b border-white/[0.12] lg:border-b-0">{list}</div>

      {/* Das Video läuft nach rechts über den Spaltenrand hinaus und wird
          nach links hin ausgeblendet — kein harter Schnitt gegen den Text.
          Wichtig fürs Drehen: die linken ~14 % des Bildes verschwinden im
          Verlauf. Was zählt, gehört rechts der Bildmitte. */}
      <div className="relative lg:-mr-8 xl:-mr-20 2xl:-mr-32">
        <div
          className="overflow-hidden rounded-[20px] lg:[mask-image:linear-gradient(to_right,transparent,#000_14%)]"
        >
          <video
            ref={ref}
            controls
            preload="metadata"
            playsInline
            poster={PROCESS_VIDEO_POSTER || undefined}
            aria-label={PROCESS_VIDEO_LABEL}
            className="block aspect-[16/10] w-full bg-[#16181a] object-cover"
          >
            <source src={PROCESS_VIDEO_URL} type="video/mp4" />
            Dein Browser kann dieses Video nicht abspielen.{" "}
            <a href={PROCESS_VIDEO_URL} className="underline">
              Video herunterladen
            </a>
          </video>
        </div>
      </div>
    </div>
  );
}
