import ReceivedRequests from "@/components/network/ReceivedRequests";
import SheetPage from "@/components/ui/SheetPage";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Empfangene Anfragen · Obtanet",
  description: "Alle offenen Vernetzungs-Anfragen an dein Unternehmen.",
};

/* Anfragen werden gelesen und beantwortet — Papier. Kopfband in Schwarz,
   weil die Nachbarseite „Fristen" Navy traegt. */
export default async function RequestsPage() {
  await requireCompanyOrOnboard();
  return (
    <SheetPage
      band="black"
      eyebrow="Netzwerk"
      title="Empfangene Anfragen"
      lead="Vernetzungs-Anfragen anderer Firmen — annehmen oder ignorieren."
      back={{ href: "/network", label: "Zurück zum Netzwerk" }}
    >
      <ReceivedRequests />
    </SheetPage>
  );
}
