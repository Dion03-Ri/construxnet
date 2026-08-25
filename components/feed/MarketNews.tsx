import { Newspaper, ChevronRight } from "lucide-react";

const NEWS = [
  { title: "Zementpreise Q3: KBOB-Index +2.4 % ggü. Vorquartal", meta: "Markt · 1'240 Leser" },
  { title: "Armierungsstahl: Nachfrage zieht in der Zentralschweiz an", meta: "Beschaffung · 860 Leser" },
  { title: "Neue SIA-118-Vorlagen für Rahmenverträge verfügbar", meta: "Recht · 540 Leser" },
  { title: "Smart Pools: Rekord-Bündelvolumen im Raum Zürich", meta: "ConstruxNet · 2'100 Leser" },
];

export default function MarketNews() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-brand" />
        <h3 className="text-[15px] font-semibold text-slate-100">
          ConstruxNet Market News
        </h3>
      </div>
      <ul className="space-y-3">
        {NEWS.map((n) => (
          <li key={n.title} className="group flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium leading-snug text-slate-200 group-hover:text-slate-50">
                {n.title}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{n.meta}</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-slate-400 transition-colors hover:text-brand"
      >
        Mehr anzeigen <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
