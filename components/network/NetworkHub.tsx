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
  Clock,
  Users,
  Building2,
  Truck,
  Hash,
  Sparkles,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { GEWERKE } from "@/data/feedMock";
import SupplierMap from "@/components/map/SupplierMap";
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

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
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

  const suggestions = companies.filter((c) => {
    if (c.id === myCompanyId) return false;
    if (conns[c.id]) return false;
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

  const stats = [
    { icon: Users, label: "Verbindungen", value: connectedList.length },
    { icon: Clock, label: "Offene Anfragen", value: invitations.length },
    { icon: Truck, label: "Lieferanten", value: connectedList.filter((c) => c.role === "SUPPLIER").length },
    { icon: Building2, label: "Bauunternehmen", value: connectedList.filter((c) => c.role === "BUYER").length },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Left rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-[72px] space-y-4">
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="border-b border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-900">
              Mein Netzwerk verwalten
            </div>
            <div>
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-4 py-2.5 text-[13px] text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-slate-400" />
                    {s.label}
                  </span>
                  <span className="font-semibold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(CARD, "p-4")}>
            <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
              <Hash className="h-3.5 w-3.5 text-brand" /> Deine Gewerke
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {GEWERKE.map((g) => (
                <span
                  key={g}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-brand/10 hover:text-brand"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className={cn(CARD, "bg-gradient-to-br from-brand/5 to-accent/5 p-4")}>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-brand" /> Smart Pools starten
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
              Vernetzte Firmen können gemeinsam bündeln und Ø 12–18 % sparen.
            </p>
            <Link
              href="/pools"
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Zu Smart Pools
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 space-y-5">
        {/* Lieferanten-Karte Schweiz */}
        <SupplierMap />

        {/* Offene Anfragen */}
        {invitations.length > 0 && (
          <div className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
              <h3 className="text-[15px] font-semibold text-slate-900">
                Offene Anfragen
                <span className="ml-1.5 text-slate-400">({invitations.length})</span>
              </h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {invitations.map(({ company, conn }) => (
                <li key={conn.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <Link
                    href={`/company/${company.id}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
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
                      className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900 hover:text-brand"
                    >
                      {company.company_name}
                      {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
                    </Link>
                    <p className="truncate text-xs text-slate-400">
                      {ROLE_LABEL[company.role] ?? company.role}
                      {company.city ? ` · ${company.city}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => ignore(conn.id)}
                    className="rounded-md border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    Ignorieren
                  </button>
                  <button
                    type="button"
                    onClick={() => accept(conn.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-brand px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    <Check className="h-4 w-4" /> Annehmen
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vorschläge */}
        <div>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900">
              Firmen, die du kennen könntest
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      role === r.key
                        ? "bg-brand text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Firma, Ort oder Kanton suchen …"
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand/50 focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-12 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Firmen werden geladen …
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
              Keine weiteren Firmen gefunden.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {suggestions.map((c) => {
                const relevance =
                  c.role === "SUPPLIER"
                    ? `Möglicher Lieferant${c.canton ? ` · ${c.canton}` : ""}`
                    : "Möglicher Bündel-Partner";
                return (
                  <div key={c.id} className={cn(CARD, "flex flex-col overflow-hidden text-center")}>
                    <div className="h-16 bg-gradient-to-r from-navy-800 via-navy-700 to-brand/40" />
                    <div className="flex flex-1 flex-col items-center px-4 pb-4">
                      <Link
                        href={`/company/${c.id}`}
                        className="-mt-9 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-base font-bold text-slate-700 shadow-sm"
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
                        {c.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {ROLE_LABEL[c.role] ?? c.role}
                        {c.city ? ` · ${c.city}` : ""}
                      </p>
                      <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                        <Sparkles className="h-3 w-3" /> {relevance}
                      </p>
                      <button
                        type="button"
                        onClick={() => connect(c.id)}
                        disabled={!myCompanyId}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-brand/50 px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" /> Vernetzen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
