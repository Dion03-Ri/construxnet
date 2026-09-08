import BeschaffungFlow from "@/components/procurement/BeschaffungFlow";
import { requireCompanyOrOnboard } from "@/lib/company";
import { SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Materialbedarf melden · Obtanet",
  description: "Geführter Beschaffungs-Flow: Material wählen, Menge & Region, optional Smart Pool aktivieren.",
};

export default async function BeschaffungPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string; menge?: string; projekt?: string }>;
}) {
  const company = await requireCompanyOrOnboard();
  const { material, menge, projekt } = await searchParams;

  return (
    <main className={cn(SHELL, "py-6 sm:py-8")}>
      {/* Ein Blatt mit Navy-Kopfband.

          Der Bedarf ist ein Formular — man liest und schreibt, also Papier.
          Aber ein Blatt, das oben einfach anfängt, hat keinen Anfang. Das
          Navyband gibt ihm einen: es sagt, worum es geht, und trennt den
          dunklen Rahmen der Seite vom hellen Arbeitsbereich darunter.
          Navy trägt hier zum ersten Mal eine grosse Fläche statt nur eine
          Linie — das ist die zweite CI-Farbe, die bisher kaum vorkam. */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
        <header className="bg-accent-600 px-6 py-7 text-white sm:px-9 sm:py-9">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-100">
            Beschaffung
          </span>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
            Materialbedarf melden
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/70">
            Mehrere Materialien auf einmal — optional gebündelt für einen
            garantierten Netto-Mindestvorteil gegenüber dem KBOB-Referenzpreis.
          </p>
        </header>

        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <BeschaffungFlow
            initialMaterial={material}
            initialQty={menge}
            initialProject={projekt}
            companyId={company.id}
          />
        </div>
      </div>
    </main>
  );
}
