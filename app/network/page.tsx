import NetworkCockpit from "@/components/network/NetworkCockpit";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Netzwerk · ConstruxNet",
  description: "Vernetzen fürs Beschaffen — passende Partner, Bündel-Chancen und Aktivität aus deinem Netzwerk.",
};

export default async function NetworkPage() {
  const company = await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <NetworkCockpit company={company} />
    </main>
  );
}
