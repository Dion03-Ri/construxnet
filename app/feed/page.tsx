import Link from "next/link";
import { Rss, Users } from "lucide-react";
import NetworkFeed from "@/components/NetworkFeed";

export const metadata = {
  title: "Netzwerk Feed · ConstruxNet",
  description: "B2B-Aktivitätsstream der Schweizer Baubranche",
};

export default function FeedPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Rss className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Netzwerk Feed
          </h1>
          <p className="mt-2 text-slate-400">
            B2B-Aktivitätsstream der Schweizer Baubranche.
          </p>
        </div>
        <Link
          href="/network"
          className="mt-1 hidden shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 sm:inline-flex"
        >
          <Users className="h-4 w-4" />
          Firmen entdecken
        </Link>
      </header>

      <NetworkFeed />
    </main>
  );
}
