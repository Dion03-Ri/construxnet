"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ArrowRight } from "lucide-react";
import { NOTICES, type NoticeCat } from "@/data/notifications";
import { cn } from "@/lib/utils";

type Tab = "all" | NoticeCat;

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
        className="relative grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-brand px-[3px] text-[9px] font-bold leading-none text-navy-900 ring-2 ring-navy-900">
            {unread > 9 ? "9+" : unread}
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
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
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
                            <p className="text-[13px] leading-snug text-slate-700">
                              <span className="font-semibold text-slate-900">{n.actor}</span> {n.text}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{n.time}</p>
                          </div>
                          {!isRead && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>

              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[13px] font-semibold text-brand transition-colors hover:bg-slate-50"
              >
                Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
