import SupplierMap from "@/components/map/SupplierMap";
import MapWidgets from "@/components/map/MapWidgets";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Geo-Dashboard · ConstruxNet",
  description: "Lieferanten-Netz und Beschaffungs-Analytik der Schweiz",
};

export default async function MapPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Procurement Geo-Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Lieferanten-Netz und Beschaffungs-Analytik über die Schweizer Regionen.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <SupplierMap />
        <MapWidgets />
      </div>
    </main>
  );
}
