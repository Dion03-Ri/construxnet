"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  BadgeCheck,
  MapPin,
  Search,
  Loader2,
  AlertTriangle,
  UserPlus,
  Check,
  Clock,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Typen & Konfiguration                                                      */
/* -------------------------------------------------------------------------- */

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
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Connect-Button                                                             */
/* -------------------------------------------------------------------------- */

function ConnectButton({
  conn,
  disabled,
  onConnect,
  onAccept,
}: {
  conn: ConnState | undefined;
  disabled: boolean;
  onConnect: () => void;
  onAccept: (id: string) => void;
}) {
  if (conn?.status === "CONNECTED") {
    return (
      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald/15 px-3 py-2 text-sm font-medium text-emerald">
        <Check className="h-4 w-4" />
        Verbunden
      </span>
    );
  }
  if (conn?.status === "PENDING" && conn.direction === "outgoing") {
    return (
      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500">
        <Clock className="h-4 w-4" />
        Angefragt
      </span>
    );
  }
  if (conn?.status === "PENDING" && conn.direction === "incoming") {
    return (
      <button
        type="button"
        onClick={() => onAccept(conn.id)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        <Check className="h-4 w-4" />
        Anfrage annehmen
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
      title={disabled ? "Firmenprofil nötig, um zu vernetzen" : undefined}
    >
      <UserPlus className="h-4 w-4" />
      Vernetzen
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Directory                                                                  */
/* -------------------------------------------------------------------------- */

export default function NetworkDirectory() {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [conns, setConns] = useState<Record<string, ConnState>>({});
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("ALL");
  const [query, setQuery] = useState("");

  // Eigene Firma + Verbindungen laden
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
    setError(null);
    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, company_name, uid_number, role, canton, city, verified, logo_url, bio",
      )
      .neq("role", "ADMIN")
      .order("verified", { ascending: false })
      .order("company_name", { ascending: true });
    if (error) {
      setError(error.message);
      setCompanies([]);
    } else {
      setCompanies((data ?? []) as Company[]);
    }
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
    const { error } = await supabase
      .from("connections")
      .update({ status: "CONNECTED" })
      .eq("id", connId);
    if (!error) loadMine();
  }

  const filtered = companies.filter((c) => {
    if (c.id === myCompanyId) return false;
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

  return (
    <div className="space-y-5">
      {/* Filterleiste */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                role === r.key
                  ? "bg-brand text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:text-slate-900",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Firma, Ort, Kanton …"
            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-brand/50 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Firmen werden geladen …
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Directory konnte nicht geladen werden.</p>
            <p className="mt-0.5 text-rose-300/80">{error}</p>
            <p className="mt-1 text-xs text-rose-300/60">
              Sind die Migrationen <code>02_network_schema.sql</code> und{" "}
              <code>03_company_directory.sql</code> in Supabase ausgeführt?
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
          Keine Firmen gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                  {c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.logo_url}
                      alt={c.company_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(c.company_name)
                  )}
                </span>
                {c.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] font-medium text-emerald">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verifiziert
                  </span>
                )}
              </div>

              <Link
                href={`/company/${c.id}`}
                className="mt-3 font-semibold text-slate-900 hover:text-brand"
              >
                {c.company_name}
              </Link>
              <p className="text-xs text-slate-500">
                {ROLE_LABEL[c.role] ?? c.role}
                {c.city ? ` · ${c.city}` : ""}
                {c.canton ? ` (${c.canton})` : ""}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
                <MapPin className="h-3 w-3" />
                {c.uid_number}
              </p>

              {c.bio && (
                <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                  {c.bio}
                </p>
              )}

              <div className="mt-4 pt-1">
                <ConnectButton
                  conn={conns[c.id]}
                  disabled={!myCompanyId}
                  onConnect={() => connect(c.id)}
                  onAccept={accept}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {isSignedIn && !myCompanyId && !loading && (
        <p className="text-center text-xs text-slate-500">
          Lege ein Firmenprofil an, um dich mit anderen Firmen zu vernetzen.
        </p>
      )}
    </div>
  );
}
