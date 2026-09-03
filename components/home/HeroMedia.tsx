"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO_URL, HERO_VIDEO_POSTER } from "@/data/media";

/**
 * Bewegter Hintergrund des Hero.
 *
 * Das Standbild liegt immer darunter und wird sofort gezeigt. Das Video
 * legt sich erst darüber, wenn es wirklich läuft — so gibt es keinen
 * schwarzen Rahmen, während es lädt, und keinen Sprung, wenn es scheitert.
 *
 * Kein Video, wenn:
 * · das Betriebssystem reduzierte Bewegung verlangt,
 * · der Browser das Abspielen verweigert (Datensparmodus, alte Geräte).
 * In beiden Fällen bleibt schlicht das Standbild stehen. Das ist kein
 * Notbehelf, sondern der geplante zweite Zustand.
 */
export default function HeroMedia() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!HERO_VIDEO_URL) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const onPlaying = () => setPlaying(true);
    el.addEventListener("playing", onPlaying);
    // `play()` gibt ein Versprechen zurück, das der Browser ablehnen darf.
    // Ohne diesen Fang landet die Ablehnung als Fehler in der Konsole.
    void el.play().catch(() => undefined);

    return () => el.removeEventListener("playing", onPlaying);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_VIDEO_POSTER}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[62%_28%]"
      />
      {HERO_VIDEO_URL && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER}
          className={`absolute inset-0 h-full w-full object-cover object-[62%_28%] transition-opacity duration-1000 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
