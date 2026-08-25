"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Heart,
  BadgeCheck,
  MapPin,
  Loader2,
  AlertTriangle,
  PenSquare,
  Send,
  X,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Konfiguration                                                              */
/* -------------------------------------------------------------------------- */

const REGIONS = ["Zürich", "Bern", "Nordwestschweiz", "Innerschweiz"] as const;

const POST_TYPES: Record<string, { label: string }> = {
  UPDATE: { label: "Update" },
  JOB: { label: "Stellen" },
  MATERIAL_OFFER: { label: "Material-Angebot" },
  PROJECT: { label: "Projekt" },
  ANNOUNCEMENT: { label: "Ankündigung" },
};

/* -------------------------------------------------------------------------- */
/*  Typen                                                                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Filter-Chips                                                               */
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
              : "border border-white/10 bg-white/5 text-slate-400 hover:text-slate-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Composer                                                                   */
/* -------------------------------------------------------------------------- */

function Composer({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyChecked, setCompanyChecked] = useState(false);

  const [postType, setPostType] = useState("UPDATE");
  const [region, setRegion] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eigene Firma ermitteln (für company_id beim Insert)
  useEffect(() => {
    if (!isSignedIn || !userId) {
      setCompanyChecked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("companies")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      if (!cancelled) {
        setCompanyId((data as { id: string } | null)?.id ?? null);
        setCompanyChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId, supabase]);

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        Melde dich an, um Beiträge im Netzwerk zu teilen.
      </div>
    );
  }

  if (companyChecked && !companyId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        Lege zuerst ein Firmenprofil an, um Beiträge zu veröffentlichen.
      </div>
    );
  }

  async function submit() {
    if (!content.trim() || !companyId) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("network_posts").insert({
      company_id: companyId,
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-slate-400 transition-colors hover:bg-white/[0.08]"
      >
        <PenSquare className="h-5 w-5 text-brand" />
        Was gibt&apos;s Neues in deinem Betrieb?
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-100">
          Neuer Beitrag
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10"
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
        className="mb-2 w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand/50 focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Teile ein Update, ein Material-Angebot oder eine Ausschreibung …"
        rows={4}
        className="w-full resize-none rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand/50 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="rounded-lg border border-white/10 bg-navy-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-brand/50 focus:outline-none"
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
          className="rounded-lg border border-white/10 bg-navy-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-brand/50 focus:outline-none"
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
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Veröffentlichen
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-400">Fehler: {error}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Post-Karte                                                                 */
/* -------------------------------------------------------------------------- */

function PostCard({ post }: { post: Post }) {
  const c = post.companies;
  const name = c?.company_name ?? "Unbekannte Firma";
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy-800 text-sm font-semibold text-slate-200">
          {c?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo_url}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(name)
          )}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-slate-100">{name}</span>
            {c?.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-emerald" />
            )}
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

      {post.title && (
        <h3 className="mt-3 font-semibold text-slate-50">{post.title}</h3>
      )}
      <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-300">
        {post.content}
      </p>

      {post.media_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.media_url}
          alt=""
          className="mt-3 max-h-96 w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4" />
          {post.likes_count}
        </span>
        {post.region && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {post.region}
          </span>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feed                                                                       */
/* -------------------------------------------------------------------------- */

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

  const regionOptions = [
    { key: "ALL", label: "Alle Regionen" },
    ...REGIONS.map((r) => ({ key: r, label: r })),
  ];
  const typeOptions = [
    { key: "ALL", label: "Alle" },
    ...Object.entries(POST_TYPES).map(([k, v]) => ({ key: k, label: v.label })),
  ];

  return (
    <div className="space-y-4">
      <Composer onCreated={load} />

      <div className="space-y-2">
        <ChipRow options={typeOptions} value={type} onChange={setType} />
        <ChipRow options={regionOptions} value={region} onChange={setRegion} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Feed wird geladen …
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Feed konnte nicht geladen werden.</p>
            <p className="mt-0.5 text-rose-300/80">{error}</p>
            <p className="mt-1 text-xs text-rose-300/60">
              Ist die Migration <code>02_network_schema.sql</code> in Supabase
              ausgeführt?
            </p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-12 text-center text-sm text-slate-400">
          Noch keine Beiträge — sei die erste Firma, die etwas teilt.
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
