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

      {/* Bildbühne: das Motiv steht klein und mittig, mit Luft nach unten.
          Kein Verlauf darueber, kein Schimmer dahinter — beides hat frueher
          einen hellen Kasten um das Bild erzeugt.

          Der eigentliche Grund fuer den hellen Rand lag aber in der Datei
          selbst: der Hintergrund von art-direkt lag bei rgb(27,19,7) statt
          auf Schwarz. Behoben per Schwarzpunkt-Korrektur — beide Aufnahmen
          haben jetzt 0/0/0 und gehen randlos in die schwarze Karte ueber. */}
      <div className="mt-8 flex h-[230px] items-center justify-center px-8 pb-10 sm:mt-10 sm:h-[255px] sm:px-12 sm:pb-12">
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
      className="max-h-full w-auto max-w-full object-contain"
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
