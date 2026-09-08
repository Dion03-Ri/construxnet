"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowLeft, MapPin, SlidersHorizontal } from "lucide-react";
import { useNetwork, ROLE_FILTERS, SWISS_CANTONS, type NetCompany } from "@/lib/network";
import CompanyCard from "@/components/network/CompanyCard";
import DirectRequestModal from "@/components/network/DirectRequestModal";
import { cn } from "@/lib/utils";
import { D_MD, EYEBROW } from "@/lib/ui";

const PAGE = 24;

const SORTS = [
  { key: "FIT", label: "Passend zuerst" },
  { key: "NEW", label: "Neu dazugekommen" },
  { key: "AZ", label: "A – Z" },
];

/**
 * Entdecken — die grosse Liste möglicher Verbindungen.
 *
 * Bewusst keine erfundenen Übereinstimmungs-Werte: "Passend zuerst" sortiert
 * nach nachvollziehbaren Merkmalen — gleicher Kanton, ergänzende Rolle,
 * verifiziert — und die Karte sagt, warum eine Firma oben steht.
 */
export default function DiscoverGrid() {
  const {
    companies, conns, myCompanyId, me, loading, isSignedIn,
    connect, accept, remove,
  } = useNetwork();

  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [canton, setCanton] = useState("ALL");
  const [sort, setSort] = useState("FIT");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [requestTarget, setRequestTarget] = useState<NetCompany | null>(null);

  const myCanton = me?.canton ?? null;
  const myRole = me?.role ?? null;

  /** Wie viele Firmen je Kanton — die Auswahl zeigt die ganze Schweiz und
      dahinter, wo tatsächlich jemand registriert ist. */
  const perCanton = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of companies) {
      if (c.id === myCompanyId || !c.canton) continue;
      m[c.canton] = (m[c.canton] ?? 0) + 1;
    }
    return m;
  }, [companies, myCompanyId]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = companies.filter((c) => {
      if (c.id === myCompanyId) return false;
      if (role !== "ALL" && c.role !== role) return false;
      if (canton !== "ALL" && c.canton !== canton) return false;
      if (onlyVerified && !c.verified) return false;
      if (!q) return true;
      return (
        c.company_name.toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q) ||
        (c.canton ?? "").toLowerCase().includes(q) ||
        (c.uid_number ?? "").toLowerCase().includes(q)
      );
    });

    if (sort === "AZ") {
      return [...list].sort((a, b) => a.company_name.localeCompare(b.company_name, "de-CH"));
    }
    if (sort === "NEW") {
      return [...list].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
      );
    }
    // Passend zuerst: offene Kontakte vor bestehenden, dann gleicher Kanton,
    // ergänzende Rolle, verifiziert. Alles nachvollziehbar, nichts erfunden.
    const score = (c: NetCompany) =>
      (conns[c.id] ? 0 : 8) +
      (myCanton && c.canton === myCanton ? 4 : 0) +
      (myRole && c.role !== myRole ? 2 : 0) +
      (c.verified ? 1 : 0);
    return [...list].sort(
      (a, b) => score(b) - score(a) || a.company_name.localeCompare(b.company_name, "de-CH"),
    );
  }, [companies, conns, myCompanyId, role, canton, onlyVerified, query, sort, myCanton, myRole]);

  const shown = results.slice(0, limit);
  const connectedCount = results.filter((c) => conns[c.id]?.status === "CONNECTED").length;
  const filtersOn = role !== "ALL" || canton !== "ALL" || onlyVerified || !!query.trim();

  return (
    <div className="space-y-5">
      {/* Seitenkopf über die volle Breite — kein Panel, wie auf Netzwerk,
          Smart Pools und Referenzpreise. */}
      <header className="border-b border-white/[0.12] pb-8">
        <Link
          href="/network"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/[0.56] transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zum Netzwerk
        </Link>
        <span className={cn(EYEBROW, "mt-6 block")}>Netzwerk</span>
        <h1 className={cn(D_MD, "mt-4 text-white")}>Firmen entdecken</h1>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/[0.72]">
          Alle Bauunternehmen und Baustoffwerke auf Obtanet.
          <span className="hidden sm:inline">
            {" "}Filtere nach Kanton und Rolle — jede Verbindung ist ein möglicher
            Bündel-Partner oder Lieferant.
          </span>
        </p>

        <div className="relative mt-8 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.56]" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Firma, Ort, Kanton oder UID suchen …"
            className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] py-3 pl-11 pr-3 text-sm text-white placeholder:text-white/[0.56] outline-none transition-colors focus:border-brand"
          />
        </div>
      </header>

      {/* Filterleiste */}
      <div className="border-t border-white/[0.12] pt-5">
        <div className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/[0.56] sm:flex">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </div>

        <div className="no-scrollbar -mb-px flex gap-6 overflow-x-auto border-b border-white/[0.12] sm:mt-3">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => { setRole(r.key); setLimit(PAGE); }}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 pb-2 text-[13px] font-semibold transition-colors",
                role === r.key
                  ? "border-brand text-white"
                  : "border-transparent text-white/[0.56] hover:text-white",
              )}
            >
              {r.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setOnlyVerified((v) => !v); setLimit(PAGE); }}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 pb-2 text-[13px] font-semibold transition-colors",
              onlyVerified
                ? "border-brand text-white"
                : "border-transparent text-white/[0.56] hover:text-white",
            )}
          >
            Nur verifizierte
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="relative block">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.56]" />
            <select
              value={canton}
              onChange={(e) => { setCanton(e.target.value); setLimit(PAGE); }}
              aria-label="Kanton"
              className="w-full appearance-none rounded-xl border border-white/[0.12] bg-white/[0.04] py-2.5 pl-9 pr-3 text-[13px] text-white/90 outline-none focus:border-brand"
            >
              <option value="ALL">Alle Kantone</option>
              {SWISS_CANTONS.map((k) => (
                <option key={k.code} value={k.code}>
                  {k.name}{perCanton[k.code] ? ` (${perCanton[k.code]})` : ""}
                </option>
              ))}
            </select>
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sortierung"
            className="w-full appearance-none rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2.5 text-[13px] text-white/90 outline-none focus:border-brand"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Ergebnisse */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/[0.72]">
          <Loader2 className="h-4 w-4 animate-spin" /> Firmen werden geladen …
        </div>
      ) : results.length === 0 ? (
        <div className="border-t border-white/[0.12] py-20 text-center">
          <p className="text-sm text-white/[0.72]">
            {filtersOn
              ? "Keine Firma passt zu diesen Filtern."
              : "Es sind noch keine weiteren Firmen registriert."}
          </p>
          {filtersOn && (
            <button
              type="button"
              onClick={() => { setQuery(""); setRole("ALL"); setCanton("ALL"); setOnlyVerified(false); }}
              className="mt-3 rounded-md border border-white/[0.12] px-3.5 py-2 text-[13px] font-semibold text-white/[0.72] transition-colors hover:border-brand/40 hover:text-brand"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-[13px] text-white/[0.72]">
              <span className="font-semibold text-white">{results.length}</span>{" "}
              {results.length === 1 ? "Firma" : "Firmen"}
              {canton !== "ALL" ? ` in ${canton}` : ""}
            </p>
            <p className="text-[12px] text-white/[0.56]">
              {Math.min(limit, results.length)} angezeigt
              {connectedCount > 0 ? ` · ${connectedCount} bereits verbunden` : ""}
            </p>
          </div>

          <div className="border-b border-white/[0.12]">
            {shown.map((c) => (
              <CompanyCard
                key={c.id}
                company={c}
                conn={conns[c.id]}
                canAct={!!myCompanyId}
                onConnect={connect}
                onAccept={accept}
                onRemove={remove}
                onRequest={setRequestTarget}
              />
            ))}
          </div>

          {limit < results.length && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                className="rounded-xl border border-white/[0.12] px-5 py-2.5 text-sm font-semibold text-white/[0.72] transition-colors hover:border-brand/40 hover:text-brand"
              >
                Weitere {Math.min(PAGE, results.length - limit)} anzeigen
              </button>
            </div>
          )}
        </>
      )}

      {isSignedIn && !myCompanyId && !loading && (
        <p className="text-center text-xs text-white/[0.72]">
          Lege ein Firmenprofil an, um dich mit anderen Firmen zu vernetzen.
        </p>
      )}

      {requestTarget && myCompanyId && (
        <DirectRequestModal
          target={requestTarget}
          myCompanyId={myCompanyId}
          alreadyConnected={conns[requestTarget.id]?.status === "CONNECTED"}
          onClose={() => setRequestTarget(null)}
        />
      )}
    </div>
  );
}
