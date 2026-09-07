import { Suspense } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireCompanyOrOnboard } from "@/lib/company";
import { SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · Obtanet",
  description: "Rollen-Cockpit: Beschaffung, Ausschreibungen, Verträge & Analytics",
};

export default async function DashboardPage() {
  const company = await requireCompanyOrOnboard();
  return (
    <main className={cn(SHELL, "py-5")}>
      {/* DashboardShell liest ?view= aus der URL — useSearchParams braucht
          eine Suspense-Grenze. */}
      <Suspense fallback={null}>
        <DashboardShell company={company} />
      </Suspense>
    </main>
  );
}
