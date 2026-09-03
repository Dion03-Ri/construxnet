"use client";

import { useState } from "react";
import { Newspaper, ChevronDown } from "lucide-react";
import { PANEL } from "@/lib/ui";
import { cn } from "@/lib/utils";

const NEWS = [
  { title: "Zementpreise Q3: KBOB-Index +2.4 % ggü. Vorquartal", tag: "Markt", readers: "1'240 Leser" },
  { title: "Armierungsstahl: Nachfrage zieht in der Zentralschweiz an", tag: "Beschaffung", readers: "860 Leser" },
  { title: "Neue SIA-118-Vorlagen für Rahmenverträge verfügbar", tag: "Recht", readers: "540 Leser" },
  { title: "Smart Pools: Rekord-Bündelvolumen im Raum Zürich", tag: "Obtanet", readers: "2'100 Leser" },
  { title: "Dämmstoffe: Lieferzeiten normalisieren sich nach Q2-Engpass", tag: "Markt", readers: "710 Leser" },
  { title: "RC-Beton: Kantone Bern & Aargau erhöhen Recycling-Quote", tag: "Nachhaltigkeit", readers: "430 Leser" },
  { title: "Transportbeton: Diesel-Zuschlag sinkt erstmals seit 2024", tag: "Logistik", readers: "980 Leser" },
];

export default function MarketNews() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? NEWS : NEWS.slice(0, 4);

  return (
    <div className={cn(PANEL, "p-4")}>
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-brand" />
        <h3 className="text-[15px] font-semibold text-white">Obtanet Market News</h3>
      </div>
      <ul className="space-y-3">
        {visible.map((n) => (
          <li key={n.title} className="group flex cursor-pointer gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium leading-snug text-white/90 group-hover:text-brand">
                {n.title}
              </p>
              <p className="mt-0.5 text-[11px] text-white/40">
                {n.tag} · {n.readers}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-white/55 transition-colors hover:text-brand"
      >
        {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
      </button>
    </div>
  );
}
