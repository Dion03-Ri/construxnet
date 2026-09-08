import Link from "next/link";
import { cn } from "@/lib/utils";
import { BTN_LIGHT, D_MD, EYEBROW, SECTION, SHELL } from "@/lib/ui";

/**
 * Zwei Wege zum besseren Preis.
 *
 * Aufbau nach dem Vorbild der Robinhood-Karten: dunkler Grund, sehr weiche
 * Ecken, Titel und ein kurzer Satz oben, ein runder Knopf — und darunter
 * das Motiv über die ganze Breite, bündig an der unteren Kante.
 *
 * Vorher stand das Bild klein und mittig in einer Bühne mit Rand ringsum.
 * Das las sich wie ein Symbol in einem Kästchen. Über die volle Breite
 * wird es zur Grundfläche der Karte: der Handschlag reicht mit beiden
 * Armen bis an die Ränder, der Bündelstapel steht auf der Unterkante.
 *
 * Es braucht dafür weder Verlauf noch Maske. Beide Aufnahmen haben nach
 * der Schwarzpunkt-Korrektur exakt 0/0/0 als Hintergrund, und die Karte
 * ist ebenfalls schwarz — die Bildkante ist damit unsichtbar, und das
 * Motiv scheint direkt auf der Karte zu liegen.
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
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.22] bg-black sm:rounded-[32px]">
      <div className="px-6 pb-2 pt-10 text-center sm:px-10 sm:pt-14">
        <h3 className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[30px]">
          {title}
        </h3>
        <p className="mx-auto mt-4 max-w-[26rem] text-[14.5px] font-medium leading-relaxed text-white/60 sm:text-[15.5px]">
          {lead}
        </p>
        <Link href={href} className={cn(BTN_LIGHT, "mt-7 sm:mt-8")}>
          {cta}
        </Link>
      </div>

      {/* Das Motiv, randlos. `mt-auto` drückt es auf die Unterkante, damit
          beide Karten gleich hoch bleiben, auch wenn ein Text länger ist. */}
      <div className="mt-auto pt-8 sm:pt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1400}
          height={609}
          className="block w-full select-none"
        />
      </div>
    </div>
  );
}

export default function TwoWays() {
  return (
    <section className="bg-[#060B12]">
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
            alt="Gestapelte, zu einem Bündel geschnürte Materialpakete"
          />

          <Card
            title="Direkt verhandeln"
            lead="Du willst nicht bündeln? Finde geprüfte Baustoffwerke und verhandle direkt — mit dem KBOB-Referenzpreis als Basis."
            cta="Zum Netzwerk"
            href="/network"
            src="/art-direkt.jpg"
            alt="Handschlag als Zeichen des direkten Abschlusses"
          />
        </div>
      </div>
    </section>
  );
}
