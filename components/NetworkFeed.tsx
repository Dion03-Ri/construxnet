"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  Heart,
  MessageCircle,
  Share2,
  Layers,
  BadgeCheck,
  MapPin,
  Loader2,
  AlertTriangle,
  Megaphone,
  ScanLine,
  Newspaper,
  Send,
  X,
  ImageIcon,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Konfiguration                                                             */
/* -------------------------------------------------------------------------- */

const REGIONS = ["Zürich", "Bern", "Nordwestschweiz", "Innerschweiz"] as const;

const POST_TYPES: Record<string, { label: string }> = {
  UPDATE: { label: "Update" },
  JOB: { label: "Stellen" },
  MATERIAL_OFFER: { label: "Material-Angebot" },
  PROJECT: { label: "Projekt" },
  ANNOUNCEMENT: { label: "Ankündigung" },
};

const CARD =
  "rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur transition-colors";

type Company = {
  company_name: string;
  city: string | null;
  verified: boolean;
  logo_url: string | null;
};

type Post = {
  id: string;
  post_type: string;
  title: string | null;
  content: string;
  region: string | null;
  media_url: string | null;
  likes_count: number;
  created_at: string;
  company_id: string;
  companies: Company | null;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} T.`;
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Composer                                                                  */
/* -------------------------------------------------------------------------- */

function Composer({ onCreated }: { onCreated: () => void }) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState<{
    id: string;
    company_name: string;
    logo_url: string | null;
  } | null>(null);
  const [checked, setChecked] = useState(false);

  const [postType, setPostType] = useState("UPDATE");
  const [region, setRegion] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setChecked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, company_name, logo_url")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      if (!cancelled) {
        setCompany((data as typeof company) ?? null);
        setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId, supabase]);

  function start(type: string) {
    setPostType(type);
    setOpen(true);
  }

  async function submit() {
    if (!content.trim() || !company) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("network_posts").insert({
      company_id: company.id,
      post_type: postType,
      title: title.trim() || null,
      content: content.trim(),
      region: region || null,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTitle("");
    setContent("");
    setRegion("");
    setPostType("UPDATE");
    setOpen(false);
    onCreated();
  }

  if (checked && (!isSignedIn || !company)) {
    return (
      <div className={cn(CARD, "p-4 text-sm text-slate-400")}>
        {isSignedIn
          ? "Lege zuerst ein Firmenprofil an, um Beiträge zu teilen."
          : "Melde dich an, um Beiträge im Netzwerk zu teilen."}
      </div>
    );
  }

  const avatar = (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-800 text-sm font-semibold text-slate-200">
      {company?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
      ) : company ? (
        initials(company.company_name)
      ) : null}
    </span>
  );

  return (
    <div className={cn(CARD, "p-4")}>
      {!open ? (
        <>
          <div className="flex items-center gap-3">
            {avatar}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-11 flex-1 rounded-full border border-slate-700 bg-slate-800/60 px-4 text-left text-sm text-slate-400 transition-colors hover:bg-slate-800"
            >
              Bedarf oder Projekt teilen …
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-1 border-t border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => start("MATERIAL_OFFER")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800/70"
            >
              <Megaphone className="h-4 w-4 text-brand" />
              <span className="hidden sm:inline">Material-Ausschreibung</span>
              <span className="sm:hidden">Ausschreibung</span>
            </button>
            <Link
              href="/delivery-notes"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800/70"
            >
              <ScanLine className="h-4 w-4 text-emerald" />
              <span className="hidden sm:inline">Lieferschein-Scan</span>
              <span className="sm:hidden">Scan</span>
            </Link>
            <button
              type="button"
              onClick={() => start("PROJECT")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800/70"
            >
              <Newspaper className="h-4 w-4 text-sky-400" />
              <span className="hidden sm:inline">Projekt-News</span>
              <span className="sm:hidden">Projekt</span>
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-3">
            {avatar}
            <span className="text-sm font-semibold text-slate-100">
              {company?.company_name}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-800"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel (optional)"
            className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-brand/50"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Teile ein Update, ein Material-Angebot oder eine Ausschreibung …"
            rows={4}
            autoFocus
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-brand/50"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand/50"
            >
              {Object.entries(POST_TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand/50"
            >
              <option value="">Region (optional)</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !content.trim()}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Beitrag teilen
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-400">Fehler: {error}</p>}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Post-Karte                                                                */
/* -------------------------------------------------------------------------- */

function EngagementButton({
  icon: Icon,
  label,
  active,
  accent,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  active?: boolean;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition-colors hover:bg-slate-800/70",
        active ? accent : "text-slate-400",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const c = post.companies;
  const name = c?.company_name ?? "Unbekannte Firma";
  const [liked, setLiked] = useState(false);
  const likeCount = post.likes_count + (liked ? 1 : 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.24), ease: "easeOut" }}
      className={cn(CARD, "p-5 hover:border-brand/40")}
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/company/${post.company_id}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-800 text-sm font-semibold text-slate-200"
        >
          {c?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/company/${post.company_id}`}
              className="truncate font-semibold text-slate-100 hover:text-brand"
            >
              {name}
            </Link>
            {c?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {c?.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {c.city}
              </span>
            )}
            <span>· {timeAgo(post.created_at)}</span>
          </div>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-brand/15 px-2.5 py-0.5 text-[11px] font-medium text-brand">
          {POST_TYPES[post.post_type]?.label ?? post.post_type}
        </span>
      </div>

      {post.title && <h3 className="mt-3 font-semibold text-slate-50">{post.title}</h3>}
      <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">
        {post.content}
      </p>

      {post.media_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.media_url} alt="" className="mt-3 max-h-96 w-full rounded-xl object-cover" />
      )}

      {post.region && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-400">
          <MapPin className="h-3 w-3" />
          {post.region}
        </div>
      )}

      {/* Social-Engagement-Bar */}
      <div className="mt-4 flex items-center gap-1 border-t border-slate-800 pt-2">
        <EngagementButton
          icon={Heart}
          label={likeCount > 0 ? `Gefällt mir · ${likeCount}` : "Gefällt mir"}
          active={liked}
          accent="text-rose-400"
          onClick={() => setLiked((v) => !v)}
        />
        <EngagementButton icon={MessageCircle} label="Kommentar" />
        <EngagementButton icon={Layers} label="Bündel beitreten" accent="text-brand" />
        <EngagementButton icon={Share2} label="Teilen" />
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feed                                                                      */
/* -------------------------------------------------------------------------- */

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === o.key
              ? "bg-brand text-white"
              : "border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={cn(CARD, "animate-pulse p-5")}>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-slate-800" />
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-slate-800" />
          <div className="h-2.5 w-24 rounded bg-slate-800" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-800" />
        <div className="h-3 w-3/4 rounded bg-slate-800" />
      </div>
    </div>
  );
}

export default function NetworkFeed() {
  const supabase = useSupabaseBrowser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState("ALL");
  const [type, setType] = useState("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase
      .from("network_posts")
      .select(
        "id, post_type, title, content, region, media_url, likes_count, created_at, company_id, companies(company_name, city, verified, logo_url)",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (region !== "ALL") q = q.eq("region", region);
    if (type !== "ALL") q = q.eq("post_type", type);

    const { data, error } = await q;
    if (error) {
      setError(error.message);
      setPosts([]);
    } else {
      setPosts((data ?? []) as unknown as Post[]);
    }
    setLoading(false);
  }, [supabase, region, type]);

  useEffect(() => {
    load();
  }, [load]);

  const typeOptions = [
    { key: "ALL", label: "Alle" },
    ...Object.entries(POST_TYPES).map(([k, v]) => ({ key: k, label: v.label })),
  ];
  const regionOptions = [
    { key: "ALL", label: "Alle Regionen" },
    ...REGIONS.map((r) => ({ key: r, label: r })),
  ];

  return (
    <div className="space-y-4">
      <Composer onCreated={load} />

      <div className="space-y-2">
        <ChipRow options={typeOptions} value={type} onChange={setType} />
        <ChipRow options={regionOptions} value={region} onChange={setRegion} />
      </div>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Feed konnte nicht geladen werden.</p>
            <p className="mt-0.5 text-rose-300/80">{error}</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className={cn(CARD, "border-dashed py-12 text-center text-sm text-slate-400")}>
          Noch keine Beiträge — sei die erste Firma, die etwas teilt.
        </div>
      ) : (
        posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
      )}
    </div>
  );
}
