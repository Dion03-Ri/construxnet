import Link from "next/link";
import TwoWays from "@/components/home/TwoWays";
import SiteFooter from "@/components/SiteFooter";
import ProcessVideo from "@/components/home/ProcessVideo";
import PoolFilm from "@/components/home/PoolFilm";
import Pricing from "@/components/home/Pricing";
import { HERO_IMAGE, PHOTO_POOLS, PHOTO_NETWORK } from "@/data/media";
import TrustBar from "@/components/home/TrustBar";
import {
  ArrowRight,
  Megaphone,
  BadgeCheck,
  Coins,
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
  { material: "Beton C30/37", region: "Ostschweiz", volume: "240 m³", deadline: "12 Tage", fill: 41 },
  { material: "Zement CEM II/A-LL 42,5 N", region: "Zentralschweiz", volume: "90 t", deadline: "6 Tage", fill: 63 },
  { material: "Walzasphalt AC 11 S", region: "Genferseeregion", volume: "410 t", deadline: "14 Tage", fill: 35 },
];

/* Die Namen sind mit Absicht keine Namen.
   „Muster", „Beispiel" und „Demo" stehen davor, damit niemand eine dieser
   Zeilen fuer ein echtes Mitglied haelt — und damit keine erfundene Firma
   zufaellig heisst wie eine, die es wirklich gibt. Der Ort ist ein eigenes
   Feld und kein Namensbestandteil, aus demselben Grund.

   Drei waren es vorher. Drei Firmen mit je einem Knopf daneben lesen sich
   wie eine bezahlte Platzierung; ein Verzeichnis faengt bei einem Dutzend
   an, auszusehen wie ein Verzeichnis. */
const COMPANIES = [
  { name: "Muster Bau AG", city: "Zürich", cat: "Bauunternehmen" },
  { name: "Beispiel Baustoff AG", city: "Bern", cat: "Baustoffwerk" },
  { name: "Demo Tiefbau AG", city: "Luzern", cat: "Tiefbau" },
  { name: "Muster Kies AG", city: "Aarau", cat: "Kieswerk" },
  { name: "Beispiel Armierung AG", city: "Basel", cat: "Stahlhandel" },
  { name: "Demo Elementbau AG", city: "Winterthur", cat: "Elementwerk" },
  { name: "Muster Belagswerk AG", city: "St. Gallen", cat: "Belagswerk" },
  { name: "Beispiel Transport AG", city: "Thun", cat: "Transport" },
  { name: "Demo Erdbau AG", city: "Olten", cat: "Erdbau" },
  { name: "Muster Hochbau AG", city: "Chur", cat: "Bauunternehmen" },
  { name: "Beispiel Zimmerei AG", city: "Solothurn", cat: "Holzbau" },
  { name: "Demo Baustoffhandel AG", city: "Zug", cat: "Handel" },
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
 * Eine Bildtafel, wie sie in einem gedruckten Bericht steht.
 *
 * Vorher lagen die beiden Aufnahmen als hochkante Kacheln links und rechts
 * NEBEN je einer Liste, die Seiten abwechselnd. Das ist das am haeufigsten
 * kopierte Muster erzeugter Startseiten — Text, Bild, Text, Bild, im
 * Zickzack — und die Bilder gehoerten dabei zu nichts: ein Materiallager
 * neben einer Buendelliste erklaert die Liste nicht.
 *
 * Jetzt steht beides als ein einziges Band ueber dem ganzen Abschnitt,
 * zwei Aufnahmen durch eine Haarlinie getrennt, mit geraden Ecken. Eine
 * Tafel oeffnet ein Kapitel, sie begleitet keine Zeile.
 *
 * Abgedunkelt und in Navy getoent bleibt es. Die Werte sind von Hand
 * eingestellt, nicht geraten: bei 0.58 Helligkeit bleibt die Struktur des
 * Materials erkennbar, darunter wird das Bild zur grauen Flaeche.
 */
function Bildtafel({ slot, className }: { slot: { src: string; alt: string }; className?: string }) {
  return (
    <div className={cn("relative h-56 overflow-hidden lg:h-72", className)}>
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
      {/* Vollflaechiges Bild statt einer Grafik neben dem Text. Die Baustelle
          bei Nacht bringt das Navy der Marke schon mit — es muss nichts
          eingefaerbt werden. Zwei Verlaeufe legen sich darueber: einer von
          links, damit die Schrift steht, einer von unten, damit der Uebergang
          zum naechsten Abschnitt nicht abreisst.

          Der Bildausschnitt ist nicht ueberall derselbe. Am Bildschirm ist
          das Seitenverhaeltnis fast das des Bildes, es steht also ganz da.
          Auf dem Handy bleibt nur ein Drittel der Breite uebrig — und dort
          steht die Schrift MITTEN im Bild. Darum sitzt der Ausschnitt dort
          links, auf der ruhigen Baugrube, und nicht auf dem Tablet. */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[42%_58%] lg:object-[58%_50%]"
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
          Links die Aussage, rechts der Film.

          Die drei nummerierten Belege standen frueher hier. Sie sind weg:
          der Film zeigt genau das, was sie behaupteten — dass der Vorteil
          am Buendel haengt, dass gegen einen Referenzpreis gemessen wird,
          dass der Vorteil vorher feststeht. Beides nebeneinander waere
          dieselbe Aussage zweimal. Unter `lg` laeuft kein Film, sondern
          stehen die Belege als Text: der Film ist 16:9 und traegt Schrift
          in 34 px, auf 390 px Breite waeren das sieben Pixel.

          Das Abspielen steckt in PoolFilm — dort steht auch, warum das
          Javascript braucht und nicht `autoPlay` im Markup sein darf. */}
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
                ["Dein Bestellwert bestimmt deinen Mindestvorteil", "Dass es überhaupt eine Ausschreibung gibt, hängt am Bündel. Was dir darin zugesichert ist, hängt an deinem eigenen Bestellwert — nicht an der Grösse des Bündels."],
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

          {/* Der Film stand hier zuerst ueber die rechte Bildkante hinaus.
              Das sah in der Skizze gut aus und war in der Sache falsch: im
              Film steht Schrift, und was ueber die Kante laeuft, ist
              abgeschnitten und damit unlesbar. Ein Bild darf ueber den Rand
              hinauslaufen, ein Text nicht. Jetzt ganz in der Spalte. */}
          <div className="relative hidden lg:block">
            <PoolFilm />
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
            {/* Vor dem Start gibt es keine echten Buendel und keine echten
                Mitglieder. Das hier zu verschweigen und trotzdem Namen
                hinzuschreiben, waere die eine Sache, die man auf einer
                Startseite nicht tun darf. Also steht es da. */}
            <p className={cn(LEAD, "mt-5 text-slate-600")}>
              Wer gerade bündelt und wer im Netzwerk ist, steht offen — ohne
              Anmeldung. Bis zum Start sind die Einträge Beispiele; das Raster
              ist das, was danach hier steht.
            </p>
          </div>

          {/* Eine Tafel ueber dem Kapitel statt zwei Kacheln im Zickzack.
              Die Haarlinie zwischen den Aufnahmen entsteht durch gap-px auf
              grauem Grund — kein Rahmen, keine Ecken. */}
          <div className="mt-12 grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-[3fr_2fr]">
            <Bildtafel slot={PHOTO_POOLS} />
            <Bildtafel slot={PHOTO_NETWORK} className="hidden sm:block" />
          </div>

          {/* ---- Buendel: eine Tabelle, kein Kachelfeld ----
              Eine Kopfzeile, feste Spalten, sechs Zeilen. Was Daten sind,
              soll wie Daten aussehen; die grossen Prozentzahlen mit Uhr-
              und Ortssymbol daneben waren Schmuck um drei Zahlen herum. */}
          <div className="mt-14">
            <div className="flex items-baseline justify-between border-b border-slate-900 pb-3">
              <h3 className="text-[19px] font-bold tracking-tight text-slate-900">Aktive Smart Pools</h3>
              <Link href="/pools" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand">
                Alle ansehen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {/* Auf dem Handy faellt die Region weg, statt dass die Tabelle
                seitlich verschwindet. Vier Spalten passen auf 390 px, fuenf
                nicht — und eine Tabelle, von der man ein Stueck wegschieben
                muss, liest niemand. */}
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <th className="w-[38%] py-3 pr-4 font-semibold md:w-[28%]">Material</th>
                  <th className="hidden w-[16%] py-3 pr-4 font-semibold md:table-cell">Region</th>
                  <th className="w-[22%] py-3 pr-4 text-right font-semibold md:w-[12%] md:pr-6">Menge</th>
                  <th className="w-[20%] py-3 pr-4 text-right font-semibold md:w-[34%] md:text-left">Füllung</th>
                  <th className="w-[20%] py-3 text-right font-semibold md:w-[10%]">Frist</th>
                </tr>
              </thead>
              <tbody>
                {POOLS.map((p) => (
                  <tr key={p.material} className="border-t border-slate-200">
                    <td className="py-4 pr-4 text-[14.5px] font-semibold leading-snug text-slate-900">{p.material}</td>
                    <td className="hidden py-4 pr-4 text-[13.5px] text-slate-600 md:table-cell">{p.region}</td>
                    <td className="py-4 pr-4 text-right text-[13.5px] tabular-nums text-slate-900 md:pr-6">{p.volume}</td>
                    <td className="py-4 pr-4">
                      {/* Der Balken faellt auf dem Handy weg. Dreissig Pixel
                          Balken zeigen nichts, was die Zahl daneben nicht
                          schon sagt — und sie kosten die Breite, an der
                          „180 m³" sonst umbricht. */}
                      <div className="flex items-center justify-end gap-3 md:justify-start">
                        <div className="hidden h-1 flex-1 overflow-hidden bg-slate-200 md:block">
                          <div className="h-full bg-brand" style={{ width: `${p.fill}%` }} />
                        </div>
                        <span className="w-10 shrink-0 text-right text-[13.5px] font-semibold tabular-nums text-slate-900">
                          {p.fill} %
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-[13.5px] tabular-nums text-slate-600">{p.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Firmen: ein Verzeichnis in drei Spalten ----
              Vorher drei Zeilen, jede mit einem runden Kuerzel-Plaettchen
              und einem eigenen „Vernetzen" daneben. Genau so sieht eine
              bezahlte Platzierung aus: wenige Namen, jeder mit Aufforderung.
              Jetzt ein Dutzend Eintraege, gleich gewichtet, ohne Plaettchen
              und ohne Knopf — der eine Weg ins Netzwerk steht oben. */}
          <div className="mt-14 lg:mt-16">
            <div className="flex items-baseline justify-between border-b border-slate-900 pb-3">
              <h3 className="text-[19px] font-bold tracking-tight text-slate-900">Firmen im Netzwerk</h3>
              <Link href="/network" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand">
                Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
              {COMPANIES.map((c) => (
                <li key={c.name} className="border-t border-slate-200 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold text-slate-900">{c.name}</span>
                    <BadgeCheck aria-label="verifiziert" className="h-4 w-4 shrink-0 text-brand-700" />
                  </div>
                  <div className="mt-1 truncate text-[13px] text-slate-600">{c.cat} · {c.city}</div>
                </li>
              ))}
            </ul>
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
