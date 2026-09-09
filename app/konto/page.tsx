import SubscriptionPanel from "@/components/account/SubscriptionPanel";
import SheetPage from "@/components/ui/SheetPage";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Abo · Obtanet",
  description: "Deine Stufe, Laufzeit und Kündigung.",
};

/* Kontoverwaltung: lesen, vergleichen, entscheiden — Papier. Kopfband in
   Schwarz, weil „Benachrichtigungen“ nebenan Navy traegt. Der schwarze
   Anker (TILE) im Panel ist weg: auf Papier traegt der helle Block den
   Namen der Stufe, zwei dunkle Flaechen uebereinander heben sich auf. */
export default async function KontoPage() {
  await requireCompanyOrOnboard();
  return (
    <SheetPage
      band="black"
      eyebrow="Konto"
      title="Abo"
      lead="Welche Stufe gilt, wie lange sie läuft und wie du sie wechselst oder kündigst."
      wide
    >
      <SubscriptionPanel />
    </SheetPage>
  );
}
