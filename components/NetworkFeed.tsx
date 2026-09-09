"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  BadgeCheck,
  MapPin,
  Loader2,
  AlertTriangle,
  Newspaper,
  ImageIcon,
  Send,
  X,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Flag,
  Check,
  Building2,
  HelpCircle,
  Boxes,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";
import { SAMPLE_POSTS, type MockPost } from "@/data/feedMock";
import PostActions from "@/components/feed/PostActions";

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

/** Die Arten, die im Composer angeboten werden. */
const COMPOSER_TYPES = [
  { key: "MATERIAL_OFFER", label: "Kapazität", icon: Boxes, placeholder: "Was hast du frei — Material, Menge, Lieferradius?" },
  { key: "PROJECT", label: "Projekt", icon: Building2, placeholder: "Erzähl von deinem Projekt — Ort, Umfang, Besonderheiten …" },
  { key: "QUESTION", label: "Frage", icon: HelpCircle, placeholder: "Was möchtest du die Branche fragen?" },
  { key: "UPDATE", label: "Update", icon: Newspaper, placeholder: "Was gibt es Neues in deinem Betrieb?" },
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

/**
 * Was hochgeladen werden darf. Dieselbe Liste steht serverseitig am
 * Bucket (Migration 20) — hier nur, damit der Nutzer es sofort erfährt
 * statt erst nach dem Absenden.
 */
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // Sofort prüfen statt beim Absenden: sonst verschwindet ein
    // HEIC-Foto vom iPhone kommentarlos aus dem Beitrag.
    if (!IMAGE_EXT[f.type]) {
      setImageError("Nur JPG, PNG, WebP oder GIF — dieses Format wird nicht unterstützt.");
      if (imgRef.current) imgRef.current.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setImageError("Das Bild ist grösser als 5 MB.");
      if (imgRef.current) imgRef.current.value = "";
      return;
    }
    setImageError(null);
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }
  function clearImage() {
    setImage(null);
    setImageFile(null);
    setImageError(null);
    if (imgRef.current) imgRef.current.value = "";
  }

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    let cancelled = false;
    (async () => {
      const myId = await fetchMyCompanyId(supabase);
      if (!myId) {
        if (!cancelled) setCompany(null);
        return;
      }
      const { data } = await supabase
        .from("companies")
        .select("id, company_name, logo_url")
        .eq("id", myId)
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
        // Endung aus dem Dateityp, nicht aus dem Dateinamen: sonst landet
        // über einen manipulierten Namen eine .html im öffentlich
        // erreichbaren Bucket.
        const ext = IMAGE_EXT[imageFile.type];
        if (!ext) throw new Error("Nicht unterstütztes Bildformat.");
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
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white/[0.72]">
      {company?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
      ) : company ? (
        initials(company.company_name)
      ) : (
        <ImageIcon className="h-5 w-5 text-white/[0.56]" />
      )}
    </span>
  );

  return (
    <div className={open ? "border-t border-white/[0.12] pt-5" : undefined}>
      {!open ? (
        /* Geschlossen ist der Composer kein Kasten mehr, sondern eine Zeile
           in der Überschrift der News: „Neu in der Branche" links, rechts
           die Arten, die man selber melden kann. Der Avatar und das leere
           Eingabefeld sagten nichts, was man nicht ohnehin weiss, und
           kosteten die Höhe eines halben Beitrags. */
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-white/[0.12] pb-3">
          <h2 className="mr-auto text-[15px] font-bold tracking-tight text-white">Neu in der Branche</h2>
          <span className="text-[12px] text-white/[0.56]">
            {company ? "selber melden:" : "Firmenprofil nötig, um zu melden"}
          </span>
          <Link
            href="/beschaffung"
            className="text-[12.5px] font-semibold text-white/[0.72] transition-colors hover:text-brand"
          >
            Bedarf
          </Link>
          {COMPOSER_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => start(t.key)}
              disabled={!company}
              className="text-[12.5px] font-semibold text-white/[0.72] transition-colors hover:text-brand disabled:opacity-40"
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Kopf mit Art-Auswahl */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{company?.company_name}</div>
              <div className="text-[11.5px] text-white/[0.56]">Beitrag hinzufügen</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-white/[0.56] transition-colors hover:bg-white/[0.07] hover:text-white/[0.72]"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pt-3">
            <div className="inline-flex items-center gap-x-5">
              {COMPOSER_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPostType(t.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 border-b-2 pb-1 text-[13px] font-semibold transition-colors",
                    postType === t.key
                      ? "border-brand text-white"
                      : "border-transparent text-white/[0.56] hover:text-white",
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
              className="w-full rounded-md border border-white/[0.12] bg-[#16181a] px-3 py-2 text-sm font-semibold text-white placeholder:font-normal placeholder:text-white/[0.56] outline-none focus:border-brand/50"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={activeType.placeholder}
              rows={5}
              autoFocus
              className="mt-2 w-full resize-none rounded-md border border-white/[0.12] bg-[#16181a] px-3 py-2 text-sm text-white placeholder:text-white/[0.56] outline-none focus:border-brand/50"
            />

            {imageError && (
              <p className="mt-2 text-[12.5px] font-medium text-rose-300">{imageError}</p>
            )}

            {image ? (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-white/[0.12]">
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
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.16] bg-white/[0.03] py-3 text-[13px] font-medium text-white/[0.72] transition-colors hover:border-brand hover:text-brand"
              >
                <ImageIcon className="h-4 w-4" /> Bild hinzufügen
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onImage} />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="select-dark rounded-md border border-white/[0.12] bg-[#16181a] px-2.5 py-1.5 text-xs text-white/[0.72] outline-none focus:border-brand/50"
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
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand/100 disabled:cursor-not-allowed disabled:opacity-50"
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


/**
 * Das Menue am Beitrag.
 *
 * Der Knopf stand vorher da und tat nichts — kein `onClick`, kein Inhalt.
 * Ein Bedienelement, das sich nicht bedienen laesst, ist schlimmer als
 * keines: man drueckt darauf und zweifelt an der Seite, nicht am Knopf.
 *
 * Jetzt stehen darin nur Dinge, die es wirklich gibt. Beim eigenen
 * Beitrag das Loeschen — zweistufig, weil ein Loeschen ohne Rueckfrage
 * einen Fehlgriff nicht verzeiht. Bei fremden Beitraegen der Weg zur
 * Firma: anschreiben oder Profil ansehen. Was es nicht gibt (melden,
 * stummschalten, bearbeiten), steht auch nicht drin.
 */
const MELDEGRUENDE: { key: string; label: string }[] = [
  { key: "SPAM", label: "Werbung oder Spam" },
  { key: "FALSCH", label: "Falsche Angaben" },
  { key: "BELEIDIGEND", label: "Beleidigend" },
  { key: "ANDERES", label: "Etwas anderes" },
];

function PostMenu({
  eigener,
  companyId,
  postId,
  meineFirma,
  demo,
  onLoeschen,
  loeschend,
}: {
  eigener: boolean;
  companyId: string;
  postId: string;
  meineFirma: string | null;
  demo: boolean;
  onLoeschen: () => void;
  loeschend: boolean;
}) {
  const supabase = useSupabaseBrowser();
  const [offen, setOffen] = useState(false);
  const [sicher, setSicher] = useState(false);
  const [meldeschritt, setMeldeschritt] = useState(false);
  const [gemeldet, setGemeldet] = useState(false);
  const [sendend, setSendend] = useState<string | null>(null);
  const huelle = useRef<HTMLDivElement>(null);

  async function melden(grund: string) {
    setSendend(grund);
    if (!demo && meineFirma) {
      const { error } = await supabase
        .from("post_reports")
        .insert({ post_id: postId, reporter_company_id: meineFirma, reason: grund });
      // 23505: schon gemeldet. Fuer den Meldenden ist das dasselbe Ergebnis
      // wie eine neue Meldung — die Meldung liegt vor.
      if (error && error.code !== "23505") {
        setSendend(null);
        return;
      }
    }
    setSendend(null);
    setGemeldet(true);
  }

  useEffect(() => {
    if (!offen) return;
    function aus(e: MouseEvent) {
      if (huelle.current && !huelle.current.contains(e.target as Node)) setOffen(false);
    }
    function taste(e: KeyboardEvent) {
      if (e.key === "Escape") setOffen(false);
    }
    document.addEventListener("mousedown", aus);
    document.addEventListener("keydown", taste);
    return () => {
      document.removeEventListener("mousedown", aus);
      document.removeEventListener("keydown", taste);
    };
  }, [offen]);

  // Zugeklappt faengt die Rueckfrage wieder von vorne an.
  useEffect(() => {
    if (!offen) {
      setSicher(false);
      setMeldeschritt(false);
    }
  }, [offen]);

  const eintrag =
    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] transition-colors";

  return (
    <div ref={huelle} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOffen((v) => !v)}
        aria-label="Optionen zum Beitrag"
        aria-expanded={offen}
        className={cn(
          "rounded-lg p-1 transition-colors",
          offen ? "bg-white/[0.08] text-white" : "text-white/[0.5] hover:text-white/[0.72]",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {offen && (
        <div className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-xl border border-white/[0.12] bg-[#16181a] py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
          {eigener ? (
            sicher ? (
              <>
                <div className="px-3.5 pb-1.5 pt-2 text-[12px] leading-snug text-white/[0.72]">
                  Beitrag endgültig löschen?
                </div>
                <button
                  type="button"
                  onClick={onLoeschen}
                  disabled={loeschend}
                  className={cn(eintrag, "font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50")}
                >
                  {loeschend ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Ja, löschen
                </button>
                <button
                  type="button"
                  onClick={() => setSicher(false)}
                  className={cn(eintrag, "text-white/[0.72] hover:bg-white/[0.06] hover:text-white")}
                >
                  Abbrechen
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setSicher(true)}
                className={cn(eintrag, "text-rose-300 hover:bg-rose-500/10")}
              >
                <Trash2 className="h-4 w-4" /> Beitrag löschen
              </button>
            )
          ) : (
            <>
              {/* „Firmenprofil ansehen" stand hier auch — und war ueberfluessig:
                  Name und Zeichen im Kopf des Beitrags fuehren schon dorthin. */}
              <Link
                href={`/messages?to=${companyId}`}
                onClick={() => setOffen(false)}
                className={cn(eintrag, "text-white/[0.72] hover:bg-white/[0.06] hover:text-white")}
              >
                <MessageSquare className="h-4 w-4" /> Firma anschreiben
              </Link>

              {gemeldet ? (
                <div className={cn(eintrag, "text-white/[0.56]")}>
                  <Check className="h-4 w-4 text-brand" /> Gemeldet — danke
                </div>
              ) : meldeschritt ? (
                <>
                  <div className="px-3.5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-white/[0.56]">
                    Warum?
                  </div>
                  {MELDEGRUENDE.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => melden(g.key)}
                      disabled={sendend !== null}
                      className={cn(eintrag, "text-white/[0.72] hover:bg-white/[0.06] hover:text-white disabled:opacity-50")}
                    >
                      {sendend === g.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4" />}
                      {g.label}
                    </button>
                  ))}
                </>
              ) : meineFirma ? (
                <button
                  type="button"
                  onClick={() => setMeldeschritt(true)}
                  className={cn(eintrag, "text-white/[0.72] hover:bg-white/[0.06] hover:text-white")}
                >
                  <Flag className="h-4 w-4" /> Beitrag melden
                </button>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  index,
  meineFirma,
  onGeloescht,
  demo,
  gelikt,
  onLike,
  onKommentarAnzahl,
}: {
  post: Post;
  index: number;
  meineFirma: string | null;
  onGeloescht: (id: string) => void;
  demo: boolean;
  gelikt: boolean;
  onLike: (jetzt: boolean) => void;
  onKommentarAnzahl: (delta: number) => void;
}) {
  const c = post.companies;
  const name = c?.company_name ?? "Unbekannte Firma";
  const supabase = useSupabaseBrowser();
  const [expanded, setExpanded] = useState(false);
  const [loeschend, setLoeschend] = useState(false);
  const eigener = meineFirma !== null && meineFirma === post.company_id;

  async function loeschen() {
    setLoeschend(true);
    // Im Demo-Feed gibt es keine Zeile in der Datenbank — dort verschwindet
    // der Beitrag nur aus der Ansicht.
    if (!demo) {
      const { error } = await supabase.from("network_posts").delete().eq("id", post.id);
      if (error) {
        setLoeschend(false);
        return;
      }
    }
    onGeloescht(post.id);
  }

  const LIMIT = 220;
  const isLong = post.content.length > LIMIT;
  const shown = isLong && !expanded ? post.content.slice(0, LIMIT).trimEnd() + "…" : post.content;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.24), ease: "easeOut" }}
      className="border-t border-white/[0.12] py-6"
    >
      {/* Kopfzeile eines Beitrags.

          Die Art des Beitrags stand rechts als gefuellte Goldpille — auf
          jedem Beitrag, in der lautesten Farbe der Seite. Auf dem Handy
          drueckte sie ausserdem Ort und Zeit in drei Zeilen. Jetzt steht
          sie als erstes Wort der Kennzeile, genau wie die Phase in der
          Bündelliste. */}
      <div className="flex items-start gap-3">
        <Link
          href={`/company/${post.company_id}`}
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
            <Link href={`/company/${post.company_id}`} className="truncate font-semibold text-white hover:text-brand">
              {name}
            </Link>
            {c?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-white/[0.56]">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.5]">
              {POST_TYPES[post.post_type]?.label ?? post.post_type}
            </span>
            {c?.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {c.city}
              </span>
            )}
            <span>{timeAgo(post.created_at)}</span>
            {post.region && post.region !== c?.city && <span>{post.region}</span>}
          </div>
        </div>
        <PostMenu
          eigener={eigener}
          companyId={post.company_id}
          postId={post.id}
          meineFirma={meineFirma}
          demo={demo}
          onLoeschen={loeschen}
          loeschend={loeschend}
        />
      </div>

      {post.title && <h3 className="mt-3 font-semibold text-white">{post.title}</h3>}
      <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-white/[0.72]">
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

      {/* Nur ein echtes, hochgeladenes Bild. Vorher stand hier bei
          Beitraegen ohne Bild eine Flaeche mit Farbverlauf und einem
          Paket-Symbol in der Mitte — ein erzeugtes Motiv, das nichts
          zeigt. Ein Beitrag ohne Bild hat jetzt kein Bild. */}
      {/* Das Bild wird nicht beschnitten, sondern verkleinert.

          Vorher stand hier ein Ausschnitt auf Breitformat: ein
          quadratisches Foto verlor damit oben und unten je ein Viertel. Was
          jemand hochlaedt, soll ganz zu sehen sein — ein Lieferschein oder
          ein Werkfoto ist ohne seine Raender oft wertlos.

          Stattdessen behaelt das Bild sein Seitenverhaeltnis und wird an
          der laengeren Seite begrenzt: hoechstens 420 px hoch, hoechstens
          so breit wie die Spalte. Ein Quadrat erscheint als 420 x 420 und
          nimmt damit weniger Platz als eine beschnittene Zeile ueber die
          volle Breite; ein Breitformat wird von der Spalte begrenzt, ein
          Hochformat von der Hoehe.

          Die Haarlinie steht dort, weil ein helles Bild sonst ohne Kante
          in den schwarzen Grund laeuft. */}
      {post.media_url && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media_url}
            alt={post.title ?? name}
            className="max-h-[420px] w-auto max-w-full rounded-lg border border-white/[0.12] object-contain"
          />
        </div>
      )}

      <PostActions
        postId={post.id}
        autorId={post.company_id}
        titel={post.title ?? name}
        text={post.content}
        likes={post.likes_count}
        kommentare={post.comments_count}
        gelikt={gelikt}
        meineFirma={meineFirma}
        demo={demo}
        onLike={onLike}
        onKommentarAnzahl={onKommentarAnzahl}
      />
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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "border-b-2 pb-0.5 text-[12.5px] font-semibold transition-colors",
            value === o.key
              ? "border-brand text-white"
              : "border-transparent text-white/[0.56] hover:text-white",
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
    <div className="animate-pulse border-t border-white/[0.12] py-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="h-2.5 w-24 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-white/10" />
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
  /* Fuer das Menue am Beitrag: nur beim eigenen Beitrag steht dort das
     Loeschen. */
  const [meineFirma, setMeineFirma] = useState<string | null>(null);
  /* Welche der geladenen Beitraege die eigene Firma schon mit einer
     Reaktion versehen hat. In einer Abfrage fuer alle sichtbaren
     Beitraege — eine je Beitrag waeren zwanzig Abfragen fuer eine
     Bildschirmseite. */
  const [meineLikes, setMeineLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    let abgebrochen = false;
    fetchMyCompanyId(supabase).then((id) => {
      if (!abgebrochen) setMeineFirma(id ?? null);
    }, () => undefined);
    return () => {
      abgebrochen = true;
    };
  }, [supabase]);

  const entfernen = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const likeSetzen = useCallback((id: string, jetzt: boolean) => {
    setMeineLikes((prev) => {
      const n = new Set(prev);
      if (jetzt) n.add(id);
      else n.delete(id);
      return n;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes_count: Math.max(0, p.likes_count + (jetzt ? 1 : -1)) } : p,
      ),
    );
  }, []);

  const kommentarAnzahl = useCallback((id: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, comments_count: Math.max(0, p.comments_count + delta) } : p,
      ),
    );
  }, []);

  useEffect(() => {
    if (!meineFirma || isDemo || posts.length === 0) return;
    let abgebrochen = false;
    const ids = posts.map((p) => p.id);
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("company_id", meineFirma)
      .in("post_id", ids)
      .then(({ data }) => {
        if (abgebrochen || !data) return;
        setMeineLikes(new Set((data as { post_id: string }[]).map((r) => r.post_id)));
      });
    return () => {
      abgebrochen = true;
    };
  }, [supabase, meineFirma, isDemo, posts]);

  // Endloses Nachladen: Seite für Seite, wie im LinkedIn-Feed.
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (page: number) => {
      const from = page * PAGE_SIZE;
      let q = supabase
        .from("network_posts")
        .select(
          // Der Zusatz „!network_posts_company_id_fkey" ist kein Zierrat:
          // seit `post_likes`, `post_comments` und `post_reports` je einen
          // Schluessel auf `network_posts` UND auf `companies` haben, sieht
          // PostgREST darin Verbindungstabellen und damit mehrere moegliche
          // Wege von einem Beitrag zu einer Firma. Ohne die Angabe, welcher
          // gemeint ist, lehnt es die Abfrage ab.
          "id, post_type, title, content, region, media_url, likes_count, comments_count, created_at, company_id, companies!network_posts_company_id_fkey(company_name, city, verified, logo_url)",
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
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore, posts.length]);

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

      {/* Vorher zwei Reihen mit zusammen zehn Woertern, bevor der erste
          Beitrag kam. Die Art bleibt als Reihe — man waehlt sie oft —, die
          Region wird ein Auswahlfeld: sechsundzwanzig Kantone gehoeren
          nicht als Woerterband auf die Seite. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-4">
        <ChipRow options={typeOptions} value={type} onChange={setType} />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Region"
          className="select-dark shrink-0 rounded-lg border border-white/[0.12] bg-transparent px-2.5 py-1.5 text-[12.5px] text-white/[0.72] outline-none transition-colors hover:border-white/[0.24] focus:border-brand [&>option]:bg-[#16181a] [&>option]:text-white"
        >
          {regionOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isDemo && (
        <p className="px-1 text-[11px] text-white/[0.56]">
          Beispiel-Beiträge — dein erster eigener Beitrag ersetzt diese Vorschau.
        </p>
      )}

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : error ? (
        <div className="flex items-start gap-2 border-l-2 border-rose-400/60 py-2 pl-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Feed konnte nicht geladen werden.</p>
            <p className="mt-0.5 text-rose-300">{error}</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="border-t border-white/[0.12] py-14 text-center text-sm text-white/[0.56]">
          Keine Beiträge in dieser Auswahl.
        </div>
      ) : (
        posts.map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            index={i}
            meineFirma={meineFirma}
            onGeloescht={entfernen}
            demo={isDemo}
            gelikt={meineLikes.has(p.id)}
            onLike={(jetzt) => likeSetzen(p.id, jetzt)}
            onKommentarAnzahl={(d) => kommentarAnzahl(p.id, d)}
          />
        ))
      )}

      {/* Nachlade-Bereich */}
      {!loading && !error && posts.length > 0 && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px" />
          {loadingMore && <SkeletonCard />}
          {!hasMore && (
            <p className="py-6 text-center text-[12.5px] text-white/[0.56]">
              Du bist auf dem neuesten Stand.
            </p>
          )}
        </>
      )}
    </div>
  );
}
