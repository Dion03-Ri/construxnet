"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Users, Layers, Gavel, ArrowRight, Flame } from "lucide-react";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Pool = {
  id: string;
  material: string;
  region: string;
  unit: string;
  vol: number;
  target: number;
  tier: number;
  disc: number;
  participants: number;
  phase: "OPEN" | "SEALED";
  endsInH: number; // Stunden bis Deadline
};

const POOLS: Pool[] = [
  { id: "p1", material: "Beton C25/30", region: "Zürich", unit: "m³", vol: 230, target: 300, tier: 2, disc: 12, participants: 8, phase: "OPEN", endsInH: 53 },
  { id: "p2", material: "Bewehrungsstahl B500B", region: "Bern", unit: "t", vol: 48, target: 60, tier: 2, disc: 12, participants: 5, phase: "OPEN", endsInH: 212 },
  { id: "p3", material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", unit: "t", vol: 320, target: 301, tier: 3, disc: 20, participants: 11, phase: "SEALED", endsInH: 19 },
  { id: "p4", material: "Beton C30/37", region: "Innerschweiz", unit: "m³", vol: 90, target: 250, tier: 1, disc: 5, participants: 3, phase: "OPEN", endsInH: 288 },
  { id: "p5", material: "Transportbeton C25/30", region: "Westschweiz", unit: "m³", vol: 140, target: 200, tier: 2, disc: 12, participants: 6, phase: "OPEN", endsInH: 7 },
  { id: "p6", material: "Dämmung EPS 034", region: "Ostschweiz", unit: "m²", vol: 1800, target: 3000, tier: 2, disc: 12, participants: 4, phase: "OPEN", endsInH: 121 },
];

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

function PoolCard({ p }: { p: Pool }) {
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
        <span className={badge(p.phase === "SEALED" ? "navy" : "gold", true)}>
          {p.phase === "SEALED" ? <><Gavel className="h-3 w-3" /> Sealed-Bid</> : <><Layers className="h-3 w-3" /> Sammelphase</>}
        </span>
      </div>

      {/* Fortschritt */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="text-slate-500">{p.vol} / {p.target} {p.unit}</span>
          <span className="font-semibold text-brand">−{p.disc}% (Tier {p.tier})</span>
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

      <Link
        href="/beschaffung"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
      >
        Bedarf melden &amp; beitreten <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function OpenPools() {
  const [region, setRegion] = useState("Alle");
  const [phase, setPhase] = useState<"all" | "OPEN" | "SEALED">("all");

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
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
        >
          {REGIONS.map((r) => <option key={r} value={r}>{r === "Alle" ? "Alle Regionen" : r}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className={cn(CARD, "border-dashed py-12 text-center text-sm text-slate-400")}>
          Keine offenen Bündel in dieser Auswahl.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => <PoolCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
