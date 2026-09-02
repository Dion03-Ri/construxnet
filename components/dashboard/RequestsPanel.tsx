"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Handshake,
  Clock,
  MapPin,
  MessageSquare,
  Check,
  X,
  Loader2,
  Info,
  TrendingDown,
  TrendingUp,
  Award,
  Send,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import {
  REQUEST_STATUS_LABEL,
  currentOffer,
  deltaToKbob,
  isExpired,
  isLive,
  type DirectOffer,
  type DirectRequest,
  type RequestStatus,
} from "@/lib/directRequests";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<RequestStatus, string> = {
  OPEN: "bg-slate-100 text-slate-600",
  OFFERED: "bg-brand/15 text-brand-700",
  ACCEPTED: "bg-navy-100 text-navy-700",
  DECLINED: "bg-slate-100 text-slate-400",
  WITHDRAWN: "bg-slate-100 text-slate-400",
};

function chf(v: number, d = 0) {
  return v.toLocaleString("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function dateCH(s: string | null) {
  if (!s) return null;
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

/** „noch 3 Tage" / „heute" / „2 Tage überfällig" */
function untilLabel(date: string | null): { text: string; late: boolean } | null {
  if (!date) return null;
  const today = new Date().toISOString().slice(0, 10);
  const days = Math.round(
    (new Date(date).getTime() - new Date(today).getTime()) / 86_400_000,
  );
  if (days === 0) return { text: "heute fällig", late: false };
  if (days < 0)
    return { text: `${-days} Tag${days === -1 ? "" : "e"} überfällig`, late: true };
  return { text: `noch ${days} Tag${days === 1 ? "" : "e"}`, late: days <= 2 };
}

/* -------------------------------------------------------------------------- */
/*  Angebot abgeben (Lieferant)                                               */
/* -------------------------------------------------------------------------- */

const FIELD =
  "w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white";
const LABEL =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

function OfferModal({
  request,
  myCompanyId,
  onClose,
  onSaved,
}: {
  request: DirectRequest;
  myCompanyId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = useSupabaseBrowser();
  const previous = currentOffer(request);
  const [price, setPrice] = useState(previous ? String(previous.unit_price) : "");
  const [promise, setPromise] = useState(previous?.delivery_promise ?? "");
  const [validUntil, setValidUntil] = useState(() => {
    if (previous?.valid_until) return previous.valid_until;
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = Number(price);
  const valid = p > 0;
  const total = valid ? p * request.quantity : 0;
  const ref = request.kbob_reference_price;
  const delta = valid && ref ? ((p - ref) / ref) * 100 : null;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("direct_offers").insert({
      request_id: request.id,
      supplier_company_id: myCompanyId,
      unit_price: p,
      delivery_promise: promise.trim() || null,
      valid_until: validUntil || null,
      note: note.trim() || null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              <Handshake className="h-4 w-4 text-brand" />
              {previous ? "Angebot nachbessern" : "Angebot abgeben"}
            </h3>
            <p className="mt-0.5 truncate text-[12.5px] text-slate-500">
              {request.material_label} · {chf(request.quantity)} {request.unit} für{" "}
              {request.buyer?.company_name ?? "den Besteller"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 px-5 py-4">
          <div>
            <label className={LABEL}>Einheitspreis (CHF pro {request.unit}) *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              autoFocus
              placeholder={ref ? `KBOB-Referenz: ${chf(ref, 2)}` : "z. B. 148.50"}
              className={FIELD}
            />
          </div>

          {valid && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Auftragswert</span>
                <b className="text-slate-900">CHF {chf(total)}</b>
              </div>
              {delta !== null && (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-slate-500">gegenüber KBOB-Referenz</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-semibold",
                      delta <= 0 ? "text-brand-700" : "text-slate-500",
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Gültig bis</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Lieferzusage</label>
              <input
                value={promise}
                onChange={(e) => setPromise(e.target.value)}
                placeholder="z. B. ab KW 12"
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Bemerkung</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Konditionen, Abladestelle, Mindestabnahme …"
              className={cn(FIELD, "resize-none")}
            />
          </div>

          <p className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-500">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
            Ein nachgebessertes Angebot ersetzt das vorige nicht, sondern kommt
            dazu. Beide Seiten sehen den Verlauf.
          </p>

          {error && <p className="text-[12.5px] font-medium text-rose-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500",
              (!valid || saving) && "cursor-not-allowed opacity-50",
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Angebot senden
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Angebotszeile                                                             */
/* -------------------------------------------------------------------------- */

function OfferBox({
  request,
  offer,
  best,
}: {
  request: DirectRequest;
  offer: DirectOffer;
  best: boolean;
}) {
  const delta = deltaToKbob(request, offer);
  const expired = isExpired(offer);
  const total = offer.unit_price * request.quantity;

  return (
    <div
      className={cn(
        "mt-3 rounded-md border px-3 py-2.5",
        best ? "border-brand/40 bg-brand/[0.05]" : "border-slate-200 bg-slate-50",
        expired && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-[13px] text-slate-500">
          CHF <b className="text-[15px] text-slate-900">{chf(offer.unit_price, 2)}</b> /{" "}
          {request.unit}
        </span>
        <span className="text-[13px] text-slate-500">
          Auftragswert <b className="text-slate-900">CHF {chf(total)}</b>
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
        {delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-semibold",
              delta <= 0 ? "text-brand-700" : "text-slate-500",
            )}
          >
            {delta <= 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" />
            )}
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} % gegenüber KBOB
          </span>
        )}
        {best && (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand/30">
            <Award className="h-3 w-3" /> Bestes Angebot
          </span>
        )}
        {offer.valid_until && (
          <span className={cn("text-slate-400", expired && "font-semibold text-rose-500")}>
            {expired ? "abgelaufen am" : "gültig bis"} {dateCH(offer.valid_until)}
          </span>
        )}
        {offer.delivery_promise && (
          <span className="text-slate-400">Lieferung {offer.delivery_promise}</span>
        )}
      </div>

      {offer.note && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">{offer.note}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel                                                                     */
/* -------------------------------------------------------------------------- */

export default function RequestsPanel({
  myCompanyId,
  isSupplier,
  requests,
  loading,
  error,
  reload,
}: {
  myCompanyId: string;
  isSupplier: boolean;
  requests: DirectRequest[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}) {
  const supabase = useSupabaseBrowser();
  const [offerFor, setOfferFor] = useState<DirectRequest | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const live = useMemo(() => requests.filter((r) => isLive(r.status)), [requests]);
  const done = useMemo(() => requests.filter((r) => !isLive(r.status)), [requests]);
  const shown = showDone ? done : live;

  /**
   * Bestes Angebot je Material: wer mehrere Lieferanten angefragt hat,
   * soll auf einen Blick sehen, welches Angebot vorn liegt.
   */
  const bestOfferId = useMemo(() => {
    const byMaterial = new Map<string, { id: string; price: number }>();
    for (const r of requests) {
      if (!isLive(r.status)) continue;
      const o = currentOffer(r);
      if (!o || isExpired(o)) continue;
      const cur = byMaterial.get(r.material_key);
      if (!cur || o.unit_price < cur.price) {
        byMaterial.set(r.material_key, { id: o.id, price: o.unit_price });
      }
    }
    // Nur markieren, wo es tatsächlich etwas zu vergleichen gibt.
    const counts = new Map<string, number>();
    for (const r of requests) {
      if (!isLive(r.status)) continue;
      if (currentOffer(r)) counts.set(r.material_key, (counts.get(r.material_key) ?? 0) + 1);
    }
    const ids = new Set<string>();
    for (const [key, v] of byMaterial) {
      if ((counts.get(key) ?? 0) > 1) ids.add(v.id);
    }
    return ids;
  }, [requests]);

  async function setRequestStatus(r: DirectRequest, status: RequestStatus) {
    setBusy(r.id);
    await supabase.from("direct_requests").update({ status }).eq("id", r.id);
    setBusy(null);
    reload();
  }

  async function acceptOffer(r: DirectRequest, o: DirectOffer) {
    setBusy(r.id);
    await supabase.from("direct_offers").update({ status: "ACCEPTED" }).eq("id", o.id);
    await supabase.from("direct_requests").update({ status: "ACCEPTED" }).eq("id", r.id);
    setBusy(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isSupplier ? "Direktanfragen" : "Meine Anfragen"}
          </h2>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
            {isSupplier
              ? "Anfragen, die ohne Bündelung direkt an dich gehen. Ein Angebot mit Preis und Gültigkeit macht daraus etwas Verbindliches."
              : "Anfragen, die du direkt an einen Lieferanten gestellt hast. Kommt ein Angebot zurück, siehst du hier den Auftragswert und den Abstand zum KBOB-Referenzpreis."}
          </p>
        </div>
        <div className="flex shrink-0 rounded-md border border-slate-200 p-0.5">
          {[
            { k: false, label: `Offen (${live.length})` },
            { k: true, label: `Erledigt (${done.length})` },
          ].map((t) => (
            <button
              key={String(t.k)}
              type="button"
              onClick={() => setShowDone(t.k)}
              className={cn(
                "rounded px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                showDone === t.k
                  ? "bg-navy-900 text-white"
                  : "text-slate-500 hover:bg-slate-100",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-800">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Anfragen konnten nicht geladen werden. Falls die Datenbank-Migration
          <code className="mx-1 rounded bg-amber-100 px-1">11_direct_offers.sql</code>
          noch nicht eingespielt ist, hol das im Supabase-SQL-Editor nach.
        </p>
      )}

      {loading ? (
        <div className={cn(CARD, "grid place-items-center py-16 text-slate-400")}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className={cn(CARD, "px-6 py-12 text-center")}>
          <Handshake className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-[15px] font-semibold text-slate-800">
            {showDone
              ? "Noch nichts abgeschlossen"
              : isSupplier
                ? "Keine offenen Anfragen"
                : "Keine offenen Anfragen"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500">
            {isSupplier
              ? "Sobald dich ein Bauunternehmen direkt anfragt, steht die Anfrage hier — mit Material, Menge und Frist."
              : "Im Netzwerk kannst du einen Lieferanten direkt anfragen, ohne auf ein Bündel zu warten."}
          </p>
          {!isSupplier && !showDone && (
            <Link
              href="/network"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              Zum Netzwerk
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => {
            const other = isSupplier ? r.buyer : r.supplier;
            const offer = currentOffer(r);
            const until = untilLabel(r.respond_by);
            const working = busy === r.id;

            return (
              <div key={r.id} className={cn(CARD, "p-4")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-bold text-slate-900">
                      {r.material_label}
                      <span className="ml-2 font-semibold text-slate-500">
                        {chf(r.quantity)} {r.unit}
                      </span>
                    </h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-slate-500">
                      <span>
                        {isSupplier ? "von" : "an"}{" "}
                        <b className="text-slate-700">
                          {other?.company_name ?? "Unbekannte Firma"}
                        </b>
                      </span>
                      {other?.city && (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {other.city}
                        </span>
                      )}
                      {r.spec && <span className="text-slate-400">{r.spec}</span>}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLE[r.status],
                    )}
                  >
                    {REQUEST_STATUS_LABEL[r.status]}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-500">
                  {r.delivery_window && <span>Lieferung {r.delivery_window}</span>}
                  {until && isLive(r.status) && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        until.late ? "font-semibold text-rose-600" : "text-slate-500",
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Antwort bis {dateCH(r.respond_by)} · {until.text}
                    </span>
                  )}
                  {r.kbob_reference_price != null && (
                    <span className="text-slate-400">
                      KBOB-Referenz CHF {chf(r.kbob_reference_price, 2)}/{r.unit}
                    </span>
                  )}
                </div>

                {r.note && (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{r.note}</p>
                )}

                {offer && (
                  <OfferBox request={r} offer={offer} best={bestOfferId.has(offer.id)} />
                )}

                {r.offers.length > 1 && (
                  <p className="mt-1.5 text-[11.5px] text-slate-400">
                    {r.offers.length} Angebote im Verlauf — das jüngste ist oben.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                  {other && (
                    <Link
                      href={`/messages?to=${other.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Im Chat besprechen
                    </Link>
                  )}

                  {isSupplier && isLive(r.status) && (
                    <>
                      <button
                        type="button"
                        onClick={() => setOfferFor(r)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand-500"
                      >
                        <Handshake className="h-3.5 w-3.5" />
                        {offer ? "Angebot nachbessern" : "Angebot abgeben"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestStatus(r, "DECLINED")}
                        disabled={working}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        {working ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Kann ich nicht liefern
                      </button>
                    </>
                  )}

                  {!isSupplier && isLive(r.status) && (
                    <>
                      {offer && !isExpired(offer) && (
                        <button
                          type="button"
                          onClick={() => acceptOffer(r, offer)}
                          disabled={working}
                          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:opacity-50"
                        >
                          {working ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Angebot annehmen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setRequestStatus(r, "WITHDRAWN")}
                        disabled={working}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                      >
                        Anfrage zurückziehen
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {offerFor && (
          <OfferModal
            request={offerFor}
            myCompanyId={myCompanyId}
            onClose={() => setOfferFor(null)}
            onSaved={reload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
