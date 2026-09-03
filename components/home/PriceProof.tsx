import { GRID_TEXTURE } from "@/lib/ui";

/**
 * Der Beweis in Zahlen.
 *
 * Hier stand vorher eine Attrappe eines Browserfensters mit einem Suchfeld
 * und drei Zeilen. Sie sah nach Produkt aus, sagte aber nichts: kein Preis,
 * kein Vergleich, kein Grund. Was Obtanet tut, ist eine einzige Bewegung —
 * vom Referenzpreis zum Bündelpreis — und genau die steht jetzt da.
 *
 * Die Balken sind massstäblich: die Breite des Goldbalkens entspricht dem
 * Bündelpreis im Verhältnis zur Referenz. Was man sieht, stimmt also mit
 * dem überein, was danebensteht.
 */

type Row = {
  material: string;
  unit: string;
  region: string;
  /** KBOB-Referenzpreis, Stand 2026-Q2 — dieselben Werte wie auf /kbob. */
  kbob: number;
  /** Beispielhafter Bündelpreis innerhalb des angegebenen Vorteilsbands. */
  pool: number;
};

const ROWS: Row[] = [
  { material: "Beton C25/30", unit: "m³", region: "Zürich", kbob: 156.12, pool: 132.7 },
  { material: "Bewehrungsstahl B500B", unit: "t", region: "Bern", kbob: 1053.0, pool: 926.6 },
  { material: "Koffer-/Wandkies 0/45", unit: "t", region: "Nordwestschweiz", kbob: 39.16, pool: 31.72 },
];

function chf(n: number) {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PriceProof() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#080F19] sm:rounded-[30px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={GRID_TEXTURE} />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand/15 blur-[100px]"
      />

      <div className="relative">
        {/* Kopfzeile wie in einer technischen Tabelle */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-7">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Referenz → Bündel · Stand 2026-Q2
          </div>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            Beispiel
          </span>
        </div>

        <ul className="divide-y divide-white/[0.07]">
          {ROWS.map((r) => {
            const saved = r.kbob - r.pool;
            const pct = (saved / r.kbob) * 100;
            const poolWidth = (r.pool / r.kbob) * 100;
            return (
              <li key={r.material} className="px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0">
                    <div className="truncate text-[14.5px] font-bold text-white">{r.material}</div>
                    <div className="mt-0.5 text-[11.5px] text-white/40">
                      {r.region} · CHF / {r.unit}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[13px] tabular-nums text-white/35 line-through">
                      {chf(r.kbob)}
                    </span>
                    <span className="font-display text-[28px] font-bold leading-none tabular-nums text-brand sm:text-[32px]">
                      {chf(r.pool)}
                    </span>
                  </div>
                </div>

                {/* Massstäblicher Balken: aussen die Referenz, gefüllt der Bündelpreis */}
                <div className="mt-3.5 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand"
                      style={{ width: `${poolWidth}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[12.5px] font-bold tabular-nums text-brand">
                    −{pct.toFixed(1)} %
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-white/[0.08] px-5 py-4 text-[12px] leading-relaxed text-white/40 sm:px-7">
          Referenzwerte aus dem KBOB-Preisindex. Der Bündelpreis hängt vom erreichten
          Volumen ab — im Sealed-Bid kann das beste Werksangebot die Garantie übertreffen.
        </div>
      </div>
    </div>
  );
}
