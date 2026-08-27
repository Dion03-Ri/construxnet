import NetworkHub from "@/components/network/NetworkHub";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Netzwerk · ConstruxNet",
  description: "Dein Beschaffungs-Netzwerk — Verbindungen, Einladungen und passende Firmen.",
};

export default async function NetworkPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <NetworkHub />
    </main>
  );
}
