"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Der Film der Smart-Pools-Sektion.
 *
 * Warum das ein eigenes Bauteil mit Javascript ist und nicht einfach ein
 * `<video autoPlay loop>`:
 *
 * Ein Film, der ohne Zutun laeuft und nie aufhoert, ist fuer Menschen mit
 * eingestellter Bewegungsreduktion eine Zumutung — und mit `autoPlay` im
 * Markup gibt es keine Moeglichkeit, ihn fuer sie anzuhalten. Hier startet
 * er deshalb erst nach dem Laden, und nur wenn niemand widersprochen hat.
 * Wer Bewegung reduziert hat, bekommt das Standbild und eine Leiste, um
 * ihn selbst zu starten. Die Einstellung wird auch nachtraeglich beachtet:
 * wer sie waehrend des Besuchs umstellt, sieht es sofort.
 *
 * Der Film selbst ist so geschnitten, dass die Schleife traegt: kein
 * weisses erstes Bild (das Aufnahmewerkzeug liefert eines), rund zwei
 * Zehntel Schwarz am Anfang, der Abbinder steht knapp drei Sekunden, dann
 * gut drei Zehntel Schwarz. Der Uebergang ist damit ein Atemzug und kein
 * Ruckler. Quelle und Rezept: design/film/.
 */
export default function PoolFilm() {
  const film = useRef<HTMLVideoElement>(null);
  const [ruhig, setRuhig] = useState(false);

  useEffect(() => {
    const wunsch = window.matchMedia("(prefers-reduced-motion: reduce)");
    const anwenden = () => {
      setRuhig(wunsch.matches);
      const v = film.current;
      if (!v) return;
      if (wunsch.matches) {
        v.pause();
        v.currentTime = 0;
      } else {
        /* Schlaegt fehl, wenn der Browser das Abspielen ohne Klick
           verweigert. Dann bleibt das Standbild stehen — kein Fehler. */
        void v.play().catch(() => {});
      }
    };
    anwenden();
    wunsch.addEventListener("change", anwenden);
    return () => wunsch.removeEventListener("change", anwenden);
  }, []);

  return (
    <video
      ref={film}
      className="w-full rounded-2xl border border-white/[0.12]"
      src="/smart-pools.webm"
      poster="/smart-pools-poster.png"
      muted
      loop
      playsInline
      preload="auto"
      controls={ruhig}
      aria-label="Wie aus vier Bestellungen ein Volumen wird: allein ist jede Bestellung zu klein, gebündelt ergeben sie 500 m³, drei Lieferanten bieten verdeckt darauf, und der Rabatt verteilt sich nach der eingebrachten Menge."
    />
  );
}
