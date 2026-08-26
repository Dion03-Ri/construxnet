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
];

function demoMsgs(counterId: string, meId: string): Msg[] {
  const t = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
  if (counterId === "d-kibag")
    return [
      { id: "m1", sender_company_id: counterId, receiver_company_id: meId, content: "Grüezi! Wir haben Kapazität für euren Beton-C25/30-Pool im Limmattal.", is_negotiation_offer: false, offer_amount: null, created_at: t(6) },
      { id: "m2", sender_company_id: meId, receiver_company_id: counterId, content: "Perfekt. Aktuelles Poolvolumen liegt bei 230 m³. Was könnt ihr anbieten?", is_negotiation_offer: false, offer_amount: null, created_at: t(5) },
      { id: "m3", sender_company_id: counterId, receiver_company_id: meId, content: "Angebot: Beton C25/30 · 230 m³ · Lieferung Q4", is_negotiation_offer: true, offer_amount: 145.2, created_at: t(4) },
    ];
  if (counterId === "d-vigier")
    return [
      { id: "v1", sender_company_id: counterId, receiver_company_id: meId, content: "Transportbeton Region Mittelland verfügbar — gerne im Pool.", is_negotiation_offer: false, offer_amount: null, created_at: t(28) },
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

export default function ChatWindow({ initialTo }: { initialTo?: string }) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useSupabaseBrowser();

  const [myId, setMyId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Company[]>([]);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [demo, setDemo] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    setDemo(false);
    setThreads(list);
    setMsgs(map);
    setActive(initialTo && counterIds.has(initialTo) ? initialTo : list[0]?.id ?? null);
    setLoading(false);
  }, [isSignedIn, userId, supabase, initialTo]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCompany = threads.find((t) => t.id === active) ?? null;
  const activeMsgs = active ? msgs[active] ?? [] : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeMsgs.length, active]);

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
    <div className={cn(CARD, "grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden sm:grid-cols-[280px_1fr] lg:grid-cols-[260px_minmax(0,1fr)_290px]")}>
      {/* Thread list */}
      <aside className={cn("border-r border-slate-200", active && "hidden sm:block")}>
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Nachrichten</h2>
          {demo && <p className="text-[11px] text-slate-400">Beispiel-Konversationen</p>}
        </div>
        <ul className="overflow-y-auto">
          {loading ? (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            </li>
          ) : (
            threads.map((c) => {
              const last = (msgs[c.id] ?? []).at(-1);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActive(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                      active === c.id && "bg-brand/[0.05]",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {initials(c.company_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-[13px] font-semibold text-slate-900">
                        <span className="truncate">{c.company_name}</span>
                        {c.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald" />}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {last ? (last.is_negotiation_offer ? "💬 Angebot" : last.content) : "Neue Konversation"}
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
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <button type="button" onClick={() => setActive(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 sm:hidden">
                <X className="h-4 w-4" />
              </button>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {initials(activeCompany.company_name)}
              </span>
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                  {activeCompany.company_name}
                  {activeCompany.verified && <BadgeCheck className="h-4 w-4 text-emerald" />}
                </div>
                <div className="text-[11px] text-slate-400">{activeCompany.city}</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 px-4 py-4">
              {activeMsgs.map((m) => {
                const mine = m.sender_company_id === myId;
                if (m.is_negotiation_offer) {
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-[85%] max-w-sm rounded-lg border border-brand/30 bg-white p-4 shadow-card">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
                          <Tag className="h-3.5 w-3.5" /> Verhandlungs-Angebot
                        </div>
                        <p className="mt-1.5 text-sm text-slate-700">{m.content}</p>
                        <div className="mt-2 text-2xl font-bold text-slate-900">
                          CHF {chf(m.offer_amount ?? 0)}
                          <span className="text-sm font-normal text-slate-400"> / Einheit</span>
                        </div>
                        {!mine && (
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => acceptOffer(m.offer_amount ?? 0)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald px-3 py-2 text-sm font-medium text-white transition-colors hover:brightness-95">
                              <Check className="h-4 w-4" /> Annehmen
                            </button>
                            <button type="button" onClick={() => { setOfferMode(true); setOfferPrice(String(m.offer_amount ?? "")); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                              <Repeat className="h-4 w-4" /> Gegenangebot
                            </button>
                          </div>
                        )}
                        <div className="mt-2 text-right text-[10px] text-slate-400">{time(m.created_at)}</div>
                      </motion.div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-lg px-3.5 py-2 text-sm", mine ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-700")}>
                      {m.content}
                      <div className={cn("mt-1 text-right text-[10px]", mine ? "text-white/70" : "text-slate-400")}>{time(m.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="border-t border-slate-200 p-3">
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
                  className="h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/50 focus:bg-white"
                />
                <button type="button" onClick={send} disabled={!canSend || sending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">Wähle links eine Konversation.</p>
          </div>
        )}
      </section>

      {/* Kontakt-/Deal-Panel */}
      <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50/40 lg:flex">
        {activeCompany ? (
          <ContactPanel company={activeCompany} onOffer={() => setOfferMode(true)} />
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

function ContactPanel({ company, onOffer }: { company: Company; onOffer: () => void }) {
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
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald" />}
            </div>
            <p className="truncate text-[11px] text-slate-400">
              {company.role ? ROLE_LABEL[company.role] ?? company.role : "Firma"}
              {company.city ? ` · ${company.city}` : ""}
            </p>
          </div>
        </div>
        {company.verified && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-1 text-[11px] font-semibold text-emerald">
            <ShieldCheck className="h-3.5 w-3.5" /> Verifizierter Baupartner
          </div>
        )}
      </div>

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
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Tag className="h-4 w-4" /> Angebot senden
        </button>
        <Link
          href={`/company/${company.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Building2 className="h-4 w-4" /> Profil ansehen
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
