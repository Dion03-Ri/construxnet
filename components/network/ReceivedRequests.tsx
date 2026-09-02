"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { BadgeCheck, Check, Loader2, Inbox, MapPin } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Company = {
  id: string;
  company_name: string;
  role: string;
  city: string | null;
  canton: string | null;
  verified: boolean;
  logo_url: string | null;
};
type Req = { connId: string; company: Company };

const ROLE_LABEL: Record<string, string> = { BUYER: "Bauunternehmen", SUPPLIER: "Baustoffwerk / Lieferant" };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function ReceivedRequests() {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!isSignedIn || !userId) {
      setReqs([]);
      setLoading(false);
      return;
    }
    const mineId = await fetchMyCompanyId(supabase);
    if (!mineId) {
      setReqs([]);
      setLoading(false);
      return;
    }
    const { data: rows } = await supabase
      .from("connections")
      .select("id, company_id_a, company_id_b, status, requested_by")
      .eq("status", "PENDING");
    const incoming = ((rows ?? []) as { id: string; company_id_a: string; company_id_b: string; requested_by: string | null }[])
      .filter((r) => (r.company_id_a === mineId || r.company_id_b === mineId) && r.requested_by !== mineId);
    if (incoming.length === 0) {
      setReqs([]);
      setLoading(false);
      return;
    }
    const otherIds = incoming.map((r) => (r.company_id_a === mineId ? r.company_id_b : r.company_id_a));
    const { data: comps } = await supabase
      .from("companies")
      .select("id, company_name, role, city, canton, verified, logo_url")
      .in("id", otherIds);
    const byId = new Map(((comps ?? []) as Company[]).map((c) => [c.id, c]));
    setReqs(
      incoming
        .map((r) => {
          const other = r.company_id_a === mineId ? r.company_id_b : r.company_id_a;
          const company = byId.get(other);
          return company ? { connId: r.id, company } : null;
        })
        .filter(Boolean) as Req[],
    );
    setLoading(false);
  }, [isSignedIn, userId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function accept(id: string) {
    await supabase.from("connections").update({ status: "CONNECTED" }).eq("id", id);
    load();
  }
  async function ignore(id: string) {
    await supabase.from("connections").delete().eq("id", id);
    load();
  }

  if (loading) {
    return (
      <div className={cn(CARD, "flex items-center justify-center gap-2 py-12 text-sm text-slate-500")}>
        <Loader2 className="h-4 w-4 animate-spin" /> Anfragen werden geladen …
      </div>
    );
  }

  if (reqs.length === 0) {
    return (
      <div className={cn(CARD, "flex flex-col items-center gap-3 border-dashed py-14 text-center")}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-slate-900">Keine offenen Anfragen</p>
        <p className="max-w-sm text-[13px] text-slate-500">
          Wenn dir Firmen eine Vernetzungs-Anfrage senden, erscheinen sie hier zum Annehmen.
        </p>
        <Link href="/network" className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
          Firmen entdecken
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <ul className="divide-y divide-slate-100">
        {reqs.map(({ connId, company }) => (
          <li key={connId} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
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
              <Link href={`/company/${company.id}`} className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900 hover:text-brand">
                {company.company_name}
                {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
              </Link>
              <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                {ROLE_LABEL[company.role] ?? company.role}
                {company.city && <><span>·</span><MapPin className="h-3 w-3" /> {company.city}</>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => ignore(connId)}
              className="rounded-md border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
            >
              Ignorieren
            </button>
            <button
              type="button"
              onClick={() => accept(connId)}
              className="inline-flex items-center gap-1 rounded-md bg-brand px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              <Check className="h-4 w-4" /> Annehmen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
