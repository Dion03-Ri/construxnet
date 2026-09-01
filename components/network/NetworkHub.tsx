"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  BadgeCheck,
  Search,
  Loader2,
  UserPlus,
  Check,
  X,
  ChevronDown,
  Map as MapIcon,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Company = {
  id: string;
  company_name: string;
  uid_number: string;
  role: string;
  canton: string | null;
  city: string | null;
  verified: boolean;
  logo_url: string | null;
  bio: string | null;
};

type ConnState = {
  id: string;
  status: "PENDING" | "CONNECTED";
  direction: "outgoing" | "incoming";
};

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk",
};

const ROLE_FILTERS = [
  { key: "ALL", label: "Alle" },
  { key: "BUYER", label: "Bauunternehmen" },
  { key: "SUPPLIER", label: "Baustoffwerke" },
];

// Leaderboard „Meiste Deals" — aggregierte Beispielwerte (bis echte Deal-Daten
// vorliegen). Zeigt, mit welchen Firmen am meisten abgeschlossen wurde.
const TOP_DEALS = [
  { id: "d-kibag", name: "KIBAG Baustoffe", role: "SUPPLIER", deals: 34, volume: "CHF 2.1 Mio.", verified: true },
  { id: "d-vigier", name: "Vigier Beton Mittelland", role: "SUPPLIER", deals: 28, volume: "CHF 1.7 Mio.", verified: true },
  { id: "d-implenia", name: "Implenia", role: "BUYER", deals: 24, volume: "CHF 1.5 Mio.", verified: true },
  { id: "d-eberhard", name: "Eberhard Bau AG", role: "BUYER", deals: 19, volume: "CHF 1.2 Mio.", verified: false },
  { id: "d-jura", name: "Jura Cement", role: "SUPPLIER", deals: 15, volume: "CHF 0.9 Mio.", verified: true },
];
const MAX_DEALS = Math.max(...TOP_DEALS.map((d) => d.deals));

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent/60">{children}</div>;
}

/* -------------------------------------------------------------------------- */

export default function NetworkHub() {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [conns, setConns] = useState<Record<string, ConnState>>({});
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("ALL");
  const [query, setQuery] = useState("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [moreStats, setMoreStats] = useState(false);

  const loadMine = useCallback(async () => {
    if (!isSignedIn || !userId) {
      setMyCompanyId(null);
      setConns({});
      return;
    }
    const { data: me } = await supabase
      .from("companies")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();
    const mineId = (me as { id: string } | null)?.id ?? null;
    setMyCompanyId(mineId);
    if (!mineId) return;

    const { data: rows } = await supabase
      .from("connections")
      .select("id, company_id_a, company_id_b, status, requested_by")
      .or(`company_id_a.eq.${mineId},company_id_b.eq.${mineId}`);

    const map: Record<string, ConnState> = {};
    for (const r of (rows ?? []) as {
      id: string;
      company_id_a: string;
      company_id_b: string;
      status: "PENDING" | "CONNECTED";
      requested_by: string | null;
    }[]) {
      const other = r.company_id_a === mineId ? r.company_id_b : r.company_id_a;
      map[other] = {
        id: r.id,
        status: r.status,
        direction: r.requested_by === mineId ? "outgoing" : "incoming",
      };
    }
    setConns(map);
  }, [isSignedIn, userId, supabase]);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("id, company_name, uid_number, role, canton, city, verified, logo_url, bio")
      .neq("role", "ADMIN")
      .order("verified", { ascending: false })
      .order("company_name", { ascending: true });
    setCompanies((data ?? []) as Company[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  useEffect(() => {
    loadMine();
  }, [loadMine]);

  async function connect(targetId: string) {
    if (!myCompanyId) return;
    const { error } = await supabase.from("connections").insert({
      company_id_a: myCompanyId,
      company_id_b: targetId,
      requested_by: myCompanyId,
      status: "PENDING",
    });
    if (!error) loadMine();
  }
  async function accept(connId: string) {
    const { error } = await supabase.from("connections").update({ status: "CONNECTED" }).eq("id", connId);
    if (!error) loadMine();
  }
  async function ignore(connId: string) {
    const { error } = await supabase.from("connections").delete().eq("id", connId);
    if (!error) loadMine();
  }

  const byId = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  const connectedList = useMemo(
    () =>
      Object.entries(conns)
        .filter(([, s]) => s.status === "CONNECTED")
        .map(([id]) => byId.get(id))
        .filter(Boolean) as Company[],
    [conns, byId],
  );

  const invitations = useMemo(
    () =>
      Object.entries(conns)
        .filter(([, s]) => s.status === "PENDING" && s.direction === "incoming")
        .map(([id, s]) => ({ company: byId.get(id), conn: s }))
        .filter((x) => x.company) as { company: Company; conn: ConnState }[],
    [conns, byId],
  );

  const outgoing = useMemo(
    () => Object.values(conns).filter((s) => s.status === "PENDING" && s.direction === "outgoing").length,
    [conns],
  );

  const suggestions = companies.filter((c) => {
    if (c.id === myCompanyId) return false;
    if (conns[c.id]) return false;
    if (dismissed.has(c.id)) return false;
    if (role !== "ALL" && c.role !== role) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        c.company_name.toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q) ||
        (c.canton ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const bannerFirms = suggestions.slice(0, 5);
  const region = companies.find((c) => c.id === myCompanyId)?.canton ?? null;

  const overview = [
    { label: "Einladungen gesendet", value: outgoing },
    { label: "Verbindungen", value: connectedList.length },
    { label: "Erhaltene Anfragen", value: invitations.length },
  ];
  const overviewMore = [
    { label: "Lieferanten", value: connectedList.filter((c) => c.role === "SUPPLIER").length },
    { label: "Bauunternehmen", value: connectedList.filter((c) => c.role === "BUYER").length },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* ---------------- LEFT RAIL ---------------- */}
      <aside className="space-y-4">
        {/* Netzwerk im Überblick */}
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-5 pb-3 pt-4">
            <Eyebrow>Dein Netzwerk</Eyebrow>
            <h2 className="mt-0.5 text-[15px] font-bold text-slate-900">Überblick</h2>
          </div>
          <div className="divide-y divide-slate-50 px-5">
            {[...overview, ...(moreStats ? overviewMore : [])].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-500">{s.label}</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMoreStats((v) => !v)}
            className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/5"
          >
            {moreStats ? "Weniger anzeigen" : "Mehr anzeigen"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", moreStats && "rotate-180")} />
          </button>
        </div>

        {/* Meiste Deals (Leaderboard) */}
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-5 pb-3 pt-4">
            <Eyebrow>Rangliste · 12 Monate</Eyebrow>
            <h3 className="mt-0.5 text-[15px] font-bold text-slate-900">Meiste Deals abgeschlossen</h3>
          </div>
          <ul className="px-3 py-1.5">
            {TOP_DEALS.map((d, i) => (
              <li key={d.id} className="rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-md text-[12px] font-bold tabular-nums",
                      i === 0 ? "bg-accent text-white" : "bg-accent/10 text-accent",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold", d.role === "SUPPLIER" ? "bg-navy-800 text-white" : "bg-accent/12 text-accent")}>
                    {initials(d.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-[13px] font-semibold text-slate-900">
                      <span className="truncate">{d.name}</span>
                      {d.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
                    </div>
                    <div className="text-[11px] text-slate-400">{d.volume}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[14px] font-bold tabular-nums text-slate-900">{d.deals}</span>
                    <span className="ml-0.5 text-[10px] text-slate-400">Deals</span>
                  </div>
                </div>
                <div className="mt-1.5 ml-[34px] h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn("h-full rounded-full", i === 0 ? "bg-accent" : "bg-accent/40")} style={{ width: `${(d.deals / MAX_DEALS) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Karten-Zugang */}
        <Link href="/map" className={cn(CARD, "group flex items-center gap-3 p-4 transition-colors hover:border-accent/40")}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
            <MapIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-slate-900">Lieferanten-Karte Schweiz</div>
            <div className="text-[11px] text-slate-500">Lieferanten am Standort entdecken</div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Smart Pools (Bündeln = Gold) */}
        <div className={cn(CARD, "p-5")}>
          <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
            <Layers className="h-4 w-4 text-brand" /> Smart Pools
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
            Bündle deinen Bedarf mit anderen Firmen — Sealed-Bid-Angebote gegen KBOB sichern
            einen garantierten Netto-Mindestvorteil.
          </p>
          <Link href="/pools" className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand-500">
            Zu den Bündeln <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* ---------------- MAIN ---------------- */}
      <div className="min-w-0 space-y-4">
        {/* Wachstums-Banner (Navy) */}
        <div className={cn(CARD, "relative overflow-hidden")}>
          <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
          <div className="flex flex-col gap-5 p-5 pl-6 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pl-7">
            <div className="max-w-md">
              <Eyebrow>Netzwerk erweitern</Eyebrow>
              <h2 className="mt-1 text-xl font-bold leading-snug text-slate-900">
                Verbinde dich mit passenden Firmen{region ? ` in ${region}` : " in deiner Region"}
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                Mehr Verbindungen bedeuten mehr Bündel-Möglichkeiten — mit Bauunternehmen und Lieferanten deiner Region.
              </p>
              <a href="#vorschlaege" className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700">
                Passende Firmen finden <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="flex shrink-0 -space-x-3">
              {bannerFirms.length > 0
                ? bannerFirms.map((c) => (
                    <Link
                      key={c.id}
                      href={`/company/${c.id}`}
                      title={c.company_name}
                      className={cn("grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-white text-[13px] font-bold shadow-sm", c.role === "SUPPLIER" ? "bg-navy-800 text-white" : "bg-accent/12 text-accent")}
                    >
                      {c.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                      ) : (
                        initials(c.company_name)
                      )}
                    </Link>
                  ))
                : [0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-12 w-12 rounded-full border-2 border-white bg-slate-100" />
                  ))}
            </div>
          </div>
        </div>

        {/* Erhaltene Einladungen */}
        {invitations.length > 0 && (
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-[15px] font-bold text-slate-900">
                Erhaltene Einladungen <span className="font-semibold text-accent">{invitations.length}</span>
              </h3>
              <Link href="/network/requests" className="text-[13px] font-semibold text-accent hover:underline">Alle anzeigen</Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {invitations.map(({ company, conn }) => (
                <li key={conn.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Link href={`/company/${company.id}`} className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {company.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
                    ) : (
                      initials(company.company_name)
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/company/${company.id}`} className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900 hover:text-accent">
                      {company.company_name}
                      {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
                    </Link>
                    <p className="truncate text-xs text-slate-400">
                      {ROLE_LABEL[company.role] ?? company.role}{company.city ? ` · ${company.city}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => ignore(conn.id)} className="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100">
                    Ignorieren
                  </button>
                  <button type="button" onClick={() => accept(conn.id)} className="inline-flex items-center gap-1 rounded-full bg-accent-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700">
                    <Check className="h-4 w-4" /> Annehmen
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Firmen, die du kennen könntest */}
        <div id="vorschlaege" className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>Empfohlen für dich</Eyebrow>
              <h3 className="mt-0.5 text-[15px] font-bold text-slate-900">
                {region ? `Firmen in der Region ${region}` : "Firmen, die du kennen könntest"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_FILTERS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                    role === r.key ? "bg-accent-600 text-white" : "border border-slate-200 bg-white text-slate-500 hover:border-accent/40 hover:text-accent",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Firma, Ort oder Kanton suchen …"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-accent focus:bg-white focus:ring-1 focus:ring-accent/20"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Firmen werden geladen …
              </div>
            ) : suggestions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
                Keine weiteren Firmen gefunden.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {suggestions.map((c) => (
                  <div key={c.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 text-center transition-all hover:border-accent/30 hover:shadow-cardhover">
                    <button
                      type="button"
                      onClick={() => setDismissed((d) => new Set(d).add(c.id))}
                      aria-label="Vorschlag ausblenden"
                      className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="h-14 bg-gradient-to-r from-navy-900 via-navy-800 to-accent-600" />
                    <div className="flex flex-1 flex-col items-center px-4 pb-4">
                      <Link href={`/company/${c.id}`} className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-base font-bold text-slate-700 shadow-sm">
                        {c.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                        ) : (
                          initials(c.company_name)
                        )}
                      </Link>
                      <Link href={`/company/${c.id}`} className="mt-2 flex items-center justify-center gap-1 text-[15px] font-semibold text-slate-900 hover:text-accent">
                        <span className="max-w-full truncate">{c.company_name}</span>
                        {c.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
                      </Link>
                      <p className="text-xs text-slate-500">{ROLE_LABEL[c.role] ?? c.role}{c.city ? ` · ${c.city}` : ""}</p>
                      <span className={cn(
                        "mt-2 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        c.role === "SUPPLIER" ? "border-accent/25 bg-accent/5 text-accent" : "border-brand/25 bg-brand/5 text-brand-700",
                      )}>
                        {c.role === "SUPPLIER" ? "Möglicher Lieferant" : "Möglicher Bündel-Partner"}
                      </span>
                      <button
                        type="button"
                        onClick={() => connect(c.id)}
                        disabled={!myCompanyId}
                        className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" /> Vernetzen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isSignedIn && !myCompanyId && !loading && (
          <p className="text-center text-xs text-slate-500">
            Lege ein Firmenprofil an, um dich mit anderen Firmen zu vernetzen.
          </p>
        )}
      </div>
    </div>
  );
}
