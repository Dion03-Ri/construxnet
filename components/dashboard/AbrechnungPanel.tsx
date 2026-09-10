"use client";

import { Loader2, Receipt } from "lucide-react";
import { useZuschlaege } from "@/lib/lieferantensicht";
import { cn } from "@/lib/utils";

/**
 * Abrechnung — was an Vermittlung offen ist.
 *
 * Die Forderung entsteht mit dem ZUSCHLAG, auf die zugeschlagene Menge.
 * Bemessen wird bewusst nicht die gefahrene: eine Gebühr auf Gefahrenes
 * lädt Werk und Besteller zur Absprache ein, weil beide sparen, wenn sie
 * kleinrechnen.
 *
 * Fällig ist sie 30 Tage nach Lieferbeginn — der Anspruch steht fest, das
 * Werk hat Luft.
 */

function chf(v: number | null | undefined, stellen = 2) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("de-CH", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}
function datum(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AbrechnungPanel() {
  const { abrechnung, laden } = useZuschlaege();

  if (laden) {
    return (
      <div className="grid place-items-center py-20 text-white/[0.56]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const offen = abrechnung.filter((a) => a.offen);
  const summeOffen = offen.reduce((s, a) => s + (a.provision_chf ?? 0), 0);

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-bold text-white">Abrechnung</h2>
      <p className="mt-0.5 max-w-2xl text-sm text-white/[0.72]">
        Die Vermittlungsgebühr je gewonnenem Bündel. Sie entsteht mit dem Zuschlag auf
        die zugeschlagene Menge und ist 30 Tage nach Lieferbeginn fällig.
      </p>

      {abrechnung.length === 0 ? (
        <div className="mt-6 border-t border-white/[0.12] py-16 text-center">
          <Receipt className="mx-auto h-8 w-8 text-white/[0.4]" />
          <p className="mt-3 text-[15px] font-semibold text-white/90">Nichts abzurechnen</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-white/[0.72]">
            Sobald du ein Bündel gewinnst, steht die Gebühr hier — mit Betrag und
            Fälligkeit.
          </p>
        </div>
      ) : (
        <>
          {summeOffen > 0 && (
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-white/[0.12] pt-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/[0.56]">
                Offen
              </span>
              <span className="font-display text-[28px] font-medium leading-none tabular-nums text-white">
                CHF {chf(summeOffen, 0)}
              </span>
            </div>
          )}

          <ul className="mt-6 border-t border-white/[0.12]">
            {abrechnung.map((a) => (
              <li
                key={a.bundle_id}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 border-b border-white/[0.12] py-4 lg:grid-cols-[minmax(0,1fr)_8rem_8rem_7rem]"
              >
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-white">{a.titel}</div>
                  <div className="mt-0.5 text-[12px] tabular-nums text-white/[0.56]">
                    {a.menge?.toLocaleString("de-CH") ?? "—"} {a.einheit ?? ""} ·{" "}
                    {a.provision_pct ?? "—"} % Vermittlung
                  </div>
                </div>
                <div className="text-[13px] lg:text-right">
                  <div className="text-white/[0.56]">Betrag</div>
                  <div className="tabular-nums text-white">CHF {chf(a.provision_chf, 0)}</div>
                </div>
                <div className="text-[13px] lg:text-right">
                  <div className="text-white/[0.56]">Fällig</div>
                  <div className="tabular-nums text-white/[0.72]">{datum(a.faellig_am)}</div>
                </div>
                <div className="lg:text-right">
                  <span
                    className={cn(
                      "text-[12px] font-semibold uppercase tracking-[0.1em]",
                      a.offen ? "text-brand" : "text-white/[0.5]",
                    )}
                  >
                    {a.offen ? "offen" : `bezahlt ${datum(a.bezahlt_am)}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
