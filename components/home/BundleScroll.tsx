"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Layers, ShieldCheck } from "lucide-react";

/**
 * Scroll-Erzählung: aus einem einzelnen Bedarf wird ein Bündel wird ein Rabatt.
 *
 * Der Abschnitt ist eine hohe Bahn, in der ein bildschirmfüllender Block
 * klebt. Beim Scrollen wird genau EIN Wert gesetzt — die CSS-Variable `--p`
 * von 0 bis 1 — und alles andere hängt in CSS daran. Vorteile:
 *
 *  - kein React-Rendern je Bild, nur eine Variable am Wurzelknoten
 *  - jeder Abschnitt begrenzt seinen Bereich selbst mit clamp(), es gibt
 *    keine Überraschungen ausserhalb des Bereichs
 *  - bewegt werden ausschliesslich transform und opacity
 *
 * Ablauf über `--p`:
 *   0.00–0.10  Kopfzeile fährt ein
 *   0.05–0.34  die einzelne Karte schrumpft von gross auf normal
 *   0.12–0.40  der Grund löst sich auf: Navy → Hell
 *   0.30–0.52  zwei weitere Firmen fächern nach links und rechts aus
 *   0.54–0.76  die Mengen laufen zusammen, 120 → 300 m³
 *   0.76–0.96  Ergebnis und Abschluss
 */

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

/** Fortschritt eines Abschnitts als CSS-tauglicher Ausdruck, hart begrenzt. */
function phase(from: number, to: number) {
  return `clamp(0, calc((var(--p) - ${from}) / ${to - from}), 1)`;
}

type Firm = { name: string; city: string; volume: string };

const CENTER: Firm = { name: "Firma A", city: "Zürich", volume: "120 m³" };
const SIDES: Firm[] = [
  { name: "Firma B", city: "Winterthur", volume: "90 m³" },
  { name: "Firma C", city: "Uster", volume: "90 m³" },
];

/** Eine Bedarfskarte. Bewusst immer dunkel — nur der Grund darunter wechselt. */
function DemandCard({ firm, lead }: { firm: Firm; lead?: boolean }) {
  return (
    <div
      className={
        "relative w-[33vw] max-w-[126px] overflow-hidden rounded-xl border border-white/10 bg-navy-900 p-3 text-white sm:w-[244px] sm:rounded-2xl sm:p-5 " +
        (lead
          ? "shadow-[0_30px_70px_-30px_rgba(8,17,30,0.85)]"
          : "shadow-[0_20px_50px_-24px_rgba(8,17,30,0.7)]")
      }
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
      <div className="relative">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06] text-white/45 sm:h-9 sm:w-9">
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
        <div className="mt-2 truncate text-[12px] font-semibold leading-tight sm:mt-3 sm:text-[13.5px]">
          {firm.name}
        </div>
        {/* Nur der Ort: die Rolle geht aus dem Abschnitt hervor, und die
            volle Zeile wuerde in der schmalen Karte abgeschnitten. */}
        <div className="truncate text-[10px] text-white/40 sm:text-[11.5px]">{firm.city}</div>
        <div className="mt-2.5 border-t border-white/10 pt-2.5 sm:mt-4 sm:pt-3">
          <div className="text-[9px] uppercase tracking-wider text-white/35 sm:text-[10px]">Bedarf</div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-[15px] font-bold leading-none text-brand sm:text-[24px]">
              {firm.volume}
            </span>
            <span className="text-[10px] text-white/45 sm:text-[11.5px]">Beton C25/30</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eyebrow() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
      <Layers className="h-3.5 w-3.5" /> Smart Pools
    </span>
  );
}

function Headline() {
  return (
    <h2 className="mx-auto mt-3 max-w-2xl text-[22px] font-bold leading-[1.16] tracking-tight sm:mt-4 sm:text-[38px]">
      Mengenrabatte,
      <br />
      die alleine niemand bekommt.
    </h2>
  );
}

function Result() {
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-2.5">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">Mengenrabatt</div>
        <div className="mt-0.5 text-[19px] font-bold leading-none text-brand sm:text-[24px]">16 %</div>
        <div className="mt-1 text-[10.5px] text-slate-400">garantiert, ggü. KBOB</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">Ersparnis</div>
        <div className="mt-0.5 text-[19px] font-bold leading-none text-slate-900 sm:text-[24px]">
          CHF 19&apos;200
        </div>
        <div className="mt-1 text-[10.5px] text-slate-400">für alle Teilnehmer</div>
      </div>
    </div>
  );
}

function Outro() {
  return (
    <>
      <p className="mx-auto mt-4 max-w-[19rem] text-[10.5px] leading-relaxed text-slate-400 sm:mt-5 sm:max-w-md sm:text-[11.5px]">
        <ShieldCheck className="mr-1 inline-block h-3.5 w-3.5 -translate-y-px text-brand" />
        Beispielrechnung. Das beste verdeckte Angebot kann die Garantie übertreffen.
      </p>
      <Link
        href="/pools"
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-800 sm:mt-5 sm:px-5 sm:py-3 sm:text-sm"
      >
        So funktioniert ein Pool <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export default function BundleScroll() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const volume = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = track.current;
    const stageEl = stage.current;
    if (!el || !stageEl) return;

    // Reduzierte Bewegung: Endzustand setzen und nichts weiter tun.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) {
      stageEl.style.setProperty("--p", "1");
      if (volume.current) volume.current.textContent = "300 m³";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / span));
      stageEl.style.setProperty("--p", p.toFixed(4));
      if (volume.current) {
        // 120 → 300 m³, gleicher Bereich wie der Balken in CSS.
        const t = Math.min(1, Math.max(0, (p - 0.54) / 0.22));
        volume.current.textContent = `${Math.round(120 + t * 180)} m³`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const head = phase(0, 0.1);
  const light = phase(0.14, 0.36);
  const lead = phase(0.05, 0.34);
  // Die Schrift wechselt erst, wenn die helle Fläche oben angekommen ist —
  // sonst steht sie kurz dunkel auf dunklem Grund.
  const headColor = phase(0.3, 0.38);
  const fan = phase(0.3, 0.52);
  const sides = phase(0.32, 0.46);
  const lift = phase(0.62, 0.78);
  const bundle = phase(0.54, 0.66);
  const bar = phase(0.54, 0.76);
  const result = phase(0.76, 0.88);
  const outro = phase(0.86, 0.96);

  return (
    <section ref={track} className="relative h-[300vh] sm:h-[400vh]">
      <div
        ref={stage}
        style={{ "--p": 0 } as React.CSSProperties}
        className="sticky top-0 h-screen overflow-hidden [--fan:96%] [--rot:6deg] [height:100svh] sm:[--fan:112%] sm:[--rot:4deg]"
      >
        {/* Grund: Navy → Hell. Zwei Ebenen, die zweite blendet auf — das ist
            billiger und farbtreuer als eine Farbmischung je Bild. */}
        <div aria-hidden className="absolute inset-0 bg-[#0B1522]" />
        <div aria-hidden className="absolute inset-0 opacity-[0.05]" style={GRID_BG} />
        {/* Der helle Grund schiebt sich als abgerundete Fläche über das Dunkle
            — dasselbe Bild wie beim Vorbild, statt eines flauen Überblendens. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 top-0 bg-slate-50"
          style={{
            transform: `translateY(calc(100% - 100% * ${light}))`,
            borderTopLeftRadius: `calc(64px - 64px * ${light})`,
            borderTopRightRadius: `calc(64px - 64px * ${light})`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]"
          style={{ opacity: `calc(0.9 - 0.9 * ${light})` }}
        />

        <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-4 pb-16 sm:px-6 sm:pb-0">
          {/* Kopfzeile — Farbe wechselt mit dem Grund */}
          <div
            className="text-center"
            style={{
              opacity: head,
              transform: `translateY(calc(24px - 24px * ${head}))`,
              color: `rgb(calc(255 - 240 * ${headColor}) calc(255 - 232 * ${headColor}) calc(255 - 213 * ${headColor}))`,
            }}
          >
            <Eyebrow />
            <Headline />
          </div>

          {/* Karten */}
          <div className="relative mt-6 flex h-[176px] w-full items-start justify-center sm:mt-10 sm:h-[252px]">
            <div
              className="absolute origin-center"
              style={{
                opacity: sides,
                transform: `translateX(calc(-1 * var(--fan) * ${fan})) translateY(calc(-14px * ${lift})) rotate(calc(-1 * var(--rot) * ${fan})) scale(calc(0.86 + 0.08 * ${fan}))`,
              }}
            >
              <DemandCard firm={SIDES[0]} />
            </div>
            <div
              className="absolute origin-center"
              style={{
                opacity: sides,
                transform: `translateX(calc(var(--fan) * ${fan})) translateY(calc(-14px * ${lift})) rotate(calc(var(--rot) * ${fan})) scale(calc(0.86 + 0.08 * ${fan}))`,
              }}
            >
              <DemandCard firm={SIDES[1]} />
            </div>
            {/* Die führende Karte liegt oben, damit die anderen dahinter hervorkommen. */}
            <div
              className="absolute z-10 origin-center"
              style={{
                transform: `translateY(calc(40px - 40px * ${lead} - 14px * ${lift})) scale(calc(1.22 - 0.22 * ${lead}))`,
              }}
            >
              <DemandCard firm={CENTER} lead />
            </div>
          </div>

          {/* Bündel */}
          <div
            className="mt-4 w-full max-w-md sm:mt-6"
            style={{ opacity: bundle, transform: `translateY(calc(26px - 26px * ${bundle}))` }}
          >
            <div className="rounded-xl border border-brand/30 bg-brand/10 px-3.5 py-2.5 sm:px-5 sm:py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-slate-700">Gebündeltes Volumen</span>
                <span
                  ref={volume}
                  className="text-[17px] font-bold tabular-nums text-brand-700 sm:text-[19px]"
                >
                  120 m³
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/10">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `calc(34% + 52% * ${bar})` }}
                />
              </div>
            </div>
          </div>

          {/* Ergebnis */}
          <div
            className="w-full max-w-md"
            style={{ opacity: result, transform: `translateY(calc(26px - 26px * ${result}))` }}
          >
            <Result />
          </div>

          <div className="text-center" style={{ opacity: outro }}>
            <Outro />
          </div>
        </div>
      </div>
    </section>
  );
}
