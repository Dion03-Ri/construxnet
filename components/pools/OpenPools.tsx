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
} from "lucide-react";
import {
  useBundles,
  nextStep,
  withdrawDemand,
  type Bundle,
} from "@/lib/bundles";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useSavedPools } from "@/lib/useSavedPools";
import { INPUT_DARK } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Die offenen Bündel — als Liste, nicht als Kachelwand.
 *
 * Vorher stand jedes Bündel in einer eigenen Karte mit Rand und Schatten,
 * drei nebeneinander. Bei fünfzehn offenen Bündeln ergibt das eine Wand aus
 * Kästchen, in der sich nichts vergleichen lässt — und genau vergleichen
 * will man hier: welches Bündel ist wie voll, welches schliesst zuerst, wo
 * ist der Vorteil am grössten.
 *
 * Deshalb eine Tabelle: jede Zeile ein Bündel, getrennt nur durch eine
 * Haarlinie, die Zahlen rechts in Tabellenziffern untereinander. So liest
 * man eine Spalte von oben nach unten, statt fünfzehn Kästchen einzeln
 * abzugehen. Das ist die Sprache von Handelsoberflächen — und ein
 * Materialbündel mit Frist und Preisvorteil ist genau das.
 */

const REGIONS = [
  "Alle",
  "Zürich",
  "Bern",
  "Nordwestschweiz",
  "Innerschweiz",
  "Westschweiz",
  "Ostschweiz",
];

/**
 * Ein Raster für alle Zeilen und den Spaltenkopf.
 *
 * Feste Breiten statt `1fr`: nur so stehen Balken, Prozentwert und Handlung
 * in jeder Zeile an derselben Stelle. Genau das unterscheidet eine Tabelle,
 * die man von oben nach unten liest, von einer Liste, die man Zeile für
 * Zeile abgeht.
 */
const ROW_GRID =
  "grid grid-cols-1 gap-x-8 lg:grid-cols-[minmax(0,1fr)_300px_84px_148px_16px] lg:items-center";

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

function PoolRow({
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
    /* Die Kennung macht die Zeile anspringbar: die Suche in der Kopfleiste
       verweist auf /pools#b-<id>. `scroll-mt` haelt die Zeile unter der
       klebenden Leiste, sonst landet sie darunter. */
    <li id={`b-${b.id}`} className="scroll-mt-20 border-t border-white/[0.12] transition-colors hover:bg-white/[0.02]">
      <div className={cn(ROW_GRID, "gap-y-5 py-6")}>
        {/* ---------- Was und wo ---------- */}
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <h3 className="min-w-0 flex-1 truncate text-[16px] font-bold tracking-tight text-white">
              {b.material_label ?? b.title}
            </h3>
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={saved ? "Aus Merkliste entfernen" : "Bündel speichern"}
              className={cn(
                "mt-0.5 shrink-0 transition-colors lg:hidden",
                saved ? "text-brand" : "text-white/[0.5] hover:text-white/[0.72]",
              )}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>

          {/* Phase, Ort, Firmen, Frist in einer Zeile. Die Phase steht als
              Wort da, nicht als gefülltes Etikett — ein Kästchen pro Zeile
              ergäbe wieder eine Kästchenwand. */}
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-white/[0.56]">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]",
                sealed ? "text-white/[0.56]" : "text-brand",
              )}
            >
              {sealed ? <Gavel className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
              {sealed ? "Sealed-Bid" : "Sammelphase"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {b.region}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {b.participant_count} {b.participant_count === 1 ? "Firma" : "Firmen"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                cd.urgent ? "text-rose-300" : "text-white/[0.56]",
              )}
            >
              {cd.urgent ? <Flame className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              schliesst in {cd.text}
            </span>
          </p>

          {b.participant_count < b.min_participants_for_bidding && (
            <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-white/[0.5]">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              Ausschreibung startet ab {b.min_participants_for_bidding} Firmen — so kann kein
              Lieferant aus dem Bündel auf einzelne Bauunternehmen zurückrechnen.
            </p>
          )}
        </div>

        {/* ---------- Wie voll ---------- */}
        <div>
          <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="tabular-nums text-white/[0.72]">
              {chf(b.current_volume)} {b.unit}
            </span>
            {step && (
              <span className="tabular-nums text-white/[0.5]">
                Stufe {step.tier} bei {chf(step.at)} {b.unit}
              </span>
            )}
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.10]">
            <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
          {step && (
            <p className="mt-2 text-[11.5px] text-white/[0.56]">
              Noch{" "}
              <b className="font-semibold tabular-nums text-white/[0.72]">
                {chf(step.at - b.current_volume)} {b.unit}
              </b>{" "}
              bis mind. {step.discount} %.
            </p>
          )}
        </div>

        {/* ---------- Garantierter Vorteil ---------- */}
        <div className="lg:text-right">
          <div className="font-display text-[30px] font-bold leading-none tabular-nums text-brand">
            {b.current_discount_pct}
            <span className="text-[17px]"> %</span>
          </div>
          <div className="mt-1.5 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/[0.5]">
            Stufe {b.current_tier}
          </div>
        </div>

        {/* ---------- Handlung ---------- */}
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          {myVolume !== null ? (
            <div className="lg:text-right">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-semibold text-white/85">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                {chf(myVolume)} {b.unit} dabei
              </span>
              <div className="mt-1 flex items-center gap-3 text-[11.5px] lg:justify-end">
                <Link
                  href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
                  className="font-semibold text-brand hover:underline"
                >
                  erhöhen
                </Link>
                <button
                  type="button"
                  onClick={onWithdraw}
                  disabled={busy}
                  className="font-semibold text-white/[0.5] transition-colors hover:text-rose-300 disabled:opacity-50"
                >
                  {busy ? "…" : "zurückziehen"}
                </button>
              </div>
            </div>
          ) : (
            <Link
              href={`/beschaffung?material=${encodeURIComponent(b.material_id ?? "")}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-white transition-colors hover:text-brand"
            >
              Beitreten <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* ---------- Merken ---------- */}
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? "Aus Merkliste entfernen" : "Bündel speichern"}
          className={cn(
            "hidden self-start justify-self-end pt-1 transition-colors lg:block",
            saved ? "text-brand" : "text-white/[0.4] hover:text-white/[0.72]",
          )}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>
    </li>
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

  const FILTERS = [
    { key: "all" as const, label: "Alle Phasen" },
    { key: "OPEN" as const, label: "Sammelphase" },
    { key: "SEALED_BIDDING" as const, label: "Sealed-Bid" },
  ];

  return (
    <div>
      {/* ---------- Filter als Reiterzeile, nicht als Knopfleiste ----------
          Der aktive Filter trägt eine Goldkante unten. Ein gefülltes
          Kästchen in einem umrandeten Kästchen wären zwei Ränder für eine
          Auswahl aus vier Möglichkeiten. */}
      <div className="flex flex-col gap-4 border-b border-white/[0.12] sm:flex-row sm:items-end sm:justify-between">
        <div className="-mb-px flex gap-6 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setPhase(f.key);
                setOnlyMine(false);
              }}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13.5px] font-semibold transition-colors",
                phase === f.key && !onlyMine
                  ? "border-brand text-white"
                  : "border-transparent text-white/[0.56] hover:text-white",
              )}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyMine((v) => !v)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13.5px] font-semibold transition-colors",
              onlyMine ? "border-brand text-white" : "border-transparent text-white/[0.56] hover:text-white",
            )}
          >
            Meine
          </button>
        </div>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={cn(INPUT_DARK, "mb-3 w-full py-2 text-[13px] sm:w-auto")}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r === "Alle" ? "Alle Regionen" : r}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-5 flex items-start gap-2 border-l-2 border-brand pl-3 text-[12.5px] leading-relaxed text-brand">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            Bündel konnten nicht geladen werden. Falls die Migration
            <code className="mx-1">16_real_bundles.sql</code>
            noch nicht eingespielt ist, hol das im Supabase-SQL-Editor nach.
          </span>
        </p>
      )}

      {loading ? (
        <div className="grid place-items-center py-24 text-white/[0.56]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="border-t border-white/[0.12] py-20 text-center">
          <p className="text-[17px] font-bold tracking-tight text-white">
            {bundles.length === 0
              ? "Noch läuft kein Bündel"
              : "Keine Bündel in dieser Auswahl"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-white/[0.56]">
            {bundles.length === 0
              ? "Bündel entstehen aus gemeldetem Bedarf. Meldest du deinen, ist das erste da — und andere mit demselben Material in derselben Region kommen dazu."
              : "Andere Region oder Phase wählen."}
          </p>
          {bundles.length === 0 && (
            <Link
              href="/beschaffung"
              className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand hover:underline"
            >
              Bedarf melden <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Spaltenkopf — nur auf breiten Schirmen, sonst nimmt er Platz
              weg, den die Zeilen selbst schon beschriften. */}
          <div
            className={cn(
              ROW_GRID,
              "hidden pb-2.5 pt-7 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.4] lg:grid",
            )}
          >
            <span>Bündel</span>
            <span>Volumen bis zur nächsten Stufe</span>
            <span className="text-right">Vorteil</span>
            <span />
            <span />
          </div>

          <ul className="border-b border-white/[0.12]">
            {list.map((b) => (
              <PoolRow
                key={b.id}
                b={b}
                myVolume={myVolumes.get(b.id) ?? null}
                saved={has(b.id)}
                onToggleSave={() => toggle(b.id)}
                onWithdraw={() => withdraw(b)}
                busy={busy === b.id}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
