"use client";

import { useRabattstufen } from "@/lib/rabatt";
import { cn } from "@/lib/utils";

/**
 * Die vollständige Rabattstaffel einer Materialkategorie.
 *
 * Bisher stand die Staffel nirgends als Liste. Der Rechner zeigte eine
 * Kurve mit drei Beschriftungen an der Achse, das Formular je Position
 * einen einzelnen Satz — wer wissen wollte, welche Stufen es überhaupt
 * gibt, konnte es nirgends nachlesen. Bei sieben Stufen ist das eine
 * Auskunft, die fehlt.
 *
 * Die Zeilen kommen aus `rabattstufen`. Wer den Bestellwert mitgibt,
 * bekommt die erreichte Stufe hervorgehoben und die nächste markiert.
 */
export function Staffel({
  kategorie,
  bestellwert,
  ton = "dunkel",
  className,
}: {
  kategorie: string;
  /** Eigener Bestellwert in dieser Kategorie, wenn bekannt. */
  bestellwert?: number;
  ton?: "dunkel" | "hell";
  className?: string;
}) {
  const { stufen, laden } = useRabattstufen();

  const eigene = stufen
    .filter((s) => s.material_category === kategorie)
    .sort((a, b) => Number(a.ab_chf) - Number(b.ab_chf));

  if (laden) {
    return (
      <p className={cn("text-[12px]", ton === "hell" ? "text-slate-500" : "text-white/[0.56]", className)}>
        Staffel wird geladen …
      </p>
    );
  }

  if (eigene.length === 0) {
    return (
      <p className={cn("text-[12px] leading-relaxed", ton === "hell" ? "text-slate-500" : "text-white/[0.56]", className)}>
        Für {kategorie} gibt es keine Mengenstaffel — diese Kategorie wird einzeln
        verhandelt.
      </p>
    );
  }

  // Die erreichte Stufe ist die höchste, deren Schwelle unterschritten wird.
  const erreichtIndex = bestellwert == null
    ? -1
    : eigene.reduce((letzter, s, i) => (bestellwert >= Number(s.ab_chf) ? i : letzter), -1);
  const naechsterIndex = erreichtIndex + 1 < eigene.length ? erreichtIndex + 1 : -1;

  const hell = ton === "hell";

  return (
    <ul className={cn("divide-y", hell ? "divide-slate-200" : "divide-white/[0.08]", className)}>
      {eigene.map((s, i) => {
        const wert = Number(s.ab_chf);
        const pct = Number(s.rabatt_pct);
        const erreicht = i === erreichtIndex;
        const naechste = bestellwert != null && i === naechsterIndex;
        // Bereits überschritten, aber nicht die aktuelle: gedämpft, damit
        // die erreichte Stufe als einzige hervorsticht.
        const ueberholt = erreichtIndex >= 0 && i < erreichtIndex;

        return (
          <li
            key={`${s.material_category}-${wert}`}
            className={cn(
              "flex items-baseline justify-between gap-3 py-1.5 text-[12.5px] tabular-nums",
              erreicht && "font-semibold",
            )}
          >
            <span
              className={cn(
                erreicht
                  ? hell ? "text-brand-700" : "text-brand"
                  : ueberholt
                    ? hell ? "text-slate-400" : "text-white/[0.4]"
                    : hell ? "text-slate-600" : "text-white/[0.72]",
              )}
            >
              ab CHF {wert.toLocaleString("de-CH")}
              {erreicht && <span className="ml-2 text-[10.5px] font-semibold uppercase tracking-[0.1em]">deine Stufe</span>}
              {naechste && (
                <span className={cn("ml-2 text-[10.5px] font-medium", hell ? "text-slate-400" : "text-white/[0.4]")}>
                  noch CHF {(wert - (bestellwert ?? 0)).toLocaleString("de-CH", { maximumFractionDigits: 0 })}
                </span>
              )}
            </span>
            <span
              className={cn(
                erreicht
                  ? hell ? "text-brand-700" : "text-brand"
                  : ueberholt
                    ? hell ? "text-slate-400" : "text-white/[0.4]"
                    : hell ? "text-slate-700" : "text-white/90",
              )}
            >
              {pct} %
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Alle Staffeln, die es gibt — für Seiten, die das Modell erklären.
 *
 * Kategorien mit identischer Staffel werden zusammengefasst. Heute haben
 * alle fünf dieselben Schwellen; fünf Mal dieselbe Tabelle untereinander
 * wäre eine Wand ohne Aussage. Laufen sie später auseinander, entstehen
 * daraus von selbst mehrere Tabellen — ohne dass jemand diese Datei
 * anfassen muss.
 */
export function StaffelUebersicht({ ton = "dunkel" }: { ton?: "dunkel" | "hell" }) {
  const { stufen, laden } = useRabattstufen();
  const hell = ton === "hell";

  if (laden) {
    return (
      <p className={cn("text-[13px]", hell ? "text-slate-500" : "text-white/[0.56]")}>
        Staffel wird geladen …
      </p>
    );
  }

  // Je Kategorie die Staffel als Zeichenkette — gleiche Zeichenkette,
  // gleiche Staffel.
  const jeKategorie = new Map<string, { ab: number; pct: number }[]>();
  for (const s of stufen) {
    const liste = jeKategorie.get(s.material_category) ?? [];
    liste.push({ ab: Number(s.ab_chf), pct: Number(s.rabatt_pct) });
    jeKategorie.set(s.material_category, liste);
  }

  const gruppen = new Map<string, { kategorien: string[]; stufen: { ab: number; pct: number }[] }>();
  for (const [kategorie, liste] of jeKategorie) {
    liste.sort((a, b) => a.ab - b.ab);
    const schluessel = liste.map((z) => `${z.ab}:${z.pct}`).join("|");
    const vorhanden = gruppen.get(schluessel);
    if (vorhanden) vorhanden.kategorien.push(kategorie);
    else gruppen.set(schluessel, { kategorien: [kategorie], stufen: liste });
  }

  if (gruppen.size === 0) {
    return (
      <p className={cn("text-[13px]", hell ? "text-slate-500" : "text-white/[0.56]")}>
        Zurzeit ist keine Materialkategorie gestaffelt.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {[...gruppen.values()].map((g) => (
        <div key={g.kategorien.join(",")}>
          <p className={cn("text-[13px] leading-relaxed", hell ? "text-slate-600" : "text-white/[0.72]")}>
            {g.kategorien.sort().join(" · ")}
          </p>
          <ul className={cn("mt-3 divide-y", hell ? "divide-slate-200" : "divide-white/[0.08]")}>
            {g.stufen.map((z) => (
              <li
                key={z.ab}
                className="flex items-baseline justify-between gap-4 py-2.5 text-[15px] tabular-nums"
              >
                <span className={hell ? "text-slate-600" : "text-white/[0.72]"}>
                  ab CHF {z.ab.toLocaleString("de-CH")}
                </span>
                <span className={cn("font-semibold", hell ? "text-slate-900" : "text-white")}>
                  {z.pct} %
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
