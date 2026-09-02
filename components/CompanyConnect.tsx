"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, Check, Clock, MessageSquare } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";

type ConnState = {
  id: string;
  status: "PENDING" | "CONNECTED";
  direction: "outgoing" | "incoming";
};

export default function CompanyConnect({ targetId }: { targetId: string }) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [myId, setMyId] = useState<string | null>(null);
  const [conn, setConn] = useState<ConnState | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!isSignedIn || !userId) {
      setReady(true);
      return;
    }
    const mineId = await fetchMyCompanyId(supabase);
    setMyId(mineId);

    if (mineId && mineId !== targetId) {
      const { data: rows } = await supabase
        .from("connections")
        .select("id, company_id_a, company_id_b, status, requested_by")
        .or(
          `and(company_id_a.eq.${mineId},company_id_b.eq.${targetId}),and(company_id_a.eq.${targetId},company_id_b.eq.${mineId})`,
        )
        .maybeSingle();
      const r = rows as {
        id: string;
        status: "PENDING" | "CONNECTED";
        requested_by: string | null;
      } | null;
      setConn(
        r
          ? {
              id: r.id,
              status: r.status,
              direction: r.requested_by === mineId ? "outgoing" : "incoming",
            }
          : null,
      );
    }
    setReady(true);
  }, [isSignedIn, userId, supabase, targetId]);

  useEffect(() => {
    load();
  }, [load]);

  async function connect() {
    if (!myId) return;
    const { error } = await supabase.from("connections").insert({
      company_id_a: myId,
      company_id_b: targetId,
      requested_by: myId,
      status: "PENDING",
    });
    if (!error) load();
  }

  async function accept() {
    if (!conn) return;
    const { error } = await supabase
      .from("connections")
      .update({ status: "CONNECTED" })
      .eq("id", conn.id);
    if (!error) load();
  }

  if (!ready) return null;
  if (myId === targetId) {
    return (
      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
        Das ist dein Profil
      </span>
    );
  }
  if (!myId) return null;

  const messageBtn = (
    <Link
      href={`/messages?to=${targetId}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
    >
      <MessageSquare className="h-4 w-4" />
      Nachricht
    </Link>
  );

  if (conn?.status === "CONNECTED") {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
          <Check className="h-4 w-4" />
          Verbunden
        </span>
        {messageBtn}
      </div>
    );
  }
  if (conn?.status === "PENDING" && conn.direction === "outgoing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500">
        <Clock className="h-4 w-4" />
        Anfrage gesendet
      </span>
    );
  }
  if (conn?.status === "PENDING" && conn.direction === "incoming") {
    return (
      <button
        type="button"
        onClick={accept}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        <Check className="h-4 w-4" />
        Anfrage annehmen
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={connect}
      className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
    >
      <UserPlus className="h-4 w-4" />
      Vernetzen
    </button>
  );
}
