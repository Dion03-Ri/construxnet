import DashboardTabs from "@/components/DashboardTabs";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · ConstruxNet",
  description: "Rollen-Cockpits: Bauunternehmer, Baustoffwerk, Admin",
};

export default async function DashboardPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Dein Cockpit — je nach Rolle als Bauunternehmer, Baustoffwerk oder
          Admin.
        </p>
      </header>

      <DashboardTabs />
    </main>
  );
}
