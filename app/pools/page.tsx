import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import OpenPools from "@/components/pools/OpenPools";
import BundleEnginePanel from "@/components/pools/BundleEnginePanel";
import { D_MD, EYEBROW, BTN_GOLD, BTN_OUTLINE_DARK } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Smart Pools · Obtanet",
  description: "Offene, gebündelte Bedarfe der Schweizer Baubranche — beitreten und sparen",
};

/**
 * Wie das Bündeln abläuft — drei Schritte statt eines Textblocks.
 *
 * Vorher stand die Erklärung als drei Absätze in einem dunklen Kasten über
 * der Liste. Der Kasten war das Erste, was man sah, und die offenen Bündel
 * — der eigentliche Inhalt der Seite — rutschten darunter. Jetzt trägt die
 * Ordnung eine Haarlinie: drei Schritte nebeneinander, kurz, und darunter
 * beginnt sofort die Liste.
 */
const ABLAUF = [
  {
    n: "01",
    head: "Sammelphase",
    body: "Bedarf melden, Bündel beitreten. Je grösser das Volumen, desto höher der garantierte Mindestvorteil.",
  },
  {
    n: "02",
    head: "Sealed-Bid",
    body: "Die Werke geben verdeckte Angebote gegen den KBOB-Referenzpreis ab. Das beste erhält den Zuschlag — und kann die Garantie übertreffen.",
  },
  {
    n: "03",
    head: "Kein Zwang",
    body: "Wird das Zielvolumen bis zur Frist nicht erreicht, löst sich das Bündel auf. Es entsteht keine Verpflichtung.",
  },
];

export default function PoolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* ===================== KOPF, VOLLE BREITE =====================
          Kein Panel, kein Raster, kein Goldkästchen — Zeile, Überschrift,
          Handlung, Haarlinie. Dieselbe Machart wie auf der Netzwerkseite. */}
      <header className="border-b border-white/[0.08]">
        <div className="py-8">
          <span className={EYEBROW}>Smart Pools</span>
          <h1 className={cn(D_MD, "mt-4 max-w-3xl text-white")}>
            Offene, gebündelte Bedarfe in deiner Region
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/55">
            Melde deinen Materialbedarf und tritt einem Bündel bei. Aus vielen
            kleinen Mengen wird eine grosse — und aus einer grossen Menge ein
            besserer Preis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/beschaffung" className={BTN_GOLD}>
              Bedarf melden <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pools/saved" className={BTN_OUTLINE_DARK}>
              <Bookmark className="h-4 w-4" /> Merkliste
            </Link>
          </div>
        </div>
      </header>

      {/* Ablauf — drei Spalten, nur durch senkrechte Haarlinien getrennt */}
      <div className="grid grid-cols-1 gap-y-8 border-b border-white/[0.08] py-8 sm:grid-cols-3 sm:gap-y-0">
        {ABLAUF.map((s, i) => (
          <div
            key={s.n}
            className={cn(
              i > 0 && "sm:border-l sm:border-white/[0.08] sm:pl-8",
              i < ABLAUF.length - 1 && "sm:pr-8",
            )}
          >
            <span className="font-display text-[12px] font-bold tabular-nums text-brand">{s.n}</span>
            <h2 className="mt-2 text-[14px] font-bold tracking-tight text-white">{s.head}</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">{s.body}</p>
          </div>
        ))}
      </div>

      {/* Hauptinhalt: offene Bündel mit Countdown */}
      <div className="pt-8">
        <OpenPools />
      </div>

      {/* Zusatztool: Rabatt-Rechner — klein, per Vollbild-Icon aufklappbar */}
      <section className="mt-12">
        <BundleEnginePanel />
      </section>
    </main>
  );
}
