"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, BellOff, ChevronRight } from "lucide-react";
import {
  useNotifications,
  NOTICE_TABS,
  relTime,
  type NoticeCat,
} from "@/lib/useNotifications";
import { PANEL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function NotificationList() {
  const [tab, setTab] = useState<"all" | NoticeCat>("all");
  const { notices, unread, isUnread, markAllSeen, loading } = useNotifications();

  const list = useMemo(
    () => notices.filter((n) => (tab === "all" ? true : n.cat === tab)),
    [notices, tab],
  );

  return (
    <div className={cn(PANEL, "overflow-hidden")}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
        <h1 className="text-[15px] font-semibold text-white">
          Benachrichtigungen
          {unread > 0 && (
            <span className="ml-2 rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-navy-900">
              {unread}
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllSeen}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-white/55 transition-colors hover:text-brand"
          >
            <Check className="h-3.5 w-3.5" /> Alle als gelesen
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/[0.08] px-3 py-2.5">
        {NOTICE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.key
                ? "bg-brand/10 text-brand"
                : "text-white/55 hover:bg-white/[0.07] hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <BellOff className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-3 text-[15px] font-semibold text-white/90">
            {notices.length === 0 ? "Nichts Neues" : "Nichts in dieser Kategorie"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-white/55">
            {notices.length === 0
              ? "Hier stehen Verbindungsanfragen, eingegangene Angebote, der Stand deiner Bündel und ungelesene Nachrichten — sobald es etwas gibt."
              : "In anderen Kategorien liegt vielleicht etwas."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {list.map((n) => {
            const fresh = isUnread(n);
            return (
              <li key={n.id} className={cn("relative", fresh && "bg-brand/[0.03]")}>
                {fresh && <span className="absolute left-0 top-0 h-full w-[3px] bg-brand" />}
                <Link
                  href={n.href}
                  className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.05] sm:px-5"
                >
                  <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full", n.tone)}>
                    <n.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] leading-snug text-white/75">
                      <span className="font-semibold text-white">{n.actor}</span> {n.text}
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">{relTime(n.at)}</p>
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-white/25" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
