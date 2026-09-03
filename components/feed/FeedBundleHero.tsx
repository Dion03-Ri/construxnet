"use client";

import Link from "next/link";
import { Megaphone, ArrowRight, MapPin, Users } from "lucide-react";
import { useBundles, nextStep } from "@/lib/bundles";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Kopf des Feeds: die Handlung, nicht die Werbung.
 *
 * Vorher stand hier ein Marketing-Block mit Ueberschrift und Absatz —
 * derselbe Text wie auf der Startseite. Wer eingeloggt ist, hat sich
 * laengst entschieden; er will handeln, nicht ueberzeugt werden. Geblieben
 * sind die zwei Aktionen und die laufenden Buendel, weil das die Sachen
 * sind, auf die jemand klickt.
 */
export default function FeedBundleHero() {
  const { bundles } = useBundles();
  // Die drei, bei denen am meisten drinliegt. Ohne laufende Bündel bleibt
  // der Streifen leer statt Beispiele zu zeigen, die es nicht gibt.
  const top = [...bundles]
    .sort((a, b) => b.current_discount_pct - a.current_discount_pct)
    .slice(0, 3);

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
            Was brauchst du auf der Baustelle?
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-400">
            Gleiche Bedarfe deiner Region werden gebündelt — die Werke bieten verdeckt dagegen.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/beschaffung"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[13px] font-semibold text-navy-950 transition-colors hover:bg-brand-500"
          >
            <Megaphone className="h-4 w-4" /> Bedarf melden
          </Link>
          <Link
            href="/pools"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Offene Bündel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Laufende Bündel — echte, oder gar keine */}
      {top.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Laufende Bündel
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {top.map((b) => {
              const step = nextStep(b.current_volume);
              const goal = step?.at ?? b.current_volume;
              const pct = Math.min(100, Math.round((b.current_volume / (goal || 1)) * 100));
              return (
                <Link
                  key={b.id}
                  href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-brand/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-slate-900">
                      {b.material_label ?? b.title}
                    </span>
                    <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-brand">
                      −{b.current_discount_pct} %
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5 text-[11.5px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.region}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {b.participant_count}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
