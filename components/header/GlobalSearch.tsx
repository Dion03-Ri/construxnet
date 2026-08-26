"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Building2, Package, LineChart, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; sub: string; href: string; icon: LucideIcon };

const FIRMEN: Item[] = [
  { label: "KIBAG Baustoffe", sub: "Baustoffwerk · Zürich", href: "/network", icon: Building2 },
  { label: "Vigier Beton Mittelland", sub: "Baustoffwerk · Bern", href: "/network", icon: Building2 },
  { label: "Gebr. Meier Hochbau AG", sub: "Bauunternehmen · Bern", href: "/network", icon: Building2 },
  { label: "Rhomberg Bau AG", sub: "Bauunternehmen · Luzern", href: "/network", icon: Building2 },
  { label: "Toggenburger Kies AG", sub: "Baustoffwerk · Wil", href: "/network", icon: Building2 },
];

const POOLS: Item[] = [
  { label: "Beton C25/30 · Raum Zürich", sub: "Smart Pool · Tier 2", href: "/pools", icon: Package },
  { label: "Armierungsstahl B500B · Bern", sub: "Smart Pool · Sammelphase", href: "/pools", icon: Package },
  { label: "Koffer-/Wandkies 0/45 · NWCH", sub: "Smart Pool · Sealed-Bid", href: "/pools", icon: Package },
];

const MATERIALIEN: Item[] = [
  { label: "Beton C25/30", sub: "KBOB-Index · CHF 156/m³", href: "/kbob", icon: LineChart },
  { label: "Bewehrungsstahl B500B", sub: "KBOB-Index · CHF 1'120/t", href: "/kbob", icon: LineChart },
  { label: "Koffer-/Wandkies 0/45", sub: "KBOB-Index · CHF 39/t", href: "/kbob", icon: LineChart },
];

function match(items: Item[], q: string) {
  const s = q.toLowerCase();
  return items.filter((i) => i.label.toLowerCase().includes(s) || i.sub.toLowerCase().includes(s)).slice(0, 4);
}

export default function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);

  const groups = useMemo(
    () =>
      [
        { key: "Firmen", items: match(FIRMEN, q) },
        { key: "Smart Pools", items: match(POOLS, q) },
        { key: "Materialien (KBOB)", items: match(MATERIALIEN, q) },
      ].filter((g) => g.items.length > 0),
    [q],
  );

  const show = focus && q.trim().length > 0;
  const empty = show && groups.length === 0;

  function go(href: string) {
    setQ("");
    setFocus(false);
    router.push(href);
  }

  return (
    <div className="relative hidden w-full max-w-xs md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        placeholder="Firmen, Pools, Materialien …"
        className="w-full rounded-full border border-slate-200 bg-slate-100/70 py-2 pl-9 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-brand/50 focus:bg-white"
      />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-cardhover backdrop-blur-xl"
          >
            {empty ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                Keine Treffer für „{q}“.
              </div>
            ) : (
              groups.map((g) => (
                <div key={g.key} className="border-b border-slate-100 last:border-0">
                  <div className="px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {g.key}
                  </div>
                  <ul className="pb-1.5">
                    {g.items.map((i) => (
                      <li key={i.label}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(i.href)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <i.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium text-slate-800">{i.label}</span>
                            <span className="block truncate text-[11px] text-slate-400">{i.sub}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
