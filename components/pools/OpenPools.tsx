"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Users,
  Layers,
  Gavel,
  ArrowRight,
  Flame,
  Bookmark,
  Info,
  Loader2,
  Check,
  TrendingUp,
} from "lucide-react";
import {
  useBundles,
  nextStep,
  withdrawDemand,
  type Bundle,
} from "@/lib/bundles";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useSavedPools } from "@/lib/useSavedPools";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

const REGIONS = [
  "Alle",
  "Zürich",
  "Bern",
  "Nordwestschweiz",
  "Innerschweiz",
  "Westschweiz",
  "Ostschweiz",
];

function chf(v: number) {
  return v.toLocaleString("de-CH", { maximumFractionDigits: 0 });
}

/**
 * Restlaufzeit, clientseitig tickend.
 *
 * Erst nach dem Einhängen gerechnet, damit Server und Browser beim ersten
 * Rendern nicht auseinanderlaufen.
 */
function useCountdown(deadline: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return { text: "—", urgent: false };
  const diff = Math.max(0, new Date(deadline).getTime() - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const text = d > 0 ? `${d} T ${h} Std` : h > 0 ? `${h} Std ${m} Min` : `${m} Min`;
  return { text, urgent: diff < 24 * 3_600_000 };
}

function PoolCard({
  b,
  myVolume,
  saved,
  onToggleSave,
  onWithdraw,
  busy,
}: {
  b: Bundle;
  /** Eigener Anteil, oder null wenn nicht beteiligt. */
  myVolume: number | null;
  saved: boolean;
  onToggleSave: () => void;
  onWithdraw: () => void;
  busy: boolean;
}) {
  const cd = useCountdown(b.deadline);
  const step = nextStep(b.current_volume);
  // Der Fortschrittsbalken misst gegen die nächste Stufe, nicht gegen ein
  // fernes Endziel: sichtbar ist, was als Nächstes erreichbar ist.
  const goal = step?.at ?? b.current_volume;
  const pct = Math.min(100, Math.round((b.current_volume / (goal || 1)) * 100));
  const sealed = b.status === "SEALED_BIDDING";

  return (
    <div className={cn(CARD, "flex flex-col p-5 transition-shadow hover:shadow-cardhover")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-slate-900">
            {b.material_label ?? b.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {b.region}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={badge(sealed ? "navy" : "gold", true)}>
            {sealed ? (
              <><Gavel className="h-3 w-3" /> Sealed-Bid</>
            ) : (
              <><Layers className="h-3 w-3" /> Sammelphase</>
            )}
          </span>
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? "Aus Merkliste entfernen" : "Bündel speichern"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md border transition-colors",
              saved
                ? "border-brand bg-brand/10 text-brand"
                : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Menge und aktuell erreichte Stufe. Der Prozentwert ist die
          garantierte Untergrenze, nicht der zu erwartende Endpreis. */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="text-slate-500">
            {chf(b.current_volume)} {b.unit}
            {step && (
              <span className="text-slate-400"> / {chf(step.at)} bis Stufe {step.tier}</span>
            )}
          </span>
          <span className="font-semibold text-brand">
            mind. {b.current_discount_pct} %
            <span className="ml-1 font-normal text-slate-400">Stufe {b.current_tier}</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        {step && (
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-brand" />
            Noch <b className="text-slate-800">{chf(step.at - b.current_volume)} {b.unit}</b> bis
            mind. {step.discount} %.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Users className="h-3.5 w-3.5" />
          {b.participant_count} {b.participant_count === 1 ? "Firma" : "Firmen"} dabei
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold",
            cd.urgent ? "text-rose-600" : "text-slate-600",
          )}
        >
          {cd.urgent ? <Flame className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          schliesst in {cd.text}
        </span>
      </div>

      {b.participant_count < b.min_participants_for_bidding && (
        <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-slate-400">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Ausschreibung startet ab {b.min_participants_for_bidding} Firmen — so
          kann kein Lieferant aus dem Bündel auf einzelne Bauunternehmen
          zurückrechnen. Kommt es nicht zustande, wird es ohne Verpflichtung
          aufgelöst.
        </p>
      )}

      {myVolume !== null ? (
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between rounded-md border border-brand/30 bg-brand/[0.05] px-3 py-2">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-800">
              <Check className="h-3.5 w-3.5 text-brand" />
              Du bist mit {chf(myVolume)} {b.unit} dabei
            </span>
            <button
              type="button"
              onClick={onWithdraw}
              disabled={busy}
              className="text-[11.5px] font-semibold text-slate-400 transition-colors hover:text-rose-600 disabled:opacity-50"
            >
              {busy ? "…" : "zurückziehen"}
            </button>
          </div>
          <Link
            href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
            className="mt-1.5 block text-center text-[12px] font-semibold text-brand hover:underline"
          >
            Menge erhöhen
          </Link>
        </div>
      ) : (
        <Link
          href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 self-stretch rounded-md bg-brand px-4 py-2.5 pt-4 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
        >
          Bedarf melden &amp; beitreten <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function OpenPools() {
  const supabase = useSupabaseBrowser();
  const [region, setRegion] = useState("Alle");
  const [phase, setPhase] = useState<"all" | "OPEN" | "SEALED_BIDDING">("all");
  const [onlyMine, setOnlyMine] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { has, toggle } = useSavedPools();
  const { bundles, mine, loading, error, reload } = useBundles();

  const myVolumes = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of mine) m.set(p.bundle_id, Number(p.requested_volume));
    return m;
  }, [mine]);

  const list = useMemo(
    () =>
      bundles.filter(
        (b) =>
          (region === "Alle" || b.region === region) &&
          (phase === "all" || b.status === phase) &&
          (!onlyMine || myVolumes.has(b.id)),
      ),
    [bundles, region, phase, onlyMine, myVolumes],
  );

  async function withdraw(b: Bundle) {
    if (!confirm(`Teilnahme an „${b.material_label ?? b.title}" zurückziehen?`)) return;
    setBusy(b.id);
    await withdrawDemand(supabase, b.id);
    setBusy(null);
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {(["all", "OPEN", "SEALED_BIDDING"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPhase(k)}
              className={cn(
                "rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                phase === k ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {k === "all" ? "Alle Phasen" : k === "OPEN" ? "Sammelphase" : "Sealed-Bid"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyMine((v) => !v)}
            className={cn(
              "rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors",
              onlyMine ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-900",
            )}
          >
            Meine
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pools/saved"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Bookmark className="h-3.5 w-3.5" /> Merkliste
          </Link>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r === "Alle" ? "Alle Regionen" : r}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-800">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Bündel konnten nicht geladen werden. Falls die Migration
          <code className="mx-1 rounded bg-amber-100 px-1">16_real_bundles.sql</code>
          noch nicht eingespielt ist, hol das im Supabase-SQL-Editor nach.
        </p>
      )}

      {loading ? (
        <div className={cn(CARD, "grid place-items-center py-20 text-slate-400")}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className={cn(CARD, "px-6 py-14 text-center")}>
          <Layers className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-[15px] font-semibold text-slate-800">
            {bundles.length === 0
              ? "Noch läuft kein Bündel"
              : "Keine Bündel in dieser Auswahl"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500">
            {bundles.length === 0
              ? "Bündel entstehen aus gemeldetem Bedarf. Meldest du deinen, ist das erste da — und andere mit demselben Material in derselben Region kommen dazu."
              : "Andere Region oder Phase wählen."}
          </p>
          {bundles.length === 0 && (
            <Link
              href="/beschaffung"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              Bedarf melden <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((b) => (
            <PoolCard
              key={b.id}
              b={b}
              myVolume={myVolumes.get(b.id) ?? null}
              saved={has(b.id)}
              onToggleSave={() => toggle(b.id)}
              onWithdraw={() => withdraw(b)}
              busy={busy === b.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
