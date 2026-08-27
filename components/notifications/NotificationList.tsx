"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Check } from "lucide-react";
import { NOTICES, NOTICE_TABS, type NoticeCat } from "@/data/notifications";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function NotificationList() {
  const [tab, setTab] = useState<"all" | NoticeCat>("all");
  const [read, setRead] = useState<Set<string>>(new Set());

  const list = useMemo(
    () => NOTICES.filter((n) => (tab === "all" ? true : n.cat === tab)),
    [tab],
  );

  function markAll() {
    setRead(new Set(NOTICES.map((n) => n.id)));
  }

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {/* Kopf */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <h1 className="text-[15px] font-semibold text-slate-900">Benachrichtigungen</h1>
        <button
          type="button"
          onClick={markAll}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-brand"
        >
          <Check className="h-3.5 w-3.5" /> Alle als gelesen
        </button>
      </div>

      {/* Filter (scharfe Segmented-Tabs) */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 py-2.5">
        {NOTICE_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.key ? "bg-brand/10 text-brand" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <ul className="divide-y divide-slate-100">
        {list.map((n) => {
          const unread = !read.has(n.id);
          return (
            <li key={n.id} className={cn("relative", unread && "bg-brand/[0.03]")}>
              {unread && <span className="absolute left-0 top-0 h-full w-[3px] bg-brand" />}
              <Link
                href={n.href}
                onClick={() => setRead((r) => new Set(r).add(n.id))}
                className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:px-5"
              >
                <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full", n.tone)}>
                  <n.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-snug text-slate-700">
                    <span className="font-semibold text-slate-900">{n.actor}</span> {n.text}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{n.time}</p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-md p-1 text-slate-300">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="px-5 py-12 text-center text-sm text-slate-400">Keine Benachrichtigungen in dieser Kategorie.</li>
        )}
      </ul>
    </div>
  );
}
