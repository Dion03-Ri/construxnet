/**
 * Bewehrungsstäbe mit Betonmanschetten — das Bildmotiv von Obtanet.
 *
 * Warum ausgerechnet das: die Startseite braucht ein Objekt, das ohne
 * Bildunterschrift funktioniert und das niemand sonst hat. Bewehrungsstahl
 * und Beton sind die beiden Materialien, um die sich die ganze Plattform
 * dreht — und ein Bündel Stäbe *ist* das Produkt, nicht bloss Dekoration.
 *
 * Alles ist aus Verläufen gebaut, kein Bild, keine Lizenz, kein Ladegewicht.
 * Die Stäbe driften sehr langsam und unterschiedlich schnell auf und ab.
 */

type Rod = {
  /** Waagrechte Lage in Prozent der Breite. */
  x: number;
  /** Oberkante des Stabs in Prozent der Höhe. */
  top: number;
  /** Länge des Stabs in Prozent der Höhe. */
  h: number;
  /** Abstand der Manschette von der Oberkante des Stabs, in Prozent der Höhe. */
  collar: number;
  /** Höhe der Manschette in Prozent der Höhe. */
  ch: number;
  /** Dauer eines Driftzyklus in Sekunden. */
  dur: number;
  /** Versatz, damit die Stäbe nicht im Gleichschritt laufen. */
  delay: number;
};

// Die Reihe steigt von links nach rechts an — wie ein Volumen, das wächst.
const RODS: Rod[] = [
  { x: 4, top: 40, h: 50, collar: 30, ch: 20, dur: 9.5, delay: 0 },
  { x: 17, top: 24, h: 54, collar: 20, ch: 14, dur: 11, delay: -1.8 },
  { x: 30, top: 28, h: 42, collar: 0, ch: 24, dur: 8.5, delay: -3.4 },
  { x: 43, top: 12, h: 48, collar: 22, ch: 13, dur: 12, delay: -0.9 },
  { x: 56, top: 24, h: 40, collar: 20, ch: 15, dur: 10, delay: -4.2 },
  { x: 69, top: 17, h: 44, collar: 8, ch: 21, dur: 9, delay: -2.6 },
  { x: 82, top: 8, h: 42, collar: 8, ch: 13, dur: 11.5, delay: -5.1 },
];

/* Der Stahl: ein Zylinder ist nichts als ein Verlauf mit einem harten
   Glanzpunkt links der Mitte und einer tiefen Kante aussen. */
const STEEL =
  "linear-gradient(90deg,#0B0D0F 0%,#3A4046 14%,#8E979E 30%,#E8ECEF 44%,#FFFFFF 49%,#C3CACF 57%,#6B747B 72%,#2A2F34 88%,#0A0C0E 100%)";

/* Die Rippen des Bewehrungsstahls — schräg, eng, nur als Schattenkante. */
const RIBS =
  "repeating-linear-gradient(102deg,rgba(0,0,0,0) 0 5px,rgba(0,0,0,0.42) 5px 6.5px)";

/* Der Beton: gröber, matter, mit einem Anflug Gold aus der Hausfarbe. */
const CONCRETE =
  "linear-gradient(90deg,#141719 0%,#4A4F53 16%,#8E9297 34%,#B6BABD 46%,#9A9EA2 58%,#5C6165 76%,#17191B 100%)";

export default function RebarArt({ className = "" }: { className?: string }) {
  // Bewusst OHNE eigene Positionierung: der Aufrufer entscheidet, ob das Bild
  // absolut am Rand klebt oder im Fluss steht. Stuende hier `relative`, wuerde
  // es das `absolute` von aussen schlagen — Tailwind entscheidet nach der
  // Reihenfolge im Stylesheet, nicht nach der Reihenfolge im Attribut.
  return (
    <div className={`isolate overflow-hidden ${className}`} aria-hidden>
      {/* Warmes Streiflicht von rechts — nimmt das Gold der Marke auf, ohne
          dass irgendetwas golden eingefärbt werden müsste. */}
      <div
        className="pointer-events-none absolute -right-1/4 top-1/4 h-[60%] w-[70%] rounded-full bg-brand/25 blur-[110px]"
      />
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-[50%] w-[40%] rounded-full bg-accent-500/20 blur-[100px]"
      />

      {RODS.map((r) => (
        <div
          key={r.x}
          className="absolute"
          style={{
            left: `${r.x}%`,
            top: `${r.top}%`,
            height: `${r.h}%`,
            width: "clamp(9px, 1.5vw, 17px)",
            animation: `rod-drift ${r.dur}s ease-in-out ${r.delay}s infinite`,
          }}
        >
          {/* Stab */}
          <div
            className="absolute inset-0 rounded-[3px]"
            style={{ backgroundImage: `${RIBS},${STEEL}` }}
          />
          {/* Manschette aus Beton */}
          <div
            className="absolute rounded-[4px] shadow-[0_18px_34px_-12px_rgba(0,0,0,0.9)]"
            style={{
              left: "-105%",
              width: "310%",
              top: `${r.collar}%`,
              height: `${(r.ch / r.h) * 100}%`,
              backgroundImage: CONCRETE,
            }}
          >
            {/* Obere Deckfläche — macht aus der Fläche einen Körper. */}
            <div
              className="absolute inset-x-0 top-0 h-[14%] rounded-t-[4px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#2B2F32,#C9CDD0 42%,#E4E7E9 50%,#8F9498 70%,#26292B)",
              }}
            />
            {/* Schattenfuge unten */}
            <div className="absolute inset-x-0 bottom-0 h-[10%] rounded-b-[4px] bg-black/45" />
          </div>
        </div>
      ))}

      {/* Der Boden verliert sich ins Dunkle, statt hart abzuschneiden. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950 to-transparent" />
    </div>
  );
}
