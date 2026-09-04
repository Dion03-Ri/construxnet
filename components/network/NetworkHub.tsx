"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Search,
  Loader2,
  UserPlus,
  Check,
  ChevronDown,
  Map as MapIcon,
  ArrowRight,
  Layers,
  Inbox,
  Sparkle,
  Handshake,
  Users,
  MessageSquare,
  Clock,
  Compass,
} from "lucide-react";
import DirectRequestModal from "@/components/network/DirectRequestModal";
import CompanyCard from "@/components/network/CompanyCard";
import {
  useNetwork,
  ROLE_LABEL,
  initials,
  type NetCompany,
} from "@/lib/network";
import { D_MD, EYEBROW, BTN_GOLD, BTN_OUTLINE_DARK } from "@/lib/ui";
import { cn } from "@/lib/utils";

/** Kleine Überschrift über einem Panel-Titel. */
function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={cn("text-[11px] font-semibold uppercase tracking-[0.12em]", dark ? "text-white/40" : "text-white/40")}>
      {children}
    </div>
  );
}

/**
 * Ein Block statt einer Karte.
 *
 * Vorher: gerundetes Rechteck, Rand, dunkle Fuellung, Rastertextur — sechs
 * davon nebeneinander ergaben eine Wand aus Kaesten, in der nichts wichtiger
 * war als anderes. Jetzt traegt eine Haarlinie oben die Trennung, sonst
 * nichts. Der Inhalt steht direkt auf der Seite.
 */
function DarkPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-t border-white/[0.08] text-white", className)}>{children}</div>;
}

/** Zeile einer Firma in den Listen des Netzwerks. */
function CompanyRow({
  company,
  children,
}: {
  company: NetCompany;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05]/70">
      <Link
        href={`/company/${company.id}`}
        className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[12px] font-bold text-white/75"
      >
        {company.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
        ) : (
          initials(company.company_name)
        )}
      </Link>
      <div className="min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-auto">
        <Link
          href={`/company/${company.id}`}
          className="flex items-center gap-1 text-[14px] font-semibold text-white hover:text-brand"
        >
          <span className="truncate">{company.company_name}</span>
          {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
        </Link>
        <p className="truncate text-[12px] text-white/55">
          {ROLE_LABEL[company.role] ?? company.role}
          {company.city ? ` · ${company.city}` : company.canton ? ` · ${company.canton}` : ""}
        </p>
      </div>
      {/* Auf schmalen Geraeten unter den Namen statt daneben — sonst bleibt
          vom Firmennamen nur ein Kuerzel uebrig. */}
      <div className="flex w-full gap-1.5 [&>*]:flex-1 sm:w-auto sm:shrink-0 sm:[&>*]:flex-none">
        {children}
      </div>
    </li>
  );
}

const TABS = [
  { key: "connected", label: "Verbindungen", icon: Users },
  { key: "incoming", label: "Anfragen", icon: Inbox },
  { key: "outgoing", label: "Gesendet", icon: Clock },
];

/* -------------------------------------------------------------------------- */

export default function NetworkHub() {
  const {
    companies, conns, myCompanyId, me, loading, isSignedIn,
    connected, incoming, outgoing,
    connect, accept, remove,
  } = useNetwork();

  const [tab, setTab] = useState("connected");
  const [query, setQuery] = useState("");
  const [moreStats, setMoreStats] = useState(false);
  const [requestTarget, setRequestTarget] = useState<NetCompany | null>(null);

  const region = me?.canton ?? null;

  /** Vorschläge: noch nicht verbunden, Region und ergänzende Rolle zuerst. */
  const suggestions = useMemo(() => {
    const open = companies.filter((c) => c.id !== myCompanyId && !conns[c.id]);
    const score = (c: NetCompany) =>
      (region && c.canton === region ? 4 : 0) +
      (me?.role && c.role !== me.role ? 2 : 0) +
      (c.verified ? 1 : 0);
    return [...open].sort((a, b) => score(b) - score(a));
  }, [companies, conns, myCompanyId, region, me?.role]);

  /** Zuletzt beigetretene Firmen — echte Daten, ohne erfundene Kennzahlen. */
  const newest = useMemo(
    () =>
      companies
        .filter((c) => c.id !== myCompanyId && c.created_at)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 5),
    [companies, myCompanyId],
  );

  const filteredConnected = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return connected;
    return connected.filter(
      (c) =>
        c.company_name.toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q) ||
        (c.canton ?? "").toLowerCase().includes(q),
    );
  }, [connected, query]);

  const overview = [
    { label: "Verbindungen", value: connected.length },
    { label: "Einladungen gesendet", value: outgoing.length },
    { label: "Erhaltene Anfragen", value: incoming.length },
  ];
  const overviewMore = [
    { label: "Lieferanten", value: connected.filter((c) => c.role === "SUPPLIER").length },
    { label: "Bauunternehmen", value: connected.filter((c) => c.role === "BUYER").length },
  ];
  const networkEmpty = connected.length === 0 && outgoing.length === 0 && incoming.length === 0;
  const counts: Record<string, number> = {
    connected: connected.length,
    incoming: incoming.length,
    outgoing: outgoing.length,
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
      {/* ============================ LEFT RAIL ============================ */}
      <aside className="space-y-4">
        <DarkPanel>
          <div className="border-b border-white/10 px-5 pb-3 pt-4">
            <Eyebrow dark>Dein Netzwerk</Eyebrow>
            <h2 className="mt-0.5 text-[15px] font-bold">Überblick</h2>
          </div>

          {networkEmpty ? (
            // Erster Eindruck: keine Nullen-Wand, sondern ein Weg nach vorne.
            <div className="px-5 py-4">
              <p className="text-[13px] leading-relaxed text-white/55">
                Dein Netzwerk ist noch leer. Finde Bauunternehmen und Baustoffwerke
                {region ? ` in ${region}` : " in deiner Region"} — mehr Verbindungen heisst
                mehr Bündel-Möglichkeiten.
              </p>
              <Link
                href="/network/entdecken"
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
              >
                Firmen finden <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-white/[0.06] px-5">
                {[...overview, ...(moreStats ? overviewMore : [])].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-2.5">
                    <span className="text-[13px] text-white/55">{s.label}</span>
                    <span className="text-lg font-bold tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMoreStats((v) => !v)}
                className="flex w-full items-center justify-center gap-1 border-t border-white/10 py-2.5 text-[12px] font-semibold text-brand transition-colors hover:bg-white/5"
              >
                {moreStats ? "Weniger anzeigen" : "Mehr anzeigen"}
                <ChevronDown className={cn("h-4 w-4 transition-transform", moreStats && "rotate-180")} />
              </button>
            </>
          )}
        </DarkPanel>

        {/* Neu im Netzwerk — echte, zuletzt beigetretene Firmen */}
        {newest.length > 0 && (
          <DarkPanel>
            <div className="border-b border-white/10 px-5 pb-3 pt-4">
              <Eyebrow dark>Zuletzt dazugekommen</Eyebrow>
              <h3 className="mt-0.5 flex items-center gap-1.5 text-[15px] font-bold">
                <Sparkle className="h-4 w-4 text-brand" /> Neu im Netzwerk
              </h3>
            </div>
            <ul className="px-3 py-2">
              {newest.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5">
                  <Link
                    href={`/company/${c.id}`}
                    className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[11px] font-bold"
                  >
                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                    ) : (
                      initials(c.company_name)
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/company/${c.id}`} className="flex items-center gap-1 truncate text-[13px] font-semibold hover:text-brand">
                      <span className="truncate">{c.company_name}</span>
                      {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />}
                    </Link>
                    <div className="truncate text-[11px] text-white/40">
                      {ROLE_LABEL[c.role] ?? c.role}
                      {c.city ? ` · ${c.city}` : ""}
                    </div>
                  </div>
                  {!conns[c.id] && myCompanyId && (
                    <button
                      type="button"
                      onClick={() => connect(c.id)}
                      aria-label={`${c.company_name} vernetzen`}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-brand/50 hover:text-brand"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </DarkPanel>
        )}
      </aside>

      {/* ============================== MITTE ============================== */}
      {/* Auf dem Handy zuerst: Verbindungen und Anfragen stehen oben. */}
      <div className="order-first min-w-0 space-y-4 lg:order-none">
        {/* Kopf: wofür diese Seite da ist, plus der Weg zu neuen Firmen */}
        <DarkPanel>
          <div className="flex flex-col gap-8 py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <span className={EYEBROW}>Dein Netzwerk</span>
              <h1 className={cn(D_MD, "mt-4 text-white")}>
                Mit wem du baust{region ? ` — und wer in ${region} dazupasst` : ""}
              </h1>
              <p className="mt-5 text-[15px] leading-relaxed text-white/55">
                Verbindungen verwalten, Anfragen beantworten und neue Partner finden.
                <span className="hidden sm:inline">
                  {" "}Jede Verbindung ist ein möglicher Bündel-Partner, Lieferant oder Abnehmer.
                </span>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/network/entdecken"
                  className={BTN_GOLD}
                >
                  <Compass className="h-4 w-4" /> Passende Firmen finden
                </Link>
                <Link
                  href="/map"
                  className={BTN_OUTLINE_DARK}
                >
                  <MapIcon className="h-4 w-4" /> Auf der Karte
                </Link>
              </div>
            </div>

            {/* Echte Firmen statt grauer Platzhalter — sonst gar nichts */}
            {suggestions.length > 0 && (
              <Link href="/network/entdecken" className="hidden shrink-0 lg:block">
                <span className="flex -space-x-3">
                  {suggestions.slice(0, 5).map((c) => (
                    <span
                      key={c.id}
                      title={c.company_name}
                      className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-navy-900 bg-white/10 text-[13px] font-bold text-white"
                    >
                      {c.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" />
                      ) : (
                        initials(c.company_name)
                      )}
                    </span>
                  ))}
                </span>
                <span className="mt-2 block text-right text-[12px] font-semibold text-brand">
                  {suggestions.length} offene Kontakte
                </span>
              </Link>
            )}
          </div>
        </DarkPanel>

        {/* Verbindungen verwalten */}
        <div className="border-t border-white/[0.08]">
          <div className="no-scrollbar flex gap-7 overflow-x-auto border-b border-white/[0.08]">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  // Der aktive Reiter traegt eine Goldkante unten, kein
                  // gefuelltes Kaestchen. Das ist der Unterschied zwischen
                  // einer Navigation und einer Knopfleiste.
                  "-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-3 pt-1 text-[13.5px] font-semibold transition-colors",
                  tab === t.key
                    ? "border-brand text-white"
                    : "border-transparent text-white/45 hover:text-white",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10.5px] font-bold",
                    tab === t.key
                      ? "bg-white/15 text-white"
                      : counts[t.key] > 0 && t.key === "incoming"
                        ? "bg-brand/15 text-brand-700"
                        : "bg-white/10 text-white/55",
                  )}
                >
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-white/55">
              <Loader2 className="h-4 w-4 animate-spin" /> Netzwerk wird geladen …
            </div>
          ) : tab === "connected" ? (
            connected.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-white/55">
                  Noch keine Verbindungen. Firmen, mit denen du dich vernetzt, erscheinen hier —
                  mit Chat und Direktanfrage.
                </p>
                <Link
                  href="/network/entdecken"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
                >
                  <Compass className="h-4 w-4" /> Firmen entdecken
                </Link>
              </div>
            ) : (
              <>
                {connected.length > 6 && (
                  <div className="relative border-b border-white/[0.06] px-4 py-3">
                    <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="In deinen Verbindungen suchen …"
                      className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-brand focus:bg-[#0B1522]"
                    />
                  </div>
                )}
                <ul className="divide-y divide-white/[0.06]">
                  {filteredConnected.map((c) => (
                    <CompanyRow key={c.id} company={c}>
                      <Link
                        href={`/messages?to=${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-[12.5px] font-semibold text-white/70 transition-colors hover:border-brand/40 hover:text-brand"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Nachricht
                      </Link>
                      {c.role === "SUPPLIER" && (
                        <button
                          type="button"
                          onClick={() => setRequestTarget(c)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
                        >
                          <Handshake className="h-3.5 w-3.5" /> Anfragen
                        </button>
                      )}
                    </CompanyRow>
                  ))}
                  {filteredConnected.length === 0 && (
                    <li className="px-4 py-10 text-center text-sm text-white/40">
                      Keine Verbindung passt zur Suche.
                    </li>
                  )}
                </ul>
              </>
            )
          ) : tab === "incoming" ? (
            incoming.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-white/55">
                Keine offenen Anfragen. Sobald dich eine Firma vernetzen möchte, erscheint sie hier.
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {incoming.map(({ company, conn }) => (
                  <CompanyRow key={conn.id} company={company}>
                    <button
                      type="button"
                      onClick={() => accept(conn.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
                    >
                      <Check className="h-3.5 w-3.5" /> Annehmen
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(conn.id)}
                      className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[12.5px] font-semibold text-white/55 transition-colors hover:bg-white/[0.05]"
                    >
                      Ignorieren
                    </button>
                  </CompanyRow>
                ))}
              </ul>
            )
          ) : outgoing.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-white/55">
              Keine offenen Einladungen. Was du versendest, steht hier, bis es beantwortet ist.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {outgoing.map(({ company, conn }) => (
                <CompanyRow key={conn.id} company={company}>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white/55">
                    <Clock className="h-3.5 w-3.5" /> Wartet
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(conn.id)}
                    className="rounded-md border border-white/[0.08] px-3 py-1.5 text-[12.5px] font-semibold text-white/55 transition-colors hover:bg-white/[0.05]"
                  >
                    Zurückziehen
                  </button>
                </CompanyRow>
              ))}
            </ul>
          )}
        </div>

        {/* Vorschläge — die Vollansicht liegt auf /network/entdecken */}
        {suggestions.length > 0 && (
          <div className="border-t border-white/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-5 py-3.5">
              <div>
                <Eyebrow>Empfohlen für dich</Eyebrow>
                <h3 className="mt-0.5 text-[15px] font-bold text-white">
                  {region ? `Firmen in der Region ${region}` : "Firmen, die du kennen könntest"}
                </h3>
              </div>
              <Link
                href="/network/entdecken"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand transition-colors hover:text-brand-600"
              >
                Alle {suggestions.length} ansehen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {suggestions.slice(0, 6).map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  canAct={!!myCompanyId}
                  onConnect={connect}
                  onRequest={setRequestTarget}
                />
              ))}
            </div>
            <Link
              href="/network/entdecken"
              className="flex items-center justify-center gap-1.5 border-t border-white/[0.06] py-3 text-[13px] font-semibold text-brand transition-colors hover:bg-brand/5"
            >
              <Compass className="h-4 w-4" /> Weitere Firmen entdecken
            </Link>
          </div>
        )}

        {isSignedIn && !myCompanyId && !loading && (
          <p className="text-center text-xs text-white/55">
            Lege ein Firmenprofil an, um dich mit anderen Firmen zu vernetzen.
          </p>
        )}
      </div>

      {/* ============================ RIGHT RAIL ============================ */}
      <aside className="order-last space-y-4 lg:order-none">
        {/* Zwei Verweise als Zeilen statt als Karten mit Symbolflaeche.
            Ein Kompass in einem Kasten sagt nichts, was der Titel nicht
            schon sagt — er fuellt nur Platz. */}
        {[
          {
            href: "/network/entdecken",
            t: "Firmen entdecken",
            d:
              suggestions.length > 0
                ? `${suggestions.length} Firmen, mit denen du noch nicht verbunden bist`
                : "Nach Kanton, Rolle und Namen filtern",
          },
          { href: "/map", t: "Firmen-Karte", d: "Standorte in der ganzen Schweiz" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center gap-3 border-t border-white/[0.08] py-4 transition-colors hover:bg-white/[0.03]"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-white group-hover:text-brand">{l.t}</div>
              <div className="mt-0.5 text-[12px] text-white/40">{l.d}</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}

        {/* Smart Pools */}
        <DarkPanel>
          <div className="p-5">
            <div className="flex items-center gap-2 text-[14px] font-bold">
              <Layers className="h-4 w-4 text-brand" /> Smart Pools
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
              Bündle deinen Bedarf mit anderen Firmen — Sealed-Bid-Angebote gegen KBOB sichern
              einen garantierten Netto-Mindestvorteil.
            </p>
            <Link
              href="/pools"
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-semibold text-navy-900 transition-colors hover:bg-brand/100"
            >
              Zu den Bündeln <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DarkPanel>
      </aside>

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
