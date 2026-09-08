import { redirect } from "next/navigation";
import { getMyCompany } from "@/lib/company";
import OnboardingForm from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil einrichten · Obtanet",
  description: "Firmenprofil anlegen, um Obtanet zu nutzen",
};

export default async function OnboardingPage() {
  const company = await getMyCompany();
  if (company) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-zeichen-hell.png" alt="" className="mx-auto h-11 w-11" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Willkommen bei Obtanet
        </h1>
        <p className="mt-2 text-white/[0.72]">
          Lege dein Firmenprofil an, um Feed, Netzwerk und Dashboard zu nutzen.
        </p>
      </header>

      <div className="rounded-lg border border-white/[0.12] bg-[#16181a] p-6 backdrop-blur sm:p-8">
        <OnboardingForm />
      </div>
    </main>
  );
}
