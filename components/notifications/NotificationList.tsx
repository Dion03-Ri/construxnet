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
import { cn } from "@/lib/utils";

export default function NotificationList() {
  const [tab, setTab] = useState<"all" | NoticeCat>("all");
  const { notices, unread, isUnread, markAllSeen, loading } = useNotifications();

  const list = useMemo(
    () => notices.filter((n) => (tab === "all" ? true : n.cat === tab)),
    [notices, tab],
  );

  return (
    <div>
      {/* Der Titel steht im Kopfband der Seite — hier bleibt nur, was man
          mit der Liste tut. */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex flex-wrap gap-1">
          {NOTICE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                tab === t.key
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllSeen}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-brand-700"
          >
            <Check className="h-3.5 w-3.5" /> Alle als gelesen
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-14 text-center">
          <BellOff className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-[15px] font-semibold text-slate-900">
            {notices.length === 0 ? "Nichts Neues" : "Nichts in dieser Kategorie"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-slate-500">
            {notices.length === 0
              ? "Hier stehen Verbindungsanfragen, eingegangene Angebote, der Stand deiner Bündel und ungelesene Nachrichten — sobald es etwas gibt."
              : "In anderen Kategorien liegt vielleicht etwas."}
          </p>
        </div>
      ) : (
        <ul className="-mx-6 divide-y divide-slate-200 border-t border-slate-200 sm:-mx-9">
          {list.map((n) => {
            const fresh = isUnread(n);
            return (
              <li key={n.id} className={cn("relative", fresh && "bg-brand-50/50")}>
                {fresh && <span className="absolute left-0 top-0 h-full w-[3px] bg-brand" />}
                <Link
                  href={n.href}
                  className="flex items-start gap-3 py-3.5 pl-6 pr-4 transition-colors hover:bg-slate-50 sm:pl-9 sm:pr-6"
                >
                  <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full", n.tone)}>
                    <n.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] leading-snug text-slate-500">
                      <span className="font-semibold text-slate-900">{n.actor}</span> {n.text}
                    </p>
                    {relTime(n.at) && <p className="mt-1 text-[11px] text-slate-400">{relTime(n.at)}</p>}
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
