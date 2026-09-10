"use client";

import { useCallback, useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchMyCompanyId } from "@/lib/myCompany";
import { cn } from "@/lib/utils";

/**
 * Konto schliessen.
 *
 * Geschlossen, nicht geloescht. Der Weg ist der von LinkedIn: das Profil
 * verschwindet, die Belege bleiben — Nachrichten, Angebote, Teilnahmen,
 * Gebote. Wer mit dieser Firma verhandelt hat, behaelt seinen Verlauf; in
 * ihm steht dann „Ehemaliges Mitglied". Wuerde die Zeile wirklich
 * geloescht, verloere die Gegenseite ihre eigene Geschichte mit.
 *
 * Zwei Dinge macht dieser Bildschirm bewusst nicht:
 *
 *   Er entscheidet nichts selbst. Ob geschlossen werden darf, sagt die
 *   Datenbank (`close_own_company_account`). Eine Sperre, die der Browser
 *   durchsetzt, ist keine — der Aufruf laesst sich nachbauen. Die Liste
 *   der laufenden Buendel steht hier nur, damit die Absage einen Grund
 *   nennt, nicht damit sie hier faellt.
 *
 *   Er fragt nicht „Sind Sie sicher?". Er verlangt den Firmennamen. Ein
 *   Ja-Nein-Fenster klickt man weg, ohne es gelesen zu haben.
 */

type Bindung = { bundle_id: string; titel: string; bundle_status: string; rolle: string };

const STATUS_WORT: Record<string, string> = {
  OPEN: "sammelt noch",
  SEALED_BIDDING: "Werke bieten verdeckt",
  AWARDED: "vergeben, noch nicht abgeschlossen",
};

export default function KontoSchliessen() {
  const supabase = useSupabaseBrowser();
  const { signOut } = useClerk();

  const [name, setName] = useState<string | null>(null);
  const [bindung, setBindung] = useState<Bindung[]>([]);
  const [laden, setLaden] = useState(true);
  const [offen, setOffen] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const [busy, setBusy] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const holen = useCallback(async () => {
    const id = await fetchMyCompanyId(supabase);
    if (id) {
      const { data } = await supabase.from("companies").select("company_name").eq("id", id).single();
      setName((data as { company_name: string } | null)?.company_name ?? null);
    }
    const { data: b } = await supabase.rpc("meine_bindung");
    setBindung(Array.isArray(b) ? (b as Bindung[]) : []);
    setLaden(false);
  }, [supabase]);

  useEffect(() => {
    void holen();
  }, [holen]);

  async function schliessen() {
    setBusy(true);
    setFehler(null);
    const { error } = await supabase.rpc("close_own_company_account");
    if (error) {
      setFehler(error.message);
      setBusy(false);
      void holen(); // vielleicht ist zwischenzeitlich ein Buendel dazugekommen
      return;
    }
    await signOut({ redirectUrl: "/" });
  }

  const passt = name !== null && eingabe.trim() === name;

  if (laden) return null;

  return (
    <section className="mt-14 max-w-3xl border-t border-white/[0.12] pt-10">
      <h2 className="text-[15px] font-bold tracking-tight text-white">Konto schliessen</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-white/[0.56]">
        Endgültig. Eine geschlossene Firma lässt sich nicht wieder aufmachen.
      </p>

      {bindung.length > 0 ? (
        /* ---------- gebunden: kein Knopf, sondern der Grund ---------- */
        <div className="mt-6">
          <p className="text-[13px] leading-relaxed text-white/[0.72]">
            Geht im Moment nicht. Ein Bündel ist verbindlich — auf deine Menge rechnet ein Werk
            seinen Preis. Erst liefern, dann schliessen.
          </p>
          <ul className="mt-4 border-t border-white/[0.12]">
            {bindung.map((b) => (
              <li
                key={b.bundle_id + b.rolle}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/[0.12] py-3"
              >
                <span className="text-[13px] font-semibold text-white">{b.titel}</span>
                <span className="text-[12px] text-white/[0.56]">
                  {b.rolle} · {STATUS_WORT[b.bundle_status] ?? b.bundle_status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : !offen ? (
        /* ---------- der Weg dorthin, unauffaellig ---------- */
        <button
          type="button"
          onClick={() => setOffen(true)}
          className="mt-5 text-[13px] font-semibold text-white/[0.5] transition-colors hover:text-rose-300"
        >
          Konto schliessen
        </button>
      ) : (
        /* ---------- was passiert, und die Bestaetigung ---------- */
        <div className="mt-6">
          <dl className="grid grid-cols-1 gap-x-10 gap-y-6 border-t border-white/[0.12] pt-6 text-[13px] leading-relaxed sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-white">Weg ist</dt>
              <dd className="mt-1.5 text-white/[0.56]">
                Firmenname, UID, Kontaktangaben, Logo, Standort, Beiträge und Kommentare,
                Verbindungen, Projekte, eigene Materialien, das Abo — und der Zugang.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Bleibt</dt>
              <dd className="mt-1.5 text-white/[0.56]">
                Nachrichten, Angebote, Teilnahmen, Gebote, Verträge und Lieferscheine. Sie gehören
                auch der Gegenseite. Dort steht künftig „Ehemaliges Mitglied“.
              </dd>
            </div>
          </dl>

          {fehler && (
            <p className="mt-6 flex items-start gap-2 border-l-2 border-rose-400/60 py-2 pl-4 text-[13px] text-rose-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {fehler}
            </p>
          )}

          <label className="mt-7 block text-[13px] text-white/[0.72]">
            Tippe zur Bestätigung <b className="font-semibold text-white">{name ?? "den Firmennamen"}</b>.
            <input
              type="text"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 block w-full max-w-sm border-b border-white/[0.24] bg-transparent py-2 text-[14px] text-white outline-none transition-colors placeholder:text-white/[0.32] focus:border-brand"
              placeholder={name ?? ""}
            />
          </label>

          <div className="mt-7 flex items-center gap-6">
            <button
              type="button"
              onClick={schliessen}
              disabled={!passt || busy}
              className={cn(
                "inline-flex items-center gap-2 text-[13px] font-semibold transition-colors",
                passt && !busy
                  ? "text-rose-300 hover:text-rose-200"
                  : "cursor-not-allowed text-white/[0.32]",
              )}
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {busy ? "wird geschlossen …" : "Endgültig schliessen"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOffen(false);
                setEingabe("");
                setFehler(null);
              }}
              disabled={busy}
              className="text-[13px] text-white/[0.5] transition-colors hover:text-white disabled:opacity-50"
            >
              abbrechen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
