"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { initials, timeAgo } from "@/lib/post";
import { mitGeduld } from "@/lib/supabaseRetry";
import { cn } from "@/lib/utils";

type Kommentar = {
  id: string;
  company_id: string;
  content: string;
  created_at: string;
  companies: { company_name: string; logo_url: string | null } | null;
};

/**
 * Kommentare unter einem Beitrag.
 *
 * Geladen wird erst beim Aufklappen: in einem Feed mit zwanzig Beitraegen
 * waeren zwanzig Abfragen fuer Texte, die niemand aufgeschlagen hat.
 *
 * Loeschen darf, wer den Kommentar geschrieben hat — und wer den Beitrag
 * geschrieben hat. Beides steht so in der Regel der Datenbank; die
 * Anwendung blendet nur aus, was ohnehin abgelehnt wuerde.
 */
export default function PostComments({
  postId,
  autorId,
  meineFirma,
  demo,
  onAnzahl,
}: {
  postId: string;
  autorId: string;
  meineFirma: string | null;
  demo: boolean;
  onAnzahl: (delta: number) => void;
}) {
  const supabase = useSupabaseBrowser();
  const [liste, setListe] = useState<Kommentar[]>([]);
  const [laden, setLaden] = useState(true);
  const [text, setText] = useState("");
  const [sendend, setSendend] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const holen = useCallback(async () => {
    if (demo) {
      setListe([]);
      setLaden(false);
      return;
    }
    const { data, error } = await mitGeduld(() =>
      supabase
        .from("post_comments")
        .select("id, company_id, content, created_at, companies(company_name, logo_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true }),
    );
    if (error) setFehler("Kommentare konnten nicht geladen werden.");
    else setListe((data ?? []) as unknown as Kommentar[]);
    setLaden(false);
  }, [supabase, postId, demo]);

  useEffect(() => {
    holen();
  }, [holen]);

  async function senden() {
    const inhalt = text.trim();
    if (!inhalt || !meineFirma || demo) return;
    setSendend(true);
    setFehler(null);
    const { data, error } = await mitGeduld(() =>
      supabase
        .from("post_comments")
        .insert({ post_id: postId, company_id: meineFirma, content: inhalt })
        .select("id, company_id, content, created_at, companies(company_name, logo_url)")
        .single(),
    );
    setSendend(false);
    if (error || !data) {
      setFehler("Der Kommentar konnte nicht gespeichert werden.");
      return;
    }
    setListe((v) => [...v, data as unknown as Kommentar]);
    setText("");
    onAnzahl(1);
  }

  async function loeschen(id: string) {
    const vorher = liste;
    setListe((v) => v.filter((k) => k.id !== id));
    onAnzahl(-1);
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) {
      setListe(vorher);
      onAnzahl(1);
    }
  }

  return (
    <div className="mt-3 border-t border-white/[0.06] pt-3">
      {laden ? (
        <div className="flex justify-center py-4 text-white/[0.56]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          {liste.length === 0 && (
            <p className="pb-3 text-[13px] text-white/[0.56]">
              {demo
                ? "Beispiel-Beitrag — Kommentare gibt es erst bei echten Beiträgen."
                : "Noch keine Kommentare."}
            </p>
          )}

          <ul className="space-y-3">
            {liste.map((k) => {
              const name = k.companies?.company_name ?? "Unbekannte Firma";
              const darfLoeschen =
                meineFirma !== null && (meineFirma === k.company_id || meineFirma === autorId);
              return (
                <li key={k.id} className="group flex items-start gap-2.5">
                  <Link
                    href={`/company/${k.company_id}`}
                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[11px] font-semibold text-white/[0.72]"
                  >
                    {k.companies?.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={k.companies.logo_url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      initials(name)
                    )}
                  </Link>
                  <div className="min-w-0 flex-1 rounded-xl bg-white/[0.04] px-3.5 py-2.5">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/company/${k.company_id}`} className="truncate text-[13px] font-semibold text-white hover:text-brand">
                        {name}
                      </Link>
                      <span className="shrink-0 text-[11px] text-white/[0.56]">{timeAgo(k.created_at)}</span>
                      {darfLoeschen && (
                        <button
                          type="button"
                          onClick={() => loeschen(k.id)}
                          aria-label="Kommentar löschen"
                          className="ml-auto shrink-0 text-white/[0.4] opacity-0 transition-opacity hover:text-rose-300 focus:opacity-100 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/[0.72]">
                      {k.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {fehler && <p className="mt-2 text-[12px] text-rose-300">{fehler}</p>}

      {meineFirma && !demo ? (
        <div className="mt-3 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter schickt ab, Umschalt+Enter macht eine Zeile.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                senden();
              }
            }}
            rows={1}
            placeholder="Antworten …"
            className="min-h-[40px] flex-1 resize-none rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/[0.56] outline-none focus:border-brand/50"
          />
          <button
            type="button"
            onClick={senden}
            disabled={sendend || !text.trim()}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-navy-950 transition-colors hover:bg-brand-500",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
            aria-label="Kommentar senden"
          >
            {sendend ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      ) : (
        !demo && (
          <p className="mt-3 text-[12.5px] text-white/[0.56]">
            <Link href="/onboarding" className="font-semibold text-brand hover:underline">
              Firmenprofil anlegen
            </Link>{" "}
            , um mitzuschreiben.
          </p>
        )
      )}
    </div>
  );
}
