import Link from "next/link";
import { Inbox, ArrowLeft } from "lucide-react";
import ReceivedRequests from "@/components/network/ReceivedRequests";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Empfangene Anfragen · Obtanet",
  description: "Alle offenen Vernetzungs-Anfragen an dein Unternehmen.",
};

export default async function RequestsPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/network" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/55 transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Zurück zum Netzwerk
      </Link>
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <Inbox className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Empfangene Anfragen</h1>
          <p className="text-sm text-white/55">Vernetzungs-Anfragen anderer Firmen — annehmen oder ignorieren.</p>
        </div>
      </header>
      <ReceivedRequests />
    </main>
  );
}
