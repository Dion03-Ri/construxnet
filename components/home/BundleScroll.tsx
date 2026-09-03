"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Layers } from "lucide-react";

/**
 * Smart Pools auf der Startseite: links der Text, rechts eine Grafik, die
 * sich beim Scrollen aufbaut — aus einem einzelnen Bedarf wird ein Bündel
 * wird ein Rabatt.
 *
 * Die Bewegung bleibt vollständig IN der Grafik. Beim Scrollen wird genau
 * eine CSS-Variable `--p` (0…1) gesetzt, alles andere hängt in CSS mit
 * `clamp()` daran: kein React-Rendern je Bild, bewegt werden nur `transform`
 * und `opacity`.
 *
 * Ablauf über `--p`:
 *   0.00–0.28  eine Karte, gross, auf dunklem Grund
 *   0.20–0.44  eine helle Fläche schiebt sich im Panel hoch
 *   0.30–0.54  zwei weitere Firmen fächern aus
 *   0.56–0.76  die Mengen laufen zusammen, 120 → 300 m³
 *   0.76–0.94  Ergebnis
 */

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

/** Fortschritt eines Abschnitts als CSS-Ausdruck, hart begrenzt. */
function phase(from: number, to: number) {
  return `clamp(0, calc((var(--p) - ${from}) / ${to - from}), 1)`;
}

type Firm = { name: string; city: string; volume: string };

const CENTER: Firm = { name: "Firma A", city: "Zürich", volume: "120 m³" };
const SIDES: Firm[] = [
  { name: "Firma B", city: "Winterthur", volume: "90 m³" },
  { name: "Firma C", city: "Uster", volume: "90 m³" },
];

function DemandCard({ firm, lead }: { firm: Firm; lead?: boolean }) {
  return (
    <div
      className={
        "relative w-[100px] overflow-hidden rounded-2xl border border-white/10 bg-navy-900 p-2.5 text-white sm:w-[124px] sm:p-3.5 " +
        (lead
          ? "shadow-[0_24px_50px_-24px_rgba(8,17,30,0.9)]"
          : "shadow-[0_16px_36px_-20px_rgba(8,17,30,0.8)]")
      }
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
      <div className="relative">
        {/* Das Symbol nur ab sm — auf dem Handy fehlt im Panel die Höhe. */}
        <span className="hidden h-6 w-6 place-items-center rounded-lg bg-white/[0.06] text-white/45 sm:grid">
          <Building2 className="h-3 w-3" />
        </span>
        <div className="truncate text-[11.5px] font-semibold leading-tight sm:mt-2">{firm.name}</div>
        <div className="truncate text-[9.5px] text-white/40">{firm.city}</div>
        <div className="mt-2 border-t border-white/10 pt-2">
          <div className="text-[8.5px] uppercase tracking-wider text-white/35">Bedarf</div>
          <div className="text-[15px] font-bold leading-tight text-brand sm:text-[16px]">
            {firm.volume}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BundleScroll() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const volume = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = track.current;
    const stageEl = stage.current;
    if (!el || !stageEl) return;

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
        const t = Math.min(1, Math.max(0, (p - 0.56) / 0.2));
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

  const sheet = phase(0.2, 0.44);
  const lead = phase(0.04, 0.28);
  const fan = phase(0.3, 0.54);
  const sides = phase(0.32, 0.48);
  const lift = phase(0.56, 0.72);
  const bundle = phase(0.56, 0.68);
  const bar = phase(0.56, 0.76);
  const result = phase(0.76, 0.9);

  return (
    <section ref={track} className="relative h-[240vh] border-y border-slate-200 bg-white sm:h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden [height:100svh]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 sm:px-6 sm:gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* Links: Text — steht still, wie im übrigen Seitenaufbau */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
              <Layers className="h-3.5 w-3.5" /> Smart Pools
            </span>
            <h2 className="mt-3 text-[23px] font-bold leading-[1.14] tracking-tight text-slate-900 sm:mt-4 sm:text-[2.4rem]">
              Mengenrabatte,
              <br />
              die alleine niemand bekommt.
            </h2>
            {/* Auf dem Handy die kurze Fassung — sonst passt der Abschnitt
                nicht auf einen Bildschirm und wird oben abgeschnitten. */}
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500 sm:hidden">
              Obtanet legt den Bedarf mehrerer Baufirmen zusammen und verhandelt mit dem
              gesamten Volumen.{" "}
              <b className="font-semibold text-slate-800">
                Je grösser das Bündel, desto höher der Rabatt.
              </b>
            </p>
            <p className="mt-5 hidden max-w-lg text-[15px] leading-relaxed text-slate-500 sm:block">
              Wer alleine einkauft, zahlt Einzelpreise. Obtanet bündelt den Bedarf mehrerer
              Baufirmen zu einem gemeinsamen Auftrag und verhandelt mit dem gesamten Volumen
              bei den Werken.{" "}
              <b className="font-semibold text-slate-800">
                Je grösser das Bündel, desto höher der Rabatt
              </b>{" "}
              — auch für kleine Einzelbestellungen.
            </p>
            <Link
              href="/pools"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-800 sm:mt-7 sm:px-6 sm:py-3 sm:text-sm"
            >
              So funktioniert ein Pool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Rechts: die Grafik — hier und nur hier passiert die Bewegung */}
          <div
            ref={stage}
            style={{ "--p": 0 } as React.CSSProperties}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] border border-white/10 bg-[#0B1522] sm:rounded-[32px]"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={GRID_BG} />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[38%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-[90px]"
              style={{ opacity: `calc(0.9 - 0.55 * ${sheet})` }}
            />
            {/* Die helle Fläche schiebt sich im Panel hoch — der Übergang bleibt
                im Fenster, die Seite darum bleibt ruhig. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-slate-50"
              style={{
                transform: `translateY(calc(100% - 100% * ${sheet}))`,
                borderTopLeftRadius: `calc(40px - 40px * ${sheet})`,
                borderTopRightRadius: `calc(40px - 40px * ${sheet})`,
              }}
            />

            <div className="relative flex h-full flex-col items-center justify-center px-4 sm:px-6">
              {/* Karten */}
              <div className="relative flex h-[112px] w-full items-center justify-center sm:h-[152px]">
                <div
                  className="absolute origin-center"
                  style={{
                    opacity: sides,
                    transform: `translateX(calc(-108% * ${fan})) translateY(calc(-10px * ${lift})) rotate(calc(-5deg * ${fan})) scale(calc(0.88 + 0.07 * ${fan}))`,
                  }}
                >
                  <DemandCard firm={SIDES[0]} />
                </div>
                <div
                  className="absolute origin-center"
                  style={{
                    opacity: sides,
                    transform: `translateX(calc(108% * ${fan})) translateY(calc(-10px * ${lift})) rotate(calc(5deg * ${fan})) scale(calc(0.88 + 0.07 * ${fan}))`,
                  }}
                >
                  <DemandCard firm={SIDES[1]} />
                </div>
                <div
                  className="absolute z-10 origin-center"
                  style={{
                    transform: `translateY(calc(16px - 16px * ${lead} - 10px * ${lift})) scale(calc(1.3 - 0.3 * ${lead}))`,
                  }}
                >
                  <DemandCard firm={CENTER} lead />
                </div>
              </div>

              {/* Bündel */}
              <div
                className="mt-3 w-full max-w-[340px] sm:mt-4"
                style={{ opacity: bundle, transform: `translateY(calc(18px - 18px * ${bundle}))` }}
              >
                <div className="rounded-2xl border border-brand/30 bg-brand/10 px-3.5 py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11.5px] font-semibold text-slate-700">
                      Gebündeltes Volumen
                    </span>
                    <span
                      ref={volume}
                      className="text-[15px] font-bold tabular-nums text-brand-700 sm:text-[16px]"
                    >
                      120 m³
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/10">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `calc(34% + 52% * ${bar})` }}
                    />
                  </div>
                </div>
              </div>

              {/* Ergebnis */}
              <div
                className="mt-2 grid w-full max-w-[340px] grid-cols-2 gap-2"
                style={{ opacity: result, transform: `translateY(calc(18px - 18px * ${result}))` }}
              >
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <div className="text-[8.5px] uppercase tracking-wider text-slate-400">
                    Mengenrabatt
                  </div>
                  <div className="text-[17px] font-bold leading-tight text-brand">16 %</div>
                  <div className="text-[9px] text-slate-400">garantiert, ggü. KBOB</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <div className="text-[8.5px] uppercase tracking-wider text-slate-400">Ersparnis</div>
                  <div className="text-[17px] font-bold leading-tight text-slate-900">
                    CHF 19&apos;200
                  </div>
                  <div className="text-[9px] text-slate-400">Beispielrechnung</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
