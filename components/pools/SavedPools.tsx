"use client";

import Link from "next/link";
import { Clock, MapPin, Users, Layers, Gavel, ArrowRight, Bookmark, BookmarkX } from "lucide-react";
import { OPEN_POOLS } from "@/data/pools";
import { useSavedPools } from "@/lib/useSavedPools";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function SavedPools() {
  const { ids, ready, toggle } = useSavedPools();
  const saved = OPEN_POOLS.filter((p) => ids.includes(p.id));

  if (!ready) {
    return <div className={cn(CARD, "py-12 text-center text-sm text-slate-400")}>Lädt …</div>;
  }

  if (saved.length === 0) {
    return (
      <div className={cn(CARD, "flex flex-col items-center gap-3 border-dashed py-14 text-center")}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
          <Bookmark className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-slate-900">Keine gespeicherten Pools</p>
        <p className="max-w-sm text-[13px] text-slate-500">
          Merke dir offene Bündel über das Lesezeichen-Symbol — sie erscheinen dann hier zum schnellen Wiederfinden.
        </p>
        <Link
          href="/pools"
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
        >
          Offene Bündel ansehen <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {saved.map((p) => {
        const pct = Math.min(100, Math.round((p.vol / p.target) * 100));
        return (
          <div key={p.id} className={cn(CARD, "flex flex-col p-5")}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-slate-900">{p.material}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {p.region}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className={badge(p.phase === "SEALED" ? "navy" : "gold", true)}>
                  {p.phase === "SEALED" ? <><Gavel className="h-3 w-3" /> Sealed-Bid</> : <><Layers className="h-3 w-3" /> Sammelphase</>}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-label="Aus Merkliste entfernen"
                  title="Entfernen"
                  className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  <BookmarkX className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-slate-500">{p.vol} / {p.target} {p.unit}</span>
                <span className="font-semibold text-brand">−{p.disc}% (Tier {p.tier})</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.participants} Firmen</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {Math.round(p.endsInH / 24)} T</span>
            </div>

            <Link
              href={`/beschaffung?material=${encodeURIComponent(p.matKey)}`}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              Bedarf melden &amp; beitreten <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
