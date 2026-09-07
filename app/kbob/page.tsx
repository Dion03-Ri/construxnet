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
      <header className="border-b border-white/[0.08]">
        <div className="py-8">
          <span className={EYEBROW}>Marktdaten</span>
          <h1 className={cn(D_MD, "mt-4 text-white")}>Referenzpreise</h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/55">
            Wo der Markt steht — und was du selbst bezahlt hast. Jeder Abschluss
            wird gegen den Referenzpreis gemessen, der zum Zeitpunkt deiner
            Anfrage galt.
          </p>
        </div>
      </header>

      {/* Woher die Zahlen kommen. Gehört sichtbar auf die Seite, nicht in
          eine Fussnote — sonst liest sich eine Modellreihe wie ein amtlicher
          Index. Kein Warnkasten mehr, sondern eine Notiz an einer Goldkante:
          sie soll gelesen, nicht weggeklickt werden. */}
      <div className="border-b border-white/[0.08] py-6">
        <p className="border-l-2 border-brand pl-4 text-[12.5px] leading-relaxed text-white/50">
          <b className="font-semibold text-white/80">Zur Datenlage:</b> Die
          Referenzkurve ist derzeit eine nachgebildete Reihe am KBOB-Preisindex,
          keine amtliche Publikation. Sie taugt für Grössenordnung und Verlauf,
          nicht als Beleg gegenüber einem Lieferanten, und deckt vier
          Warengruppen ab — der Materialkatalog ist breiter. Deine eigenen
          Abschlüsse dagegen sind echt: sie stammen aus angenommenen Angeboten
          und werden gegen den Referenzpreis gemessen, der bei deiner Anfrage
          festgehalten wurde.
        </p>
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
