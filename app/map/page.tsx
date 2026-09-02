import SupplierMap from "@/components/map/SupplierMap";
import MapWidgets from "@/components/map/MapWidgets";
import { requireCompanyOrOnboard } from "@/lib/company";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lieferantenkarte · Obtanet",
  description: "Wer wo produziert, was er führt und wie weit er liefert.",
};

export default async function MapPage() {
  const company = await requireCompanyOrOnboard();

  // Eigene Karten-Einwilligung. Über die Service-Role gelesen, weil die
  // Spalte erst mit Migration 12 dazukommt und ein alter Datenbestand
  // sonst einen Fehler statt eines Vorgabewerts liefern würde.
  let myConsent = false;
  try {
    const { data } = await supabaseAdmin()
      .from("companies")
      .select("show_on_map")
      .eq("id", company.id)
      .single();
    myConsent = Boolean((data as { show_on_map?: boolean } | null)?.show_on_map);
  } catch {
    myConsent = false;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Lieferantenkarte
        </h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Wer wo produziert, was er führt und wie weit er liefert. Auf der Karte
          steht nur, wer dem ausdrücklich zugestimmt hat.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <SupplierMap
          isSupplier={company.role === "SUPPLIER"}
          myConsent={myConsent}
        />
        <MapWidgets />
      </div>
    </main>
  );
}
