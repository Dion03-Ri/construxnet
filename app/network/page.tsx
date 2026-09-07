import NetworkHub from "@/components/network/NetworkHub";
import { requireCompanyOrOnboard } from "@/lib/company";
import { SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Netzwerk · Obtanet",
  description: "Dein Beschaffungs-Netzwerk — Verbindungen, Einladungen und passende Firmen.",
};

export default async function NetworkPage() {
  await requireCompanyOrOnboard();
  return (
    <main className={cn(SHELL, "py-6")}>
      <NetworkHub />
    </main>
  );
}
