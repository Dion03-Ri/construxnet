"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Handshake, X, Search, Send, Loader2, Info } from "lucide-react";
import { PROC_MATERIALS, DELIVERY_WINDOWS, matchesMaterial, type ProcMaterial } from "@/data/procurement";
import { matchMaterial, WORTH_SHOWING } from "@/lib/materialMatch";
import { rememberAlias } from "@/lib/useMaterialResolve";
import { useProjects, projectLabel } from "@/lib/projects";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

type Target = { id: string; company_name: string; city: string | null };

/**
 * Direktanfrage an einen Lieferanten — ohne Bündelung.
 *
 * Legt bei Bedarf eine Verbindungsanfrage an und schreibt die Anfrage als
 * erste Nachricht in die Unterhaltung. Danach geht es direkt in den Chat,
 * wo weiterverhandelt wird.
 */
export default function DirectRequestModal({
  target,
  myCompanyId,
  alreadyConnected,
  onClose,
}: {
  target: Target;
  myCompanyId: string;
  alreadyConnected: boolean;
  onClose: () => void;
}) {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const { projects } = useProjects();

  const [query, setQuery] = useState("");
  const [materialKey, setMaterialKey] = useState("");
  const [qty, setQty] = useState("");
  const [window, setWindow] = useState<string>(DELIVERY_WINDOWS[0]);
  const [note, setNote] = useState("");
  const [projectId, setProjectId] = useState("");
  // Standardfrist: eine Woche. Lang genug für eine ernsthafte Kalkulation,
  // kurz genug, dass die Anfrage nicht liegen bleibt.
  const [respondBy, setRespondBy] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const material = PROC_MATERIALS.find((m) => m.key === materialKey);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return PROC_MATERIALS.slice(0, 6);
    const literal = PROC_MATERIALS.filter((m) => matchesMaterial(m, q)).slice(0, 6);
    if (literal.length > 0) return literal;
    // Kein wörtlicher Treffer: der Abgleich fängt Schreibweisen ab, die es
    // so nicht im Katalog gibt — "Armierungsstahl" statt "Bewehrungsstahl".
    return matchMaterial(q, 4)
      .filter((m) => m.score >= WORTH_SHOWING)
      .map((m) => m.material);
  }, [query]);

  const valid = !!material && Number(qty) > 0;

  /**
   * Material wählen — und wenn die Suche nur über den Abgleich dorthin
   * geführt hat, die Schreibweise merken. Beim nächsten Mal steht der
   * Treffer sofort da, ohne Heuristik.
   */
  function pickMaterial(m: ProcMaterial) {
    const literal = PROC_MATERIALS.some((x) => matchesMaterial(x, query.trim()));
    if (!literal) void rememberAlias(supabase, query, m.id, myCompanyId, "MATCH");
    setMaterialKey(m.key);
  }

  async function submit() {
    if (!valid || !material || sending) return;
    setSending(true);
    setError(null);

    // Noch nicht vernetzt? Dann geht die Anfrage zusammen mit der
    // Verbindungsanfrage raus — der Empfänger entscheidet über beides.
    if (!alreadyConnected) {
      const { error: connErr } = await supabase.from("connections").insert({
        company_id_a: myCompanyId,
        company_id_b: target.id,
        requested_by: myCompanyId,
        status: "PENDING",
      });
      if (connErr && !connErr.message.toLowerCase().includes("duplicate")) {
        setSending(false);
        setError("Verbindungsanfrage konnte nicht gestellt werden: " + connErr.message);
        return;
      }
    }

    // Die Anfrage selbst — strukturiert, damit der Lieferant ein
    // Angebot darauf legen kann und beide Seiten den Stand sehen.
    const { error: reqErr } = await supabase.from("direct_requests").insert({
      buyer_company_id: myCompanyId,
      supplier_company_id: target.id,
      project_id: projectId || null,
      material_key: material.key,
      material_id: material.id,
      material_label: material.label,
      spec: material.sia,
      unit: material.unit,
      quantity: Number(qty),
      kbob_reference_price: material.kbobPrice,
      delivery_window: window,
      note: note.trim() || null,
      respond_by: respondBy || null,
    });
    if (reqErr) {
      setSending(false);
      setError("Anfrage konnte nicht angelegt werden: " + reqErr.message);
      return;
    }

    const lines = [
      "Direktanfrage",
      `Material: ${material.label} (${material.id})`,
      `Spezifikation: ${material.sia}`,
      `Menge: ${Number(qty).toLocaleString("de-CH")} ${material.unit}`,
      `Lieferung: ${window}`,
    ];
    if (respondBy) lines.push(`Antwort bis: ${respondBy.split("-").reverse().join(".")}`);
    if (note.trim()) lines.push("", note.trim());

    const { error: msgErr } = await supabase.from("messages").insert({
      sender_company_id: myCompanyId,
      receiver_company_id: target.id,
      content: lines.join("\n"),
      is_negotiation_offer: false,
    });

    setSending(false);
    if (msgErr) {
      setError("Anfrage konnte nicht gesendet werden: " + msgErr.message);
      return;
    }
    router.push(`/messages?to=${target.id}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              <Handshake className="h-4 w-4 text-brand" /> Direkt anfragen
            </h3>
            <p className="mt-0.5 truncate text-[12.5px] text-slate-500">
              an {target.company_name}
              {target.city ? ` · ${target.city}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 px-5 py-4">
          {/* Material */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Material *
            </label>
            {material ? (
              <div className="flex items-center gap-2 rounded-md border border-brand/30 bg-brand/[0.05] px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-slate-900">{material.label}</div>
                  <div className="truncate text-[11px] text-slate-400">{material.sia}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setMaterialKey(""); setQuery(""); }}
                  className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700"
                  aria-label="Material ändern"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    placeholder="Material oder Nummer suchen …"
                    className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white"
                  />
                </div>
                <ul className="mt-1.5 max-h-44 overflow-y-auto rounded-md border border-slate-200">
                  {matches.map((m) => (
                    <li key={m.key}>
                      <button
                        type="button"
                        onClick={() => pickMaterial(m)}
                        className="flex w-full items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-slate-800">{m.label}</span>
                          <span className="block truncate text-[11px] text-slate-400">{m.sia}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-400">CHF {m.kbobPrice}/{m.unit}</span>
                      </button>
                    </li>
                  ))}
                  {matches.length === 0 && (
                    <li className="px-3 py-4 text-center text-[12.5px] text-slate-400">Kein Treffer.</li>
                  )}
                </ul>
              </>
            )}
          </div>

          {/* Menge + Lieferung */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Menge *
              </label>
              <div className="flex items-center rounded-md border border-slate-300 bg-slate-50 focus-within:border-brand focus-within:bg-white">
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  placeholder="z. B. 120"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                />
                <span className="px-2.5 text-sm font-medium text-slate-400">{material?.unit ?? "—"}</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Lieferung
              </label>
              <select
                value={window}
                onChange={(e) => setWindow(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white"
              >
                {DELIVERY_WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Frist + Baustelle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Antwort bis
              </label>
              <input
                type="date"
                value={respondBy}
                onChange={(e) => setRespondBy(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Baustelle
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={projects.length === 0}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:bg-white disabled:text-slate-400"
              >
                <option value="">{projects.length === 0 ? "Keine angelegt" : "Keine Zuordnung"}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{projectLabel(p)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nachricht */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Nachricht (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Baustelle, Abladestelle, Besonderheiten …"
              className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand focus:bg-white"
            />
          </div>

          {!alreadyConnected && (
            <p className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
              Ihr seid noch nicht vernetzt. Die Anfrage geht zusammen mit einer
              Verbindungsanfrage raus — {target.company_name} entscheidet über beides auf einmal.
            </p>
          )}

          {error && <p className="text-[12.5px] font-medium text-rose-600">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-[11.5px] text-slate-400">Ohne Bündelung — direkt verhandelt.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!valid || sending}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500",
                (!valid || sending) && "cursor-not-allowed opacity-50",
              )}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Anfrage senden
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
