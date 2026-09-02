import { Suspense } from "react";
import { Info } from "lucide-react";
import KbobChart from "@/components/KbobChart";
import GroupOverview from "@/components/kbob/GroupOverview";

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
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Referenzpreise
        </h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Wo der Markt steht — und was du selbst bezahlt hast. Jeder Abschluss
          wird gegen den Referenzpreis gemessen, der zum Zeitpunkt deiner
          Anfrage galt.
        </p>
      </header>

      {/* Woher die Zahlen kommen. Gehört sichtbar auf die Seite, nicht in
          eine Fussnote — sonst liest sich eine Modellreihe wie ein amtlicher
          Index. */}
      <p className="mb-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-amber-900">
        <Info className="mt-px h-4 w-4 shrink-0" />
        <span>
          <b>Zur Datenlage:</b> Die Referenzkurve ist derzeit eine
          nachgebildete Reihe am KBOB-Preisindex, keine amtliche Publikation.
          Sie taugt für Grössenordnung und Verlauf, nicht als Beleg gegenüber
          einem Lieferanten, und deckt vier Warengruppen ab — der
          Materialkatalog ist breiter. Deine eigenen Abschlüsse dagegen sind
          echt: sie stammen aus angenommenen Angeboten und werden gegen den
          Referenzpreis gemessen, der bei deiner Anfrage festgehalten wurde.
        </span>
      </p>

      <Suspense fallback={null}>
        <KbobChart initialMaterial={material} />
      </Suspense>

      <div className="mt-4">
        <GroupOverview />
      </div>
    </main>
  );
}
