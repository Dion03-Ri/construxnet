"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Trophy } from "lucide-react";
import { useZuschlaege, type ZuschlagBaustelle } from "@/lib/lieferantensicht";
import { cn } from "@/lib/utils";

/**
 * Zugeschlagen — die gewonnenen Bündel mit ihren Baustellen.
 *
 * Erst hier bekommt ein Werk die vollen Adressen und die Firmen zu sehen,
 * und nur für die Bündel, die es gewonnen hat. Während der Ausschreibung
 * stand dort nur „8400 Winterthur" — wohin geliefert wird, muss man
 * rechnen können; wer da baut, geht einen Bieter nichts an.
 */

function chf(v: number | null | undefined, stellen = 2) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("de-CH", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}
function monat(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-CH", { month: "short", year: "numeric" });
}

export default function ZuschlaegePanel() {
  const { zuschlaege, laden, baustellen } = useZuschlaege();
  const [offen, setOffen] = useState<string | null>(null);
  const [orte, setOrte] = useState<ZuschlagBaustelle[]>([]);
  const [ladenOrte, setLadenOrte] = useState(false);

  useEffect(() => {
    if (!offen) return;
    setLadenOrte(true);
    void baustellen(offen).then((b) => {
      setOrte(b);
      setLadenOrte(false);
    });
  }, [offen, baustellen]);

  if (laden) {
    return (
      <div className="grid place-items-center py-20 text-white/[0.56]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (zuschlaege.length === 0) {
    return (
      <div className="border-t border-white/[0.12] py-16 text-center">
        <Trophy className="mx-auto h-8 w-8 text-white/[0.4]" />
        <p className="mt-3 text-[15px] font-semibold text-white/90">Noch kein Zuschlag</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-white/[0.72]">
          Gewonnene Bündel stehen hier — mit den Baustellen, den Mengen und dem, was du
          je Einheit erhältst.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-white">Zugeschlagen</h2>
      <p className="mt-0.5 max-w-2xl text-sm text-white/[0.72]">
        Deine gewonnenen Bündel. Die Adressen siehst du erst hier — während der
        Ausschreibung stand dort nur das PLZ-Gebiet.
      </p>

      <ul className="mt-6 border-t border-white/[0.12]">
        {zuschlaege.map((z) => {
          const auf = offen === z.bundle_id;
          return (
            <li key={z.bundle_id} className="border-b border-white/[0.12] py-4">
              <div className="grid grid-cols-1 items-baseline gap-x-8 gap-y-2 lg:grid-cols-[minmax(0,1fr)_9rem_9rem_8rem]">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-white">{z.titel}</div>
                  <div className="mt-0.5 text-[12px] text-white/[0.56]">
                    {z.region ? `${z.region} · ` : ""}
                    Lieferung {monat(z.liefer_von)}
                    {z.liefer_bis && z.liefer_bis !== z.liefer_von ? ` – ${monat(z.liefer_bis)}` : ""}
                    {z.abgeschlossen_am ? " · abgeschlossen" : ""}
                  </div>
                </div>
                <div className="text-[13px] lg:text-right">
                  <div className="text-white/[0.56]">Menge</div>
                  <div className="tabular-nums text-white">
                    {z.menge?.toLocaleString("de-CH") ?? "—"} {z.einheit ?? ""}
                  </div>
                </div>
                <div className="text-[13px] lg:text-right">
                  <div className="text-white/[0.56]">Du erhältst</div>
                  <div className="tabular-nums text-white">CHF {chf(z.mein_preis)}</div>
                </div>
                <div className="text-[13px] lg:text-right">
                  <div className="text-white/[0.56]">Vermittlung</div>
                  <div className="tabular-nums text-white/[0.72]">CHF {chf(z.provision_chf, 0)}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOffen(auf ? null : z.bundle_id)}
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:underline"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", auf && "rotate-180")} />
                {z.baustellen} {z.baustellen === 1 ? "Baustelle" : "Baustellen"}
              </button>

              {auf && (
                <div className="mt-3 border-t border-white/[0.08] pt-3">
                  {ladenOrte ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white/[0.56]" />
                  ) : (
                    <ul className="space-y-2.5">
                      {orte.map((o, i) => (
                        <li key={i} className="text-[12.5px] leading-relaxed">
                          <div className="font-semibold text-white">
                            {o.baustelle} <span className="font-normal text-white/[0.56]">· {o.firma}</span>
                          </div>
                          <div className="text-white/[0.72]">
                            {[o.strasse, [o.plz, o.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                            {o.kontakt ? ` · ${o.kontakt}` : ""}
                          </div>
                          <div className="tabular-nums text-white/[0.56]">
                            {o.menge.toLocaleString("de-CH")} {z.einheit ?? ""} · {monat(o.liefer_von)}
                            {o.liefer_bis !== o.liefer_von ? ` – ${monat(o.liefer_bis)}` : ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
