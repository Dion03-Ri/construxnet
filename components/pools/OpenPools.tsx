"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Users, Layers, Gavel, ArrowRight, Flame, Bookmark, Info } from "lucide-react";
import { OPEN_POOLS, type Pool } from "@/data/pools";
import { useSavedPools } from "@/lib/useSavedPools";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

const POOLS = OPEN_POOLS;

const REGIONS = ["Alle", "Zürich", "Bern", "Nordwestschweiz", "Innerschweiz", "Westschweiz", "Ostschweiz"];

function useCountdown(endsInH: number) {
  const [end] = useState(() => Date.now() + endsInH * 3600_000);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return { text: "—", urgent: false, mounted: false };
  const diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const text = d > 0 ? `${d} T ${h} Std` : h > 0 ? `${h} Std ${m} Min` : `${m} Min`;
  return { text, urgent: diff < 24 * 3600_000, mounted: true };
}

function PoolCard({ p, saved, onToggleSave }: { p: Pool; saved: boolean; onToggleSave: () => void }) {
  const pct = Math.min(100, Math.round((p.vol / p.target) * 100));
  const cd = useCountdown(p.endsInH);
  return (
    <div className={cn(CARD, "flex flex-col p-5 transition-shadow hover:shadow-cardhover")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-slate-900">{p.material}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {p.region}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={badge(p.phase === "SEALED" ? "navy" : "gold", true)}>
            {p.phase === "SEALED" ? <><Gavel className="h-3 w-3" /> Sealed-Bid</> : <><Layers className="h-3 w-3" /> Sammelphase</>}
          </span>
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? "Aus Merkliste entfernen" : "Pool speichern"}
            title={saved ? "Gespeichert" : "Pool speichern"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md border transition-colors",
              saved ? "border-brand bg-brand/10 text-brand" : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Fortschritt — der Wert ist die Garantie, nicht der Endpreis */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="text-slate-500">{p.vol} / {p.target} {p.unit}</span>
          <span className="font-semibold text-brand">
            mind. {p.disc} %
            <span className="ml-1 font-normal text-slate-400">Stufe {p.tier}</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Users className="h-3.5 w-3.5" /> {p.participants} Firmen dabei
        </span>
        <span className={cn("inline-flex items-center gap-1 font-semibold", cd.urgent ? "text-rose-600" : "text-slate-600")}>
          {cd.urgent ? <Flame className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          schliesst in {cd.text}
        </span>
      </div>

      {/* Zielvolumen noch nicht erreicht — sagen, was dann passiert */}
      {pct < 100 && (
        <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-slate-400">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Zielvolumen noch offen. Wird es bis zur Frist nicht erreicht, wird das Bündel
          aufgelöst — ohne Verpflichtung für dich.
        </p>
      )}

      <Link
        href={`/beschaffung?material=${encodeURIComponent(p.matKey)}`}
        className="mt-auto pt-4 inline-flex items-center justify-center gap-1.5 self-stretch rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
      >
        Bedarf melden &amp; beitreten <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function OpenPools() {
  const [region, setRegion] = useState("Alle");
  const [phase, setPhase] = useState<"all" | "OPEN" | "SEALED">("all");
  const { has, toggle } = useSavedPools();

  const list = useMemo(
    () => POOLS.filter((p) => (region === "Alle" || p.region === region) && (phase === "all" || p.phase === phase)),
    [region, phase],
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {(["all", "OPEN", "SEALED"] as const).map((k) => (
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
            {REGIONS.map((r) => <option key={r} value={r}>{r === "Alle" ? "Alle Regionen" : r}</option>)}
          </select>
        </div>
      </div>

      {/* Solange keine echten Bündel laufen, sind das Beispiele — das gehört dazugesagt. */}
      <p className="mb-3 text-[11.5px] text-slate-400">
        Beispiel-Bündel — sobald echte Bedarfe gemeldet sind, erscheinen hier die laufenden Pools.
      </p>

      {list.length === 0 ? (
        <div className={cn(CARD, "border-dashed py-12 text-center text-sm text-slate-400")}>
          Keine offenen Bündel in dieser Auswahl.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => <PoolCard key={p.id} p={p} saved={has(p.id)} onToggleSave={() => toggle(p.id)} />)}
        </div>
      )}
    </div>
  );
}
