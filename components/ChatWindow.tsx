"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Send,
  Tag,
  Check,
  Repeat,
  Loader2,
  BadgeCheck,
  MessageSquare,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building2,
  ExternalLink,
  ShieldCheck,
  Search,
  Boxes,
  TrendingDown,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Company = {
  id: string;
  company_name: string;
  logo_url: string | null;
  city: string | null;
  verified: boolean;
  role?: string | null;
  canton?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
};
type Msg = {
  id: string;
  sender_company_id: string;
  receiver_company_id: string;
  content: string;
  is_negotiation_offer: boolean;
  offer_amount: number | null;
  created_at: string;
};

/** Beschaffungs-Kontext eines Threads — verknüpft jede Konversation mit dem
 *  Bündel/Pool, um den es geht. Genau das ist das Ziel des Netzwerks. */
type Deal = {
  material: string;
  volume: string;
  region: string;
  phase: string;
  savingsPct: number;
  unit: string;
};

const DEMO_ID = "demo";

const DEMO_THREADS: Company[] = [
  {
    id: "d-kibag",
    company_name: "KIBAG Baustoffe",
    logo_url: null,
    city: "Zürich",
    verified: true,
    role: "SUPPLIER",
    canton: "ZH",
    email: "beton@kibag.ch",
    phone: "+41 44 733 22 11",
    address: "Seestrasse 404, 8038 Zürich",
    website: "www.kibag.ch",
  },
  {
    id: "d-vigier",
    company_name: "Vigier Beton Mittelland",
    logo_url: null,
    city: "Bern",
    verified: true,
    role: "SUPPLIER",
    canton: "BE",
    email: "mittelland@vigier-beton.ch",
    phone: "+41 32 328 28 28",
    address: "Höheweg 27, 2504 Biel/Bienne",
    website: "www.vigier-beton.ch",
  },
  {
    id: "d-eberhard",
    company_name: "Eberhard Bau AG",
    logo_url: null,
    city: "Kloten",
    verified: false,
    role: "BUYER",
    canton: "ZH",
    email: "info@eberhard.ch",
    phone: "+41 44 815 66 00",
    address: "Steinackerstrasse 56, 8302 Kloten",
    website: "www.eberhard.ch",
  },
  {
    id: "d-jura",
    company_name: "Jura Cement Werke",
    logo_url: null,
    city: "Wildegg",
    verified: true,
    role: "SUPPLIER",
    canton: "AG",
    email: "verkauf@juracement.ch",
    phone: "+41 62 887 87 87",
    address: "Zurlindenstrasse 21, 5103 Wildegg",
    website: "www.juracement.ch",
  },
];

/** Deal-Kontext pro Demo-Thread. */
const DEMO_DEALS: Record<string, Deal> = {
  "d-kibag": { material: "Beton C25/30", volume: "230 m³", region: "Limmattal ZH", phase: "In Verhandlung", savingsPct: 9.4, unit: "m³" },
  "d-vigier": { material: "Transportbeton", volume: "180 m³", region: "Mittelland BE", phase: "Offen", savingsPct: 7.1, unit: "m³" },
  "d-eberhard": { material: "Armierungsstahl B500B", volume: "42 t", region: "Zürich Nord", phase: "Anfrage", savingsPct: 6.2, unit: "t" },
  "d-jura": { material: "Zement CEM II", volume: "95 t", region: "Aargau", phase: "Offen", savingsPct: 5.8, unit: "t" },
};

/** Ungelesen-Zähler für Demo-Threads (Erstansicht). */
const DEMO_UNREAD: Record<string, number> = { "d-kibag": 2, "d-jura": 1 };

function demoMsgs(counterId: string, meId: string): Msg[] {
  const t = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
  if (counterId === "d-kibag")
    return [
      { id: "m1", sender_company_id: counterId, receiver_company_id: meId, content: "Grüezi! Wir haben Kapazität für euren Beton-C25/30-Pool im Limmattal.", is_negotiation_offer: false, offer_amount: null, created_at: t(6) },
      { id: "m2", sender_company_id: meId, receiver_company_id: counterId, content: "Perfekt. Aktuelles Poolvolumen liegt bei 230 m³. Was könnt ihr anbieten?", is_negotiation_offer: false, offer_amount: null, created_at: t(5) },
      { id: "m3", sender_company_id: counterId, receiver_company_id: meId, content: "Angebot: Beton C25/30 · 230 m³ · Lieferung Q4", is_negotiation_offer: true, offer_amount: 145.2, created_at: t(4) },
      { id: "m4", sender_company_id: counterId, receiver_company_id: meId, content: "Bei +40 m³ könnten wir sogar auf CHF 142 gehen.", is_negotiation_offer: false, offer_amount: null, created_at: t(1.5) },
    ];
  if (counterId === "d-vigier")
    return [
      { id: "v1", sender_company_id: counterId, receiver_company_id: meId, content: "Transportbeton Region Mittelland verfügbar — gerne im Pool.", is_negotiation_offer: false, offer_amount: null, created_at: t(28) },
    ];
  if (counterId === "d-jura")
    return [
      { id: "j1", sender_company_id: meId, receiver_company_id: counterId, content: "Wir bündeln Zement CEM II für vier Baustellen im Aargau. Interesse?", is_negotiation_offer: false, offer_amount: null, created_at: t(20) },
      { id: "j2", sender_company_id: counterId, receiver_company_id: meId, content: "Sehr gerne. Schickt uns die Mengen, dann rechnen wir eine Staffel.", is_negotiation_offer: false, offer_amount: null, created_at: t(2) },
    ];
  return [
    { id: "e1", sender_company_id: meId, receiver_company_id: counterId, content: "Habt ihr Interesse an einem gemeinsamen Armierungsstahl-Bündel?", is_negotiation_offer: false, offer_amount: null, created_at: t(50) },
  ];
}

function initials(n: string) {
  return n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function chf(v: number) {
  return new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
function time(iso: string) {
  return new Date(iso).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}
/** kurze relative Zeit für die Thread-Liste */
function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return "jetzt";
  if (h < 24) return `${h} Std`;
  const d = Math.floor(h / 24);
  if (d === 1) return "gestern";
  if (d < 7) return `${d} T`;
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
}

export default function ChatWindow({ initialTo }: { initialTo?: string }) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [myId, setMyId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Company[]>([]);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [deals, setDeals] = useState<Record<string, Deal>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [demo, setDemo] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // composer
  const [text, setText] = useState("");
  const [offerMode, setOfferMode] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (!isSignedIn || !userId) {
      setDemo(true);
      setThreads(DEMO_THREADS);
      const map: Record<string, Msg[]> = {};
      DEMO_THREADS.forEach((c) => (map[c.id] = demoMsgs(c.id, DEMO_ID)));
      setMsgs(map);
      setDeals(DEMO_DEALS);
      setUnread(DEMO_UNREAD);
      setMyId(DEMO_ID);
      setActive(initialTo ?? DEMO_THREADS[0].id);
      setLoading(false);
      return;
    }
    const { data: me } = await supabase.from("companies").select("id").eq("clerk_user_id", userId).maybeSingle();
    const mineId = (me as { id: string } | null)?.id ?? null;
    setMyId(mineId);

    // connections (CONNECTED) + message counterparties
    const [{ data: conns }, { data: rows }] = await Promise.all([
      supabase.from("connections").select("company_id_a, company_id_b, status").eq("status", "CONNECTED"),
      supabase.from("messages").select("id, sender_company_id, receiver_company_id, content, is_negotiation_offer, offer_amount, created_at").order("created_at", { ascending: true }),
    ]);

    const counterIds = new Set<string>();
    for (const c of (conns ?? []) as { company_id_a: string; company_id_b: string }[]) {
      counterIds.add(c.company_id_a === mineId ? c.company_id_b : c.company_id_a);
    }
    const allMsgs = (rows ?? []) as Msg[];
    for (const m of allMsgs) {
      counterIds.add(m.sender_company_id === mineId ? m.receiver_company_id : m.sender_company_id);
    }
    counterIds.delete(mineId ?? "");

    if (counterIds.size === 0) {
      setDemo(true);
      setThreads(DEMO_THREADS);
      const map: Record<string, Msg[]> = {};
      DEMO_THREADS.forEach((c) => (map[c.id] = demoMsgs(c.id, mineId ?? DEMO_ID)));
      setMsgs(map);
      setDeals(DEMO_DEALS);
      setUnread(DEMO_UNREAD);
      setActive(initialTo ?? DEMO_THREADS[0].id);
      setLoading(false);
      return;
    }

    // Kontaktfelder mitladen; falls Migration 04 noch nicht lief, Fallback.
    const ids = [...counterIds];
    const full = await supabase
      .from("companies")
      .select("id, company_name, logo_url, city, verified, role, canton, email, phone, address, website")
      .in("id", ids);
    const list = (
      full.error
        ? (
            await supabase
              .from("companies")
              .select("id, company_name, logo_url, city, verified, role, canton")
              .in("id", ids)
          ).data ?? []
        : full.data ?? []
    ) as Company[];
    const map: Record<string, Msg[]> = {};
    for (const id of counterIds) map[id] = [];
    for (const m of allMsgs) {
      const other = m.sender_company_id === mineId ? m.receiver_company_id : m.sender_company_id;
      (map[other] ??= []).push(m);
    }
    // Deal-Kontext aus letztem Angebot je Thread ableiten.
    const dealMap: Record<string, Deal> = {};
    for (const id of counterIds) {
      const lastOffer = [...(map[id] ?? [])].reverse().find((m) => m.is_negotiation_offer);
      if (lastOffer) {
        dealMap[id] = { material: lastOffer.content.replace(/·.*$/, "").trim() || "Beschaffung", volume: "—", region: "—", phase: "In Verhandlung", savingsPct: 0, unit: "Einheit" };
      }
    }
    setDemo(false);
    setThreads(list);
    setMsgs(map);
    setDeals(dealMap);
    setUnread({});
    setActive(initialTo && counterIds.has(initialTo) ? initialTo : list[0]?.id ?? null);
    setLoading(false);
  }, [isSignedIn, userId, supabase, initialTo]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCompany = threads.find((t) => t.id === active) ?? null;
  const activeMsgs = active ? msgs[active] ?? [] : [];
  const activeDeal = active ? deals[active] ?? null : null;

  // Threads sortiert nach letzter Aktivität + Suchfilter.
  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...threads]
      .filter((c) => !q || c.company_name.toLowerCase().includes(q))
      .sort((a, b) => {
        const la = (msgs[a.id] ?? []).at(-1)?.created_at ?? "";
        const lb = (msgs[b.id] ?? []).at(-1)?.created_at ?? "";
        return lb.localeCompare(la);
      });
  }, [threads, msgs, query]);

  const totalUnread = useMemo(
    () => Object.values(unread).reduce((s, n) => s + n, 0),
    [unread],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeMsgs.length, active]);

  // Beim Öffnen eines Threads als gelesen markieren.
  function openThread(id: string) {
    setActive(id);
    setUnread((prev) => (prev[id] ? { ...prev, [id]: 0 } : prev));
  }

  const canSend = useMemo(
    () => (offerMode ? Number(offerPrice) > 0 : text.trim().length > 0),
    [offerMode, offerPrice, text],
  );

  function appendLocal(m: Msg) {
    setMsgs((prev) => ({ ...prev, [active!]: [...(prev[active!] ?? []), m] }));
  }

  async function send() {
    if (!active || !myId || !canSend) return;
    const isOffer = offerMode;
    const content = isOffer
      ? `Angebot${offerQty ? ` · ${offerQty}` : ""} · ${chf(Number(offerPrice))} CHF/Einheit`
      : text.trim();
    const offer_amount = isOffer ? Number(offerPrice) : null;

    // optimistic
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      sender_company_id: myId,
      receiver_company_id: active,
      content,
      is_negotiation_offer: isOffer,
      offer_amount,
      created_at: new Date().toISOString(),
    };
    appendLocal(optimistic);
    setText("");
    setOfferPrice("");
    setOfferQty("");
    setOfferMode(false);

    if (demo) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_company_id: myId,
      receiver_company_id: active,
      content,
      is_negotiation_offer: isOffer,
      offer_amount,
    });
    setSending(false);
  }

  function acceptOffer(price: number) {
    if (!active || !myId) return;
    appendLocal({
      id: `tmp-${Date.now()}`,
      sender_company_id: myId,
      receiver_company_id: active,
      content: `✓ Angebot angenommen — ${chf(price)} CHF/Einheit`,
      is_negotiation_offer: false,
      offer_amount: null,
      created_at: new Date().toISOString(),
    });
    if (!demo)
      supabase.from("messages").insert({
        sender_company_id: myId,
        receiver_company_id: active,
        content: `✓ Angebot angenommen — ${chf(price)} CHF/Einheit`,
        is_negotiation_offer: false,
        offer_amount: null,
      });
  }

  return (
    <div className={cn(CARD, "grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden sm:grid-cols-[300px_1fr] lg:grid-cols-[300px_minmax(0,1fr)_300px]")}>
      {/* Thread list */}
      <aside className={cn("flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/60", active && "hidden sm:flex")}>
        <div className="border-b border-slate-200 bg-white px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              Nachrichten
              {totalUnread > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                  {totalUnread}
                </span>
              )}
            </h2>
            <span className="text-[11px] font-medium text-slate-400">{threads.length} verbunden</span>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Firma suchen …"
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/50 focus:bg-white"
            />
          </div>
          {demo && <p className="mt-2 text-[11px] text-slate-400">Beispiel-Konversationen</p>}
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            </li>
          ) : visibleThreads.length === 0 ? (
            <li className="px-4 py-6 text-center text-[13px] text-slate-400">Keine Firma gefunden.</li>
          ) : (
            visibleThreads.map((c) => {
              const last = (msgs[c.id] ?? []).at(-1);
              const deal = deals[c.id];
              const un = unread[c.id] ?? 0;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openThread(c.id)}
                    className={cn(
                      "relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white",
                      active === c.id ? "bg-white" : "bg-transparent",
                    )}
                  >
                    {active === c.id && <span className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-brand" />}
                    <span className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-offset-2 ring-offset-slate-50",
                      c.role === "SUPPLIER" ? "bg-navy-900 text-white ring-navy-900/15" : "bg-brand/15 text-brand ring-brand/25",
                    )}>
                      {initials(c.company_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1 text-[13px] font-semibold text-slate-900">
                          <span className="truncate">{c.company_name}</span>
                          {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
                        </span>
                        {last && <span className="shrink-0 text-[10px] font-medium text-slate-400">{ago(last.created_at)}</span>}
                      </span>
                      <span className={cn("mt-0.5 block truncate text-[12px]", un > 0 ? "font-semibold text-slate-700" : "text-slate-400")}>
                        {last ? (last.is_negotiation_offer ? "💬 Verhandlungs-Angebot" : last.content) : "Neue Konversation"}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        {deal && (
                          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            <Boxes className="h-3 w-3 text-brand" /> {deal.material}
                          </span>
                        )}
                        {un > 0 && (
                          <span className="ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white" style={{ height: 18 }}>
                            {un}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      {/* Conversation */}
      <section className={cn("flex min-h-0 flex-col", !active && "hidden sm:flex")}>
        {activeCompany ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <button type="button" onClick={() => setActive(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 sm:hidden">
                <X className="h-4 w-4" />
              </button>
              <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
                activeCompany.role === "SUPPLIER" ? "bg-navy-900 text-white" : "bg-brand/15 text-brand",
              )}>
                {initials(activeCompany.company_name)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                  <span className="truncate">{activeCompany.company_name}</span>
                  {activeCompany.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeCompany.role ? ROLE_LABEL[activeCompany.role] ?? activeCompany.role : "Firma"}
                  {activeCompany.city ? ` · ${activeCompany.city}` : ""}
                </div>
              </div>
            </div>

            {/* Deal-Kontext-Ribbon: verknüpft die Konversation mit dem Bündel */}
            {activeDeal && (
              <Link
                href="/pools"
                className="group flex items-center gap-3 border-b border-brand/20 bg-gradient-to-r from-brand/[0.07] to-transparent px-4 py-2.5 transition-colors hover:from-brand/[0.12]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand/15 text-brand">
                  <Boxes className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                    <span className="truncate">{activeDeal.material}</span>
                    <span className="rounded border border-brand/30 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                      {activeDeal.phase}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                    <span>{activeDeal.volume}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {activeDeal.region}</span>
                    {activeDeal.savingsPct > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-brand">
                        <TrendingDown className="h-3 w-3" /> −{activeDeal.savingsPct.toFixed(1)}% ggü. KBOB
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-100/70 px-4 py-4">
              {activeMsgs.map((m) => {
                const mine = m.sender_company_id === myId;
                if (m.is_negotiation_offer) {
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-[85%] max-w-sm overflow-hidden rounded-lg border border-brand/30 bg-white shadow-card">
                        <div className="flex items-center gap-1.5 border-b border-brand/15 bg-brand/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-brand">
                          <Tag className="h-3.5 w-3.5" /> Verhandlungs-Angebot
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-slate-700">{m.content}</p>
                          <div className="mt-2 text-2xl font-bold text-slate-900">
                            CHF {chf(m.offer_amount ?? 0)}
                            <span className="text-sm font-normal text-slate-400"> / Einheit</span>
                          </div>
                          {!mine && (
                            <div className="mt-3 flex gap-2">
                              <button type="button" onClick={() => acceptOffer(m.offer_amount ?? 0)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:brightness-95">
                                <Check className="h-4 w-4" /> Annehmen
                              </button>
                              <button type="button" onClick={() => { setOfferMode(true); setOfferPrice(String(m.offer_amount ?? "")); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100">
                                <Repeat className="h-4 w-4" /> Gegenangebot
                              </button>
                            </div>
                          )}
                          <div className="mt-2 text-right text-[10px] text-slate-400">{time(m.created_at)}</div>
                        </div>
                      </motion.div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-lg px-3.5 py-2 text-sm shadow-sm", mine ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-700")}>
                      {m.content}
                      <div className={cn("mt-1 text-right text-[10px]", mine ? "text-white/70" : "text-slate-400")}>{time(m.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="border-t border-slate-200 bg-white p-3">
              {offerMode && (
                <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-brand/30 bg-brand/[0.04] p-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">Angebot</span>
                  <input value={offerQty} onChange={(e) => setOfferQty(e.target.value)} placeholder="Menge (z. B. 230 m³)" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-brand/50" />
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                    <span className="text-[11px] text-slate-400">CHF</span>
                    <input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} type="number" placeholder="Preis/Einheit" className="w-24 bg-transparent text-xs text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <button type="button" onClick={() => setOfferMode(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOfferMode((v) => !v)} title="Angebot senden" className={cn("rounded-lg border p-2.5 transition-colors", offerMode ? "border-brand bg-brand/10 text-brand" : "border-slate-200 text-slate-500 hover:bg-slate-100")}>
                  <Tag className="h-4 w-4" />
                </button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !offerMode && send()}
                  placeholder={offerMode ? "Optionale Notiz zum Angebot …" : "Nachricht schreiben …"}
                  className="h-11 flex-1 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/50 focus:bg-white"
                />
                <button type="button" onClick={send} disabled={!canSend || sending} className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-100/70 text-slate-400">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-card">
              <MessageSquare className="h-6 w-6 text-brand" />
            </span>
            <p className="text-sm font-medium text-slate-500">Wähle links eine Konversation.</p>
            <p className="max-w-[240px] text-center text-xs text-slate-400">
              Verhandle Mengen, sende Angebote und schliesse Bündel direkt mit deinen Baupartnern ab.
            </p>
          </div>
        )}
      </section>

      {/* Kontakt-/Deal-Panel */}
      <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50/40 lg:flex">
        {activeCompany ? (
          <ContactPanel company={activeCompany} deal={activeDeal} onOffer={() => setOfferMode(true)} />
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-slate-400">
            Firmen-Kontaktdaten erscheinen hier, sobald du eine Konversation öffnest.
          </div>
        )}
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Kontakt-/Deal-Panel                                                        */
/* -------------------------------------------------------------------------- */

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk / Lieferant",
};

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  const missing = !value;
  const body = (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-slate-400 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
        <div className={cn("truncate text-[13px]", missing ? "text-slate-300" : "font-medium text-slate-700")}>
          {value ?? "Nicht hinterlegt"}
        </div>
      </div>
    </div>
  );
  if (href && !missing) {
    return (
      <a href={href} className="block rounded-lg p-1 transition-colors hover:bg-white">
        {body}
      </a>
    );
  }
  return <div className="p-1">{body}</div>;
}

function ContactPanel({ company, deal, onOffer }: { company: Company; deal: Deal | null; onOffer: () => void }) {
  const hasContact = company.email || company.phone || company.address || company.website;
  const site = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
            ) : (
              initials(company.company_name)
            )}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
              <span className="truncate">{company.company_name}</span>
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
            </div>
            <p className="truncate text-[11px] text-slate-400">
              {company.role ? ROLE_LABEL[company.role] ?? company.role : "Firma"}
              {company.city ? ` · ${company.city}` : ""}
            </p>
          </div>
        </div>
        {company.verified && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> Verifizierter Baupartner
          </div>
        )}
      </div>

      {/* Gemeinsamer Deal */}
      {deal && (
        <div className="border-b border-slate-200 px-3 py-3">
          <div className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Gemeinsames Bündel
          </div>
          <div className="rounded-lg border border-brand/25 bg-gradient-to-br from-brand/[0.06] to-white p-3">
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
              <Boxes className="h-4 w-4 text-brand" /> {deal.material}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-slate-400">Volumen</div>
                <div className="font-semibold text-slate-800">{deal.volume}</div>
              </div>
              <div>
                <div className="text-slate-400">Region</div>
                <div className="font-semibold text-slate-800">{deal.region}</div>
              </div>
              <div>
                <div className="text-slate-400">Status</div>
                <div className="flex items-center gap-1 font-semibold text-slate-800"><Clock className="h-3 w-3 text-slate-400" /> {deal.phase}</div>
              </div>
              {deal.savingsPct > 0 && (
                <div>
                  <div className="text-slate-400">Ersparnis</div>
                  <div className="font-semibold text-brand">−{deal.savingsPct.toFixed(1)}%</div>
                </div>
              )}
            </div>
            <Link href="/pools" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline">
              Zum Bündel <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-1 px-3 py-3">
        <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Kontakt · deal-ready
        </div>
        <ContactRow icon={Mail} label="E-Mail" value={company.email} href={company.email ? `mailto:${company.email}` : undefined} />
        <ContactRow icon={Phone} label="Telefon" value={company.phone} href={company.phone ? `tel:${company.phone.replace(/\s/g, "")}` : undefined} />
        <ContactRow icon={MapPin} label="Adresse" value={company.address} />
        <ContactRow icon={Globe} label="Website" value={company.website} href={site ?? undefined} />
      </div>

      {!hasContact && (
        <p className="px-4 pb-2 text-[11px] leading-relaxed text-slate-400">
          Diese Firma hat noch keine Kontaktdaten hinterlegt.
        </p>
      )}

      <div className="mt-auto space-y-2 border-t border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={onOffer}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Tag className="h-4 w-4" /> Angebot senden
        </button>
        <Link
          href={`/company/${company.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Building2 className="h-4 w-4" /> Profil ansehen
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
