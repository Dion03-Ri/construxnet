import { Suspense } from "react";
import KbobChart from "@/components/KbobChart";
import GroupOverview from "@/components/kbob/GroupOverview";
import { D_MD, EYEBROW, SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Referenzpreise · Obtanet",
  description: "Baustoff-Referenzpreise und was du selbst dafür bezahlt hast",
};

export default async function KbobPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string }>;
}) {
  const { material } = await searchParams;

  return (
    <main className={cn(SHELL, "py-6")}>
      {/* Kopf über die volle Breite, ohne Kasten — wie auf Netzwerk und
          Smart Pools. Darunter eine Haarlinie, dann der Verlauf. */}
      <header className="border-b border-white/[0.12]">
        <div className="py-8">
          <span className={EYEBROW}>Marktdaten</span>
          <h1 className={cn(D_MD, "mt-4 text-white")}>Referenzpreise</h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/[0.72]">
            Wo der Markt steht — und was du selbst bezahlt hast. Jeder Abschluss
            wird gegen den Referenzpreis gemessen, der zum Zeitpunkt deiner
            Anfrage galt. Vier Warengruppen: Beton, Bewehrungsstahl, Kies und
            Transport. Mehr Reihen führt der Index nicht.
          </p>
        </div>
      </header>

      {/* Woher die Zahlen kommen. Gehört sichtbar auf die Seite, nicht in
          eine Fussnote — sonst liest sich eine Modellreihe wie ein amtlicher
          Index. Kein Warnkasten, sondern eine Notiz an einer Goldkante: sie
          soll gelesen, nicht weggeklickt werden.

          Der entscheidende Satz ist der zweite. „Nachgebildete Reihe" konnte
          man bisher so lesen, als gäbe es irgendwo amtliche Frankenpreise,
          die wir nur noch nicht angebunden haben. Die gibt es nicht: die
          KBOB publiziert einen INDEX. Das gehört auf die Seite und nicht
          nur ins Entwicklerdokument. */}
      <div className="border-b border-white/[0.12] py-6">
        <div className="border-l-2 border-brand pl-4">
          <p className="text-[12.5px] leading-relaxed text-white/[0.56]">
            <b className="font-semibold text-white/80">Zur Datenlage:</b> Die
            KBOB veröffentlicht <b className="font-semibold text-white/80">Preisindizes,
            keine Frankenbeträge</b> — monatlich publiziert vom Bundesamt für
            Statistik, für Materialgruppen wie Beton, Zement, Kies und
            Betonstahl. Eine amtliche Zahl „Beton C25/30 kostet in Zürich
            CHF 156 pro m³" gibt es also nicht.
          </p>
          <p className="mt-3 text-[12.5px] leading-relaxed text-white/[0.56]">
            Die Frankenkurve auf dieser Seite ist daher eine{" "}
            <b className="font-semibold text-white/80">nachgebildete Reihe</b>:
            am Indexverlauf entlanggeführt, in der Höhe geschätzt. Sie taugt
            für Grössenordnung und Richtung, nicht als Beleg gegenüber einem
            Lieferanten. Als belastbarer Anker sind die regionalisierten
            Einheitspreise von BFS und CRB vorgesehen — sie stehen in Franken,
            sind vom Bund erhoben und zweimal jährlich nachgeführt. Bis die
            Nutzungsfrage dafür geklärt ist, bleibt es bei der Modellreihe.
          </p>
          <p className="mt-3 text-[12.5px] leading-relaxed text-white/[0.56]">
            <b className="font-semibold text-white/80">Deine eigenen Abschlüsse
            sind echt.</b> Sie stammen aus angenommenen Angeboten und werden
            gegen den Referenzpreis gemessen, der bei deiner Anfrage
            festgehalten wurde — nicht gegen den heutigen Stand der Kurve.
          </p>
        </div>
      </div>

      <div className="pt-8">
        <Suspense fallback={null}>
          <KbobChart initialMaterial={material} />
        </Suspense>
      </div>

      <div className="mt-10">
        <GroupOverview />
      </div>
    </main>
  );
}
