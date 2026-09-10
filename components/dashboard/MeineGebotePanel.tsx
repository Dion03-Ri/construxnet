"use client";

import { useMemo } from "react";
import { Gavel, Loader2 } from "lucide-react";
import { useBundles, useMyBids } from "@/lib/bundles";
import { cn } from "@/lib/utils";

/**
 * Die eigenen Gebote — abgegeben, gewonnen, verloren.
 *
 * Ein Werk sah sein Gebot bisher nirgends wieder. Es bot, und danach
 * verschwand die Zahl: kein Rückblick, kein Vergleich, keine Ahnung, wie
 * knapp es war. Wer nicht sieht, wie er abgeschnitten hat, bietet beim
 * nächsten Mal nicht besser.
 *
 * Fremde Gebote stehen hier NICHT und werden es nie — die verdeckte
 * Ausschreibung lebt davon. Was nach dem Zuschlag sichtbar wird, ist der
 * Zuschlagspreis, nicht wer was geboten hat.
 */

function chf(v: number | null | undefined, stellen = 2) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("de-CH", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function MeineGebotePanel() {
  const { bids, loading } = useMyBids();
  const { bundles } = useBundles();

  const zeilen = useMemo(() => {
    const nach = new Map(bundles.map((b) => [b.id, b]));
    return bids
      .map((g) => ({ gebot: g, buendel: nach.get(g.bundle_id) ?? null }))
      .sort((a, b) => (a.gebot.created_at < b.gebot.created_at ? 1 : -1));
  }, [bids, bundles]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20 text-white/[0.56]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (zeilen.length === 0) {
    return (
      <div className="border-t border-white/[0.12] py-16 text-center">
        <Gavel className="mx-auto h-8 w-8 text-white/[0.4]" />
        <p className="mt-3 text-[15px] font-semibold text-white/90">Noch kein Gebot abgegeben</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-white/[0.72]">
          Sobald du auf eine Ausschreibung bietest, steht sie hier — mit dem, was du
          verlangt hast, und wie es ausgegangen ist.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-white">Meine Gebote</h2>
      <p className="mt-0.5 max-w-2xl text-sm text-white/[0.72]">
        Was du geboten hast und wie es ausgegangen ist. Fremde Gebote siehst du nicht —
        die Ausschreibung ist verdeckt, und das bleibt sie auch nach dem Zuschlag.
      </p>

      <ul className="mt-6 border-t border-white/[0.12]">
        {zeilen.map(({ gebot, buendel }) => {
          const entschieden = buendel?.status === "AWARDED" || buendel?.status === "FAILED";
          const gewonnen = gebot.is_winning_bid;
          return (
            <li
              key={gebot.id}
              className="grid grid-cols-1 items-baseline gap-x-8 gap-y-2 border-b border-white/[0.12] py-4 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_9rem]"
            >
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-white">
                  {buendel?.material_label ?? buendel?.title ?? "Bündel"}
                </div>
                <div className="mt-0.5 text-[12px] text-white/[0.56]">
                  {buendel?.region ? `${buendel.region} · ` : ""}
                  geboten am {datum(gebot.created_at)}
                </div>
              </div>

              <div className="text-[13px] lg:text-right">
                <div className="text-white/[0.56]">Du erhältst</div>
                <div className="tabular-nums text-white">
                  CHF {chf(gebot.lieferantenpreis_net)}
                </div>
              </div>

              <div className="text-[13px] lg:text-right">
                <div className="text-white/[0.56]">Besteller zahlen</div>
                <div className="tabular-nums text-white/[0.72]">
                  CHF {chf(gebot.customer_price_net)}
                </div>
              </div>

              <div className="lg:text-right">
                <span
                  className={cn(
                    "text-[12px] font-semibold uppercase tracking-[0.1em]",
                    gewonnen
                      ? "text-brand"
                      : entschieden
                        ? "text-white/[0.5]"
                        : "text-white/[0.72]",
                  )}
                >
                  {gewonnen ? "Zuschlag" : entschieden ? "nicht zum Zug" : "läuft"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
