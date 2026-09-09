"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Building2, Package, Layers, X, type LucideIcon } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useCustomMaterials } from "@/lib/customMaterials";
import { matchesMaterial } from "@/data/procurement";
import { cn } from "@/lib/utils";

type Item = { label: string; sub: string; href: string; icon: LucideIcon };
type Group = { key: string; items: Item[] };

type Firm = { id: string; company_name: string; role: string; city: string | null };
type Pool = {
  id: string;
  title: string;
  material_label: string | null;
  region: string;
  unit: string;
  current_volume: number;
  status: string;
};

/**
 * Was in eine Suchabfrage getippt wird, geht als Filter an PostgREST.
 * Komma und Klammer trennen dort die Bedingungen einer `or`-Abfrage, das
 * Prozentzeichen ist der Platzhalter von `ilike`. Ungefiltert waere ein
 * Komma im Firmennamen also keine Suche, sondern eine zweite Bedingung —
 * und ein einzelnes „%" gaebe das ganze Verzeichnis zurueck.
 */
function sauber(s: string) {
  return s.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
}

const STATUS_WORT: Record<string, string> = {
  OPEN: "sammelt",
  SEALED_BIDDING: "in der Ausschreibung",
};

/* ------------------------------------------------------------------ */
/*  Die Trefferliste                                                   */
/* ------------------------------------------------------------------ */
function Treffer({
  groups,
  aktiv,
  onPick,
  onHover,
  q,
}: {
  groups: Group[];
  aktiv: number;
  onPick: (href: string) => void;
  onHover: (i: number) => void;
  q: string;
}) {
  if (groups.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-white/[0.56]">
        Keine Treffer für „{q}“.
      </div>
    );
  }
  let lauf = -1;
  return (
    <>
      {groups.map((g) => (
        <div key={g.key} className="border-b border-white/[0.06] last:border-0">
          <div className="px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
            {g.key}
          </div>
          <ul className="pb-1.5">
            {g.items.map((i) => {
              lauf += 1;
              const idx = lauf;
              return (
                <li key={g.key + i.href + i.label}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => onHover(idx)}
                    onClick={() => onPick(i.href)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                      idx === aktiv ? "bg-white/[0.07]" : "hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/[0.72]">
                      <i.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-white/90">{i.label}</span>
                      <span className="block truncate text-[11px] text-white/[0.56]">{i.sub}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export default function GlobalSearch() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const { catalog } = useCustomMaterials();

  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [mobil, setMobil] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);

  const feld = useRef<HTMLInputElement>(null);
  const feldMobil = useRef<HTMLInputElement>(null);

  /* Die Vollbildsuche haengt am Dokument, nicht in der Kopfleiste: die
     ist `sticky` mit z-index und bildet damit einen eigenen Stapel — ein
     Kind darin kommt nie ueber die Fusszeile der Navigation, egal wie
     hoch sein z-index ist. */
  const [montiert, setMontiert] = useState(false);
  /* Auf Windows und Linux ist es Strg, nicht ⌘. Das Zeichen im Feld hat
     beides mit demselben Symbol angeschrieben. */
  const [mac, setMac] = useState(true);
  useEffect(() => {
    setMontiert(true);
    setMac(/mac|iphone|ipad/i.test(navigator.userAgent));
  }, []);

  // Firmen und Bündel kommen aus der Datenbank, nicht aus einer Liste im
  // Code. Gesucht wird erst ab drei Zeichen — davor trifft ohnehin alles.
  useEffect(() => {
    const nadel = sauber(q);
    if (nadel.length < 3) {
      setFirms([]);
      setPools([]);
      return;
    }
    const t = setTimeout(async () => {
      const [f, p] = await Promise.all([
        supabase
          .from("companies")
          .select("id, company_name, role, city")
          .ilike("company_name", `%${nadel}%`)
          .limit(4),
        supabase
          .from("bundles")
          .select("id, title, material_label, region, unit, current_volume, status")
          .in("status", ["OPEN", "SEALED_BIDDING"])
          .or(`title.ilike.%${nadel}%,material_label.ilike.%${nadel}%,region.ilike.%${nadel}%`)
          .limit(4),
      ]);
      setFirms((f.data ?? []) as Firm[]);
      setPools((p.data ?? []) as Pool[]);
    }, 200);
    return () => clearTimeout(t);
  }, [q, supabase]);

  const groups: Group[] = useMemo(() => {
    const firmen: Item[] = firms.map((f) => ({
      label: f.company_name,
      sub: `${f.role === "SUPPLIER" ? "Baustoffwerk" : "Bauunternehmen"}${f.city ? ` · ${f.city}` : ""}`,
      href: `/company/${f.id}`,
      icon: Building2,
    }));

    const buendel: Item[] = pools.map((b) => ({
      label: b.material_label ?? b.title,
      sub: `${b.region} · ${b.current_volume.toLocaleString("de-CH")} ${b.unit} · ${STATUS_WORT[b.status] ?? "läuft"}`,
      href: `/pools#b-${b.id}`,
      icon: Layers,
    }));

    const materialien: Item[] =
      sauber(q).length >= 2
        ? catalog
            .filter((m) => matchesMaterial(m, q))
            .slice(0, 4)
            .map((m) => ({
              label: m.label,
              sub: `${m.id} · ${m.category}`,
              href: `/beschaffung?material=${encodeURIComponent(m.id)}`,
              icon: Package,
            }))
        : [];

    return [
      { key: "Firmen", items: firmen },
      { key: "Bündel", items: buendel },
      { key: "Materialien", items: materialien },
    ].filter((g) => g.items.length > 0);
  }, [firms, pools, catalog, q]);

  const flach = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Neue Eingabe heisst neue Liste — die Markierung faengt wieder oben an.
  useEffect(() => setAktiv(0), [q]);

  const go = useCallback(
    (href: string) => {
      setQ("");
      setFocus(false);
      setMobil(false);
      router.push(href);
    },
    [router],
  );

  /* ⌘K / Strg+K — das Zeichen stand schon im Feld, die Taste tat nichts. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const gross = window.matchMedia("(min-width: 768px)").matches;
        if (gross) {
          feld.current?.focus();
          feld.current?.select();
        } else {
          setMobil(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Auf dem Handy erscheint das Feld erst auf Knopfdruck — dann gehoert
     die Schreibmarke auch hinein. */
  useEffect(() => {
    if (mobil) feldMobil.current?.focus();
  }, [mobil]);

  function tasten(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (q) setQ("");
      else {
        setMobil(false);
        (e.target as HTMLInputElement).blur();
      }
      return;
    }
    if (flach.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktiv((i) => (i + 1) % flach.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((i) => (i - 1 + flach.length) % flach.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ziel = flach[aktiv] ?? flach[0];
      if (ziel) go(ziel.href);
    }
  }

  const zeigen = focus && q.trim().length > 0;

  return (
    <>
      {/* ---------------- Grosser Bildschirm: Feld in der Leiste ---------------- */}
      <div className="relative hidden w-full max-w-xs md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.56]" />
        <input
          ref={feld}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          onKeyDown={tasten}
          placeholder="Firmen, Bündel oder Material suchen …"
          aria-label="Suche"
          className="w-full rounded-md border border-white/15 bg-white/10 py-2 pl-9 pr-14 text-[13px] text-white placeholder:text-white/[0.56] outline-none transition-colors focus:border-white/30 focus:bg-white/15"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/[0.56] lg:inline-flex">
          {mac ? "⌘K" : "Strg K"}
        </kbd>

        <AnimatePresence>
          {zeigen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-[20px] border border-white/[0.12] bg-[#16181a] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <Treffer groups={groups} aktiv={aktiv} onPick={go} onHover={setAktiv} q={q} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------- Handy: Knopf, der das Feld aufzieht ----------------
          Vorher gab es auf dem Handy ueberhaupt keine Suche — das Feld war
          schlicht ausgeblendet. */}
      <button
        type="button"
        onClick={() => setMobil(true)}
        aria-label="Suche öffnen"
        className="ml-auto grid h-9 w-9 place-items-center rounded-md text-white/[0.72] transition-colors hover:bg-white/[0.07] hover:text-white md:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      {montiert &&
        createPortal(
          <AnimatePresence>
            {mobil && (
              <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-navy-900/95 backdrop-blur md:hidden"
          >
            <div className="flex h-14 items-center gap-2 border-b border-white/[0.12] px-4">
              <Search className="h-4 w-4 shrink-0 text-white/[0.56]" />
              <input
                ref={feldMobil}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={tasten}
                placeholder="Firmen, Bündel oder Material suchen …"
                aria-label="Suche"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/[0.56] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setMobil(false);
                }}
                aria-label="Suche schliessen"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-white/[0.72] transition-colors hover:bg-white/[0.07]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
              {q.trim().length > 0 ? (
                <Treffer groups={groups} aktiv={aktiv} onPick={go} onHover={setAktiv} q={q} />
              ) : (
                <p className="px-4 py-8 text-center text-sm text-white/[0.56]">
                  Firmenname, Material oder Region eingeben.
                </p>
              )}
            </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
