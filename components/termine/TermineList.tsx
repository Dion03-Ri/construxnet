"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, MapPin, ArrowRight, Check, Gavel, Layers, Users, Megaphone } from "lucide-react";
import { TERMINE, type Termin, type TerminType } from "@/data/termine";
import { CARD, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

const TYPE_META: Record<TerminType, { tone: "gold" | "navy" | "accent" | "slate"; icon: typeof Gavel }> = {
  "Ausschreibung": { tone: "gold", icon: Megaphone },
  "Sealed-Bid": { tone: "navy", icon: Gavel },
  "Pool-Deadline": { tone: "accent", icon: Layers },
  "Netzwerk-Event": { tone: "slate", icon: Users },
};

function dateFor(t: Termin) {
  const d = new Date();
  d.setDate(d.getDate() + t.inDays);
  d.setHours(t.hour, 0, 0, 0);
  return d;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** ICS-Zeitstempel in UTC (…Z). */
function icsStamp(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00Z"
  );
}

function downloadIcs(t: Termin) {
  const start = dateFor(t);
  const end = new Date(start.getTime() + t.durationH * 3600_000);
  const uid = `${t.id}-${start.getTime()}@construxnet`;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ConstruxNet//Termine//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${esc(t.title)}`,
    `DESCRIPTION:${esc(t.description)}`,
    `LOCATION:${esc(t.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.id}-construxnet.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function TerminCard({ t }: { t: Termin }) {
  const [added, setAdded] = useState(false);
  const d = useMemo(() => dateFor(t), [t]);
  const meta = TYPE_META[t.type];
  const Icon = meta.icon;

  return (
    <div className={cn(CARD, "flex flex-col gap-4 p-5 sm:flex-row sm:items-start")}>
      {/* Datums-Kachel */}
      <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center sm:w-20">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {d.toLocaleDateString("de-CH", { month: "short" })}
        </span>
        <span className="text-2xl font-bold leading-tight text-slate-900">{d.getDate()}</span>
        <span className="text-[11px] text-slate-400">{d.toLocaleDateString("de-CH", { weekday: "short" })}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={badge(meta.tone, true)}><Icon className="h-3 w-3" /> {t.type}</span>
          <span className="text-[12px] text-slate-400">
            {d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} Uhr
          </span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-semibold text-slate-900">{t.title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{t.description}</p>
        <p className="mt-2 flex items-center gap-1 text-[12px] text-slate-400">
          <MapPin className="h-3.5 w-3.5" /> {t.location} · {t.region}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { downloadIcs(t); setAdded(true); }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold transition-colors",
              added ? "bg-accent/10 text-accent" : "bg-brand text-navy-900 hover:bg-brand-500",
            )}
          >
            {added ? <><Check className="h-4 w-4" /> Zum Kalender hinzugefügt</> : <><CalendarPlus className="h-4 w-4" /> Zum Kalender hinzufügen</>}
          </button>
          {t.href && (
            <Link href={t.href} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TermineList() {
  const sorted = useMemo(() => [...TERMINE].sort((a, b) => a.inDays - b.inDays), []);
  return (
    <div className="space-y-3">
      {sorted.map((t) => <TerminCard key={t.id} t={t} />)}
    </div>
  );
}
