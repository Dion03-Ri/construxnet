import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · ConstruxNet",
  description: "Rollen-Cockpit: Beschaffung, Ausschreibungen, Verträge & Analytics",
};

export default async function DashboardPage() {
  const company = await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5">
      <DashboardShell company={company} />
    </main>
  );
}
