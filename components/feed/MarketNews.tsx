import { Newspaper, ChevronRight } from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const NEWS = [
  { title: "Zementpreise Q3: KBOB-Index +2.4 % ggü. Vorquartal", tag: "Markt", readers: "1'240 Leser" },
  { title: "Armierungsstahl: Nachfrage zieht in der Zentralschweiz an", tag: "Beschaffung", readers: "860 Leser" },
  { title: "Neue SIA-118-Vorlagen für Rahmenverträge verfügbar", tag: "Recht", readers: "540 Leser" },
  { title: "Smart Pools: Rekord-Bündelvolumen im Raum Zürich", tag: "ConstruxNet", readers: "2'100 Leser" },
];

export default function MarketNews() {
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-brand" />
        <h3 className="text-[15px] font-semibold text-slate-900">ConstruxNet Market News</h3>
      </div>
      <ul className="space-y-3">
        {NEWS.map((n) => (
          <li key={n.title} className="group flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium leading-snug text-slate-800 group-hover:text-brand">
                {n.title}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {n.tag} · {n.readers}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 transition-colors hover:text-brand"
      >
        Mehr anzeigen <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
