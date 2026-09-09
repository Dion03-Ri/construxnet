"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageCircle, Rocket, Share2, Mail, Link2, Check } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { postUrl } from "@/lib/post";
import { cn } from "@/lib/utils";
import PostComments from "./PostComments";

function Knopf({
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
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition-colors hover:bg-white/[0.07]",
    active ? accent : "text-white/[0.72]",
  );
  const inner = (
    <>
      <Icon className={cn("h-4 w-4", active && "fill-current")} />
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

/**
 * Die Leiste unter dem Beitrag.
 *
 * Vorher waren hier vier Attrappen: „Gefaellt mir" zaehlte im Browser
 * hoch und war nach dem Neuladen weg, „Kommentieren" und „Teilen" taten
 * gar nichts, und die Zahl darueber kam aus der Beispieldatei.
 *
 * Jetzt liegt die Reaktion in `post_likes` — sichtbar fuer alle, auch fuer
 * den Verfasser —, die Kommentare in `post_comments`, und die Zaehler
 * pflegt die Datenbank selbst.
 */
export default function PostActions({
  postId,
  autorId,
  titel,
  text,
  likes,
  kommentare,
  gelikt,
  meineFirma,
  demo,
  onLike,
  onKommentarAnzahl,
  offeneKommentare,
}: {
  postId: string;
  autorId: string;
  titel: string;
  text: string;
  likes: number;
  kommentare: number;
  gelikt: boolean;
  meineFirma: string | null;
  demo: boolean;
  onLike: (jetztGelikt: boolean) => void;
  onKommentarAnzahl: (delta: number) => void;
  /** Auf der Beitragsseite stehen die Kommentare von Anfang an offen. */
  offeneKommentare?: boolean;
}) {
  const supabase = useSupabaseBrowser();
  const [kommentareOffen, setKommentareOffen] = useState(offeneKommentare ?? false);
  const [teilenOffen, setTeilenOffen] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const [likend, setLikend] = useState(false);
  const huelle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teilenOffen) return;
    function aus(e: MouseEvent) {
      if (huelle.current && !huelle.current.contains(e.target as Node)) setTeilenOffen(false);
    }
    function taste(e: KeyboardEvent) {
      if (e.key === "Escape") setTeilenOffen(false);
    }
    document.addEventListener("mousedown", aus);
    document.addEventListener("keydown", taste);
    return () => {
      document.removeEventListener("mousedown", aus);
      document.removeEventListener("keydown", taste);
    };
  }, [teilenOffen]);

  async function like() {
    if (!meineFirma || likend) return;
    const neu = !gelikt;
    setLikend(true);
    // Zuerst anzeigen, dann schreiben: eine Reaktion, die eine halbe
    // Sekunde ueberlegt, fuehlt sich kaputt an. Geht das Schreiben
    // schief, wird zurueckgedreht.
    onLike(neu);
    if (!demo) {
      const { error } = neu
        ? await supabase.from("post_likes").insert({ post_id: postId, company_id: meineFirma })
        : await supabase.from("post_likes").delete().eq("post_id", postId).eq("company_id", meineFirma);
      // 23505 heisst: lag schon vor. Fuer den Nutzer ist das kein Fehler.
      if (error && error.code !== "23505") onLike(!neu);
    }
    setLikend(false);
  }

  const adresse = postUrl(postId);
  const betreff = titel || "Beitrag auf Obtanet";
  const nachricht = `${betreff}\n\n${text.slice(0, 300)}${text.length > 300 ? "…" : ""}\n\n${adresse}`;

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(adresse);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      /* Zwischenablage verweigert — dann bleiben WhatsApp und E-Mail. */
    }
  }

  async function nativTeilen() {
    if (typeof navigator === "undefined" || !navigator.share) return false;
    try {
      await navigator.share({ title: betreff, text: text.slice(0, 200), url: adresse });
      setTeilenOffen(false);
      return true;
    } catch {
      return true; // abgebrochen ist kein Fehler
    }
  }

  const eintrag =
    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-white/[0.72] transition-colors hover:bg-white/[0.06] hover:text-white";

  return (
    <>
      <div className="mt-3 flex items-center justify-between text-[11px] text-white/[0.56]">
        <span>{likes} {likes === 1 ? "Reaktion" : "Reaktionen"}</span>
        <button
          type="button"
          onClick={() => setKommentareOffen((v) => !v)}
          className="transition-colors hover:text-white/[0.72]"
        >
          {kommentare} {kommentare === 1 ? "Kommentar" : "Kommentare"}
        </button>
      </div>

      <div className="relative mt-1 flex items-center gap-1 border-t border-white/[0.06] pt-1">
        <Knopf
          icon={ThumbsUp}
          label="Gefällt mir"
          active={gelikt}
          accent="text-brand"
          onClick={like}
        />
        <Knopf icon={MessageCircle} label="Kommentieren" onClick={() => setKommentareOffen((v) => !v)} />
        <Knopf icon={Rocket} label="Pool beitreten" accent="text-brand" href="/pools" />

        <div ref={huelle} className="relative flex flex-1">
          <Knopf
            icon={Share2}
            label="Teilen"
            onClick={async () => {
              // Auf dem Handy uebernimmt das System die Auswahl — dort ist
              // die eigene Liste eine schlechtere Kopie davon.
              if (await nativTeilen()) return;
              setTeilenOffen((v) => !v);
            }}
          />
          {teilenOffen && (
            <div className="absolute bottom-full right-0 z-30 mb-1.5 w-56 overflow-hidden rounded-xl border border-white/[0.12] bg-[#16181a] py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(nachricht)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTeilenOffen(false)}
                className={eintrag}
              >
                <Share2 className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(nachricht)}`}
                onClick={() => setTeilenOffen(false)}
                className={eintrag}
              >
                <Mail className="h-4 w-4" /> E-Mail
              </a>
              <button type="button" onClick={kopieren} className={eintrag}>
                {kopiert ? <Check className="h-4 w-4 text-brand" /> : <Link2 className="h-4 w-4" />}
                {kopiert ? "Link kopiert" : "Link kopieren"}
              </button>
            </div>
          )}
        </div>
      </div>

      {kommentareOffen && (
        <PostComments
          postId={postId}
          autorId={autorId}
          meineFirma={meineFirma}
          demo={demo}
          onAnzahl={onKommentarAnzahl}
        />
      )}
    </>
  );
}
