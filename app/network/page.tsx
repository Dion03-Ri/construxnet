import { Users } from "lucide-react";
import NetworkHub from "@/components/network/NetworkHub";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Netzwerk · ConstruxNet",
  description: "Verbundene Firmen auf der Karte, offene Anfragen & Empfehlungen",
};

export default async function NetworkPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mein Netzwerk</h1>
          <p className="text-sm text-slate-500">
            Verbundene Bauunternehmen & Baustoffwerke der Schweiz — vernetzen und verhandeln.
          </p>
        </div>
      </header>

      <NetworkHub />
    </main>
  );
}
