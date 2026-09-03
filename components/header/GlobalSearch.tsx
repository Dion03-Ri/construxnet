"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Building2, Package, type LucideIcon } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useCustomMaterials } from "@/lib/customMaterials";
import { matchesMaterial } from "@/data/procurement";
import { cn } from "@/lib/utils";

type Item = { label: string; sub: string; href: string; icon: LucideIcon };

type Firm = { id: string; company_name: string; role: string; city: string | null };

export default function GlobalSearch() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [firms, setFirms] = useState<Firm[]>([]);
  const { catalog } = useCustomMaterials();

  // Firmen kommen aus dem Verzeichnis, nicht aus einer Liste im Code.
  // Gesucht wird erst ab drei Zeichen — davor trifft ohnehin alles.
  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 3) {
      setFirms([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, company_name, role, city")
        .ilike("company_name", `%${needle}%`)
        .limit(4);
      setFirms((data ?? []) as Firm[]);
    }, 200);
    return () => clearTimeout(t);
  }, [q, supabase]);

  const groups = useMemo(() => {
    const firmItems: Item[] = firms.map((f) => ({
      label: f.company_name,
      sub: `${f.role === "SUPPLIER" ? "Baustoffwerk" : "Bauunternehmen"}${f.city ? ` · ${f.city}` : ""}`,
      href: `/company/${f.id}`,
      icon: Building2,
    }));

    const materialItems: Item[] = q.trim().length >= 2
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
      { key: "Firmen", items: firmItems },
      { key: "Materialien", items: materialItems },
    ].filter((g) => g.items.length > 0);
  }, [firms, catalog, q]);

  const show = focus && q.trim().length > 0;
  const empty = show && groups.length === 0;

  function go(href: string) {
    setQ("");
    setFocus(false);
    router.push(href);
  }

  return (
    <div className="relative hidden w-full max-w-xs md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        placeholder="Firmen oder Material suchen …"
        className="w-full rounded-md border border-white/15 bg-white/10 py-2 pl-9 pr-14 text-[13px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/30 focus:bg-white/15"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/50 lg:inline-flex">
        ⌘K
      </kbd>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-white/[0.08] bg-white/95 shadow-cardhover backdrop-blur-xl"
          >
            {empty ? (
              <div className="px-4 py-6 text-center text-sm text-white/40">
                Keine Treffer für „{q}“.
              </div>
            ) : (
              groups.map((g) => (
                <div key={g.key} className="border-b border-white/[0.06] last:border-0">
                  <div className="px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    {g.key}
                  </div>
                  <ul className="pb-1.5">
                    {g.items.map((i) => (
                      <li key={i.label}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(i.href)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-white/[0.05]"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/55">
                            <i.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium text-white/90">{i.label}</span>
                            <span className="block truncate text-[11px] text-white/40">{i.sub}</span>
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
