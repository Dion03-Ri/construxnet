import DiscoverGrid from "@/components/network/DiscoverGrid";
import { requireCompanyOrOnboard } from "@/lib/company";
import { SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Firmen entdecken · Obtanet",
  description: "Alle Bauunternehmen und Baustoffwerke auf Obtanet — nach Kanton und Rolle filtern.",
};

export default async function DiscoverPage() {
  await requireCompanyOrOnboard();
  return (
    <main className={cn(SHELL, "py-6")}>
      <DiscoverGrid />
    </main>
  );
}
