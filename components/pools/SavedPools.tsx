"use client";

import Link from "next/link";
import {
  Clock,
  MapPin,
  Users,
  Layers,
  Gavel,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useBundles, deadlineLabel } from "@/lib/bundles";
import { useSavedPools } from "@/lib/useSavedPools";
import { chf } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Die Merkliste.
 *
 * Das hier war einmal eine Karte für ein Raster und stand dann allein auf
 * einer Seite über die volle Breite. Das Ergebnis: ein goldener Knopf von
 * 1700 px Länge, ein Fortschrittsbalken quer über den Bildschirm und eine
 * Angabe „48 t / 101", der die Einheit fehlte.
 *
 * Jetzt dieselbe Zeilenform wie die offenen Bündel unter /pools — was auf
 * beiden Seiten dasselbe ist, soll auch gleich aussehen. Der Balken sitzt
 * in einer Spalte fester Breite, der Rabatt steht als Zahl rechts, und
 * beitreten ist ein Wort und kein goldenes Band.
 */

const ROW_GRID =
  "grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,1fr)_268px_92px_186px] lg:items-center";

export default function SavedPools() {
  const { ids, ready, toggle } = useSavedPools();
  const { bundles, loading } = useBundles();
  const saved = bundles.filter((b) => ids.includes(b.id));

  if (!ready || loading) {
    return (
      <div className="grid place-items-center py-20 text-white/[0.56]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (saved.length === 0) {
    /* Kein Kreis mit Symbol und kein goldener Knopf. Ein leerer Zustand ist
       ein Satz, der sagt, was zu tun ist — nicht eine Grafik dafür. */
    return (
      <div className="border-t border-white/[0.12] py-16">
        <p className="text-[15px] font-semibold text-white">Noch nichts gemerkt</p>
        <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/[0.56]">
          Merke dir laufende Bündel über das Lesezeichen in der Liste — sie stehen
          dann hier. Bündel, die inzwischen geschlossen sind, fallen wieder heraus.
        </p>
        <Link
          href="/pools"
          className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand hover:underline"
        >
          Laufende Bündel ansehen <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="border-b border-white/[0.12]">
      {saved.map((b) => {
        const sealed = b.status === "SEALED_BIDDING";

        return (
          <li
            key={b.id}
            className="border-t border-white/[0.12] transition-colors hover:bg-white/[0.02]"
          >
            <div className={cn(ROW_GRID, "py-6")}>
              {/* ---------- Was und wo ---------- */}
              <div className="min-w-0">
                <h3 className="truncate text-[16px] font-bold tracking-tight text-white">
                  {b.material_label ?? b.title}
                </h3>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-white/[0.56]">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]",
                      sealed ? "text-white/[0.56]" : "text-brand",
                    )}
                  >
                    {sealed ? <Gavel className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
                    {sealed ? "Sealed-Bid" : "Sammelphase"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {b.region}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {b.participant_count} {b.participant_count === 1 ? "Firma" : "Firmen"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {deadlineLabel(b.deadline)}
                  </span>
                </p>
              </div>

              {/* ---------- Wie voll ---------- */}
              <div>
                <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                  <span className="tabular-nums text-white/[0.72]">
                    {chf(b.current_volume)} {b.unit}
                  </span>
                </div>
                {/* Kein Balken zur nächsten Stufe mehr: die Schwelle eines
                    Bündels ist der höchste individuelle Anspruch seiner
                    Teilnehmer, sie steigt nicht mit mehr Menge. */}
                <p className="mt-2 text-[11.5px] leading-relaxed text-white/[0.56]">
                  Garantierte Untergrenze. In der verdeckten Ausschreibung bieten
                  die Werke darunter.
                </p>
              </div>

              {/* ---------- Garantierter Vorteil ---------- */}
              <div className="lg:text-right">
                <div className="font-display text-[30px] font-bold leading-none tabular-nums text-brand">
                  {b.current_discount_pct}
                  <span className="text-[17px]"> %</span>
                </div>
                <div className="mt-1.5 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/[0.5]">
                  mindestens
                </div>
              </div>

              {/* ---------- Handlung ---------- */}
              <div className="flex items-center gap-6 lg:justify-end">
                <Link
                  href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-white transition-colors hover:text-brand"
                >
                  Beitreten <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(b.id)}
                  className="whitespace-nowrap text-[12.5px] font-semibold text-white/[0.5] transition-colors hover:text-rose-300"
                >
                  entfernen
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
