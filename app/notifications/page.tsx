import NotificationList from "@/components/notifications/NotificationList";
import SheetPage from "@/components/ui/SheetPage";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Benachrichtigungen · Obtanet",
  description: "Pool-Updates, Angebote und Netzwerk-Aktivität",
};

/**
 * Links stand eine Profilkarte mit Logo, Firmenname und zwei Zahlen — auf
 * einer Seite, die nur Benachrichtigungen zeigt. Dieselbe Karte ist schon
 * aus dem Feed geflogen: die eigene Firma gehört ins Dashboard.
 *
 * Eine Liste, die man durchgeht und abhakt, ist Papier. Kopfband in Navy;
 * „Empfangene Anfragen", die andere Seite aus der Glocke, traegt Schwarz.
 */
export default async function NotificationsPage() {
  await requireCompanyOrOnboard();
  return (
    <SheetPage
      band="navy"
      eyebrow="Konto"
      title="Benachrichtigungen"
      lead="Verbindungsanfragen, eingegangene Angebote, der Stand deiner Bündel und ungelesene Nachrichten."
    >
      <NotificationList />
    </SheetPage>
  );
}
