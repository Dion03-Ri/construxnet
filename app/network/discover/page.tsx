import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import NetworkHub from "@/components/network/NetworkHub";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Firmen entdecken · ConstruxNet",
  description: "Alle Bauunternehmen & Baustoffwerke — filtern, suchen und vernetzen.",
};

export default async function DiscoverPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/network" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
      </Link>
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Firmen entdecken</h1>
          <p className="text-sm text-slate-500">
            Alle Bauunternehmen &amp; Baustoffwerke der Schweiz — filtern, suchen und vernetzen.
          </p>
        </div>
      </header>

      <NetworkHub />
    </main>
  );
}
