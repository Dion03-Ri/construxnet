"use client";

import { useMemo, useState } from "react";
import {
  Gavel,
  MapPin,
  Users,
  Clock,
  Check,
  Loader2,
  Info,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useLieferantenkonto } from "@/lib/lieferant";
import {
  useBundles,
  useMyBids,
  placeBid,
  holeMindestgebot,
  holeKapazitaetFuer,
  holeAusschreibungsBaustellen,
  type Mindestgebot,
  type KapazitaetsZeile,
  type AusschreibungsBaustelle,
  deadlineLabel,
  type Bundle,
} from "@/lib/bundles";
import { cn } from "@/lib/utils";

function chf(v: number, d = 0) {
  return v.toLocaleString("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d });
}

/**
 * Ausschreibungen für Baustoffwerke.
 *
 * Verdeckt: sichtbar ist Material, Menge, Region und der
 * KBOB-Referenzpreis — nie fremde Gebote und nie, welche Firmen im Bündel
 * stecken. Wer die Konkurrenz sieht, bietet knapp darunter statt seinen
 * besten Preis.
 */
export default function TendersPanel() {
  const supabase = useSupabaseBrowser();
  const { bundles, loading, error, reload } = useBundles();
  /* Ob dieses Werk überhaupt bieten darf. Die Datenbank weist ein
     Gebot ohne Zulassung ohnehin ab — hier steht der Grund, damit
     niemand erst einen Preis eintippt und dann eine Absage liest. */
  const { darf } = useLieferantenkonto();
  const { bids, reload: reloadBids } = useMyBids();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [listPrice, setListPrice] = useState("");
  /* Teilgebot: Zielanteil und Puffer. Ganze Baustellen ergeben nie
     genau einen Prozentwert — ohne Puffer wäre ein Teilgebot fast
     immer unerfüllbar, und das Werk würde wortlos übergangen. */
  const [teilgebot, setTeilgebot] = useState(false);
  const [anteil, setAnteil] = useState("50");
  const [puffer, setPuffer] = useState("10");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /* Was für DIESES Bündel mindestens verlangt ist. Aus der Datenbank
     geholt statt im Browser gerechnet — die Sätze stehen in
     `app_settings`, und eine zweite Rechnung hier wäre eine zweite
     Wahrheit. */
  const [minimum, setMinimum] = useState<Mindestgebot | null>(null);
  /* Die Mengenkurve mit der eigenen Kapazität, und die grobe Lage der
     Baustellen. Beides braucht ein Werk, um seinen Aufwand zu rechnen —
     500 m³ in einem Monat sind etwas anderes als über vier, und die
     Fahrt ins Nachbardorf etwas anderes als über den Berg. */
  const [kurve, setKurve] = useState<KapazitaetsZeile[]>([]);
  const [orte, setOrte] = useState<AusschreibungsBaustelle[]>([]);

  const myBid = useMemo(() => {
    const m = new Map<string, (typeof bids)[number]>();
    for (const b of bids) m.set(b.bundle_id, b);
    return m;
  }, [bids]);

  const open = bundles.filter((b) => b.status === "SEALED_BIDDING");
  const decided = bundles.filter((b) => b.status === "AWARDED" && myBid.has(b.id));

  async function submit(b: Bundle) {
    const p = Number(price);
    if (!(p > 0) || busy) return;
    setBusy(true);
    setFormError(null);
    const res = await placeBid(
      supabase,
      b.id,
      p,
      Number(listPrice) || 0,
      teilgebot ? Number(anteil) || 0 : 100,
      teilgebot ? Number(puffer) || 0 : 0,
    );
    setBusy(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setOpenFor(null);
    setPrice("");
    setListPrice("");
    setTeilgebot(false);
    reloadBids();
    reload();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Ausschreibungen</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-white/[0.72]">
          Gebündelte Bedarfe, auf die du bieten kannst. Gebote sind verdeckt —
          du siehst weder fremde Preise noch, welche Firmen im Bündel stecken.
          Den Zuschlag bekommt das günstigste Angebot gemessen am
          KBOB-Referenzpreis.
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-md border border-brand/25 bg-brand/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-brand">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Ausschreibungen konnten nicht geladen werden. Falls die Migrationen
          <code className="mx-1 rounded bg-brand/15 px-1">16</code> und
          <code className="mx-1 rounded bg-brand/15 px-1">17</code>
          noch nicht eingespielt sind, hol das im Supabase-SQL-Editor nach.
        </p>
      )}

      {loading ? (
        <div className={"grid place-items-center py-20 text-white/[0.56]"}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : open.length === 0 ? (
        <div className={"border-t border-white/[0.12] py-16 text-center"}>
          <Gavel className="mx-auto h-8 w-8 text-white/[0.4]" />
          <p className="mt-3 text-[15px] font-semibold text-white/90">
            Zurzeit keine offene Ausschreibung
          </p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-white/[0.72]">
            Ein Bündel geht in die Ausschreibung, sobald seine Sammelfrist
            abgelaufen ist und genug Firmen dabei sind. Dann steht es hier, mit
            Menge und Referenzpreis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {open.map((b) => {
            const mine = myBid.get(b.id);
            const ref = b.kbob_reference_price;
            const typed = Number(price);
            const delta = ref && typed > 0 ? ((typed - ref) / ref) * 100 : null;

            return (
              <div key={b.id} className={"border-t border-white/[0.12] py-5 transition-colors hover:bg-white/[0.02]"}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-bold text-white">
                      {b.material_label ?? b.title}
                    </h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-white/[0.72]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-white/[0.56]" /> {b.region}
                      </span>
                      <span className="font-semibold text-white/[0.72]">
                        {chf(b.current_volume)} {b.unit}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-white/[0.56]" />
                        {b.participant_count} Firmen
                      </span>
                      {ref != null && (
                        <span className="text-white/[0.56]">
                          KBOB-Ref CHF {chf(ref, 2)}/{b.unit}
                        </span>
                      )}
                    </p>
                    {b.sia_specification && (
                      <p className="mt-0.5 truncate text-[11.5px] text-white/[0.56]">
                        {b.sia_specification}
                      </p>
                    )}
                  </div>

                  {mine ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand-700">
                      <Check className="h-3.5 w-3.5" />
                      Dein Gebot CHF {chf(mine.customer_price_net, 2)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 text-[12.5px]">
                  {b.bid_deadline && (
                    <span className="inline-flex items-center gap-1 font-semibold text-white/[0.72]">
                      <Clock className="h-3.5 w-3.5" />
                      Angebotsfrist {deadlineLabel(b.bid_deadline)}
                    </span>
                  )}
                </div>

                <div className="mt-3 border-t border-white/[0.06] pt-3">
                  {darf && !darf.ok ? (
                    <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/[0.72]">
                      <Info className="mt-px h-3.5 w-3.5 shrink-0 text-white/[0.56]" />
                      {darf.grund}
                    </p>
                  ) : openFor === b.id ? (
                    <div className="space-y-2.5">
                      {/* Was verlangt ist, und woraus es besteht. Eine Zahl
                          ohne Herkunft muss man glauben. */}
                      {minimum && (
                        <div className="rounded-md border border-brand/25 bg-brand/[0.07] px-3 py-2.5 text-[12.5px] leading-relaxed">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                            <span className="font-semibold text-white">Verlangt für dieses Bündel</span>
                            <span className="font-semibold text-brand">
                              höchstens CHF {chf(minimum.max_lieferantenpreis, 2)} / {b.unit}
                            </span>
                          </div>
                          <p className="mt-1 text-white/[0.72]">
                            {minimum.gesamtrabatt_pct} % unter Referenz — davon{" "}
                            {minimum.mindestrabatt_pct} % Rabatt für die Besteller und{" "}
                            {minimum.provision_pct} % Vermittlung Obtanet. Bietest du besser,
                            geht der Überschuss vollständig an die Besteller; Obtanet bleibt
                            bei {minimum.provision_pct} %.
                          </p>
                        </div>
                      )}

                      {/* Wann wie viel gebraucht wird — und ob du das fahren
                          kannst. Ohne diese Kurve bietet ein Werk blind auf
                          eine Jahreszahl. */}
                      {kurve.length > 0 && (
                        <div className="rounded-md border border-white/[0.12] bg-white/[0.03] px-3 py-2.5 text-[12.5px]">
                          <div className="font-semibold text-white">Menge über die Monate</div>
                          <ul className="mt-1.5 space-y-1">
                            {kurve.map((m) => {
                              const eng = m.gebraucht > m.frei_gebucht;
                              return (
                                <li key={m.monat} className="flex flex-wrap items-baseline justify-between gap-x-4">
                                  <span className="text-white/[0.72]">
                                    {new Date(m.monat).toLocaleDateString("de-CH", { month: "long", year: "numeric" })}
                                  </span>
                                  <span className={cn("tabular-nums", eng ? "text-rose-300" : "text-white")}>
                                    {m.gebraucht.toLocaleString("de-CH")} {b.unit}
                                    <span className="text-white/[0.5]">
                                      {" "}· frei {m.frei_gebucht.toLocaleString("de-CH")}
                                      {m.frei_offen !== m.frei_gebucht
                                        ? ` (offene Gebote: ${(m.frei_gebucht - m.frei_offen).toLocaleString("de-CH")})`
                                        : ""}
                                    </span>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {orte.length > 0 && (
                        <div className="rounded-md border border-white/[0.12] bg-white/[0.03] px-3 py-2.5 text-[12.5px]">
                          <div className="font-semibold text-white">
                            {orte.length} {orte.length === 1 ? "Baustelle" : "Baustellen"}
                          </div>
                          <ul className="mt-1.5 space-y-1">
                            {orte.map((o, i) => (
                              <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4">
                                <span className="text-white/[0.72]">{o.lage}</span>
                                <span className="tabular-nums text-white/[0.72]">
                                  {o.menge.toLocaleString("de-CH")} {b.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-white/[0.5]">
                            Wer dort baut, siehst du erst mit dem Zuschlag.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
                            Was du erhältst (CHF / {b.unit}) *
                          </label>
                          <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                            inputMode="decimal"
                            autoFocus
                            placeholder={
                              minimum
                                ? `höchstens ${chf(minimum.max_lieferantenpreis, 2)}`
                                : ref
                                  ? `Referenz ${chf(ref, 2)}`
                                  : "z. B. 148.50"
                            }
                            className="w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-brand focus:bg-[#16181a]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
                            Listenpreis (optional)
                          </label>
                          <input
                            value={listPrice}
                            onChange={(e) => setListPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                            inputMode="decimal"
                            placeholder="nur zur Anzeige"
                            className="w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-brand focus:bg-[#16181a]"
                          />
                        </div>
                      </div>

                      {typed > 0 && (
                        <div className="rounded-md border border-white/[0.12] bg-white/[0.03] px-3 py-2.5 text-[13px]">
                          <div className="flex items-center justify-between">
                            <span className="text-white/[0.72]">Du erhältst</span>
                            <b className="text-white">
                              CHF {chf(typed * b.current_volume)}
                            </b>
                          </div>
                          {minimum && (
                            <>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-white/[0.72]">
                                  Vermittlung Obtanet ({minimum.provision_pct} %)
                                </span>
                                <span className="text-white/[0.72]">
                                  CHF {chf((minimum.kbob * minimum.provision_pct / 100) * b.current_volume)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between border-t border-white/[0.12] pt-1">
                                <span className="text-white/[0.72]">Die Besteller zahlen</span>
                                <span className="text-white/[0.72]">
                                  CHF {chf((typed + minimum.kbob * minimum.provision_pct / 100) * b.current_volume)}
                                </span>
                              </div>
                            </>
                          )}
                          {delta !== null && (
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-white/[0.72]">gegenüber KBOB-Referenz</span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 font-semibold",
                                  delta <= 0 ? "text-brand-700" : "text-white/[0.72]",
                                )}
                              >
                                {delta <= 0 ? (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                ) : (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                )}
                                {delta > 0 ? "+" : ""}
                                {delta.toFixed(1)} %
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Teilgebot. Ein Bündel wird auf GANZE Baustellen
                          verteilt — eine Bodenplatte kommt aus einem Werk.
                          Der Anteil ist deshalb ein Ziel, kein Schnitt. */}
                      <div className="rounded-md border border-white/[0.12] bg-white/[0.03] px-3 py-2.5">
                        <label className="flex cursor-pointer items-start gap-2 text-[12.5px] leading-relaxed text-white/[0.72]">
                          <input
                            type="checkbox"
                            checked={teilgebot}
                            onChange={(e) => setTeilgebot(e.target.checked)}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#D99000]"
                          />
                          <span>
                            <b className="font-semibold text-white">Nur einen Teil übernehmen</b> — du
                            bekommst dann ganze Baustellen zugeteilt, nicht einen Schnitt durch jede
                            Lieferung.
                          </span>
                        </label>

                        {teilgebot && (
                          <div className="mt-3 flex flex-wrap items-end gap-4">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
                              Zielanteil %
                              <input
                                value={anteil}
                                onChange={(e) => setAnteil(e.target.value.replace(/[^0-9]/g, ""))}
                                inputMode="numeric"
                                className="mt-1 block w-24 rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-brand focus:bg-[#16181a]"
                              />
                            </label>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
                              Puffer ± Punkte
                              <input
                                value={puffer}
                                onChange={(e) => setPuffer(e.target.value.replace(/[^0-9]/g, ""))}
                                inputMode="numeric"
                                className="mt-1 block w-24 rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-brand focus:bg-[#16181a]"
                              />
                            </label>
                            <p className="flex-1 text-[11.5px] leading-relaxed text-white/[0.56]">
                              Du erklärst dich einverstanden, zwischen{" "}
                              <b className="font-semibold text-white/[0.8]">
                                {Math.max(Number(anteil) - Number(puffer), 0)} %
                              </b>{" "}
                              und{" "}
                              <b className="font-semibold text-white/[0.8]">
                                {Math.min(Number(anteil) + Number(puffer), 100)} %
                              </b>{" "}
                              zu übernehmen — zum selben Preis je {b.unit}.
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="flex items-start gap-2 rounded-md bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-white/[0.72]">
                        <Info className="mt-px h-3.5 w-3.5 shrink-0 text-white/[0.56]" />
                        Trag ein, was du je {b.unit} erhalten willst — die
                        Vermittlung schlägt Obtanet auf, du musst sie nicht
                        abziehen. Bewertet wird dein Preis gegen den
                        Referenzpreis, nicht gegen deinen Listenpreis; ein hoher
                        Listenpreis mit grossem Rabatt bringt also nichts.
                        Nachbessern ersetzt dein Gebot, es kommt kein zweites
                        dazu.
                      </p>

                      {formError && (
                        <p className="text-[12.5px] font-medium text-rose-300">{formError}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => submit(b)}
                          disabled={!(typed > 0) || busy}
                          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand/100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Gavel className="h-4 w-4" />
                          )}
                          {mine ? "Gebot ersetzen" : "Gebot abgeben"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setOpenFor(null); setFormError(null); }}
                          className="rounded-md px-3 py-2 text-sm font-semibold text-white/[0.72] transition-colors hover:bg-white/[0.07]"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFor(b.id);
                        setPrice(mine?.lieferantenpreis_net ? String(mine.lieferantenpreis_net) : "");
                        setListPrice(mine ? String(mine.list_price_net) : "");
                        setFormError(null);
                        setMinimum(null);
                        setKurve([]);
                        setOrte([]);
                        void holeMindestgebot(supabase, b.id).then(setMinimum);
                        void holeKapazitaetFuer(supabase, b.id).then(setKurve);
                        void holeAusschreibungsBaustellen(supabase, b.id).then(setOrte);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
                    >
                      <Gavel className="h-3.5 w-3.5" />
                      {mine ? "Gebot nachbessern" : "Gebot abgeben"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {decided.length > 0 && (
        <div className={"border-t border-white/[0.12]"}>
          <div className="border-b border-white/[0.12] px-5 py-3.5">
            <h3 className="text-[15px] font-semibold text-white">Entschieden</h3>
            <p className="mt-0.5 text-[12px] text-white/[0.72]">
              Bündel, auf die du geboten hast und die vergeben sind.
            </p>
          </div>
          <ul className="divide-y divide-white/[0.12]">
            {decided.map((b) => {
              const mine = myBid.get(b.id)!;
              return (
                <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-white/90">
                      {b.material_label ?? b.title}
                    </span>
                    <span className="block text-[11.5px] text-white/[0.56]">
                      {b.region} · {chf(b.current_volume)} {b.unit} · dein Gebot CHF{" "}
                      {chf(mine.customer_price_net, 2)}
                    </span>
                  </div>
                  {mine.is_winning_bid ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand/10 px-2.5 py-1 text-[12px] font-semibold text-brand-700">
                      <Trophy className="h-3.5 w-3.5" /> Zuschlag
                    </span>
                  ) : (
                    <span className="shrink-0 text-[12px] text-white/[0.56]">
                      nicht zum Zug gekommen
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
