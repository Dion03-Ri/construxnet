import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { StaffelUebersicht } from "@/components/rabatt/Staffel";
import { ArrowRight } from "lucide-react";
import {
  BTN_GOLD,
  BTN_OUTLINE_DARK,
  D_LG,
  D_MD,
  EYEBROW,
  GROUND,
  LEAD,
  SECTION_TIGHT,
  SHELL,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "So funktioniert es · Obtanet",
  description:
    "Das Modell hinter Obtanet: Bedarf mehrerer Baufirmen wird zu einem Volumen gebündelt, Werke bieten verdeckt darauf, gemessen am KBOB-Referenzpreis.",
};

/* ------------------------------------------------------------------ */
/*  Der Ablauf                                                         */
/* ------------------------------------------------------------------ */
/* Fünf Schritte, jeder eine volle Zeile: Nummer links, Text rechts.
   Ein Ablauf ist eine Reihenfolge — als Vierspalter nebeneinander liest
   man ihn als Aufzählung, untereinander als Abfolge. Bewusst ohne
   Symbole: vier gleich aussehende Icon-Kacheln erklären nichts. */
const STEPS: { t: string; d: string }[] = [
  {
    t: "Bedarf melden",
    d: "Material, Menge, Region, frühester und spätester Liefertermin. Wer eine Ausschreibung als PDF hat, lädt sie hoch, statt die Angaben abzutippen. Die Meldung ist unverbindlich — sie sagt, was du brauchst, nicht, dass du kaufst.",
  },
  {
    t: "Das Bündel entsteht",
    d: "Gleichartiger Bedarf derselben Region und desselben Zeitfensters wird zu einem Volumen zusammengelegt. Du siehst laufend, wie voll das Bündel ist und wann es schliesst. Bis zum Schliessen kannst du deine Menge ändern oder aussteigen.",
  },
  {
    t: "Werke bieten verdeckt",
    d: "Ist das Bündel geschlossen, geht es an die Werke der Region. Jedes gibt genau ein Angebot ab, ohne die Angebote der anderen zu sehen (Sealed Bid). Das verhindert, dass sich alle am tiefsten Aushang orientieren, statt zu rechnen.",
  },
  {
    t: "Zuschlag und Vertrag",
    d: "Die Angebote werden nebeneinander gestellt — Preis, Lieferbedingungen, Abweichungen. Wer den Zuschlag erteilt, schliesst den Vertrag direkt mit dem Werk; die Vorlage nach SIA 118 liegt bereit. Obtanet ist nicht Vertragspartei.",
  },
  {
    t: "Lieferung und Abrufe",
    d: "Abrufe, Lieferscheine und Termine laufen im Dashboard weiter, damit am Ende nachvollziehbar ist, was zu welchem Preis auf welche Baustelle ging.",
  },
];

/* Fragen, die beim ersten Lesen wirklich aufkommen — nicht die,
   die sich gut beantworten lassen. */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Muss ich kaufen, wenn ich einen Bedarf melde?",
    a: "Nein. Verbindlich wird es erst, wenn du einem konkreten Angebot den Zuschlag erteilst. Bis dahin kannst du die Menge ändern oder aus dem Bündel aussteigen.",
  },
  {
    q: "Sehen andere Firmen, was ich brauche?",
    a: "Im Bündel zählt nur die Menge, nicht wer sie meldet. Die Werke sehen das Gesamtvolumen, die Region und das Zeitfenster — nicht die Liste der beteiligten Firmen. Wer im Netzwerk offen auftreten will, kann das, muss aber nicht.",
  },
  {
    q: "Was passiert, wenn zu wenige mitmachen?",
    a: "Erreicht ein Bündel die Mindestmenge nicht, wird es nicht ausgeschrieben. Dein Bedarf bleibt bestehen und läuft in die nächste Runde — oder du gehst über das Netzwerk direkt auf ein Werk zu.",
  },
  {
    q: "Wer haftet für Menge, Qualität und Termin?",
    a: "Das Werk, das liefert. Obtanet vermittelt und stellt die Werkzeuge, wird aber nicht Partei des Liefergeschäfts. Was das im Einzelnen heisst, steht in den AGB.",
  },
  {
    q: "Kann ich auch als Lieferant mitmachen?",
    a: "Ja. Baustoffwerke, Transporteure und Lieferanten legen ein Firmenprofil an und erhalten die Bündel ihrer Region zur Angebotsabgabe. Für ein Werk ist ein gebündelter Auftrag eine Anfrage statt zwanzig.",
  },
];

export default function SoFunktioniertEsPage() {
  return (
    <main className={GROUND}>
      {/* ========================= Kopf ========================= */}
      <section className={cn(SHELL, "pb-16 pt-14 sm:pb-20 sm:pt-20")}>
        <div className="max-w-3xl">
          <span className={EYEBROW}>Das Modell</span>
          <h1 className={cn(D_LG, "mt-6 text-white")}>
            Wie aus einzelnen Bedarfen ein Volumen wird
          </h1>
          <p className={cn(LEAD, "mt-8 max-w-xl text-white/[0.72]")}>
            Auf dem Baustoffmarkt entscheidet die Menge über den Preis — für jede Firma, die
            einkauft. Obtanet legt den Bedarf mehrerer Schweizer Baufirmen zu einem Volumen
            zusammen. Aus einzelnen Bestellungen wird eine Menge, über die sich verhandeln
            lässt, und jede beteiligte Firma bekommt bessere Konditionen, als sie allein
            aushandeln würde.
          </p>
        </div>
      </section>

      {/* ===================== Zwei Wege ===================== */}
      <section className="border-t border-white/[0.12]">
        <div className={cn(SHELL, SECTION_TIGHT)}>
          <h2 className={cn(D_MD, "max-w-xl text-white")}>Zwei Wege zum Preis</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-lg">
              <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
                Bündeln
              </div>
              <p className="mt-4 text-[15.5px] leading-[1.65] text-white/[0.72]">
                Du meldest, was du brauchst. Andere Firmen in derselben Region melden
                dasselbe Material im selben Zeitfenster. Aus den einzelnen Bedarfen wird ein
                Volumen, auf das die Werke bieten. Du bleibst dabei eigenständig: eigener
                Vertrag, eigene Lieferung, eigene Rechnung — gemeinsam ist nur die
                Verhandlungsmasse.
              </p>
            </div>
            <div className="max-w-lg">
              <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
                Direkt verhandeln
              </div>
              <p className="mt-4 text-[15.5px] leading-[1.65] text-white/[0.72]">
                Nicht jeder Bedarf passt in ein Bündel. Für alles andere gibt es das
                Netzwerk: Schweizer Firmen mit geprüfter UID, nach Region und Gewerk
                auffindbar, direkt anschreibbar. Kapazitäten, Restmengen und kurzfristige
                Ausfälle laufen über denselben Kanal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== Ablauf ====================== */}
      <section className="border-t border-white/[0.12]">
        <div className={cn(SHELL, SECTION_TIGHT)}>
          {/* Titel links, Ablauf rechts. Alle Abschnitte linksbündig
              untereinander laufen zu lassen, laesst die rechte Haelfte des
              Bildschirms ueber die ganze Seite leer — und liest sich nach
              drei Abschnitten gleichfoermig. */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
            <div>
              <span className={EYEBROW}>Ablauf</span>
              <h2 className={cn(D_MD, "mt-5 text-white")}>Von der Meldung bis zur Baustelle</h2>
            </div>

            <ol className="max-w-[680px]">
              {STEPS.map((s, i) => (
                <li
                  key={s.t}
                  className="flex gap-6 border-t border-white/[0.08] py-7 first:border-t-0 first:pt-0 sm:gap-10"
                >
                  <span className="w-8 shrink-0 pt-1 font-display text-[15px] font-medium tabular-nums text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-white">{s.t}</h3>
                    <p className="mt-2.5 text-[15px] leading-[1.65] text-white/[0.72]">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ==================== Die Garantie ==================== */}
      {/* Die Seite erklärte den Ablauf und die Referenz, aber nie die
          Zahlen. Wer wissen wollte, was ihm zugesichert wird, fand es
          nirgends — und eine Garantie, die man nicht nachschlagen kann,
          ist keine. Die Tabelle kommt aus `rabattstufen`, derselben
          Quelle, aus der die Datenbank rechnet; sie kann deshalb nicht
          von der Wirklichkeit abweichen. */}
      <section className="border-t border-white/[0.12]">
        <div className={cn(SHELL, SECTION_TIGHT)}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
            <div>
              <span className={EYEBROW}>Die Garantie</span>
              <h2 className={cn(D_MD, "mt-5 text-white")}>Was dir zugesichert ist</h2>
              <p className={cn(LEAD, "mt-6 text-white/[0.72]")}>
                Der Mindestvorteil richtet sich nach <b className="font-semibold text-white">deinem
                eigenen Bestellwert</b> in einer Materialkategorie — nicht nach der Grösse des
                Bündels. Wer viel bestellt, bekommt mehr zugesichert als wer wenig bestellt, auch
                wenn beide im selben Bündel liegen.
              </p>
            </div>

            <div className="max-w-[680px]">
              <StaffelUebersicht />

              <div className="mt-8 space-y-4 border-t border-white/[0.08] pt-7 text-[14px] leading-[1.65] text-white/[0.72]">
                <p>
                  <b className="font-semibold text-white">Das ist die Untergrenze, nicht der Preis.</b>{" "}
                  In der verdeckten Ausschreibung bieten die Werke darunter — mehr ist möglich,
                  weniger nicht. Wird die Untergrenze nicht erreicht, löst sich das Bündel auf und
                  niemand ist gebunden.
                </p>
                <p>
                  <b className="font-semibold text-white">Unterhalb der ersten Schwelle sichern wir
                  nichts zu.</b> Der Bedarf geht trotzdem ins Bündel und in die Ausschreibung — nur
                  ohne zugesicherten Prozentsatz.
                </p>
                <p>
                  <b className="font-semibold text-white">Nicht jede Kategorie ist gestaffelt.</b>{" "}
                  Indexnahe Güter wie Bewehrungsstahl geben eine Mengenstaffel nicht her; dort wird
                  einzeln verhandelt statt etwas zugesichert, das kein Werk halten kann.
                </p>
                <p>
                  Gemessen wird gegen den Referenzpreis, der bei deiner Anfrage festgehalten wurde —
                  nicht gegen den Stand am Liefertag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== Preisreferenz ================== */}
      <section className="border-t border-white/[0.12]">
        <div className={cn(SHELL, SECTION_TIGHT)}>
          <div className="max-w-[560px]">
            <div>
              <span className={EYEBROW}>Referenz</span>
              <h2 className={cn(D_MD, "mt-5 text-white")}>Woran ein Angebot gemessen wird</h2>
              <p className={cn(LEAD, "mt-6 text-white/[0.72]")}>
                Ein Preis allein sagt wenig — er sagt etwas im Vergleich. Als Vergleichsgrösse
                dienen die Materialpreisindizes der KBOB, der Koordination der Bau- und
                Liegenschaftsorgane der öffentlichen Bauherren. Jedes Angebot lässt sich
                dagegen halten, und der Verlauf zeigt, ob der Markt gerade steigt oder fällt.
              </p>
              <Link
                href="/kbob"
                className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-white transition-colors hover:text-brand"
              >
                Zum KBOB-Index <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= Fragen ======================= */}
      <section className="border-t border-white/[0.12]">
        <div className={cn(SHELL, SECTION_TIGHT)}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
            <h2 className={cn(D_MD, "text-white")}>Häufige Fragen</h2>
            <dl className="max-w-[680px]">
              {FAQ.map((f) => (
                <div key={f.q} className="border-t border-white/[0.08] py-7 first:border-t-0 first:pt-0">
                  <dt className="text-[17px] font-semibold tracking-[-0.01em] text-white">{f.q}</dt>
                  <dd className="mt-2.5 text-[15px] leading-[1.65] text-white/[0.72]">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ======================== Schluss ======================== */}
      <section className={cn(SHELL, "pb-24 pt-4 lg:pb-32")}>
        <div className="rounded-[20px] bg-accent-600 px-6 py-14 text-white sm:px-14 sm:py-16">
          <div className="max-w-xl">
            <h2 className={cn(D_MD, "text-white")}>Der erste Bedarf kostet nichts</h2>
            <p className={cn(LEAD, "mt-6 text-white/[0.72]")}>
              Firmenprofil anlegen, Material und Menge melden — danach siehst du, ob für deine
              Region und dein Zeitfenster ein Bündel entsteht.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/sign-up" className={BTN_GOLD}>
                Kostenlos registrieren
              </Link>
              <Link href="/pools" className={BTN_OUTLINE_DARK}>
                Offene Bündel ansehen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
