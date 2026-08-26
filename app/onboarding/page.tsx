import { redirect } from "next/navigation";
import { HardHat } from "lucide-react";
import { getMyCompany } from "@/lib/company";
import OnboardingForm from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil einrichten · ConstruxNet",
  description: "Firmenprofil anlegen, um ConstruxNet zu nutzen",
};

export default async function OnboardingPage() {
  const company = await getMyCompany();
  if (company) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand/15 text-brand">
          <HardHat className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Willkommen bei ConstruxNet
        </h1>
        <p className="mt-2 text-slate-500">
          Lege dein Firmenprofil an, um Feed, Netzwerk und Dashboard zu nutzen.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6 backdrop-blur sm:p-8">
        <OnboardingForm />
      </div>
    </main>
  );
}
