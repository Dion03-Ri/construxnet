"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Package,
  Newspaper,
  ImageIcon,
  Send,
  X,
  MoreHorizontal,
  Building2,
  HelpCircle,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import RecommendedPartners from "@/components/feed/RecommendedPartners";
import { SAMPLE_POSTS, type MockPost } from "@/data/feedMock";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

const REGIONS = ["Zürich", "Bern", "Nordwestschweiz", "Innerschweiz"] as const;

/** Beiträge pro Nachlade-Schritt im Feed. */
const PAGE_SIZE = 4;

// Alle Kantone, nach Grossregion gruppiert — für die Region-Auswahl im Composer.
const CANTON_GROUPS: { group: string; cantons: string[] }[] = [
  { group: "Zürich", cantons: ["Zürich"] },
  { group: "Espace Mittelland", cantons: ["Bern", "Freiburg", "Solothurn", "Neuenburg", "Jura"] },
  { group: "Nordwestschweiz", cantons: ["Basel-Stadt", "Basel-Landschaft", "Aargau"] },
  { group: "Ostschweiz", cantons: ["St. Gallen", "Thurgau", "Appenzell A.Rh.", "Appenzell I.Rh.", "Glarus", "Schaffhausen", "Graubünden"] },
  { group: "Zentralschweiz", cantons: ["Luzern", "Uri", "Schwyz", "Obwalden", "Nidwalden", "Zug"] },
  { group: "Genferseeregion", cantons: ["Waadt", "Wallis", "Genf"] },
  { group: "Tessin", cantons: ["Tessin"] },
];

const POST_TYPES: Record<string, { label: string }> = {
  UPDATE: { label: "Update" },
  JOB: { label: "Stellen" },
  MATERIAL_OFFER: { label: "Material-Angebot" },
  PROJECT: { label: "Projekt" },
  ANNOUNCEMENT: { label: "Ankündigung" },
  QUESTION: { label: "Frage" },
};

/** Die drei Arten, die im Composer angeboten werden. */
const COMPOSER_TYPES = [
  { key: "UPDATE", label: "Update", icon: Newspaper, placeholder: "Was gibt es Neues in deinem Betrieb?" },
  { key: "PROJECT", label: "Projekt", icon: Building2, placeholder: "Erzähl von deinem Projekt — Ort, Umfang, Besonderheiten …" },
  { key: "QUESTION", label: "Frage", icon: HelpCircle, placeholder: "Was möchtest du die Branche fragen?" },
] as const;

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
  const [image, setImage] = useState<string | null>(null); // Vorschau (Data-URL)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }
  function clearImage() {
    setImage(null);
    setImageFile(null);
    if (imgRef.current) imgRef.current.value = "";
  }

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

  const activeType = COMPOSER_TYPES.find((t) => t.key === postType) ?? COMPOSER_TYPES[0];

  async function submit() {
    if (!content.trim() || !company) return;
    setSubmitting(true);
    setError(null);

    // Bild (optional) in den Storage laden; scheitert es (kein Bucket), posten wir ohne Bild.
    let media_url: string | null = null;
    if (imageFile) {
      try {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${company.id}/${Date.now()}.${ext}`;
        const up = await supabase.storage.from("post-media").upload(path, imageFile, { upsert: true });
        if (!up.error) {
          media_url = supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
        }
      } catch {
        /* Storage nicht verfügbar — Beitrag ohne Bild */
      }
    }

    const { error } = await supabase.from("network_posts").insert({
      company_id: company.id,
      post_type: postType,
      title: title.trim() || null,
      content: content.trim(),
      region: region || null,
      media_url,
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
    clearImage();
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

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {!open ? (
        <div className="p-4">
          <div className="flex items-center gap-3">
            {avatar}
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={!company}
              className="h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-500 transition-colors hover:border-brand/40 hover:bg-white disabled:opacity-60"
            >
              {company ? "Beitrag hinzufügen …" : "Firmenprofil nötig, um zu posten"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-3">
            {COMPOSER_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => start(t.key)}
                disabled={!company}
                className="inline-flex items-center justify-center gap-2 rounded-md px-2 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                <t.icon className="h-4 w-4 text-brand" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Kopf mit Art-Auswahl */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">{company?.company_name}</div>
              <div className="text-[11.5px] text-slate-400">Beitrag hinzufügen</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pt-3">
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
              {COMPOSER_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPostType(t.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    postType === t.key ? "bg-navy-900 text-white" : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel (optional)"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none focus:border-brand/50"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={activeType.placeholder}
              rows={5}
              autoFocus
              className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/50"
            />

            {image ? (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Vorschau" className="max-h-80 w-full object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label="Bild entfernen"
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-navy-900/70 text-white transition-colors hover:bg-navy-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imgRef.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-3 text-[13px] font-medium text-slate-500 transition-colors hover:border-brand hover:text-brand"
              >
                <ImageIcon className="h-4 w-4" /> Bild hinzufügen
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-brand/50"
            >
              <option value="">Region / Kanton (optional)</option>
              {CANTON_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.cantons.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !content.trim()}
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Teilen
            </button>
          </div>
          {error && <p className="px-4 pb-3 text-xs text-rose-500">Fehler: {error}</p>}
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

      {post.media_url ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media_url} alt={post.title ?? name} className="max-h-96 w-full object-cover" />
        </div>
      ) : post.gradient ? (
        <div className={cn("mt-3 flex h-44 items-center justify-center rounded-lg bg-gradient-to-br", post.gradient)}>
          <Package className="h-10 w-10 text-white/70" />
        </div>
      ) : null}

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState("ALL");
  const [type, setType] = useState("ALL");

  // Endloses Nachladen: Seite für Seite, wie im LinkedIn-Feed.
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (page: number) => {
      const from = page * PAGE_SIZE;
      let q = supabase
        .from("network_posts")
        .select(
          "id, post_type, title, content, region, media_url, likes_count, created_at, company_id, companies(company_name, city, verified, logo_url)",
        )
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (region !== "ALL") q = q.eq("region", region);
      if (type !== "ALL") q = q.eq("post_type", type);
      return q;
    },
    [supabase, region, type],
  );

  /** Erste Seite laden (auch nach Filterwechsel oder eigenem Beitrag). */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    pageRef.current = 0;

    const { data, error } = await fetchPage(0);
    if (error) {
      setError(error.message);
      setPosts([]);
      setHasMore(false);
    } else {
      const rows = (data ?? []) as unknown as Post[];
      if (rows.length === 0 && region === "ALL" && type === "ALL") {
        // Noch keine echten Beiträge — Beispiele zeigen, erste Seite davon.
        setPosts(SAMPLE_POSTS.slice(0, PAGE_SIZE));
        setIsDemo(true);
        setHasMore(SAMPLE_POSTS.length > PAGE_SIZE);
      } else {
        setPosts(rows.map((r) => ({ ...r, comments_count: r.comments_count ?? 0 })));
        setIsDemo(false);
        setHasMore(rows.length === PAGE_SIZE);
      }
    }
    setLoading(false);
  }, [fetchPage, region, type]);

  /** Nächste Seite anhängen, sobald der Nutzer ans Ende scrollt. */
  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    if (isDemo) {
      const slice = SAMPLE_POSTS.slice(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE);
      setPosts((prev) => [...prev, ...slice]);
      setHasMore((nextPage + 1) * PAGE_SIZE < SAMPLE_POSTS.length);
      pageRef.current = nextPage;
      setLoadingMore(false);
      return;
    }

    const { data, error } = await fetchPage(nextPage);
    if (!error) {
      const rows = (data ?? []) as unknown as Post[];
      setPosts((prev) => [...prev, ...rows.map((r) => ({ ...r, comments_count: r.comments_count ?? 0 }))]);
      setHasMore(rows.length === PAGE_SIZE);
      pageRef.current = nextPage;
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [fetchPage, hasMore, isDemo, loading, loadingMore]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore]);

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
      <Composer onCreated={load} />

      {/* Empfohlene Partner für die Beschaffung */}
      <RecommendedPartners />

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

      {/* Nachlade-Bereich */}
      {!loading && !error && posts.length > 0 && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px" />
          {loadingMore && <SkeletonCard />}
          {!hasMore && (
            <p className="py-6 text-center text-[12.5px] text-slate-400">
              Du bist auf dem neuesten Stand.
            </p>
          )}
        </>
      )}
    </div>
  );
}
