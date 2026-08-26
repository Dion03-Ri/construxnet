"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Rocket,
  BadgeCheck,
  MapPin,
  Loader2,
  AlertTriangle,
  Megaphone,
  Package,
  Newspaper,
  ImageIcon,
  Send,
  X,
  MoreHorizontal,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { SAMPLE_POSTS, type MockPost } from "@/data/feedMock";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

const REGIONS = ["Zürich", "Bern", "Nordwestschweiz", "Innerschweiz"] as const;

const POST_TYPES: Record<string, { label: string }> = {
  UPDATE: { label: "Update" },
  JOB: { label: "Stellen" },
  MATERIAL_OFFER: { label: "Material-Angebot" },
  PROJECT: { label: "Projekt" },
  ANNOUNCEMENT: { label: "Ankündigung" },
};

type Post = MockPost;

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

  const [postType, setPostType] = useState("UPDATE");
  const [region, setRegion] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, company_name, logo_url")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      if (!cancelled) setCompany((data as typeof company) ?? null);
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

  const avatar = (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
      {company?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
      ) : company ? (
        initials(company.company_name)
      ) : (
        <ImageIcon className="h-5 w-5 text-slate-400" />
      )}
    </span>
  );

  const actions = [
    { key: "MATERIAL_OFFER", label: "Material-Ausschreibung", icon: Megaphone, color: "text-brand", href: "/beschaffung" },
    { key: "PROJECT", label: "Projekt-News", icon: Newspaper, color: "text-accent", onClick: () => start("PROJECT") },
    { key: "POOL", label: "Smart Pool", icon: Package, color: "text-accent", href: "/pools" },
  ];

  return (
    <div className={cn(CARD, "p-4")}>
      {!open ? (
        <>
          <div className="flex items-center gap-3">
            {avatar}
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={!company}
              className="h-11 flex-1 rounded-md border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60"
            >
              {company ? "Bedarf oder Projekt teilen …" : "Firmenprofil nötig, um zu posten"}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-1 border-t border-slate-100 pt-2">
            {actions.map((a) =>
              a.href ? (
                <Link
                  key={a.key}
                  href={a.href}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <a.icon className={cn("h-4 w-4", a.color)} />
                  <span className="hidden sm:inline">{a.label}</span>
                </Link>
              ) : (
                <button
                  key={a.key}
                  type="button"
                  onClick={a.onClick}
                  disabled={!company}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                  <a.icon className={cn("h-4 w-4", a.color)} />
                  <span className="hidden sm:inline">{a.label}</span>
                </button>
              ),
            )}
          </div>
        </>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-3">
            {avatar}
            <span className="text-sm font-semibold text-slate-900">{company?.company_name}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100"
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
            className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/50"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Teile ein Update, ein Material-Angebot oder eine Ausschreibung …"
            rows={4}
            autoFocus
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/50"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-brand/50"
            >
              {Object.entries(POST_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-brand/50"
            >
              <option value="">Region (optional)</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !content.trim()}
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Beitrag teilen
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-500">Fehler: {error}</p>}
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
  href,
}: {
  icon: typeof ThumbsUp;
  label: string;
  active?: boolean;
  accent?: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls = cn(
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition-colors hover:bg-slate-100",
    active ? accent : "text-slate-500",
  );
  const inner = (
    <>
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const c = post.companies;
  const name = c?.company_name ?? "Unbekannte Firma";
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const likeCount = post.likes_count + (liked ? 1 : 0);

  const LIMIT = 220;
  const isLong = post.content.length > LIMIT;
  const shown = isLong && !expanded ? post.content.slice(0, LIMIT).trimEnd() + "…" : post.content;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.24), ease: "easeOut" }}
      className={cn(CARD, "p-4 sm:p-5")}
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/company/${post.company_id}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
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
            <Link href={`/company/${post.company_id}`} className="truncate font-semibold text-slate-900 hover:text-brand">
              {name}
            </Link>
            {c?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {c?.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {c.city}
              </span>
            )}
            <span>· {timeAgo(post.created_at)}</span>
          </div>
        </div>
        <span className={cn("ml-auto shrink-0", badge("gold", true))}>
          {POST_TYPES[post.post_type]?.label ?? post.post_type}
        </span>
        <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Optionen">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {post.title && <h3 className="mt-3 font-semibold text-slate-900">{post.title}</h3>}
      <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
        {shown}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 font-medium text-brand hover:underline"
          >
            {expanded ? "weniger" : "mehr"}
          </button>
        )}
      </p>

      {post.gradient && (
        <div className={cn("mt-3 flex h-44 items-center justify-center rounded-lg bg-gradient-to-br", post.gradient)}>
          <Package className="h-10 w-10 text-white/70" />
        </div>
      )}

      {post.region && (
        <div className={cn("mt-3", badge("slate"))}>
          <MapPin className="h-3 w-3" />
          {post.region}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>{likeCount} Reaktionen</span>
        <span>{post.comments_count} Kommentare</span>
      </div>

      <div className="mt-1 flex items-center gap-1 border-t border-slate-100 pt-1">
        <EngagementButton
          icon={ThumbsUp}
          label="Gefällt mir"
          active={liked}
          accent="text-brand"
          onClick={() => setLiked((v) => !v)}
        />
        <EngagementButton icon={MessageCircle} label="Kommentieren" />
        <EngagementButton icon={Rocket} label="Pool beitreten" accent="text-accent" href="/pools" />
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
    <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.key
              ? "bg-white text-brand shadow-sm"
              : "text-slate-500 hover:text-slate-900",
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
        <div className="h-11 w-11 rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-slate-100" />
          <div className="h-2.5 w-24 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-3/4 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function NetworkFeed() {
  const supabase = useSupabaseBrowser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isDemo, setIsDemo] = useState(false);
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
      const rows = (data ?? []) as unknown as Post[];
      if (rows.length === 0 && region === "ALL" && type === "ALL") {
        setPosts(SAMPLE_POSTS);
        setIsDemo(true);
      } else {
        setPosts(
          rows.map((r) => ({ ...r, comments_count: r.comments_count ?? 0 })),
        );
        setIsDemo(false);
      }
    }
    setLoading(false);
  }, [supabase, region, type]);

  useEffect(() => {
    load();
  }, [load]);

  const typeOptions = [
    { key: "ALL", label: "Alle" },
    { key: "MATERIAL_OFFER", label: "Material-Angebote" },
    { key: "PROJECT", label: "Projekte" },
    { key: "JOB", label: "Stellen" },
    { key: "ANNOUNCEMENT", label: "Ausschreibungen" },
  ];
  const regionOptions = [
    { key: "ALL", label: "Alle Regionen" },
    ...REGIONS.map((r) => ({ key: r, label: r })),
  ];

  return (
    <div className="space-y-3">
      {/* Prominenter Beschaffungs-CTA */}
      <Link
        href="/beschaffung"
        className="flex items-center gap-3 rounded-lg border border-brand/30 bg-gradient-to-r from-brand/10 to-accent/10 p-4 transition-colors hover:border-brand/50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand text-white">
          <Megaphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900">Materialbedarf melden</div>
          <div className="truncate text-[13px] text-slate-500">
            Beton, Stahl, Kies &amp; mehr — optional gebündelt für bis zu 20 % Rabatt.
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white sm:inline-flex">
          Jetzt beschaffen <Rocket className="h-4 w-4" />
        </span>
      </Link>

      <Composer onCreated={load} />

      <div className="space-y-2">
        <ChipRow options={typeOptions} value={type} onChange={setType} />
        <ChipRow options={regionOptions} value={region} onChange={setRegion} />
      </div>

      {isDemo && (
        <p className="px-1 text-[11px] text-slate-400">
          Beispiel-Beiträge — dein erster eigener Beitrag ersetzt diese Vorschau.
        </p>
      )}

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Feed konnte nicht geladen werden.</p>
            <p className="mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className={cn(CARD, "border-dashed py-12 text-center text-sm text-slate-400")}>
          Keine Beiträge in dieser Auswahl.
        </div>
      ) : (
        posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
      )}
    </div>
  );
}
