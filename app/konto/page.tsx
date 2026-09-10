import KontoSchliessen from "@/components/account/KontoSchliessen";
import SubscriptionPanel from "@/components/account/SubscriptionPanel";
import { requireCompanyOrOnboard } from "@/lib/company";
import { D_MD, EYEBROW, GROUND, SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Abo · Obtanet",
  description: "Deine Stufe, Laufzeit, Kündigung — und der Weg hinaus.",
};

export default async function KontoPage() {
  await requireCompanyOrOnboard();

  return (
    <main className={cn(GROUND, SHELL, "py-6")}>
      <header className="mb-8 border-b border-white/[0.12] pb-8">
        <span className={cn(EYEBROW, "block")}>Konto</span>
        <h1 className={cn(D_MD, "mt-3 text-white")}>Abo</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/[0.56]">
          Welche Stufe gilt, wie lange sie läuft und wie du sie wechselst oder kündigst. Weiter
          unten steht, wie du das Konto ganz schliesst.
        </p>
      </header>

      <SubscriptionPanel />

      <KontoSchliessen />
    </main>
  );
}
