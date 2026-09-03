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

      {/* Bildfläche. Beide Aufnahmen liegen auf reinem Schwarz und die Karte
          ist ebenfalls schwarz — deshalb ist die Bildkante unsichtbar. Der
          Verlauf unten faengt trotzdem ab, falls eine kuenftige Aufnahme
          nicht ganz sauber freigestellt ist. */}
      <div className="relative mt-6 h-[196px] overflow-hidden sm:mt-8 sm:h-[216px]">
        <div className="relative flex h-full items-end justify-center">{children}</div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black to-transparent"
        />
      </div>
    </div>
  );
}

/**
 * Die beiden Bildmotive.
 *
 * Bewusst klein und mittig statt formatfuellend: sie begleiten die Aussage,
 * sie ueberschreien sie nicht. Beide liegen auf reinem Schwarz und gehen
 * deshalb randlos in die schwarze Karte ueber.
 */
function Art({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-[172px] w-auto max-w-[76%] object-contain sm:h-[192px]"
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
