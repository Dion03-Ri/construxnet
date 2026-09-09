"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";
import { POST_TYPES, initials, timeAgo } from "@/lib/post";
import PostActions from "./PostActions";

export type Beitrag = {
  id: string;
  post_type: string;
  title: string | null;
  content: string;
  region: string | null;
  media_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  company_id: string;
  companies: { company_name: string; city: string | null; verified: boolean; logo_url: string | null } | null;
};

/**
 * Ein einzelner Beitrag auf eigener Seite.
 *
 * Sie ist die Adresse, auf die „Teilen" zeigt: ein Link in eine
 * unendlich scrollende Liste fuehrt zu nichts Bestimmtem. Hier stehen
 * die Kommentare ausserdem von Anfang an offen — wer dem Link folgt,
 * kommt meistens ihretwegen.
 */
export default function SinglePost({ beitrag }: { beitrag: Beitrag }) {
  const supabase = useSupabaseBrowser();
  const [meineFirma, setMeineFirma] = useState<string | null>(null);
  const [gelikt, setGelikt] = useState(false);
  const [likes, setLikes] = useState(beitrag.likes_count);
  const [kommentare, setKommentare] = useState(beitrag.comments_count);

  useEffect(() => {
    let ab = false;
    fetchMyCompanyId(supabase).then(async (id) => {
      if (ab || !id) return;
      setMeineFirma(id);
      const { data } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("company_id", id)
        .eq("post_id", beitrag.id)
        .maybeSingle();
      if (!ab) setGelikt(Boolean(data));
    }, () => undefined);
    return () => {
      ab = true;
    };
  }, [supabase, beitrag.id]);

  const c = beitrag.companies;
  const name = c?.company_name ?? "Unbekannte Firma";

  return (
    <article className="rounded-[20px] border border-white/[0.12] bg-[#16181a] p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <Link
          href={`/company/${beitrag.company_id}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white/[0.72]"
        >
          {c?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/company/${beitrag.company_id}`} className="truncate font-semibold text-white hover:text-brand">
              {name}
            </Link>
            {c?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-white/[0.56]">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.5]">
              {POST_TYPES[beitrag.post_type]?.label ?? beitrag.post_type}
            </span>
            {c?.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {c.city}
              </span>
            )}
            <span>{timeAgo(beitrag.created_at)}</span>
            {beitrag.region && beitrag.region !== c?.city && <span>{beitrag.region}</span>}
          </div>
        </div>
      </div>

      {beitrag.title && <h1 className="mt-4 text-[20px] font-semibold text-white">{beitrag.title}</h1>}
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-white/[0.72]">{beitrag.content}</p>

      {beitrag.media_url && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beitrag.media_url}
            alt={beitrag.title ?? name}
            className="max-h-[520px] w-auto max-w-full rounded-lg border border-white/[0.12] object-contain"
          />
        </div>
      )}

      <PostActions
        postId={beitrag.id}
        autorId={beitrag.company_id}
        titel={beitrag.title ?? name}
        text={beitrag.content}
        likes={likes}
        kommentare={kommentare}
        gelikt={gelikt}
        meineFirma={meineFirma}
        demo={false}
        onLike={(jetzt) => {
          setGelikt(jetzt);
          setLikes((v) => Math.max(0, v + (jetzt ? 1 : -1)));
        }}
        onKommentarAnzahl={(d) => setKommentare((v) => Math.max(0, v + d))}
        offeneKommentare
      />
    </article>
  );
}
