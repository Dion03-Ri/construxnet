/**
 * Der Zuschlag als Dokument — die Aufnahme rechts im Smart-Pools-Abschnitt.
 *
 * Warum hell auf dunklem Grund: es ist ein Blatt, kein Bildschirm. Der
 * Moment, in dem aus einem Bündel ein Preis wird, endet auf Papier — im
 * Zuschlag nach SIA 118. Ein weisses Blatt auf schwarzem Grund hat mehr
 * Gewicht als noch eine dunkle Liste, und es zeigt etwas Konkretes statt
 * einer Illustration.
 *
 * Alle Werte sind Beispielwerte und als solche gekennzeichnet. Die Werke
 * heissen bewusst „Werk A/B/C": im Sealed-Bid sind die Bieter bis zum
 * Zuschlag verdeckt, und es werden keine erfundenen Firmennamen benutzt.
 */

const BIDS = [
  { werk: "Werk A", preis: 138.4, gewinner: false },
  { werk: "Werk B", preis: 132.7, gewinner: true },
  { werk: "Werk C", preis: 141.9, gewinner: false },
];

const KBOB = 156.12;

function chf(n: number) {
  return n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OfferSheet() {
  const sieger = BIDS.find((b) => b.gewinner)!;
  const vorteil = ((KBOB - sieger.preis) / KBOB) * 100;

  return (
    <div className="overflow-hidden rounded-[14px] bg-white text-slate-900 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)]">
      {/* Kopf des Blattes */}
      <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-navy-900 text-[11px] font-bold text-brand">
            O
          </span>
          <span className="text-[12px] font-bold tracking-tight text-slate-900">
            Obta<span className="text-brand">net</span>
          </span>
        </div>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Zuschlag · Beispiel
        </span>
      </div>

      <div className="px-7 py-6">
        <h3 className="text-[21px] font-bold leading-tight tracking-tight text-slate-900">
          Beton C25/30
        </h3>

        {/* Kennzeilen wie im Kopf eines Formulars */}
        <dl className="mt-5 grid grid-cols-3 gap-x-4 border-y border-slate-200 py-4">
          {[
            ["Region", "Zürich"],
            ["Volumen", "300 m³"],
            ["Teilnehmer", "3 Firmen"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {k}
              </dt>
              <dd className="mt-1 text-[13.5px] font-semibold tabular-nums text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Die verdeckten Angebote, aufgedeckt */}
        <div className="mt-6 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Verdeckte Angebote
        </div>
        <ul className="mt-2.5">
          {BIDS.map((b) => (
            <li
              key={b.werk}
              className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-b-0"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={
                    b.gewinner
                      ? "h-1.5 w-1.5 rounded-full bg-brand"
                      : "h-1.5 w-1.5 rounded-full bg-slate-300"
                  }
                />
                <span
                  className={
                    b.gewinner
                      ? "text-[13.5px] font-bold text-slate-900"
                      : "text-[13.5px] text-slate-400"
                  }
                >
                  {b.werk}
                </span>
                {b.gewinner && (
                  <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-brand-700">
                    Zuschlag
                  </span>
                )}
              </span>
              <span
                className={
                  b.gewinner
                    ? "text-[15px] font-bold tabular-nums text-slate-900"
                    : "text-[14px] tabular-nums text-slate-400"
                }
              >
                {chf(b.preis)}
              </span>
            </li>
          ))}
        </ul>

        {/* Das Ergebnis */}
        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-500">KBOB-Referenz</span>
            <span className="tabular-nums text-slate-400 line-through">{chf(KBOB)}</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-[13px] font-semibold text-slate-900">Zuschlagspreis</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-slate-400">CHF / m³</span>
              <span className="font-display text-[30px] font-bold leading-none tabular-nums text-slate-900">
                {chf(sieger.preis)}
              </span>
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-brand/10 px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-brand-700">Vorteil gegenüber KBOB</span>
            <span className="text-[15px] font-bold tabular-nums text-brand-700">
              −{vorteil.toFixed(1)} %
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-7 py-3.5 text-[10.5px] leading-relaxed text-slate-400">
        Vertragsgrundlage SIA 118 · Beispielwerte, keine reale Ausschreibung
      </div>
    </div>
  );
}
