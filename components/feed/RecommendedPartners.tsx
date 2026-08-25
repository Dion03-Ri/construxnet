"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, BadgeCheck, Check, Sparkles } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";

type Company = {
  id: string;
  company_name: string;
  role: string;
  city: string | null;
  verified: boolean;
  logo_url: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function RecommendedPartners() {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [items, setItems] = useState<Company[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let mineId: string | null = null;
    if (isSignedIn && userId) {
      const { data: me } = await supabase
        .from("companies")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      mineId = (me as { id: string } | null)?.id ?? null;
      setMyId(mineId);
    }
    const { data } = await supabase
      .from("companies")
      .select("id, company_name, role, city, verified, logo_url")
      .neq("role", "ADMIN")
      .order("verified", { ascending: false })
      .limit(6);
    let list = (data ?? []) as Company[];
    if (mineId) list = list.filter((c) => c.id !== mineId);
    setItems(list.slice(0, 4));
    setLoading(false);
  }, [isSignedIn, userId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function connect(targetId: string) {
    if (!myId) return;
    setPending((p) => ({ ...p, [targetId]: true }));
    await supabase.from("connections").insert({
      company_id_a: myId,
      company_id_b: targetId,
      requested_by: myId,
      status: "PENDING",
    });
  }

  if (loading || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand" />
        <h3 className="text-[15px] font-semibold text-slate-100">
          Empfohlene Partner
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <Link
              href={`/company/${c.id}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy-800 text-xs font-semibold text-slate-200"
            >
              {c.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
              ) : (
                initials(c.company_name)
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/company/${c.id}`}
                className="flex items-center gap-1 truncate text-[13px] font-medium text-slate-200 hover:text-brand"
              >
                <span className="truncate">{c.company_name}</span>
                {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald" />}
              </Link>
              <p className="truncate text-[11px] text-slate-500">
                {ROLE_LABEL[c.role] ?? c.role}
                {c.city ? ` · ${c.city}` : ""}
              </p>
            </div>
            {myId && (
              <button
                type="button"
                onClick={() => connect(c.id)}
                disabled={pending[c.id]}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand/40 px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-60"
              >
                {pending[c.id] ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Gesendet
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" /> Folgen
                  </>
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
