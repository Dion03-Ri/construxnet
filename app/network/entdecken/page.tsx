import DiscoverGrid from "@/components/network/DiscoverGrid";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Firmen entdecken · Obtanet",
  description: "Alle Bauunternehmen und Baustoffwerke auf Obtanet — nach Kanton und Rolle filtern.",
};

export default async function DiscoverPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <DiscoverGrid />
    </main>
  );
}
