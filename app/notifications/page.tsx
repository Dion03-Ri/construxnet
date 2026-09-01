import FeedProfileCard from "@/components/feed/FeedProfileCard";
import NotificationList from "@/components/notifications/NotificationList";
import { requireCompanyOrOnboard } from "@/lib/company";
import { createServerSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Benachrichtigungen · Obtanet",
  description: "Pool-Updates, Angebote und Netzwerk-Aktivität",
};

export default async function NotificationsPage() {
  const company = await requireCompanyOrOnboard();
  const supabase = createServerSupabaseClient();

  const [{ count: connCount }, { count: poolCount }] = await Promise.all([
    supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "CONNECTED"),
    supabase.from("bundle_participations").select("id", { count: "exact", head: true }).eq("buyer_company_id", company.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[72px]">
            <FeedProfileCard company={company} connections={connCount ?? 0} pools={poolCount ?? 0} />
          </div>
        </aside>
        <div className="min-w-0">
          <NotificationList />
        </div>
      </div>
    </main>
  );
}
