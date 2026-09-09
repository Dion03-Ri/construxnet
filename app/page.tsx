import Link from "next/link";
import TwoWays from "@/components/home/TwoWays";
import SiteFooter from "@/components/SiteFooter";
import ProcessVideo from "@/components/home/ProcessVideo";
import Pricing from "@/components/home/Pricing";
import { HERO_IMAGE, PHOTO_POOLS, PHOTO_NETWORK } from "@/data/media";
import TrustBar from "@/components/home/TrustBar";
import {
  ArrowRight,
  Megaphone,
  BadgeCheck,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Search,
  Plus,
  Coins,
  Handshake,
  Truck,
  Users,
} from "lucide-react";
import { BTN_GOLD, BTN_LIGHT, BTN_OUTLINE_DARK, D_LG, D_MD, D_XL, EYEBROW, GROUND, LEAD, ROW_HOVER, SECTION_TIGHT, SECTION_WIDE, SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Daten (illustrative Produkt-Vorschau — pre-launch)                 */
/* ------------------------------------------------------------------ */
const POOLS = [
  { material: "Beton C25/30", region: "Zürich", volume: "180 m³", deadline: "4 Tage", fill: 77 },
  { material: "Bewehrungsstahl B500B", region: "Bern", volume: "48 t", deadline: "9 Tage", fill: 54 },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", volume: "320 t", deadline: "2 Tage", fill: 88 },
];

const COMPANIES = [
  { name: "Muster Bau AG", city: "Zürich", uid: "CHE-102.345.678", cat: "Bauunternehmen" },
  { name: "Beispiel Beton Mittelland", city: "Bern", uid: "CHE-114.987.221", cat: "Baustoffwerk" },
  { name: "Musterbau Innerschweiz AG", city: "Luzern", uid: "CHE-108.556.019", cat: "Bauunternehmen" },
];

// Bewusst ohne Icons: eine Nummer und zwei Zeilen Text tragen den Ablauf
// besser als vier Symbolkacheln, die alle gleich aussehen.
const STEPS = [
  { t: "Bedarf melden", d: "Material, Menge, Region — oder die Ausschreibung als PDF." },
  { t: "Bündeln", d: "Gleiche Bedarfe derselben Region werden zu einem Volumen." },
  { t: "Sealed-Bid", d: "Werke bieten verdeckt gegen den KBOB-Referenzpreis." },
  { t: "Vertrag & Lieferung", d: "Zuschlag, SIA-118-Vertrag, Lieferung — alles im Dashboard." },
];

/* Feine Raster-Textur der dunklen Panels (identisch zum Feed) */

/* ------------------------------------------------------------------ */
/*  Produkt-Vorschau: Miniatur des 3-Spalten-Dashboards                */
/* ------------------------------------------------------------------ */

/**
 * Ein Foto, das als Grund gemeint ist und nicht als Bild.
 *
 * Vorher lagen hier zwei Aufnahmen in voller Helligkeit auf weissem
 * Papier. Sie waren das Lauteste im ganzen Abschnitt und standen dabei
 * ueber zwei Listen, mit denen sie nichts zu tun haben — das Auge blieb
 * am Foto haengen statt an den Zahlen darunter.
 *
 * Jetzt abgedunkelt und in Navy getoent: die Aufnahme bleibt am selben
 * Ort und zeigt dasselbe, tritt aber hinter die Liste zurueck. Der
 * Ein Verlauf nach Weiss stand kurz drin und war falsch: er machte den
 * unteren Rand milchig, statt das Bild einzufaedeln. Eine dunkle Flaeche
 * auf weissem Papier braucht keinen Uebergang — so sieht ein gedrucktes
 * Bild aus.
 *
 * Die Werte sind von Hand eingestellt, nicht geraten: bei 0.58 Helligkeit
 * bleibt die Struktur des Materials erkennbar, darunter wird das Bild zur
 * grauen Flaeche.
 */
function SectionPhoto({ slot, className }: { slot: { src: string; alt: string }; className?: string }) {
  return (
    /* Auf dem Handy ein Band ueber der Liste, ab lg eine hochkante Spalte,
       die sich auf die Hoehe der Liste zieht (Raster streckt von selbst). */
    <div className={cn("relative h-44 overflow-hidden rounded-2xl sm:h-52 lg:h-auto", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slot.src}
        alt={slot.alt}
        loading="lazy"
        className="h-full w-full object-cover [filter:brightness(0.58)_saturate(0.5)_contrast(1.08)]"
      />
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[#1B3A5C]/30" />
    </div>
  );
}

export default function Home() {
  return (
    <main className={GROUND}>
      {/* ============================ HERO ============================ */}
      {/* Vollflaechiges Bild statt einer Grafik neben dem Text. Der Kran bei
          Nacht bringt das Navy der Marke schon mit — es muss nichts eingefaerbt
          werden. Zwei Verlaeufe legen sich darueber: einer von links, damit die
          Schrift steht, einer von unten, damit der Uebergang zum naechsten
          Abschnitt nicht abreisst. */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[64%_38%]"
        />
        {/* Zwei getrennte Abdunklungen statt einer fuer alles.
            Am Bildschirm steht der Text links neben dem Bild, also faellt
            der Verlauf von links. Auf dem Handy steht er MITTEN darauf —
            dort braucht es eine Abdunklung von unten und oben, sonst laeuft
            die Schrift ueber das Kranlicht und wird unlesbar. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/70 lg:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-r from-navy-950 via-navy-950/82 to-navy-950/5 lg:block"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-t from-navy-950 via-transparent to-navy-950/45 lg:block"
        />

        {/* Der Textblock sitzt OBEN, nicht in der Mitte.

            Vorher stand er senkrecht zentriert — dadurch begann die
            Ueberschrift auf halber Hoehe, und darueber wie darunter lag
            gleich viel Leere. Das ist die Anordnung, die jede erzeugte
            Startseite hat.

            Vorbild ist Revolut: die Ueberschrift beginnt kurz unter der
            Kopfleiste, der ganze Block steht im oberen Drittel, und
            darunter bleibt das Bild stehen. Der Blick faellt zuerst auf
            den Satz, dann faellt er ins Bild — nicht umgekehrt. */}
        <div className={cn(SHELL, "relative")}>
          <div className="pb-32 pt-16 sm:pb-44 sm:pt-20 lg:w-[72%] lg:pb-64 lg:pt-24 2xl:w-[62%]">
            <span className={EYEBROW}>Die Zukunft der Beschaffung</span>

            {/* Vorher stand hier „Vernetzen. Bündeln. Sparen." — drei
                abstrakte Verben, jedes auf einer Zeile, das letzte in Gold.
                Das ist das meistkopierte Überschriftenmuster überhaupt und
                sagt nichts, was nicht auf hundert anderen Seiten steht.

                Jetzt ein Satz, der die zwei Seiten des Modells nennt:
                gemeinsam mit anderen Baufirmen einkaufen, und direkt mit
                dem verhandeln, der auf der anderen Seite des Geschäfts
                sitzt. Kein Gold in der Überschrift — die Zeile darüber und
                der Knopf darunter tragen die Farbe, das reicht. */}
            {/* Groesser als vorher (D_XL statt D_LG). Eine Ueberschrift, die
                nur wenig groesser ist als der Fliesstext darunter, sieht
                aus wie ein Absatz mit Fettdruck. */}
            <h1 className={cn(D_XL, "mt-6 text-white lg:text-[4.5rem] 2xl:text-[5rem]")}>
              Gemeinsam einkaufen,<br className="hidden sm:block" /> direkt verhandeln.
            </h1>

            {/* Schmaler als vorher: eine kurze, tiefe Textspalte neben einer
                grossen Ueberschrift liest sich als Absicht, eine breite
                flache als Fuellung. */}
            <p className={cn(LEAD, "mt-8 max-w-md text-white/[0.72]")}>
              Obtanet legt den Bedarf mehrerer Schweizer Baufirmen zu einem Volumen
              zusammen und setzt dich an denselben Tisch wie die Werke, die darauf
              bieten. Statt Katalogpreis ein Preis, der ausgehandelt wurde.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/beschaffung" className={BTN_GOLD}>
                <Megaphone className="h-4 w-4" /> Materialbedarf melden
              </Link>
              {/* „Offene Buendel ansehen" war ein Produktlink — er ergibt erst
                  Sinn, wenn man das Modell schon verstanden hat. Wer zum
                  ersten Mal hier ist, versteht es nicht. */}
              <Link href="/so-funktioniert-es" className={BTN_OUTLINE_DARK}>
                Wie es funktioniert <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Vertrauensanker ================= */}
      <TrustBar />

      {/* ============ Zwei Wege zum besseren Preis ============ */}
      <TwoWays />

      {/* ================= Smart Pools =================
          Links die Aussage, rechts der Film — und der laeuft rechts aus
          dem Bild heraus, statt in einem Rahmen zu sitzen. Ein Video, das
          brav in seiner Box bleibt, sieht aus wie ein eingebetteter
          Youtube-Clip; eines, das die Bildkante schneidet, gehoert zur
          Seite.

          Die drei nummerierten Belege standen frueher hier. Sie sind weg:
          der Film zeigt genau das, was sie behaupteten — dass der Vorteil
          am Buendel haengt, dass am KBOB gemessen wird, dass der Vorteil
          vorher feststeht. Beides nebeneinander waere dieselbe Aussage
          zweimal.

          `autoPlay muted loop playsInline` ist die einzige Kombination,
          die auf dem Handy von selbst laeuft — ohne `muted` und
          `playsInline` verweigern iOS und Android den Start. Wer
          reduzierte Bewegung eingestellt hat, bekommt das Standbild. */}
      <section className="overflow-hidden border-y border-white/[0.12] bg-[#0a0a0a]">
        <div className={cn(SHELL, SECTION_WIDE, "grid grid-cols-1 items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]")}>
          <div>
            <span className={EYEBROW}>Smart Pools</span>
            <h2 className={cn(D_LG, "mt-6 text-white")}>
              Mengenrabatte,<br />die alleine<br />niemand bekommt.
            </h2>
            <p className={cn(LEAD, "mt-8 max-w-md text-white/[0.72]")}>
              Wer alleine einkauft, zahlt Einzelpreise. Obtanet legt den Bedarf
              mehrerer Baufirmen zusammen und verhandelt mit dem ganzen Volumen.
            </p>
            <Link href="/pools" className={cn(BTN_LIGHT, "mt-10")}>
              So funktioniert ein Pool
            </Link>

            {/* Auf dem Handy statt des Films die drei Belege.

                Der Film ist 16:9 und traegt Schrift in 34 px — auf 390 px
                Breite sind das sieben Pixel, also nichts. Ein Video, das
                man nicht lesen kann, ist auf dem Handy kein Inhalt,
                sondern ein Ladebalken. Dort steht deshalb, was der Film
                sagt, in Worten. */}
            <dl className="mt-12 lg:hidden">
              {[
                ["Je grösser das Bündel, desto höher der Rabatt", "Auch kleine Einzelbestellungen profitieren — deine Stufe hängt an deiner Menge, dass es die Stufe gibt, am Bündel."],
                ["Gemessen am KBOB-Referenzpreis", "Kein Prospektversprechen, sondern eine Grösse, die sich nachrechnen lässt."],
                ["Der Mindestvorteil steht vorher fest", "Wird er bis zur Frist nicht erreicht, löst sich das Bündel auf. Es entsteht keine Verpflichtung."],
              ].map(([t, d], i) => (
                <div key={t} className="border-t border-white/[0.12] py-7 last:pb-0">
                  <dt className="flex items-baseline gap-4">
                    <span className="font-display text-[13px] font-bold tabular-nums text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[17px] font-bold leading-snug tracking-tight text-white">{t}</span>
                  </dt>
                  <dd className="mt-2.5 pl-[2.1rem] text-[13.5px] leading-relaxed text-white/[0.56]">{d}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Der Film laeuft ueber die rechte Kante hinaus: er ist breiter
              als seine Spalte und wird nicht beschnitten, sondern vom
              `overflow-hidden` des Abschnitts abgeschnitten. */}
          <div className="relative hidden lg:block lg:-mr-[72px] lg:w-[calc(100%+72px)] 2xl:-mr-[160px] 2xl:w-[calc(100%+160px)]">
            <video
              className="w-full rounded-l-2xl border-y border-l border-white/[0.12] lg:rounded-r-none"
              src="/smart-pools.webm"
              poster="/smart-pools-poster.png"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Wie aus vier Bestellungen ein Volumen wird: Bündelung, verdeckte Angebote am KBOB-Referenzpreis gemessen, Zuschlag, und die Verteilung des Vorteils nach eingebrachter Menge."
            />
          </div>
        </div>
      </section>

      {/* ================= Von der Anfrage zum Vertrag =================
          Ein Ablauf ist eine Reihenfolge, kein Raster. Vorher standen die
          vier Schritte als Vierspalter nebeneinander — man las sie von
          links nach rechts wie eine Aufzählung, nicht wie eine Abfolge.

          Jetzt untereinander, jeder Schritt eine volle Zeile mit der Nummer
          links und dem Text rechts, und jeder rückt etwas weiter ein. Man
          sieht die Treppe. */}
      <section className="bg-black text-white">
        <div className={cn(SHELL, SECTION_TIGHT)}>
          <div className="max-w-2xl">
            <span className={EYEBROW}>Ablauf</span>
            <h2 className={cn(D_MD, "mt-5 text-white")}>Von der Anfrage zum Vertrag</h2>
            <p className={cn(LEAD, "mt-6 text-white/[0.72]")}>
              Vier Schritte, vollständig im Dashboard — von der ersten Meldung bis zur
              Lieferung auf die Baustelle.
            </p>
          </div>

          {/* Die vier Schritte sind zugleich die Kapitel des Videos.
              Ohne hinterlegte Videoadresse steht hier die reine Liste. */}
          <ProcessVideo chapters={STEPS} />
        </div>
      </section>

      {/* ================= Pools + Netzwerk ================= */}
      {/* Der eine helle Abschnitt der Startseite.

          Bis hierher ist die Seite durchgehend schwarz — sechstausend
          Pixel ohne Wechsel. Das ist nicht ruhig, das ist gleichfoermig.
          Hier liegt deshalb ein weisses Blatt: dieselbe Regel wie in der
          Anwendung, wo Nachrichten und Formulare Papier sind und Markt
          und Zahlen dunkel bleiben. Was hier steht, ist zum Lesen — zwei
          Listen, wer gerade buendelt und wer im Netzwerk ist.

          Danach geht es wieder ins Schwarze und zum Schluss ins Navy. */}
      <section className="bg-white text-slate-900">
        <div className={cn(SHELL, SECTION_WIDE)}>
          <div className="max-w-2xl">
            <span className={cn(EYEBROW, "text-brand-700")}>Gerade auf Obtanet</span>
            <h2 className={cn(D_MD, "mt-4 text-slate-900")}>Bündel und Firmen, offen einsehbar</h2>
          </div>

          {/* Das Foto steht hochkant neben der Liste, nicht als Band darueber.

              Vorher lagen die beiden Aufnahmen als breite Streifen ueber
              ihren Listen — sie gehoerten zu nichts und lasen sich als
              Zierleiste. Hochkant neben einer Textspalte liest dasselbe
              Bild als Beleg, und die Liste bekommt die Breite, die sie
              braucht: die Fortschrittsbalken standen vorher auf 16 rem in
              einer halben Spalte.

              Die Seiten wechseln: beim ersten Block links, beim zweiten
              rechts. Auf dem Handy steht das Bild ueber der Liste — 220 px
              Breite gibt es dort nicht. */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
            <SectionPhoto slot={PHOTO_POOLS} />
            <div>
              <div className="flex items-baseline justify-between border-b border-slate-900 pb-3">
                <h3 className="text-[19px] font-bold tracking-tight text-slate-900">Aktive Smart Pools</h3>
                <Link href="/pools" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand">
                  Alle <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul>
                {POOLS.map((p) => (
                  <li key={p.material} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 border-t border-slate-200 py-5 first:border-t-0">
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-slate-900">{p.material}</div>
                      <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-600">
                        <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                      </div>
                      <div className="mt-3 h-1 w-full max-w-[24rem] overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${p.fill}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[20px] font-bold tabular-nums leading-none text-slate-900">
                        {p.fill}<span className="text-[13px] text-slate-600"> %</span>
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] text-slate-600">
                        <Clock className="h-3 w-3" /> {p.deadline}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
            <SectionPhoto slot={PHOTO_NETWORK} className="lg:order-last" />
            <div className="lg:order-first">
              <div className="flex items-baseline justify-between border-b border-slate-900 pb-3">
                <h3 className="text-[19px] font-bold tracking-tight text-slate-900">Firmen im Netzwerk</h3>
                <Link href="/network" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand">
                  Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul>
                {COMPANIES.map((c) => (
                  <li key={c.uid} className="flex items-center gap-4 border-t border-slate-200 py-5 first:border-t-0">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                      {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-slate-900">
                        {c.name} <BadgeCheck className="h-4 w-4 shrink-0 text-brand-700" />
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-slate-600">{c.cat} · {c.city}</div>
                    </div>
                    <Link href="/network" className="shrink-0 text-[13px] font-semibold text-brand-700 transition-colors hover:text-brand">
                      Vernetzen
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Preise ================= */}
      <Pricing />

      {/* ================= Abschluss-CTA ================= */}
      <section className={cn(SHELL, "pb-24 lg:pb-32")}>
        {/* Der Schluss in Navy — die dritte Fläche der Seite.

            Vorher lag darüber ein Millimeterpapier-Raster und rechts oben
            ein verwaschener Goldnebel. Beides zeigt nichts: das Raster ist
            Zierrat, der Nebel ist der Farbschimmer, den jede erzeugte
            Landingpage in die Ecke setzt. Eine ruhige Fläche trägt die
            Aussage besser. */}
        <div className="relative overflow-hidden rounded-[20px] bg-accent-600 px-6 py-14 text-white sm:rounded-[20px] sm:px-14 sm:py-20">
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-brand-100">Loslegen</span>
              <h2 className={cn(D_MD, "mt-5")}>
                Bereit, günstiger und vernetzter zu bauen?
              </h2>
              <p className={cn(LEAD, "mt-6 max-w-lg text-white/[0.72]")}>
                Firmenprofil erstellen, ersten Materialbedarf melden — in wenigen Minuten.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/sign-up" className={BTN_GOLD}>
                  Kostenlos registrieren
                </Link>
                <Link href="/beschaffung" className={BTN_OUTLINE_DARK}>
                  Materialbedarf melden
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { icon: Users, t: "Geprüfte Schweizer Firmen", d: "CHE-verifiziert, keine anonymen Anbieter." },
                { icon: Coins, t: "KBOB als Preisbasis", d: "Jedes Angebot messbar gegen den Referenzpreis." },
                { icon: Truck, t: "Regional geliefert", d: "Werke aus deiner Region, kurze Wege." },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-3 rounded-[20px] border border-white/[0.12] bg-white/[0.04] px-4 py-3">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <div className="text-[13px] font-semibold">{f.t}</div>
                    {/* Auf Navy statt auf Schwarz: dieselbe Weissstufe traegt hier nur
                        4.46:1, weil die Flaeche heller ist. */}
                    <div className="text-[11.5px] text-white/[0.66]">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <SiteFooter />
    </main>
  );
}
