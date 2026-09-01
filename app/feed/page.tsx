import NetworkFeed from "@/components/NetworkFeed";
import ProfileRail from "@/components/feed/ProfileRail";
import BundleOpportunities from "@/components/feed/BundleOpportunities";
import FeedBundleHero from "@/components/feed/FeedBundleHero";
import { requireCompanyOrOnboard } from "@/lib/company";
import { createServerSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Feed · Obtanet",
  description: "Vernetzung, Beschaffung und Bündelung der Schweizer Baubranche",
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

  const connections = connCount ?? 0;
  const pools = poolCount ?? 0;

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* dezenter Navy-Verlauf, damit die dunklen Rails nicht als Blöcke auf reinem Weiss stehen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-navy-900/[0.06] via-navy-900/[0.02] to-transparent"
      />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Left · dunkle Profil-Rail */}
        <aside className="hidden lg:block lg:row-span-2">
          <div className="sticky top-[72px]">
            <ProfileRail company={company} connections={connections} pools={pools} />
          </div>
        </aside>

        {/* Bündel-Hero · über Feed und rechte Spalte hinweg bis an den Rand */}
        <div className="min-w-0 lg:col-span-2">
          <FeedBundleHero />
        </div>

        {/* Center · heller Feed */}
        <div className="min-w-0">
          <NetworkFeed />
        </div>

        {/* Right · dunkle Bündel-Chancen, füllt die Höhe bis zum Fensterrand */}
        <aside className="hidden lg:block">
          <div className="sticky top-[72px] max-h-[calc(100vh-88px)] overflow-y-auto pb-1">
            <BundleOpportunities />
          </div>
        </aside>
      </div>
    </main>
  );
}
