import SupplierMap from "@/components/map/SupplierMap";
import MapWidgets from "@/components/map/MapWidgets";
import { requireCompanyOrOnboard } from "@/lib/company";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Firmen-Karte · Obtanet",
  description: "Standorte der Baustoffwerke und Bauunternehmen, die zugestimmt haben.",
};

export default async function MapPage() {
  const company = await requireCompanyOrOnboard();


  // Eigene Karten-Einwilligung. Über die Service-Role gelesen, weil die
  // Spalte erst mit Migration 12 dazukommt und ein alter Datenbestand
  // sonst einen Fehler statt eines Vorgabewerts liefern würde.
  let myConsent = false;
  let myLocation = { lat: null as number | null, lng: null as number | null, label: null as string | null };
  try {
    const { data } = await supabaseAdmin()
      .from("companies")
      .select("show_on_map, lat, lng, geo_label")
      .eq("id", company.id)
      .single();
    const row = data as
      | { show_on_map?: boolean; lat?: number | null; lng?: number | null; geo_label?: string | null }
      | null;
    myConsent = Boolean(row?.show_on_map);
    myLocation = { lat: row?.lat ?? null, lng: row?.lng ?? null, label: row?.geo_label ?? null };
  } catch {
    myConsent = false;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Firmen-Karte
        </h1>
        <p className="mt-1 text-slate-500 sm:hidden">
          Auf der Karte steht nur, wer zugestimmt hat — und wird sofort anhand
          seiner Adresse verortet.
        </p>
        <p className="mt-1 hidden max-w-2xl text-slate-500 sm:block">
          Wer wo produziert, was er führt und wie weit er liefert. Auf der
          Karte steht nur, wer ausdrücklich zugestimmt hat — wer zustimmt,
          wird sofort anhand seiner Adresse verortet.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <SupplierMap myConsent={myConsent} myLocation={myLocation} />
        <MapWidgets />
      </div>
    </main>
  );
}
