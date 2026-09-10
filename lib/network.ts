"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";
import { useFrischBeiRueckkehr, useLive } from "@/lib/live";

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

/** Alle 26 Kantone — der Filter zeigt die Schweiz, nicht nur wer schon da ist. */
export const SWISS_CANTONS: { code: string; name: string }[] = [
  { code: "AG", name: "Aargau" },
  { code: "AI", name: "Appenzell Innerrhoden" },
  { code: "AR", name: "Appenzell Ausserrhoden" },
  { code: "BE", name: "Bern" },
  { code: "BL", name: "Basel-Landschaft" },
  { code: "BS", name: "Basel-Stadt" },
  { code: "FR", name: "Freiburg" },
  { code: "GE", name: "Genf" },
  { code: "GL", name: "Glarus" },
  { code: "GR", name: "Graubünden" },
  { code: "JU", name: "Jura" },
  { code: "LU", name: "Luzern" },
  { code: "NE", name: "Neuenburg" },
  { code: "NW", name: "Nidwalden" },
  { code: "OW", name: "Obwalden" },
  { code: "SG", name: "St. Gallen" },
  { code: "SH", name: "Schaffhausen" },
  { code: "SO", name: "Solothurn" },
  { code: "SZ", name: "Schwyz" },
  { code: "TG", name: "Thurgau" },
  { code: "TI", name: "Tessin" },
  { code: "UR", name: "Uri" },
  { code: "VD", name: "Waadt" },
  { code: "VS", name: "Wallis" },
  { code: "ZG", name: "Zug" },
  { code: "ZH", name: "Zürich" },
];


/** Dieselben Spalten fuer Verzeichnis und Gegenseite — sonst zwei Wahrheiten. */
const NET_SPALTEN =
  "id, company_name, uid_number, role, canton, city, verified, logo_url, bio, created_at";

/** Datenbankfehler in einen Satz, den man lesen kann. */
export function klartext(code: string | undefined, nachricht: string): string {
  if (code === "23505") return "Mit dieser Firma besteht bereits eine Anfrage oder eine Verbindung.";
  if (code === "42501") return "Das darf dieses Konto nicht. Ist das Profil vollstaendig angelegt?";
  if (code === "23514") return "Diese Verbindung ist so nicht erlaubt.";
  return nachricht || "Unbekannter Fehler.";
}

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
  // Die Firmen der Gegenseite, einzeln geholt. Frueher wurden sie im
  // Verzeichnis gesucht — stand die Firma dort nicht (weil das Verzeichnis
  // aelter war als die Anmeldung der Gegenseite), fiel die ANFRAGE lautlos
  // aus der Liste. Genau so verschwanden Anfragen spurlos.
  const [partners, setPartners] = useState<Record<string, NetCompany>>({});
  const [conns, setConns] = useState<Record<string, ConnState>>({});
  const [fehler, setFehler] = useState<string | null>(null);
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

    const fremde = Object.keys(map);
    if (fremde.length === 0) {
      setPartners({});
      return;
    }
    const { data: gegen } = await supabase.from("companies").select(NET_SPALTEN).in("id", fremde);
    if (gegen) {
      setPartners(Object.fromEntries((gegen as NetCompany[]).map((c) => [c.id, c])));
    }
  }, [isSignedIn, userId, supabase]);

  // Nur beim ersten Mal einen Ladezustand zeigen. Sonst leert ein stiller
  // Neuaufbau des Clients (Clerk erneuert das Token) kurz die ganze Liste —
  // das war das Flackern, bei dem Firmen verschwanden und wiederkamen.
  const loadedOnce = useRef(false);

  const loadCompanies = useCallback(async () => {
    if (!loadedOnce.current) setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select(NET_SPALTEN)
      .neq("role", "ADMIN")
      .order("verified", { ascending: false })
      .order("company_name", { ascending: true });
    // Ein fehlgeschlagener Abruf darf die bereits gezeigte Liste nicht loeschen.
    if (data) setCompanies(data as NetCompany[]);
    loadedOnce.current = true;
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  useEffect(() => {
    loadMine();
  }, [loadMine]);

  /**
   * Live, ohne Neuladen. Siehe `lib/live.ts` fuer die Regeln dahinter.
   *
   * `connections` bringt Anfrage, Annahme und Verbindung sofort auf die
   * Gegenseite. `companies` sorgt dafuer, dass eine Firma, die sich gerade
   * erst angemeldet oder ihr Profil geaendert hat, im Verzeichnis auftaucht,
   * ohne dass jemand die Seite neu laedt.
   */
  useLive(supabase, "netzwerk", ["connections"], loadMine, isSignedIn);
  useLive(supabase, "netzwerk-firmen", ["companies"], loadCompanies, isSignedIn);

  const beides = useCallback(() => {
    void loadMine();
    void loadCompanies();
  }, [loadMine, loadCompanies]);
  useFrischBeiRueckkehr(beides);

  const connect = useCallback(
    async (targetId: string) => {
      setFehler(null);
      if (!myCompanyId) {
        setFehler("Dein Firmenprofil ist noch nicht angelegt. Schliesse zuerst die Anmeldung ab.");
        return;
      }
      const { error } = await supabase.from("connections").insert({
        company_id_a: myCompanyId,
        company_id_b: targetId,
        requested_by: myCompanyId,
        status: "PENDING",
      });
      // Frueher stand hier `if (!error) loadMine()` — ein fehlgeschlagener
      // Versuch tat also nichts und sagte nichts. Wer auf „Vernetzen"
      // drueckte, sah keinen Unterschied zwischen Erfolg und Fehler.
      if (error) setFehler(klartext(error.code, error.message));
      await loadMine();
    },
    [myCompanyId, supabase, loadMine],
  );

  const accept = useCallback(
    async (connId: string) => {
      setFehler(null);
      const { error } = await supabase.from("connections").update({ status: "CONNECTED" }).eq("id", connId);
      if (error) setFehler(klartext(error.code, error.message));
      await loadMine();
    },
    [supabase, loadMine],
  );

  /** Ablehnen einer Anfrage — und zugleich das Zurueckziehen einer eigenen. */
  const remove = useCallback(
    async (connId: string) => {
      setFehler(null);
      const { error } = await supabase.from("connections").delete().eq("id", connId);
      if (error) setFehler(klartext(error.code, error.message));
      await loadMine();
    },
    [supabase, loadMine],
  );

  const byId = useMemo(() => {
    const m = new Map(companies.map((c) => [c.id, c]));
    for (const [id, c] of Object.entries(partners)) if (!m.has(id)) m.set(id, c);
    return m;
  }, [companies, partners]);

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
    companies, conns, myCompanyId, me, loading, isSignedIn, fehler,
    connected, incoming, outgoing,
    connect, accept, remove, reload: loadMine,
  };
}
