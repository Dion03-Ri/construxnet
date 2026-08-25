import { Users } from "lucide-react";
import NetworkDirectory from "@/components/NetworkDirectory";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Netzwerk · ConstruxNet",
  description: "Firmenverzeichnis der Schweizer Baubranche — verbinden & verhandeln",
};

export default async function NetworkPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Netzwerk
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Bauunternehmen und Baustoffwerke der Schweizer Baubranche — verbinden
            und direkt verhandeln.
          </p>
        </div>
      </header>

      <NetworkDirectory />
    </main>
  );
}
