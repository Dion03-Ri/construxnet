import Link from "next/link";
import { cn } from "@/lib/utils";
import { D_LG, D_MD, EYEBROW, BTN_LIGHT, SECTION } from "@/lib/ui";

/**
 * Zwei Wege zum besseren Preis — im Aufbau der grossen Produktkarten:
 * dunkler Grund, sehr weiche Ecken, hauchdünner Rand, mittig Titel, kurzer
 * Satz, runder Knopf — und darunter ein Bild, das bis an die untere Kante
 * läuft und von unten leuchtet.
 *
 * Die Bilder sind aus unseren eigenen Bausteinen gebaut, nicht eingekauft:
 * links die Bündelung (drei Bedarfe werden ein Volumen), rechts der direkte
 * Weg (ein Werk, ein Preis gegen die KBOB-Referenz).
 */


function Card({
  title,
  lead,
  cta,
  href,
  children,
}: {
  title: string;
  lead: string;
  cta: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.09] bg-black pt-9 sm:rounded-[32px] sm:pt-12">

      <div className="relative px-6 text-center sm:px-10">
        <h3 className={cn(D_MD, "text-white")}>{title}</h3>
        <p className="mx-auto mt-4 max-w-[24rem] text-[14.5px] font-medium leading-relaxed text-white/60 sm:text-[15.5px]">
          {lead}
        </p>
        <Link
          href={href}
          className={cn(BTN_LIGHT, "mt-7 sm:mt-8")}
        >
          {cta}
        </Link>
      </div>

      {/* Bildbühne.
          Drei Dinge waren hier falsch und liessen jedes Motiv billig und
          angeschnitten wirken, egal wie gut es war:
          1. Das Bild sass mit `items-end` bündig auf der Unterkante einer
             Fläche mit `overflow-hidden` — es sah aus, als sei es dort
             abgesäbelt worden.
          2. Ein schwarzer Verlauf lag ÜBER dem unteren Drittel und liess es
             wegblassen. Auf schwarzem Grund über schwarzem Bild hatte er
             ohnehin nichts zu verbergen.
          3. Beide Aufnahmen hatten unterschiedliche Seitenverhältnisse, aber
             eine feste Höhe — dadurch war die eine schmal und die andere
             breit, und die zwei Karten wirkten unabgestimmt.

          Jetzt: eine gleich grosse Bühne je Karte, das Motiv mittig und
          vollständig darin, mit Luft nach unten. `object-contain` sorgt
          dafür, dass jedes künftige Bild — hoch, quer oder quadratisch —
          dieselbe Fläche einnimmt, ohne beschnitten zu werden. */}
      <div className="mt-8 flex h-[230px] items-center justify-center px-6 pb-9 sm:mt-10 sm:h-[260px] sm:px-10 sm:pb-11">
        {children}
      </div>
    </div>
  );
}

/**
 * Ein Bildmotiv auf der Bühne.
 *
 * Nie beschneiden, nie verlaufen lassen, nie an eine Kante drücken — das
 * Motiv steht vollständig und mittig da. Alles, was es braucht, ist ein
 * freigestelltes Objekt auf reinem Schwarz; die Karte ist ebenfalls
 * schwarz, deshalb bleibt die Bildkante unsichtbar.
 */
function Art({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(
        "max-h-full w-auto max-w-full object-contain",
        // Die Renders bringen einen warmen Lichtschein mit, der bis an den
        // Bildrand reicht (gemessen rgb(70,53,31), nicht schwarz). Auf der
        // schwarzen Karte endete der in einem sichtbaren Rechteck — das war
        // der Grund, warum die Motive billig wirkten.
        //
        // Statt die Tiefen wegzurechnen und das Objekt flach zu machen,
        // laeuft der Rand weich aus. Das wirkt auch bei jedem kuenftigen
        // Bild, ganz gleich wie sauber es freigestellt ist.
        "[-webkit-mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_88%)]",
        "[mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_88%)]",
      )}
    />
  );
}

export default function TwoWays() {
  return (
    <section className="bg-[#060B12]">
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", SECTION)}>
        <div className="mb-12 max-w-2xl sm:mb-16">
          <span className={EYEBROW}>
            Zwei Wege
          </span>
          <h2 className={cn(D_LG, "mt-5 text-white")}>
            Zum besseren Preis — gebündelt oder direkt.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <Card
            title="Gemeinsam bündeln"
            lead="Dein Bedarf wird mit gleichen Bedarfen deiner Region zusammengelegt. Je grösser das Bündel, desto höher der Mengenrabatt."
            cta="Smart Pools ansehen"
            href="/pools"
          >
            <Art src="/art-buendel.jpg" alt="Zu einem Bündel geschnürter Materialstapel" />
          </Card>

          <Card
            title="Direkt verhandeln"
            lead="Du willst nicht bündeln? Finde geprüfte Baustoffwerke und verhandle direkt — mit dem KBOB-Referenzpreis als Basis."
            cta="Zum Netzwerk"
            href="/network"
          >
            <Art src="/art-direkt.jpg" alt="Handschlag als Zeichen des direkten Abschlusses" />
          </Card>
        </div>
      </div>
    </section>
  );
}
