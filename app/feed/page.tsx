import NetworkFeed from "@/components/NetworkFeed";
import FeedProfileCard from "@/components/feed/FeedProfileCard";
import MarketNews from "@/components/feed/MarketNews";
import RecommendedPartners from "@/components/feed/RecommendedPartners";
import KbobWidget from "@/components/KbobWidget";
import { requireCompanyOrOnboard } from "@/lib/company";
import { createServerSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Feed · ConstruxNet",
  description: "B2B-Aktivitätsstream der Schweizer Baubranche",
};

export default async function FeedPage() {
  const company = await requireCompanyOrOnboard();
  const supabase = createServerSupabaseClient();

  const [{ count: connCount }, { count: poolCount }] = await Promise.all([
    supabase
      .from("connections")
      .select("id", { count: "exact", head: true })
      .eq("status", "CONNECTED"),
    supabase
      .from("bundle_participations")
      .select("id", { count: "exact", head: true })
      .eq("buyer_company_id", company.id),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)_320px]">
        {/* Left */}
        <aside className="hidden lg:block">
          <div className="sticky top-[72px]">
            <FeedProfileCard
              company={company}
              connections={connCount ?? 0}
              pools={poolCount ?? 0}
            />
          </div>
        </aside>

        {/* Center */}
        <div className="min-w-0">
          <NetworkFeed />
        </div>

        {/* Right */}
        <aside className="hidden lg:block">
          <div className="sticky top-[72px] space-y-4">
            <KbobWidget />
            <MarketNews />
            <RecommendedPartners />
          </div>
        </aside>
      </div>
    </main>
  );
}
