"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Package,
  TrendingUp,
  Tag,
  UserPlus,
  Gavel,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "all" | "pool" | "offer";

type Notice = {
  id: string;
  cat: "pool" | "offer" | "network";
  icon: LucideIcon;
  tone: string;
  text: string;
  time: string;
  href: string;
};

const NOTICES: Notice[] = [
  { id: "n1", cat: "pool", icon: Package, tone: "text-brand bg-brand/10", text: "KIBAG Baustoffe hat den Pool „Beton C25/30“ bestätigt.", time: "vor 12 Min.", href: "/pools" },
  { id: "n2", cat: "pool", icon: TrendingUp, tone: "text-emerald bg-emerald/10", text: "Neuer Rabatt-Tier 2 erreicht (−12 %) im Pool Beton C25/30.", time: "vor 1 Std.", href: "/pools" },
  { id: "n3", cat: "offer", icon: Tag, tone: "text-accent bg-accent/10", text: "Vigier Beton Mittelland: neues Angebot 145.20 CHF/m³.", time: "vor 3 Std.", href: "/messages" },
  { id: "n4", cat: "network", icon: UserPlus, tone: "text-slate-600 bg-slate-100", text: "Gebr. Meier Hochbau möchte sich mit dir vernetzen.", time: "vor 5 Std.", href: "/network" },
  { id: "n5", cat: "pool", icon: Gavel, tone: "text-brand bg-brand/10", text: "Sealed-Bid-Phase für „Kies 0/45 Nordwestschweiz“ startet in 2 Tagen.", time: "gestern", href: "/pools" },
];

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "pool", label: "Pool-Updates" },
  { key: "offer", label: "Angebote" },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [read, setRead] = useState<Set<string>>(new Set());

  const unread = NOTICES.filter((n) => !read.has(n.id)).length;
  const list = useMemo(
    () => NOTICES.filter((n) => (tab === "all" ? true : n.cat === tab)),
    [tab],
  );

  function markRead(id: string) {
    setRead((r) => new Set(r).add(id));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Benachrichtigungen"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-cardhover backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-900">Benachrichtigungen</span>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => setRead(new Set(NOTICES.map((n) => n.id)))}
                    className="text-[11px] font-medium text-brand hover:text-brand-600"
                  >
                    Alle gelesen
                  </button>
                )}
              </div>

              <div className="flex gap-1 border-b border-slate-100 px-2 py-2">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      tab === t.key ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-100",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <ul className="max-h-[360px] overflow-y-auto">
                {list.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-slate-400">Nichts Neues hier.</li>
                ) : (
                  list.map((n) => {
                    const isRead = read.has(n.id);
                    return (
                      <li key={n.id}>
                        <Link
                          href={n.href}
                          onClick={() => markRead(n.id)}
                          className={cn(
                            "flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                            !isRead && "bg-brand/[0.03]",
                          )}
                        >
                          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", n.tone)}>
                            <n.icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] leading-snug text-slate-700">{n.text}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{n.time}</p>
                          </div>
                          {!isRead && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
