import { ShoppingCart } from "lucide-react";
import BeschaffungFlow from "@/components/procurement/BeschaffungFlow";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Materialbedarf melden · Obtanet",
  description: "Geführter Beschaffungs-Flow: Material wählen, Menge & Region, optional Smart Pool aktivieren.",
};

export default async function BeschaffungPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string; menge?: string }>;
}) {
  await requireCompanyOrOnboard();
  const { material, menge } = await searchParams;
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Materialbedarf melden</h1>
          <p className="text-sm text-slate-500">
            Mehrere Materialien auf einmal — optional gebündelt für einen garantierten
            Netto-Mindestvorteil gegenüber KBOB.
          </p>
        </div>
      </header>

      <BeschaffungFlow initialMaterial={material} initialQty={menge} />
    </main>
  );
}
