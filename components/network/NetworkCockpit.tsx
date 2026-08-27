"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Megaphone,
  ArrowRight,
  UserPlus,
  Layers,
  BadgeCheck,
  MapPin,
  TrendingDown,
  Boxes,
  Users,
  Package,
  Sparkles,
  Check,
  Clock,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import SupplierMap from "@/components/map/SupplierMap";
import { OPEN_POOLS } from "@/data/pools";
import { DEMO_ACTIVITY, DEMO_GROUPS, DEMO_PARTNERS, type DemoPartner } from "@/data/cockpit";
import type { Company } from "@/lib/company";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk / Lieferant",
  ADMIN: "Administrator",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** wandelt **fett** in <strong> um */
function boldify(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

type Suggestion = {
  id: string;
  company_name: string;
  role: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
  logo_url: string | null;
};

export default function NetworkCockpit({ company }: { company: Company }) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();
  const isSupplier = company.role === "SUPPLIER";

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ connections: 0, requests: 0 });
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    // Verbindungen des eigenen Unternehmens
    const relatedIds = new Set<string>();
    let requests = 0;
    let connections = 0;
    const { data: conns } = await supabase
      .from("connections")
      .select("company_id_a, company_id_b, status, requested_by")
      .or(`company_id_a.eq.${company.id},company_id_b.eq.${company.id}`);
    for (const c of (conns ?? []) as { company_id_a: string; company_id_b: string; status: string; requested_by: string | null }[]) {
      const other = c.company_id_a === company.id ? c.company_id_b : c.company_id_a;
      relatedIds.add(other);
      if (c.status === "CONNECTED") connections++;
      else if (c.status === "PENDING" && c.requested_by !== company.id) requests++;
    }
    setConnectedIds(relatedIds);
    setStats({ connections, requests });

    // Vorschläge: Firmen, die nicht ich selbst und (noch) nicht verbunden sind.
    const { data: comps } = await supabase
      .from("companies")
      .select("id, company_name, role, city, canton, verified, logo_url")
      .neq("role", "ADMIN")
      .order("verified", { ascending: false })
      .limit(30);
    const list = ((comps ?? []) as Suggestion[]).filter((c) => c.id !== company.id && !relatedIds.has(c.id));
    // gleiche Region zuerst
    list.sort((a, b) => Number(b.canton === company.canton) - Number(a.canton === company.canton));
    setSuggestions(list.slice(0, 4));
    setLoaded(true);
  }, [supabase, company.id, company.canton]);

  useEffect(() => {
    if (isSignedIn && userId) load();
    else setLoaded(true);
  }, [isSignedIn, userId, load]);

  async function connect(id: string) {
    setPendingIds((p) => new Set(p).add(id));
    await supabase.from("connections").insert({
      company_id_a: company.id,
      company_id_b: id,
      requested_by: company.id,
      status: "PENDING",
    });
  }

  function reasonFor(s: Suggestion) {
    const sameRegion = s.canton && s.canton === company.canton;
    if (s.role === "SUPPLIER")
      return `Möglicher Lieferant${sameRegion ? " in deiner Region" : s.canton ? ` · ${s.canton}` : ""} — für deinen Materialbedarf.`;
    return `Möglicher Bündel-Partner${sameRegion ? " in deiner Region" : ""} — gemeinsam höhere Rabattstufe.`;
  }

  const useDemo = loaded && suggestions.length < 2;
  const topPools = useMemo(() => [...OPEN_POOLS].sort((a, b) => b.disc - a.disc).slice(0, 3), []);

  return (
    <div className="space-y-5">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-navy-950 to-navy-800 text-white shadow-card">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="relative flex flex-col gap-6 px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
              <Layers className="h-3.5 w-3.5" /> Vernetzen fürs Beschaffen
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-[28px]">
              Verbinde dich mit der Branche —{" "}
              <span className="text-brand">und beschaffe gemeinsam günstiger.</span>
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/60">
              Finde Firmen mit demselben Materialbedarf und passende Lieferanten in deiner Region.
              Aus jeder Verbindung wird ein Bündel — und aus dem Bündel ein besserer Preis.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/beschaffung" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500">
                <Megaphone className="h-4 w-4" /> Materialbedarf melden
              </Link>
              <Link href="/network/discover" className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/5">
                Passende Partner finden <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="flex gap-6 lg:pb-1">
            <div><div className="text-2xl font-bold">{stats.connections}</div><div className="text-[11px] text-white/50">Verbindungen</div></div>
            <div className="border-l border-white/12 pl-6"><div className="text-2xl font-bold text-brand">{OPEN_POOLS.length}</div><div className="text-[11px] text-white/50">offene Bündel</div></div>
            <div className="border-l border-white/12 pl-6"><div className="text-2xl font-bold">−13.8%</div><div className="text-[11px] text-white/50">Ø ggü. KBOB</div></div>
          </div>
        </div>
      </section>

      {/* 3-Spalten */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[290px_minmax(0,1fr)_320px]">
        {/* LEFT: Beschaffungsprofil */}
        <aside className="space-y-4">
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="h-14 bg-gradient-to-r from-brand to-navy-700" />
            <div className="px-4 pb-4">
              <Link href={`/company/${company.id}`} className="relative z-10 -mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-navy-800 text-lg font-bold text-white">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
                ) : initials(company.company_name)}
              </Link>
              <div className="mt-2.5 flex items-center gap-1.5">
                <Link href={`/company/${company.id}`} className="truncate font-semibold text-slate-900 hover:text-brand">{company.company_name}</Link>
                {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
              </div>
              <p className="text-[12px] text-slate-500">
                {ROLE_LABEL[company.role] ?? company.role}{company.city ? ` · ${company.city}` : ""}
              </p>

              {!isSupplier && (
                <>
                  <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Netzwerk-Abdeckung</div>
                  <p className="mt-1 text-[12px] text-slate-600"><b>{stats.connections >= 4 ? "4 von 6" : `${Math.min(stats.connections, 6)} von 6`}</b> Materialien in {company.canton ?? "deiner Region"} durch dein Netz abgedeckt</p>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(15, (Math.min(stats.connections, 6) / 6) * 100))}%` }} />
                  </div>
                </>
              )}

              <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                {[
                  { icon: Users, label: "Verbindungen", value: stats.connections, href: "/network/discover" },
                  { icon: Clock, label: "Offene Anfragen", value: stats.requests, href: "/network/requests" },
                  { icon: Package, label: "Gespeicherte Pools", value: null, href: "/pools/saved" },
                ].map((l) => (
                  <Link key={l.label} href={l.href} className="flex items-center justify-between py-2.5 text-[13px] text-slate-600 transition-colors hover:text-brand">
                    <span className="inline-flex items-center gap-2"><l.icon className="h-4 w-4 text-slate-400" /> {l.label}</span>
                    {l.value !== null ? <span className="font-semibold text-slate-900">{l.value}</span> : <ArrowRight className="h-3.5 w-3.5 text-slate-300" />}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <div className="min-w-0 space-y-5">
          {/* Passende Partner */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-900">Passende Partner <span className="text-[13px] font-normal text-slate-500">· nach Material &amp; Region</span></h2>
              <Link href="/network/discover" className="text-[13px] font-medium text-brand hover:underline">Alle ansehen →</Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {useDemo
                ? DEMO_PARTNERS.slice(0, 2).map((p) => <DemoPartnerCard key={p.id} p={p} />)
                : suggestions.slice(0, 4).map((s) => (
                    <div key={s.id} className={cn(CARD, "p-4")}>
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] font-bold", s.role === "SUPPLIER" ? "bg-navy-800 text-white" : "bg-brand/15 text-brand")}>
                          {s.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logo_url} alt={s.company_name} className="h-full w-full object-cover" />
                          ) : initials(s.company_name)}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/company/${s.id}`} className="flex items-center gap-1 truncate text-[14px] font-semibold text-slate-900 hover:text-brand">
                            {s.company_name}{s.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
                          </Link>
                          <div className="text-[11px] text-slate-400">{ROLE_LABEL[s.role] ?? s.role}{s.city ? ` · ${s.city}` : ""}</div>
                        </div>
                      </div>
                      <p className="mt-2.5 flex items-start gap-1.5 rounded-md bg-slate-50 px-2.5 py-2 text-[12px] leading-relaxed text-slate-600">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> {reasonFor(s)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => connect(s.id)}
                          disabled={pendingIds.has(s.id)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:opacity-60"
                        >
                          {pendingIds.has(s.id) ? <><Check className="h-4 w-4" /> Angefragt</> : <><UserPlus className="h-4 w-4" /> Vernetzen</>}
                        </button>
                        <Link href={`/beschaffung`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                          <Boxes className="h-4 w-4" /> Bündel vorschlagen
                        </Link>
                      </div>
                    </div>
                  ))}
            </div>
            {useDemo && (
              <p className="mt-2 text-[11px] text-slate-400">Beispiel-Vorschläge — sobald mehr Firmen registriert sind, erscheinen hier echte Matches aus deiner Region.</p>
            )}
          </div>

          {/* Aktivität */}
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="px-4 py-3.5 text-[16px] font-bold text-slate-900">Aktivität aus deinem Netzwerk</div>
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {DEMO_ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", a.kind === "supplier" ? "bg-navy-800 text-white" : "bg-brand/15 text-brand")}>
                    {a.kind === "bundle" ? <Layers className="h-5 w-5" /> : a.kind === "offer" ? <TrendingDown className="h-5 w-5" /> : a.kind === "supplier" ? <Boxes className="h-4 w-4" /> : <UserPlus className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-slate-700">{boldify(a.text)}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{a.meta}</div>
                  </div>
                  <Link href={a.href} className={cn("shrink-0 rounded-md px-3.5 py-2 text-[13px] font-semibold transition-colors", a.kind === "bundle" ? "bg-brand text-navy-900 hover:bg-brand-500" : "border border-slate-200 text-slate-600 hover:bg-slate-50")}>
                    {a.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="space-y-4">
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="text-[14px] font-bold text-slate-900">Bündel-Chancen</span>
              <span className="text-[11px] text-slate-400">deine Region</span>
            </div>
            <div className="py-1">
              {topPools.map((p) => {
                const pct = Math.min(100, Math.round((p.vol / p.target) * 100));
                return (
                  <Link key={p.id} href={`/beschaffung?material=${encodeURIComponent(p.matKey)}`} className="block px-4 py-2.5 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-slate-900">{p.material}</span>
                      <span className={badge("gold", true)}>−{p.disc}%</span>
                    </div>
                    <div className="mb-1.5 mt-0.5 text-[11px] text-slate-400">{p.region} · {p.vol} {p.unit}</div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
                  </Link>
                );
              })}
            </div>
            <Link href="/pools" className="block border-t border-slate-100 py-2.5 text-center text-[13px] font-semibold text-brand transition-colors hover:bg-slate-50">Alle Bündel →</Link>
          </div>

          <div className={cn(CARD, "p-4")}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">KBOB-Markt</span>
              <span className="text-[11px] text-slate-400">Index</span>
            </div>
            <div className="mt-1.5 text-[12px] text-slate-500">Beton C25/30 · Referenzpreis</div>
            <div className="text-2xl font-bold text-slate-900">CHF 156.–<span className="text-[13px] font-normal text-slate-400"> / m³</span></div>
            <Link href="/kbob" className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline">Zum KBOB-Chart <ArrowRight className="h-3 w-3" /></Link>
          </div>

          <div className={cn(CARD, "p-4")}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Beschaffungs-Gruppen</div>
            <div className="mt-2 space-y-2.5">
              {DEMO_GROUPS.map((g) => (
                <div key={g.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-slate-900">{g.name}</div>
                    <div className="text-[11px] text-slate-400">{g.members} Mitglieder</div>
                  </div>
                  <button type="button" className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand">
                    Beitreten
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Karte */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-slate-900">Lieferanten-Netz Schweiz</h2>
          <Link href="/map" className="text-[13px] font-medium text-brand hover:underline">Geo-Dashboard →</Link>
        </div>
        <SupplierMap />
      </div>
    </div>
  );
}

function DemoPartnerCard({ p }: { p: DemoPartner }) {
  return (
    <div className={cn(CARD, "p-4")}>
      <div className="flex items-center gap-3">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold", p.role === "SUPPLIER" ? "bg-navy-800 text-white" : "bg-brand/15 text-brand")}>
          {initials(p.name)}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1 truncate text-[14px] font-semibold text-slate-900">
            {p.name}{p.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
          </div>
          <div className="text-[11px] text-slate-400">{p.role === "SUPPLIER" ? "Baustoffwerk" : "Bauunternehmen"} · {p.city}</div>
        </div>
      </div>
      <p className={cn("mt-2.5 flex items-start gap-1.5 rounded-md px-2.5 py-2 text-[12px] leading-relaxed", p.tone === "gold" ? "bg-brand/[0.06] text-slate-600" : "bg-accent/[0.06] text-slate-600")}>
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> {boldify(p.reason)}
      </p>
      <div className="mt-3 flex gap-2">
        <Link href="/network/discover" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand-500">
          <UserPlus className="h-4 w-4" /> Vernetzen
        </Link>
        <Link href="/beschaffung" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          <Boxes className="h-4 w-4" /> Bündel vorschlagen
        </Link>
      </div>
    </div>
  );
}
