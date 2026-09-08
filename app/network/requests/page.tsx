import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReceivedRequests from "@/components/network/ReceivedRequests";
import { requireCompanyOrOnboard } from "@/lib/company";
import { D_MD, EYEBROW, COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Empfangene Anfragen · Obtanet",
  description: "Alle offenen Vernetzungs-Anfragen an dein Unternehmen.",
};

export default async function RequestsPage() {
  await requireCompanyOrOnboard();
  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <Link href="/network" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/[0.72] transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Zurück zum Netzwerk
      </Link>
      <header className="mb-8 border-b border-white/[0.12] pb-8">
        <span className={cn(EYEBROW, "block")}>Netzwerk</span>
        <h1 className={cn(D_MD, "mt-3 text-white")}>Empfangene Anfragen</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/[0.56]">
          Vernetzungs-Anfragen anderer Firmen — annehmen oder ignorieren.
        </p>
      </header>
      <div className={COLUMN}>
        <ReceivedRequests />
      </div>
    </main>
  );
}
