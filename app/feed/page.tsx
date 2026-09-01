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
    // Ab lg füllt der Feed genau die Fensterhöhe (abzüglich der 56px-Topbar).
    // Gescrollt wird dann nur innerhalb der Spalten, nicht die ganze Seite.
    <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:h-[calc(100vh-56px)] lg:overflow-hidden">
      {/* dezenter Navy-Verlauf, damit die dunklen Rails nicht als Blöcke auf reinem Weiss stehen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-navy-900/[0.06] via-navy-900/[0.02] to-transparent"
      />
      <div className="grid grid-cols-1 gap-5 lg:h-full lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Left · dunkle Profil-Rail */}
        <aside className="hidden lg:block lg:min-h-0">
          <div className="feed-scroll lg:h-full lg:overflow-y-auto lg:pr-1">
            <ProfileRail company={company} connections={connections} pools={pools} />
          </div>
        </aside>

        {/* Center · Hero bleibt oben stehen, nur die Beiträge scrollen */}
        <div className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
          <NetworkFeed hero={<FeedBundleHero />} />
        </div>

        {/* Right · dunkle Bündel-Chancen */}
        <aside className="hidden lg:block lg:min-h-0">
          <div className="feed-scroll lg:h-full lg:overflow-y-auto lg:pr-1">
            <BundleOpportunities />
          </div>
        </aside>
      </div>
    </main>
  );
}
