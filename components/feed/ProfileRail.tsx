"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Users,
  Inbox,
  ChevronRight,
  MessageSquare,
  CalendarDays,
  Boxes,
  Bookmark,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { GEWERKE } from "@/data/feedMock";

import { cn } from "@/lib/utils";

/**
 * Linke Schiene des Feeds.
 *
 * Bewusst hell. Der eingeloggte Bereich folgt der Stripe-Sprache: heller
 * Grund, hauchdünne Ränder, echte Zahlen, keine Dekoration. Vorher waren
 * alle drei Karten dunkelblau — nebeneinander ergab das eine Wand aus
 * schwarzen Klötzen, in der nichts mehr wichtiger war als anderes.
 *
 * Die drei getrennten Navigationskarten sind zu einer zusammengefasst:
 * drei Rahmen für sechs Verweise waren zwei Rahmen zu viel.
 */

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk / Lieferant",
  ADMIN: "Administrator",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const NAV_GROUPS: {
  head: string;
  links: { href: string; icon: typeof Users; label: string; badge?: string }[];
}[] = [
  {
    head: "Schnellzugriff",
    links: [
      { href: "/messages", icon: MessageSquare, label: "Nachrichten", badge: "3" },
      { href: "/termine", icon: CalendarDays, label: "Fristen" },
      { href: "/network", icon: Boxes, label: "Beschaffungs-Gruppen", badge: "5" },
    ],
  },
  {
    head: "Netzwerk verwalten",
    links: [
      { href: "/network", icon: Users, label: "Verbindungen" },
      { href: "/network/requests", icon: Inbox, label: "Empfangene Anfragen" },
      { href: "/pools/saved", icon: Bookmark, label: "Gespeicherte Pools" },
    ],
  },
];

export default function ProfileRail({
  company,
  connections,
  pools,
}: {
  company: Company;
  connections: number;
  pools: number;
}) {
  const [open, setOpen] = useState(true);
  const isSupplier = company.role === "SUPPLIER";

  return (
    <div className="space-y-4">
      {/* ---------- Firmenkarte ---------- */}
      <div className="border-t border-white/[0.08]">
        {/* Statt des lauten Goldverlaufs eine einzelne Goldkante. Sie
            markiert die Karte als „deine", ohne die Seite zu beherrschen. */}
        <div className="h-1 bg-brand" />

        <div className="pt-5">
          <Link
            href={`/company/${company.id}`}
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-navy-900 text-[17px] font-bold text-white"
          >
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo_url}
                alt={company.company_name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(company.company_name)
            )}
          </Link>

          <div className="mt-4 flex items-start gap-1.5">
            <Link
              href={`/company/${company.id}`}
              className="text-[17px] font-bold leading-tight tracking-tight text-white hover:text-brand"
            >
              {company.company_name}
            </Link>
            {company.verified && (
              <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-brand" />
            )}
          </div>

          <p className="mt-1.5 flex items-center gap-1 text-[12.5px] text-white/40">
            {ROLE_LABEL[company.role] ?? company.role}
            {company.city && (
              <>
                <span className="text-white/25">·</span>
                <MapPin className="h-3 w-3" /> {company.city}
              </>
            )}
          </p>

          {isSupplier ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                open
                  ? "bg-navy-900 text-white hover:bg-navy-800"
                  : "border border-white/[0.16] text-white/70 hover:bg-white/[0.05]",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  open ? "bg-brand" : "bg-slate-400",
                )}
              />
              {open ? "Offen für Aufträge" : "Als offen markieren"}
            </button>
          ) : (
            <Link
              href="/beschaffung"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-navy-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-800"
            >
              Materialbedarf melden
            </Link>
          )}

          {/* Zahlen gross und mit Tabellenziffern — sie sind der Grund,
              warum jemand hierher schaut. */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { href: "/network", n: connections, l: "Verbindungen" },
              { href: "/pools", n: pools, l: "Aktive Pools" },
            ].map((s) => (
              <Link key={s.l} href={s.href} className="group border-t border-white/[0.08] pt-3">
                <div className="font-display text-[26px] font-bold leading-none tabular-nums text-white group-hover:text-brand">
                  {s.n}
                </div>
                <div className="mt-1.5 text-[11.5px] text-white/40">{s.l}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Navigation, eine Karte statt drei ---------- */}
      <div className="border-t border-white/[0.08]">
        {NAV_GROUPS.map((g, gi) => (
          <div key={g.head} className={gi > 0 ? "border-t border-white/[0.08]" : undefined}>
            <div className="pb-2 pt-5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {g.head}
            </div>
            <div className="pb-2">
              {g.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-[13.5px] font-medium text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <l.icon className="h-4 w-4 shrink-0 text-white/40" />
                  <span className="flex-1 truncate">{l.label}</span>
                  {l.badge ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10.5px] font-bold tabular-nums text-navy-950">
                      {l.badge}
                    </span>
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-white/25" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Gewerke ---------- */}
      <div className="border-t border-white/[0.08] pt-5">
        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Deine Gewerke
        </h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {GEWERKE.map((g) => (
            <span
              key={g}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-white/70"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
