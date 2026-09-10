"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useKapazitaet } from "@/lib/lieferantensicht";
import { PROC_CATEGORIES, type ProcCategory } from "@/data/procurement";
import { cn } from "@/lib/utils";

/**
 * Lieferprofil — welche Menge dieses Werk je Material und Monat fahren kann.
 *
 * Kapazität ist eine RATE, kein Vorrat. Ein Bündel belegt sie in den
 * Monaten seines Lieferzeitraums und gibt sie danach wieder frei. Deshalb
 * steht hier kein einzelner Wert, sondern ein Kalender.
 *
 * Was hier steht, ist verbindlich: Auf diese Zahl rechnet ein Besteller
 * seinen Preis. Deshalb weigert sich die Datenbank auch, unter das zu
 * gehen, was bereits zugeschlagen ist.
 */

function monatName(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", { month: "short", year: "numeric" });
}

function naechsterMonat(n: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function LieferprofilPanel() {
  const { zeilen, laden, fehler, setzen } = useKapazitaet();
  const [kategorie, setKategorie] = useState<ProcCategory>(PROC_CATEGORIES[0]);
  const [von, setVon] = useState(naechsterMonat(0));
  const [bis, setBis] = useState(naechsterMonat(5));
  const [menge, setMenge] = useState("");
  const [einheit, setEinheit] = useState("m³");
  const [busy, setBusy] = useState(false);

  async function speichern() {
    const m = Number(menge);
    if (!(m >= 0) || busy) return;
    setBusy(true);
    const ok = await setzen(kategorie, `${von}-01`, `${bis}-01`, m, einheit);
    setBusy(false);
    if (ok) setMenge("");
  }

  const gruppen = zeilen.reduce<Record<string, typeof zeilen>>((acc, z) => {
    (acc[z.material_category] ??= []).push(z);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-bold text-white">Lieferprofil</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-white/[0.72]">
          Welche Menge du je Material und Monat fahren kannst. Daran wird geprüft, ob du
          auf ein Bündel bieten darfst — und ein Zuschlag belegt sie für seinen
          Lieferzeitraum, danach ist sie wieder frei.
        </p>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-white/[0.56]">
          Was hier steht, ist verbindlich: auf diese Zahl rechnet ein Besteller seinen
          Preis. Unter eine bereits zugeschlagene Menge kannst du nicht zurück.
        </p>
      </div>

      {/* ---------- Eintragen ---------- */}
      <div className="border-t border-white/[0.12] pt-6">
        <h3 className="text-[15px] font-semibold text-white">Menge eintragen</h3>

        {fehler && (
          <p className="mt-4 flex items-start gap-2 border-l-2 border-rose-400/60 py-2 pl-4 text-[13px] text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {fehler}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-[12.5px] text-white/[0.72]">
            Material
            <select
              value={kategorie}
              onChange={(e) => setKategorie(e.target.value as ProcCategory)}
              className="mt-1.5 block w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] text-white outline-none focus:border-brand focus:bg-[#16181a]"
            >
              {PROC_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-[1fr_5.5rem] gap-3">
            <label className="block text-[12.5px] text-white/[0.72]">
              Menge je Monat
              <input
                value={menge}
                onChange={(e) => setMenge(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="z. B. 1500"
                className="mt-1.5 block w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] text-white outline-none placeholder:text-white/[0.32] focus:border-brand focus:bg-[#16181a]"
              />
            </label>
            <label className="block text-[12.5px] text-white/[0.72]">
              Einheit
              <input
                value={einheit}
                onChange={(e) => setEinheit(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] text-white outline-none focus:border-brand focus:bg-[#16181a]"
              />
            </label>
          </div>

          <label className="block text-[12.5px] text-white/[0.72] sm:col-span-2">
            Für die Monate
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <input
                type="month"
                value={von}
                onChange={(e) => {
                  setVon(e.target.value);
                  if (e.target.value > bis) setBis(e.target.value);
                }}
                className="rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] text-white outline-none focus:border-brand focus:bg-[#16181a]"
              />
              <span className="text-white/[0.56]">bis</span>
              <input
                type="month"
                value={bis}
                min={von}
                onChange={(e) => setBis(e.target.value)}
                className="rounded-md border border-white/[0.16] bg-white/[0.03] px-3 py-2 text-[14px] text-white outline-none focus:border-brand focus:bg-[#16181a]"
              />
            </div>
          </label>
        </div>

        <button
          type="button"
          onClick={speichern}
          disabled={!menge || busy}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy ? "wird gespeichert …" : "Für diese Monate eintragen"}
        </button>
      </div>

      {/* ---------- Was eingetragen ist ---------- */}
      <div className="border-t border-white/[0.12] pt-6">
        <h3 className="text-[15px] font-semibold text-white">Eingetragen</h3>
        {laden ? (
          <div className="grid place-items-center py-10 text-white/[0.56]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : zeilen.length === 0 ? (
          <p className="mt-3 text-[13px] leading-relaxed text-white/[0.56]">
            Noch nichts eingetragen. Ohne Kapazität kannst du auf kein Bündel bieten — ein
            Gebot ohne Mengenzusage wäre nur eine Absichtserklärung.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {Object.entries(gruppen).map(([kat, ms]) => (
              <div key={kat}>
                <div className="text-[12.5px] font-semibold text-white">{kat}</div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-[12.5px]">
                  {ms.map((m) => (
                    <span key={m.monat} className="tabular-nums text-white/[0.72]">
                      <span className="text-white/[0.5]">{monatName(m.monat)}</span>{" "}
                      <b className={cn("font-semibold", m.menge > 0 ? "text-white" : "text-white/[0.4]")}>
                        {m.menge.toLocaleString("de-CH")} {m.einheit ?? ""}
                      </b>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
