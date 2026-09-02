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
  Inbox,
  Sparkle,
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
  created_at: string | null;
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

/** Feine Raster-Textur der dunklen Panels — identisch zu Feed und Startseite. */
const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** Kleine Überschrift über einem Panel-Titel. */
function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={cn("text-[11px] font-semibold uppercase tracking-[0.12em]", dark ? "text-white/40" : "text-slate-400")}>
      {children}
    </div>
  );
}

/** Dunkles Panel in der Sprache von Feed und Startseite. */
function DarkPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-white/10 bg-navy-900 text-white", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
      <div className="relative">{children}</div>
    </div>
  );
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
      .select("id, company_name, uid_number, role, canton, city, verified, logo_url, bio, created_at")
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

  /** Zuletzt beigetretene Firmen — echte Daten, ohne erfundene Kennzahlen. */
  const newest = useMemo(
    () =>
      companies
        .filter((c) => c.id !== myCompanyId && c.created_at)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 5),
    [companies, myCompanyId],
  );

  const bannerFirms = suggestions.slice(0, 5);
  const region = companies.find((c) => c.id === myCompanyId)?.canton ?? null;

  const overview = [
    { label: "Verbindungen", value: connectedList.length },
    { label: "Einladungen gesendet", value: outgoing },
    { label: "Erhaltene Anfragen", value: invitations.length },
  ];
  const overviewMore = [
    { label: "Lieferanten", value: connectedList.filter((c) => c.role === "SUPPLIER").length },
    { label: "Bauunternehmen", value: connectedList.filter((c) => c.role === "BUYER").length },
  ];
  const networkEmpty = connectedList.length === 0 && outgoing === 0 && invitations.length === 0;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
      {/* ============================ LEFT RAIL ============================ */}
      <aside className="space-y-4">
        {/* Dein Netzwerk */}
        <DarkPanel>
          <div className="border-b border-white/10 px-5 pb-3 pt-4">
            <Eyebrow dark>Dein Netzwerk</Eyebrow>
            <h2 className="mt-0.5 text-[15px] font-bold">Überblick</h2>
          </div>

          {networkEmpty ? (
            // Erster Eindruck: keine Nullen-Wand, sondern ein Weg nach vorne.
            <div className="px-5 py-4">
              <p className="text-[13px] leading-relaxed text-white/55">
                Dein Netzwerk ist noch leer. Finde Bauunternehmen und Baustoffwerke
                {region ? ` in ${region}` : " in deiner Region"} — mehr Verbindungen heisst
                mehr Bündel-Möglichkeiten.
              </p>
              <a
                href="#vorschlaege"
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand-500"
              >
                Firmen finden <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <>
              <div className="divide-y divide-white/[0.06] px-5">
                {[...overview, ...(moreStats ? overviewMore : [])].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-2.5">
                    <span className="text-[13px] text-white/55">{s.label}</span>
                    <span className="text-lg font-bold tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMoreStats((v) => !v)}
                className="flex w-full items-center justify-center gap-1 border-t border-white/10 py-2.5 text-[12px] font-semibold text-brand transition-colors hover:bg-white/5"
              >
                {moreStats ? "Weniger anzeigen" : "Mehr anzeigen"}
                <ChevronDown className={cn("h-4 w-4 transition-transform", moreStats && "rotate-180")} />
              </button>
            </>
          )}
        </DarkPanel>

        {/* Neu im Netzwerk — echte, zuletzt beigetretene Firmen */}
        {newest.length > 0 && (
          <DarkPanel>
            <div className="border-b border-white/10 px-5 pb-3 pt-4">
              <Eyebrow dark>Zuletzt dazugekommen</Eyebrow>
              <h3 className="mt-0.5 flex items-center gap-1.5 text-[15px] font-bold">
                <Sparkle className="h-4 w-4 text-brand" /> Neu im Netzwerk
              </h3>
            </div>
            <ul className="px-3 py-2">
              {newest.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5">
                  <Link
                    href={`/company/${c.id}`}
                    className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[11px] font-bold"
                  >
                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                    ) : (
                      initials(c.company_name)
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/company/${c.id}`} className="flex items-center gap-1 truncate text-[13px] font-semibold hover:text-brand">
                      <span className="truncate">{c.company_name}</span>
                      {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />}
                    </Link>
                    <div className="truncate text-[11px] text-white/40">
                      {ROLE_LABEL[c.role] ?? c.role}
                      {c.city ? ` · ${c.city}` : ""}
                    </div>
                  </div>
                  {!conns[c.id] && myCompanyId && (
                    <button
                      type="button"
                      onClick={() => connect(c.id)}
                      aria-label={`${c.company_name} vernetzen`}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-brand/50 hover:text-brand"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </DarkPanel>
        )}
      </aside>

      {/* ============================== MITTE ============================== */}
      <div className="min-w-0 space-y-4">
        {/* Wachstums-Banner */}
        <DarkPanel>
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
                Netzwerk erweitern
              </span>
              <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
                Verbinde dich mit passenden Firmen{region ? ` in ${region}` : " in deiner Region"}
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                Mehr Verbindungen bedeuten mehr Bündel-Möglichkeiten — mit Bauunternehmen und
                Lieferanten deiner Region.
              </p>
              <a
                href="#vorschlaege"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
              >
                Passende Firmen finden <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Echte Firmen statt grauer Platzhalter — sonst gar nichts */}
            {bannerFirms.length > 0 && (
              <div className="flex shrink-0 -space-x-3">
                {bannerFirms.map((c) => (
                  <Link
                    key={c.id}
                    href={`/company/${c.id}`}
                    title={c.company_name}
                    className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-navy-900 bg-white/10 text-[13px] font-bold text-white"
                  >
                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                    ) : (
                      initials(c.company_name)
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DarkPanel>

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
                    "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    role === r.key
                      ? "bg-navy-900 text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
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
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30"
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
                  <div
                    key={c.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 text-center transition-all hover:border-brand/40 hover:shadow-cardhover"
                  >
                    <button
                      type="button"
                      onClick={() => setDismissed((d) => new Set(d).add(c.id))}
                      aria-label="Vorschlag ausblenden"
                      className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="relative h-14 overflow-hidden bg-navy-900">
                      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={GRID_BG} />
                    </div>
                    <div className="flex flex-1 flex-col items-center px-4 pb-4">
                      <Link
                        href={`/company/${c.id}`}
                        className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-base font-bold text-slate-700 shadow-sm"
                      >
                        {c.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                        ) : (
                          initials(c.company_name)
                        )}
                      </Link>
                      <Link
                        href={`/company/${c.id}`}
                        className="mt-2 flex items-center justify-center gap-1 text-[15px] font-semibold text-slate-900 hover:text-brand"
                      >
                        <span className="max-w-full truncate">{c.company_name}</span>
                        {c.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {ROLE_LABEL[c.role] ?? c.role}
                        {c.city ? ` · ${c.city}` : ""}
                      </p>
                      <span
                        className={cn(
                          "mt-2 rounded-md border px-2.5 py-0.5 text-[11px] font-medium",
                          c.role === "SUPPLIER"
                            ? "border-brand/25 bg-brand/5 text-brand-700"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                        )}
                      >
                        {c.role === "SUPPLIER" ? "Möglicher Lieferant" : "Möglicher Bündel-Partner"}
                      </span>
                      <button
                        type="button"
                        onClick={() => connect(c.id)}
                        disabled={!myCompanyId}
                        className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* ============================ RIGHT RAIL ============================ */}
      <aside className="space-y-4">
        {/* Erhaltene Anfragen — jetzt dauerhaft sichtbar statt versteckt */}
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
              <Inbox className="h-4 w-4 text-brand" /> Erhaltene Anfragen
            </h3>
            {invitations.length > 0 && (
              <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">
                {invitations.length}
              </span>
            )}
          </div>

          {invitations.length === 0 ? (
            <p className="px-4 py-4 text-[12.5px] leading-relaxed text-slate-400">
              Keine offenen Anfragen. Sobald dich eine Firma vernetzen möchte, erscheint sie hier.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {invitations.slice(0, 3).map(({ company, conn }) => (
                  <li key={conn.id} className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/company/${company.id}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700"
                      >
                        {company.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
                        ) : (
                          initials(company.company_name)
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/company/${company.id}`}
                          className="flex items-center gap-1 truncate text-[13px] font-semibold text-slate-900 hover:text-brand"
                        >
                          <span className="truncate">{company.company_name}</span>
                          {company.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />}
                        </Link>
                        <p className="truncate text-[11px] text-slate-400">
                          {ROLE_LABEL[company.role] ?? company.role}
                          {company.city ? ` · ${company.city}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => accept(conn.id)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand-500"
                      >
                        <Check className="h-3.5 w-3.5" /> Annehmen
                      </button>
                      <button
                        type="button"
                        onClick={() => ignore(conn.id)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-[12.5px] font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                      >
                        Ignorieren
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {invitations.length > 3 && (
                <Link
                  href="/network/requests"
                  className="flex items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[12.5px] font-semibold text-brand transition-colors hover:bg-brand/5"
                >
                  Alle {invitations.length} anzeigen <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </>
          )}
        </div>

        {/* Lieferanten-Karte */}
        <Link href="/map" className={cn(CARD, "group block overflow-hidden transition-colors hover:border-brand/40")}>
          <div className="relative h-24 overflow-hidden bg-navy-900">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={GRID_BG} />
            <div className="absolute inset-0 grid place-items-center">
              <MapIcon className="h-8 w-8 text-brand/70" />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-slate-900">Lieferanten-Karte</div>
              <div className="text-[11px] text-slate-500">Baustoffwerke am Standort entdecken</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Smart Pools */}
        <DarkPanel>
          <div className="p-5">
            <div className="flex items-center gap-2 text-[14px] font-bold">
              <Layers className="h-4 w-4 text-brand" /> Smart Pools
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
              Bündle deinen Bedarf mit anderen Firmen — Sealed-Bid-Angebote gegen KBOB sichern
              einen garantierten Netto-Mindestvorteil.
            </p>
            <Link
              href="/pools"
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              Zu den Bündeln <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DarkPanel>
      </aside>
    </div>
  );
}
