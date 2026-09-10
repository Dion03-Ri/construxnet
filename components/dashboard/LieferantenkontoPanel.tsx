"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useLieferantenkonto } from "@/lib/lieferant";
import { cn } from "@/lib/utils";

/**
 * Lieferantenkonto beantragen und seinen Stand sehen.
 *
 * Hier steht bewusst KEIN Kaufknopf. Die Lizenz zum Bieten wird zugelassen,
 * nicht gekauft — läge sie hinter einer Zahlung, kaufte sich irgendwann ein
 * Bauunternehmen hinein und das ganze Ausschreibungsverfahren hinge an
 * einer Kreditkarte.
 *
 * Der Antrag sagt deshalb auch nichts über Geld. Das kommt erst nach der
 * Zulassung, und im ersten Jahr gar nicht.
 */

function datum(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const ZUSTAND: Record<string, { wort: string; ton: string }> = {
  BEANTRAGT:  { wort: "In Prüfung",  ton: "text-white/[0.72]" },
  ZUGELASSEN: { wort: "Zugelassen",  ton: "text-brand" },
  ABGELEHNT:  { wort: "Abgelehnt",   ton: "text-rose-300" },
  GESPERRT:   { wort: "Gesperrt",    ton: "text-rose-300" },
};

export default function LieferantenkontoPanel() {
  const { konto, darf, laden, fehler, beantragen } = useLieferantenkonto();
  const [nachweis, setNachweis] = useState("");
  const [noga, setNoga] = useState("");
  const [busy, setBusy] = useState(false);

  if (laden) {
    return (
      <div className="grid place-items-center py-20 text-white/[0.56]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  async function absenden() {
    if (!nachweis.trim() || busy) return;
    setBusy(true);
    await beantragen(nachweis.trim(), noga.trim());
    setBusy(false);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-bold text-white">Lieferantenkonto</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-white/[0.72]">
          Die Zulassung zum Bieten. Sie wird geprüft und freigegeben — nicht gekauft.
          Im ersten Jahr kostenlos; danach eine Grundgebühr, an die jede Vermittlungs&shy;provision
          angerechnet wird.
        </p>
      </div>

      {/* ---------- Was gerade gilt ---------- */}
      {konto && (
        <div className="border-t border-white/[0.12] pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/[0.56]">
              Stand
            </span>
            <span className={cn("text-[15px] font-bold", ZUSTAND[konto.status]?.ton)}>
              {ZUSTAND[konto.status]?.wort ?? konto.status}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 text-[13px] sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-white/[0.56]">Beantragt</dt>
              <dd className="tabular-nums text-white">{datum(konto.beantragt_am)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/[0.56]">Entschieden</dt>
              <dd className="tabular-nums text-white">{datum(konto.entschieden_am)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/[0.56]">Kostenlos bis</dt>
              <dd className="tabular-nums text-white">{datum(konto.frei_bis)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/[0.56]">Bezahlt bis</dt>
              <dd className="tabular-nums text-white">{datum(konto.bezahlt_bis)}</dd>
            </div>
          </dl>

          {konto.begruendung && (
            <p className="mt-5 border-l-2 border-white/[0.16] py-1 pl-4 text-[13px] leading-relaxed text-white/[0.72]">
              {konto.begruendung}
            </p>
          )}

          {darf && (
            <p
              className={cn(
                "mt-6 flex items-start gap-2 text-[13px] leading-relaxed",
                darf.ok ? "text-brand" : "text-white/[0.72]",
              )}
            >
              {darf.ok ? (
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/[0.56]" />
              )}
              {darf.ok ? "Du kannst auf Ausschreibungen bieten." : darf.grund}
            </p>
          )}
        </div>
      )}

      {/* ---------- Antrag ---------- */}
      {(!konto || konto.status === "ABGELEHNT") && (
        <div className="border-t border-white/[0.12] pt-6">
          <h3 className="text-[15px] font-semibold text-white">
            {konto ? "Erneut beantragen" : "Zulassung beantragen"}
          </h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/[0.72]">
            Beschreibe, womit du nachweisen kannst, dass du das Material tatsächlich
            produzierst oder handelst — beim Beton etwa die Konformitäts&shy;bescheinigung
            nach SN EN 206, beim Kies die Abbaubewilligung. Das sind Papiere, die im
            normalen Geschäft ohnehin vorliegen.
          </p>

          {fehler && (
            <p className="mt-4 flex items-start gap-2 border-l-2 border-rose-400/60 py-2 pl-4 text-[13px] text-rose-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {fehler}
            </p>
          )}

          <label className="mt-6 block text-[13px] text-white/[0.72]">
            Deine Nachweise
            <textarea
              value={nachweis}
              onChange={(e) => setNachweis(e.target.value)}
              rows={4}
              placeholder="z. B. Transportbetonwerk in Dietikon, Konformitätsbescheinigung nach SN EN 206 vorhanden, Werksbesichtigung jederzeit möglich."
              className="mt-2 block w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] leading-relaxed text-white outline-none transition-colors placeholder:text-white/[0.32] focus:border-brand focus:bg-[#16181a]"
            />
          </label>

          <label className="mt-4 block text-[13px] text-white/[0.72]">
            Branchennummer (NOGA), falls bekannt
            <input
              value={noga}
              onChange={(e) => setNoga(e.target.value)}
              placeholder="z. B. 23.63"
              className="mt-2 block w-full max-w-[14rem] rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] text-white outline-none transition-colors placeholder:text-white/[0.32] focus:border-brand focus:bg-[#16181a]"
            />
          </label>

          <button
            type="button"
            onClick={absenden}
            disabled={!nachweis.trim() || busy}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? "wird gesendet …" : "Antrag einreichen"}
          </button>

          <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-white/[0.56]">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" />
            Wir prüfen von Hand und melden uns. Bis dahin kannst du die Plattform
            normal nutzen — nur bieten geht noch nicht.
          </p>
        </div>
      )}
    </div>
  );
}
