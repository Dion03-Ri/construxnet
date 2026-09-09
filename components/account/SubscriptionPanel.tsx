"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { PLANS, STATUS_LABEL, plan as planOf, type Subscription } from "@/data/plans";
import { chf } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Das Abo — waehlen, wechseln, kuendigen, wieder aufnehmen.
 *
 * Was hier NICHT passiert, ist die Zahlung. Eine kostenpflichtige Stufe
 * endet im Zustand „wartet auf Zahlung", und das steht auch so da. Ein
 * Ablauf, der so tut, als waere gebucht, waere schlimmer als gar keiner:
 * die Firma glaubt, sie habe Pro, und hat es nicht.
 *
 * Alle Aenderungen laufen ueber Datenbankfunktionen. Der Browser darf die
 * Tabelle nicht schreiben — sonst setzte sich jeder auf Enterprise.
 */

function datum(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SubscriptionPanel() {
  const supabase = useSupabaseBrowser();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [laden, setLaden] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const holen = useCallback(async () => {
    setFehler(null);
    await supabase.rpc("advance_due_subscriptions").then(undefined, () => undefined);
    const { data, error } = await supabase.rpc("subscription_mine");
    if (error) setFehler(error.message);
    else setSub((Array.isArray(data) ? data[0] : data) as Subscription);
    setLaden(false);
  }, [supabase]);

  useEffect(() => {
    holen();
  }, [holen]);

  async function ruf(fn: string, args?: Record<string, unknown>, marke = fn) {
    setBusy(marke);
    setFehler(null);
    const { error } = await supabase.rpc(fn, args);
    if (error) setFehler(error.message);
    await holen();
    setBusy(null);
  }

  if (laden) {
    return (
      <div className="grid place-items-center py-20 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const aktuell = sub ? planOf(sub.plan) : PLANS[0];
  const wartet = sub?.status === "PENDING_PAYMENT" && sub.pending_plan;
  const gekuendigt = sub?.cancel_at_period_end === true;

  return (
    <div className="space-y-10">
      {fehler && (
        <p className="flex items-start gap-2 border-l-2 border-rose-300 py-2 pl-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {fehler}
        </p>
      )}

      {/* ---------- Was gerade gilt ---------- */}
      <div className="max-w-3xl rounded-[20px] border border-slate-200 bg-slate-50 p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Deine Stufe
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[34px] font-medium leading-none text-slate-900">
            {aktuell.name}
          </span>
          <span className="text-[13px] text-slate-400">
            {sub ? STATUS_LABEL[sub.status] : "aktiv"}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-3 border-t border-slate-200 pt-5 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Preis</dt>
            <dd className="tabular-nums text-slate-900">
              {aktuell.price === 0 ? "kostenlos" : `CHF ${chf(aktuell.price)} ${aktuell.unit ?? ""}`}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Gleichzeitige Bündel</dt>
            <dd className="tabular-nums text-slate-900">{aktuell.poolLimit ?? "ohne Grenze"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Läuft bis</dt>
            <dd className="tabular-nums text-slate-900">{datum(sub?.current_period_end ?? null)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Seit</dt>
            <dd className="tabular-nums text-slate-900">{datum(sub?.started_at ?? null)}</dd>
          </div>
        </dl>

        {wartet && (
          <p className="mt-5 border-t border-slate-200 pt-5 text-[13px] leading-relaxed text-slate-600">
            <b className="font-semibold text-brand-700">{planOf(sub!.pending_plan!).name}</b> ist
            vorgemerkt. Die Zahlung ist noch nicht angebunden — sobald sie es ist, wird die Stufe
            hier aktiv. Bis dahin gilt weiter <b className="font-semibold">{aktuell.name}</b>.
          </p>
        )}

        {gekuendigt && !wartet && (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-[13px] leading-relaxed text-slate-600">
              Gekündigt. <b className="font-semibold">{aktuell.name}</b> läuft noch bis{" "}
              <b className="font-semibold tabular-nums">{datum(sub?.current_period_end ?? null)}</b>,
              danach gilt Gratis. Bezahlt ist bezahlt — es wird dir nichts vorher weggenommen.
            </p>
            <button
              type="button"
              onClick={() => ruf("subscription_resume")}
              disabled={busy !== null}
              className="mt-4 text-[13px] font-semibold text-brand-700 hover:underline disabled:opacity-50"
            >
              {busy === "subscription_resume" ? "…" : "Kündigung zurücknehmen"}
            </button>
          </div>
        )}
      </div>

      {/* ---------- Stufe wechseln ---------- */}
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Stufe wechseln</h2>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-slate-500">
          Ein Wechsel nach oben wird vorgemerkt und gilt, sobald die Zahlung angebunden ist. Ein
          Wechsel nach unten greift am Ende der bezahlten Laufzeit.
        </p>

        <ul className="mt-6 border-t border-slate-200">
          {PLANS.map((p) => {
            const ist = sub?.plan === p.key && !gekuendigt;
            const vorgemerkt = sub?.pending_plan === p.key;
            return (
              <li
                key={p.key}
                className="grid grid-cols-1 items-start gap-x-10 gap-y-4 border-b border-slate-200 py-6 lg:grid-cols-[13rem_minmax(0,1fr)_11rem]"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-bold tracking-tight text-slate-900">{p.name}</span>
                    {ist && (
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                        aktuell
                      </span>
                    )}
                    {vorgemerkt && !ist && (
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        vorgemerkt
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-[13px] tabular-nums text-slate-600">
                    {p.price === 0 ? "kostenlos" : `CHF ${chf(p.price)} ${p.unit ?? ""}`}
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="lg:text-right">
                  {ist ? (
                    p.key !== "FREE" ? (
                      <button
                        type="button"
                        onClick={() => ruf("subscription_cancel")}
                        disabled={busy !== null}
                        className="text-[13px] font-semibold text-slate-400 transition-colors hover:text-rose-600 disabled:opacity-50"
                      >
                        {busy === "subscription_cancel" ? "…" : "kündigen"}
                      </button>
                    ) : null
                  ) : (
                    <button
                      type="button"
                      onClick={() => ruf("subscription_choose", { p_plan: p.key }, "w-" + p.key)}
                      disabled={busy !== null}
                      className={cn(
                        "inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold transition-colors disabled:opacity-50",
                        p.key === "FREE"
                          ? "text-slate-500 hover:text-slate-900"
                          : "text-brand-700 hover:underline",
                      )}
                    >
                      {busy === "w-" + p.key
                        ? "…"
                        : p.key === "FREE"
                          ? "auf Gratis wechseln"
                          : `${p.name} wählen`}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------- Was noch fehlt ---------- */}
      <div className="max-w-3xl border-l-2 border-brand pl-5">
        <h3 className="text-[14px] font-bold tracking-tight text-slate-900">
          Zahlung ist noch nicht angebunden
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
          Auswahl, Wechsel und Kündigung funktionieren vollständig. Es fehlt der letzte Schritt:
          die Zahlungsmethode. Bis dahin bleibt eine kostenpflichtige Stufe auf „wartet auf
          Zahlung" stehen und wird nicht aktiv.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
          Die Preise sind ausserdem noch nicht bestätigt.{" "}
          <Link href="/messages" className="font-semibold text-brand-700 hover:underline">
            Fragen dazu
          </Link>{" "}
          beantworten wir direkt.
        </p>
      </div>
    </div>
  );
}
