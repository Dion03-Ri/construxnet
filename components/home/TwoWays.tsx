import Link from "next/link";
import { cn } from "@/lib/utils";
import { BTN_LIGHT, D_MD, EYEBROW, SECTION, SHELL } from "@/lib/ui";

/**
 * Zwei Wege zum besseren Preis.
 *
 * Dunkler Grund, sehr weiche Ecken, Titel und ein kurzer Satz oben, ein
 * Knopf — und darunter das Motiv.
 *
 * Das Motiv lief frueher randlos ueber die ganze Breite und buendig an
 * die Unterkante. Es war damit das Lauteste an der Karte und drueckte den
 * Text nach oben weg. Jetzt steht es auf siebzig Prozent der Breite,
 * mittig, mit Luft ringsum. Eine Strichzeichnung braucht diese Luft: sie
 * ist ein Objekt mit Aussenkontur, und wo die Kontur die Bildkante
 * trifft, sieht es nach Fehler aus.
 *
 * Die beiden Motive kamen in verschiedenen Formaten — das Buendel
 * quadratisch, der Handschlag breit. Beide liegen freigestellt und mittig
 * auf derselben Flaeche von 1400 x 760. Das ist der Grund, warum die zwei
 * Karten exakt gleich hoch sind.
 *
 * Weder Verlauf noch Maske noetig: nach der Schwarzpunkt-Korrektur ist
 * der Hintergrund der Zeichnungen exakt 0/0/0, und die Karte ist ebenfalls
 * schwarz. Die Bildkante ist damit unsichtbar.
 *
 * `glanz` ist das Licht, das beim Darueberfahren einmal durch die Karte
 * wandert. Es steht in app/globals.css, mitsamt der Begruendung.
 */

function Card({
  title,
  lead,
  cta,
  href,
  src,
  alt,
}: {
  title: string;
  lead: string;
  cta: string;
  href: string;
  src: string;
  alt: string;
}) {
  return (
    <div className="glanz group relative flex flex-col overflow-hidden rounded-[20px] border border-white/[0.22] bg-black">
      <div className="px-6 pb-2 pt-10 text-center sm:px-10 sm:pt-14">
        <h3 className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[30px]">
          {title}
        </h3>
        <p className="mx-auto mt-4 max-w-[26rem] text-[14.5px] font-medium leading-relaxed text-white/[0.72] sm:text-[15.5px]">
          {lead}
        </p>
        <Link href={href} className={cn(BTN_LIGHT, "mt-7 sm:mt-8")}>
          {cta}
        </Link>
      </div>

      {/* `mt-auto` drückt das Motiv nach unten, damit beide Karten gleich
          hoch bleiben, auch wenn ein Text länger ist. Der seitliche Rand
          ist in Prozent, nicht in Pixeln: die Zeichnung soll auf jeder
          Breite denselben Anteil der Karte einnehmen. */}
      <div className="mt-auto px-[10%] pb-7 pt-7 sm:px-[15%] sm:pb-8 sm:pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1400}
          height={760}
          className="block w-full select-none"
        />
      </div>
    </div>
  );
}

export default function TwoWays() {
  return (
    <section className="bg-black">
      <div className={cn(SHELL, SECTION)}>
        <div className="mb-12 max-w-2xl sm:mb-16">
          <span className={EYEBROW}>
            Zwei Wege
          </span>
          <h2 className={cn(D_MD, "mt-5 text-white")}>
            Zum besseren Preis — gebündelt oder direkt.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <Card
            title="Gemeinsam bündeln"
            lead="Dein Bedarf wird mit gleichen Bedarfen deiner Region zusammengelegt. Je grösser das Bündel, desto höher der Mengenrabatt."
            cta="Smart Pools ansehen"
            href="/pools"
            src="/art-buendel.jpg"
            alt="Strichzeichnung: eine zu einem Bündel geschnürte Palette mit Baumaterial"
          />

          <Card
            title="Direkt verhandeln"
            lead="Du willst nicht bündeln? Finde geprüfte Baustoffwerke und verhandle direkt — mit dem KBOB-Referenzpreis als Basis."
            cta="Zum Netzwerk"
            href="/network"
            src="/art-direkt.jpg"
            alt="Strichzeichnung: ein Handschlag als Zeichen des direkten Abschlusses"
          />
        </div>
      </div>
    </section>
  );
}
