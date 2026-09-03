"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";

export type NetCompany = {
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

export type ConnState = {
  id: string;
  status: "PENDING" | "CONNECTED";
  direction: "outgoing" | "incoming";
};

export const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk",
};

export const ROLE_FILTERS = [
  { key: "ALL", label: "Alle" },
  { key: "BUYER", label: "Bauunternehmen" },
  { key: "SUPPLIER", label: "Baustoffwerke" },
];

/** Feine Raster-Textur der dunklen Panels — identisch zu Feed und Startseite. */
export const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

export function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/**
 * Firmen und der eigene Verbindungs-Stand — geteilt von Netzwerk-Übersicht
 * und Entdecken-Seite, damit beide dieselbe Wahrheit zeigen.
 */
export function useNetwork() {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [companies, setCompanies] = useState<NetCompany[]>([]);
  const [conns, setConns] = useState<Record<string, ConnState>>({});
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMine = useCallback(async () => {
    if (!isSignedIn || !userId) {
      setMyCompanyId(null);
      setConns({});
      return;
    }
    const mineId = await fetchMyCompanyId(supabase);
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
    setCompanies((data ?? []) as NetCompany[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const connect = useCallback(
    async (targetId: string) => {
      if (!myCompanyId) return;
      const { error } = await supabase.from("connections").insert({
        company_id_a: myCompanyId,
        company_id_b: targetId,
        requested_by: myCompanyId,
        status: "PENDING",
      });
      if (!error) loadMine();
    },
    [myCompanyId, supabase, loadMine],
  );

  const accept = useCallback(
    async (connId: string) => {
      const { error } = await supabase.from("connections").update({ status: "CONNECTED" }).eq("id", connId);
      if (!error) loadMine();
    },
    [supabase, loadMine],
  );

  /** Ablehnen einer Anfrage — und zugleich das Zurückziehen einer eigenen. */
  const remove = useCallback(
    async (connId: string) => {
      const { error } = await supabase.from("connections").delete().eq("id", connId);
      if (!error) loadMine();
    },
    [supabase, loadMine],
  );

  const byId = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  const connected = useMemo(
    () =>
      Object.entries(conns)
        .filter(([, s]) => s.status === "CONNECTED")
        .map(([id]) => byId.get(id))
        .filter(Boolean) as NetCompany[],
    [conns, byId],
  );

  const incoming = useMemo(
    () =>
      Object.entries(conns)
        .filter(([, s]) => s.status === "PENDING" && s.direction === "incoming")
        .map(([id, s]) => ({ company: byId.get(id), conn: s }))
        .filter((x) => x.company) as { company: NetCompany; conn: ConnState }[],
    [conns, byId],
  );

  const outgoing = useMemo(
    () =>
      Object.entries(conns)
        .filter(([, s]) => s.status === "PENDING" && s.direction === "outgoing")
        .map(([id, s]) => ({ company: byId.get(id), conn: s }))
        .filter((x) => x.company) as { company: NetCompany; conn: ConnState }[],
    [conns, byId],
  );

  const me = myCompanyId ? byId.get(myCompanyId) ?? null : null;

  return {
    companies, conns, myCompanyId, me, loading, isSignedIn,
    connected, incoming, outgoing,
    connect, accept, remove, reload: loadMine,
  };
}
