import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TickRule from "@/components/ui/TickRule";
import { D_XL, D_LG, D_MD, LEAD, EYEBROW, BTN_GOLD, BTN_LIGHT } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * VORSCHAU — nicht verlinkt, nicht Teil der Seite.
 *
 * Zeigt dieselben Inhalte ohne Kästchen. Kein `rounded-2xl border bg-…`
 * mehr, nirgends. Was bisher ein Rahmen tat, tun jetzt drei Mittel:
 *
 *   1. HAARLINIE — eine Zeile wird von der nächsten durch einen Strich
 *      getrennt, nicht durch eine Umrandung. So arbeiten Kursseiten wie
 *      TradingView; darum wirken deren Tabellen ruhig und dicht.
 *   2. FLÄCHE ÜBER DIE GANZE BREITE — ein Abschnitt setzt sich durch einen
 *      anderen Grundton ab, der von Rand zu Rand läuft. So arbeiten Apple
 *      und Robinhood. Ein abgerundetes Rechteck mitten auf der Seite
 *      dagegen ist das Erkennungszeichen generierter Entwürfe.
 *   3. MASSBAND — die Linie mit den Strichen. Sie ist unser eigenes
 *      Zeichen und ersetzt den Rahmen dort, wo etwas anfangen muss.
 *
 * Bilder haben keine runden Ecken und keinen Rand mehr; sie laufen bis an
 * die Kante der Fläche. Zahlen stehen rechts, mit Tabellenziffern.
 */

export const metadata = { title: "Design-Vorschau · Obtanet" };

const POOLS = [
  { m: "Beton C25/30", r: "Zürich", v: "230 m³", kbob: "156.12", pool: "132.70", d: "15.0" },
  { m: "Armierungsstahl B500B", r: "Bern", v: "48 t", kbob: "1053.00", pool: "926.60", d: "12.0" },
  { m: "Koffer-/Wandkies 0/45", r: "Nordwestschweiz", v: "320 t", kbob: "39.16", pool: "31.72", d: "19.0" },
];

const STEPS = [
  { t: "Bedarf melden", d: "Material, Menge, Region — oder die Ausschreibung als PDF." },
  { t: "Bündeln", d: "Gleiche Bedarfe derselben Region werden zu einem Volumen." },
  { t: "Sealed-Bid", d: "Werke bieten verdeckt gegen den KBOB-Referenzpreis." },
  { t: "Vertrag & Lieferung", d: "Zuschlag, SIA-118-Vertrag, Lieferung — alles im Dashboard." },
];

/* Kleiner Kopf über einem Block: Massband statt Kartenrand. */
function BlockHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <span className={EYEBROW}>{eyebrow}</span>
      <h2 className={cn(D_MD, "mt-4 text-white")}>{title}</h2>
      <TickRule className="mt-7" />
    </div>
  );
}

export default function DesignVorschau() {
  return (
    <main className="bg-[#060B12] text-white">
      {/* ============================ HERO ============================ */}
      {/* Unverändert im Aufbau — er hatte nie ein Kästchen. */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-kran.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[62%_28%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#060B12] via-[#060B12]/82 to-[#060B12]/5"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-32 sm:px-6 lg:w-[56%] lg:py-44">
          <span className={EYEBROW}>Smart Bündeln</span>
          <h1 className={cn(D_XL, "mt-5")}>
            Vernetzen.<br />Bündeln.<br />
            <span className="text-brand">Sparen.</span>
          </h1>
          <p className={cn(LEAD, "mt-7 max-w-lg text-white/70")}>
            Obtanet bündelt deinen Materialbedarf mit anderen Schweizer Baufirmen und
            holt Mengenrabatte heraus.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/beschaffung" className={BTN_GOLD}>
              Materialbedarf melden
            </Link>
            <Link href="/pools" className="inline-flex items-center gap-2 border-b border-white/30 pb-1 text-[14.5px] font-semibold text-white transition-colors hover:border-brand hover:text-brand">
              Offene Bündel ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================= VERTRAUENSANKER ======================= */}
      {/* Vorher: vier Blöcke mit Oberkante. Jetzt: eine durchgehende
          Massband-Linie, an der die vier Punkte hängen. */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <TickRule />
        <dl className="mt-8 grid grid-cols-2 gap-x-10 gap-y-10 lg:grid-cols-4">
          {[
            ["KBOB", "Preisbasis des Bundes"],
            ["SIA 118", "Schweizer Vertragswerk"],
            ["CHE", "Firmen verifiziert"],
            ["CH", "Daten in der Schweiz"],
          ].map(([k, t]) => (
            <div key={k}>
              <dt className="font-display text-[20px] font-bold leading-none text-brand">{k}</dt>
              <dd className="mt-3 text-[14px] text-white/55">{t}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ========================= ZWEI WEGE ========================= */}
      {/* Vorher zwei abgerundete Karten mit Rand. Jetzt zwei Spalten auf
          derselben Fläche, getrennt nur durch eine senkrechte Haarlinie.
          Die Bilder laufen bis an die Spaltenkante — kein Rahmen, keine
          runden Ecken. */}
      <section className="border-y border-white/[0.08] bg-black">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <div className="max-w-2xl">
            <span className={EYEBROW}>Zwei Wege</span>
            <h2 className={cn(D_LG, "mt-4")}>Zum besseren Preis — gebündelt oder direkt.</h2>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2">
            {[
              {
                t: "Gemeinsam bündeln",
                l: "Dein Bedarf wird mit gleichen Bedarfen deiner Region zusammengelegt. Je grösser das Bündel, desto höher der Mengenrabatt.",
                c: "Smart Pools ansehen",
                h: "/pools",
                img: "/art-buendel.jpg",
              },
              {
                t: "Direkt verhandeln",
                l: "Du willst nicht bündeln? Finde geprüfte Baustoffwerke und verhandle direkt — mit dem KBOB-Referenzpreis als Basis.",
                c: "Zum Netzwerk",
                h: "/network",
                img: "/art-direkt.jpg",
              },
            ].map((w, i) => (
              <div
                key={w.t}
                className={cn(
                  "pb-14 lg:pb-0",
                  i === 0
                    ? "lg:border-r lg:border-white/[0.08] lg:pr-14"
                    : "border-t border-white/[0.08] pt-14 lg:border-t-0 lg:pl-14 lg:pt-0",
                )}
              >
                <h3 className={cn(D_MD, "text-white")}>{w.t}</h3>
                <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-white/60">{w.l}</p>
                <Link href={w.h} className={cn(BTN_LIGHT, "mt-8")}>
                  {w.c}
                </Link>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.img}
                  alt=""
                  aria-hidden
                  className="mt-12 h-[320px] w-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PREISE ALS TABELLE ===================== */}
      {/* Das Gegenteil der bisherigen Karte: keine Umrandung, keine Füllung.
          Nur eine Massband-Linie oben, Haarlinien zwischen den Zeilen und
          die Zahlen rechts. So bauen Kursseiten ihre Tabellen. */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <BlockHead eyebrow="Referenz → Bündel" title="Was du zahlst, gegen das, was möglich ist." />

        <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-x-10 pb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/35 sm:grid">
          <span>Material</span>
          <span className="text-right">KBOB</span>
          <span className="text-right">Bündel</span>
          <span className="text-right">Vorteil</span>
        </div>

        <ul>
          {POOLS.map((p) => (
            <li
              key={p.m}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-10 gap-y-1 border-t border-white/[0.08] py-6 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <div className="min-w-0">
                <div className="text-[16px] font-bold text-white">{p.m}</div>
                <div className="mt-1 text-[12.5px] text-white/40">
                  {p.r} · {p.v}
                </div>
              </div>
              <div className="text-right text-[14px] tabular-nums text-white/35 line-through sm:order-none">
                {p.kbob}
              </div>
              <div className="col-start-2 row-start-1 text-right font-display text-[30px] font-bold leading-none tabular-nums text-white sm:col-auto sm:row-auto">
                {p.pool}
              </div>
              <div className="text-right text-[15px] font-bold tabular-nums text-brand">
                −{p.d} %
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-white/[0.08] pt-5 text-[12.5px] text-white/35">
          Beispielwerte gegen den KBOB-Preisindex, Stand 2026-Q2.
        </div>
      </section>

      {/* ========================== ABLAUF ========================== */}
      {/* Vorher vier Karten mit Symbolkacheln, dann vier Blöcke mit
          Oberkante. Jetzt hängen die vier Schritte an einer durchgehenden
          Massband-Linie — sie liest sich als Zeitachse. */}
      <section className="border-y border-white/[0.08] bg-[#040810]">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <div className="max-w-2xl">
            <span className={EYEBROW}>Ablauf</span>
            <h2 className={cn(D_MD, "mt-4")}>Von der Anfrage zum Vertrag</h2>
          </div>

          <TickRule className="mt-14" />
          <ol className="mt-8 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <div className="font-display text-[15px] font-bold tabular-nums text-brand">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 text-[19px] font-bold tracking-tight">{s.t}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/50">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ====================== ABSCHLUSS ====================== */}
      {/* Vorher eine abgerundete dunkle Karte auf hellem Grund. Jetzt eine
          Fläche über die ganze Breite — nichts, was sie einrahmt. */}
      <section className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 lg:py-40">
        <h2 className={cn(D_LG, "text-white")}>Bereit, günstiger zu bauen?</h2>
        <p className={cn(LEAD, "mx-auto mt-6 max-w-lg text-white/55")}>
          Firmenprofil erstellen, ersten Materialbedarf melden — in wenigen Minuten.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/sign-up" className={BTN_GOLD}>
            Kostenlos registrieren
          </Link>
        </div>
        <TickRule className="mt-20" />
      </section>
    </main>
  );
}
