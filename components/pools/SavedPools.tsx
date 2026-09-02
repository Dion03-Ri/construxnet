"use client";

import Link from "next/link";
import {
  Clock,
  MapPin,
  Users,
  Layers,
  Gavel,
  ArrowRight,
  Bookmark,
  BookmarkX,
  Loader2,
} from "lucide-react";
import { useBundles, nextStep, deadlineLabel } from "@/lib/bundles";
import { useSavedPools } from "@/lib/useSavedPools";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

function chf(v: number) {
  return v.toLocaleString("de-CH", { maximumFractionDigits: 0 });
}

export default function SavedPools() {
  const { ids, ready, toggle } = useSavedPools();
  const { bundles, loading } = useBundles();
  const saved = bundles.filter((b) => ids.includes(b.id));

  if (!ready || loading) {
    return (
      <div className={cn(CARD, "grid place-items-center py-16 text-slate-400")}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className={cn(CARD, "flex flex-col items-center gap-3 border-dashed py-14 text-center")}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
          <Bookmark className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-slate-900">Keine gemerkten Bündel</p>
        <p className="max-w-sm text-[13px] leading-relaxed text-slate-500">
          Merke dir laufende Bündel über das Lesezeichen-Symbol — sie erscheinen
          dann hier zum schnellen Wiederfinden. Gemerkte Bündel, die inzwischen
          geschlossen sind, fallen aus dieser Liste.
        </p>
        <Link
          href="/pools"
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
        >
          Laufende Bündel ansehen <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {saved.map((b) => {
        const step = nextStep(b.current_volume);
        const goal = step?.at ?? b.current_volume;
        const pct = Math.min(100, Math.round((b.current_volume / (goal || 1)) * 100));
        const sealed = b.status === "SEALED_BIDDING";
        return (
          <div key={b.id} className={cn(CARD, "flex flex-col p-5")}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-slate-900">
                  {b.material_label ?? b.title}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {b.region}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className={badge(sealed ? "navy" : "gold", true)}>
                  {sealed ? (
                    <><Gavel className="h-3 w-3" /> Sealed-Bid</>
                  ) : (
                    <><Layers className="h-3 w-3" /> Sammelphase</>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(b.id)}
                  aria-label="Aus Merkliste entfernen"
                  className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  <BookmarkX className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-slate-500">
                  {chf(b.current_volume)} {b.unit}
                  {step && <span className="text-slate-400"> / {chf(step.at)}</span>}
                </span>
                <span className="font-semibold text-brand">
                  mind. {b.current_discount_pct} %
                  <span className="ml-1 font-normal text-slate-400">Stufe {b.current_tier}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {b.participant_count}{" "}
                {b.participant_count === 1 ? "Firma" : "Firmen"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {deadlineLabel(b.deadline)}
              </span>
            </div>

            <Link
              href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
              className="mt-auto pt-4 inline-flex items-center justify-center gap-1.5 self-stretch rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              Bedarf melden &amp; beitreten <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
