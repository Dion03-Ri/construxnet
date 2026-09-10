"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, BadgeCheck, Check } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { useFrischBeiRueckkehr, useLive } from "@/lib/live";
import { fetchMyCompanyId } from "@/lib/myCompany";
import { SAMPLE_PARTNERS } from "@/data/feedMock";
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
      mineId = await fetchMyCompanyId(supabase);
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

  useLive(supabase, "vorschlaege", ["companies", "connections"], load);
  useFrischBeiRueckkehr(load);

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
    /* Schmale Zeilen in der Schiene, ohne Kasten, ohne Rundbild und ohne
       Funkel-Symbol. Das Sternchen sollte „von der Maschine vorgeschlagen"
       heissen und ist genau deshalb das Erkennungszeichen erzeugter
       Oberflächen geworden.

       Über die volle Seitenbreite waren dieselben vier Zeilen eine Wand aus
       Streifen: 1600 px Haarlinie mit einem Firmennamen links und einem
       Wort rechts. Vier Namen brauchen keine Bildschirmbreite. */
    <div className="border-t border-white/[0.12] pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[14px] font-bold tracking-tight text-white">
          Partner für deine Beschaffung
        </h3>
        <Link
          href="/network/entdecken"
          className="shrink-0 text-[11.5px] font-semibold text-brand hover:underline"
        >
          Alle ansehen
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-white/[0.12] border-t border-white/[0.12]">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/company/${c.id}`}
                className="flex items-center gap-1 truncate text-[13.5px] font-semibold text-white hover:text-brand"
              >
                <span className="truncate">{c.company_name}</span>
                {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />}
              </Link>
              <p className="truncate text-[11.5px] text-white/[0.56]">
                {ROLE_LABEL[c.role] ?? c.role}
                {c.city ? ` · ${c.city}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => connect(c.id)}
              disabled={pending[c.id] || demo}
              className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-brand transition-colors hover:underline disabled:opacity-50"
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
