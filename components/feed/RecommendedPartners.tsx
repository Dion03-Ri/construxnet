"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, BadgeCheck, Check, Sparkles } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { SAMPLE_PARTNERS } from "@/data/feedMock";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Company = {
  id: string;
  company_name: string;
  role: string;
  city: string | null;
  verified: boolean;
  logo_url?: string | null;
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
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
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
    if (list.length < 2) {
      setItems(SAMPLE_PARTNERS.slice(0, 4));
      setDemo(true);
    } else {
      setItems(list.slice(0, 4));
      setDemo(false);
    }
  }, [isSignedIn, userId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function connect(targetId: string) {
    if (!myId || demo) return;
    setPending((p) => ({ ...p, [targetId]: true }));
    await supabase.from("connections").insert({
      company_id_a: myId,
      company_id_b: targetId,
      requested_by: myId,
      status: "PENDING",
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={cn(CARD, "p-4")}>
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand" />
        <h3 className="text-[15px] font-semibold text-slate-900">
          Partner für deine Beschaffung
        </h3>
      </div>
      <p className="mb-3 text-[12px] text-slate-400">
        Vernetze dich mit Werken &amp; Firmen, mit denen du bündeln kannst.
      </p>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <Link
              href={`/company/${c.id}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
            >
              {initials(c.company_name)}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/company/${c.id}`}
                className="flex items-center gap-1 truncate text-[13px] font-semibold text-slate-800 hover:text-brand"
              >
                <span className="truncate">{c.company_name}</span>
                {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </Link>
              <p className="truncate text-[11px] text-slate-400">
                {ROLE_LABEL[c.role] ?? c.role}
                {c.city ? ` · ${c.city}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => connect(c.id)}
              disabled={pending[c.id] || demo}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-brand/50 px-3 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-60"
            >
              {pending[c.id] ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Gesendet
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" /> Vernetzen
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
