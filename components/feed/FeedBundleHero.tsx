"use client";

import Link from "next/link";
import { Megaphone, Layers, TrendingDown, ArrowRight, MapPin, Users } from "lucide-react";
import { useBundles, nextStep } from "@/lib/bundles";
import { cn } from "@/lib/utils";

/**
 * Hero am Kopf des Feeds — hebt den Kern des Modells hervor: Materialbedarf
 * melden → bündeln → sparen. Bewusst grösser/dominanter als der Composer.
 */
export default function FeedBundleHero() {
  const { bundles } = useBundles();
  // Die drei, bei denen am meisten drinliegt. Ohne laufende Bündel bleibt
  // der Streifen leer statt Beispiele zu zeigen, die es nicht gibt.
  const top = [...bundles]
    .sort((a, b) => b.current_discount_pct - a.current_discount_pct)
    .slice(0, 3);

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-navy-900 text-white shadow-card">
      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        {/* dezentes Raster */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <Layers className="h-3.5 w-3.5" /> Smart Bündeln
          </span>
          <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            Bündle deinen Materialbedarf mit der Branche —{" "}
            <span className="text-brand">garantiert unter KBOB.</span>
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-white/60">
            Melde, was du brauchst. Obtanet bündelt gleiche Bedarfe deiner Region zu einem Pool,
            die Werke bieten verdeckt im Sealed-Bid — je grösser das Bündel, desto höher der
            garantierte Netto-Mindestvorteil für alle Teilnehmer.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/beschaffung"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              <Megaphone className="h-4 w-4" /> Materialbedarf melden
            </Link>
            <Link
              href="/pools"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/5"
            >
              Offene Bündel ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Laufende Bündel — echte, oder gar keine */}
      {top.length > 0 && (
        <div className="border-t border-white/10 bg-navy-950/40 px-3 py-3 sm:px-4">
          <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Laufende Bündel
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {top.map((b) => {
              const step = nextStep(b.current_volume);
              const goal = step?.at ?? b.current_volume;
              const pct = Math.min(100, Math.round((b.current_volume / (goal || 1)) * 100));
              return (
                <Link
                  key={b.id}
                  href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
                  className="group rounded-lg border border-white/10 bg-navy-900 p-3 transition-colors hover:border-brand/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-white">
                      {b.material_label ?? b.title}
                    </span>
                    <span className="shrink-0 rounded border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[11px] font-bold text-brand">
                      mind. {b.current_discount_pct} %
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
                    <MapPin className="h-3 w-3" /> {b.region}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {b.participant_count}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    <TrendingDown className="h-3 w-3" /> Beitreten
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
