"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  ArrowRight,
  Check,
  Gavel,
  Layers,
  Loader2,
  CalendarDays,
  Clock,
} from "lucide-react";
import { useBundles, type Bundle } from "@/lib/bundles";
import { PANEL, badge } from "@/lib/ui";
import { cn } from "@/lib/utils";

/**
 * Ein Termin ist hier immer eine echte Frist eines Bündels, an dem die
 * eigene Firma beteiligt ist. Erfundene Anlässe stehen nicht im Kalender —
 * ein Termin, den es nicht gibt, ist schlimmer als eine leere Liste.
 */
type Termin = {
  id: string;
  kind: "Sammelfrist" | "Angebotsfrist";
  title: string;
  description: string;
  at: Date;
  href: string;
};

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
  // Fristen sind Zeitpunkte, keine Sitzungen — eine Stunde Dauer reicht,
  // damit der Eintrag im Kalender sichtbar ist.
  const end = new Date(t.at.getTime() + 3_600_000);
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Obtanet//Termine//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${t.id}@obtanet`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(t.at)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${esc(t.title)}`,
    `DESCRIPTION:${esc(t.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.id}-obtanet.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toTermine(b: Bundle, myVolume: number): Termin[] {
  const name = `${b.material_label ?? b.title} · ${b.region}`;
  const menge = `${myVolume.toLocaleString("de-CH")} ${b.unit}`;
  const out: Termin[] = [];

  if (b.status === "OPEN") {
    out.push({
      id: `bundle-${b.id}-collect`,
      kind: "Sammelfrist",
      title: `Sammelfrist endet: ${name}`,
      description:
        `Bis dahin kannst du deine Menge noch erhöhen — je grösser das Bündel, ` +
        `desto höher der garantierte Mindestvorteil. Deine Menge: ${menge}. ` +
        `Danach geht das Bündel in die Ausschreibung, sofern genug Firmen dabei sind.`,
      at: new Date(b.deadline),
      href: "/pools",
    });
  }

  if (b.status === "SEALED_BIDDING" && b.bid_deadline) {
    out.push({
      id: `bundle-${b.id}-bid`,
      kind: "Angebotsfrist",
      title: `Angebotsfrist endet: ${name}`,
      description:
        `Die Baustoffwerke bieten verdeckt. Nach Fristende bekommt das ` +
        `günstigste Angebot den Zuschlag, gemessen am KBOB-Referenzpreis. ` +
        `Deine Menge: ${menge}.`,
      at: new Date(b.bid_deadline),
      href: "/pools",
    });
  }

  return out;
}

const KIND_META = {
  Sammelfrist: { tone: "gold" as const, icon: Layers },
  Angebotsfrist: { tone: "navy" as const, icon: Gavel },
};

function TerminCard({ t }: { t: Termin }) {
  const [added, setAdded] = useState(false);
  const meta = KIND_META[t.kind];
  const Icon = meta.icon;
  const past = t.at.getTime() < Date.now();

  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-5 sm:flex-row sm:items-start")}>
      <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center sm:w-20">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {t.at.toLocaleDateString("de-CH", { month: "short" })}
        </span>
        <span className="text-2xl font-bold leading-tight text-white">{t.at.getDate()}</span>
        <span className="text-[11px] text-white/40">
          {t.at.toLocaleDateString("de-CH", { weekday: "short" })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={badge(meta.tone, true)}>
            <Icon className="h-3 w-3" /> {t.kind}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-white/40">
            <Clock className="h-3.5 w-3.5" />
            {t.at.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} Uhr
          </span>
          {past && (
            <span className="text-[12px] font-semibold text-rose-300">abgelaufen</span>
          )}
        </div>
        <h3 className="mt-1.5 text-[15px] font-semibold text-white">{t.title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-white/55">{t.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { downloadIcs(t); setAdded(true); }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold transition-colors",
              added ? "bg-accent/10 text-accent" : "bg-brand text-navy-900 hover:bg-brand/100",
            )}
          >
            {added ? (
              <><Check className="h-4 w-4" /> Zum Kalender hinzugefügt</>
            ) : (
              <><CalendarPlus className="h-4 w-4" /> Zum Kalender hinzufügen</>
            )}
          </button>
          <Link
            href={t.href}
            className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] px-3.5 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/[0.05]"
          >
            Zum Bündel <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TermineList() {
  const { bundles, mine, loading } = useBundles();

  const termine = useMemo(() => {
    const volumes = new Map<string, number>();
    for (const p of mine) volumes.set(p.bundle_id, Number(p.requested_volume));
    return bundles
      .filter((b) => volumes.has(b.id))
      .flatMap((b) => toTermine(b, volumes.get(b.id) ?? 0))
      .sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [bundles, mine]);

  if (loading) {
    return (
      <div className={cn(PANEL, "grid place-items-center py-16 text-white/40")}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (termine.length === 0) {
    return (
      <div className={cn(PANEL, "px-6 py-14 text-center")}>
        <CalendarDays className="mx-auto h-8 w-8 text-white/25" />
        <p className="mt-3 text-[15px] font-semibold text-white/90">Keine anstehenden Fristen</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-white/55">
          Sobald du an einem Bündel beteiligt bist, stehen hier seine Sammel- und
          Angebotsfristen — mit einem Klick in deinen Kalender.
        </p>
        <Link
          href="/beschaffung"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand/100"
        >
          Bedarf melden <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {termine.map((t) => <TerminCard key={t.id} t={t} />)}
    </div>
  );
}
