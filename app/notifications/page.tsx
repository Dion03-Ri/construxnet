import NotificationList from "@/components/notifications/NotificationList";
import { requireCompanyOrOnboard } from "@/lib/company";
import { COLUMN, SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
 * Ohne sie braucht die Seite keine zwei Spalten mehr. Rand wie überall,
 * Inhalt in einer lesbaren Spalte.
 */
export default async function NotificationsPage() {
  await requireCompanyOrOnboard();

  return (
    <main className={cn(SHELL, "py-6 sm:py-8")}>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
        Benachrichtigungen
      </h1>
      <div className={COLUMN}>
        <NotificationList />
      </div>
    </main>
  );
}
