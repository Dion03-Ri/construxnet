"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Users,
  Inbox,
  Hash,
  ChevronRight,
  MessageSquare,
  CalendarDays,
  Boxes,
  Bookmark,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { GEWERKE } from "@/data/feedMock";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk / Lieferant",
  ADMIN: "Administrator",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

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
      {/* Profilkarte (dunkel) */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-navy-900 text-white shadow-card">
        <div className="relative h-16 bg-gradient-to-r from-brand via-brand-600 to-navy-700">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>
        <div className="px-4 pb-4">
          <Link
            href={`/company/${company.id}`}
            className="relative z-10 -mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-navy-900 bg-navy-800 text-lg font-bold text-white"
          >
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
            ) : (
              initials(company.company_name)
            )}
          </Link>
          <div className="mt-2.5 flex items-center gap-1.5">
            <Link href={`/company/${company.id}`} className="truncate font-semibold leading-tight text-white hover:text-brand">
              {company.company_name}
            </Link>
            {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-white/55">
            {ROLE_LABEL[company.role] ?? company.role}
            {company.city && (
              <>
                <span className="text-white/25">·</span>
                <MapPin className="h-3 w-3" /> {company.city}
              </>
            )}
          </p>

          {/* „Offen für Aufträge" ist ein Lieferanten-Status — nur für Baustoffwerke. */}
          {isSupplier && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                open
                  ? "bg-brand text-navy-900 hover:bg-brand-500"
                  : "border border-white/15 text-white/70 hover:bg-white/5",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", open ? "bg-navy-900" : "bg-brand")} />
              {open ? "Offen für Aufträge" : "Als offen markieren"}
            </button>
          )}
          {!isSupplier && (
            <Link
              href="/beschaffung"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[12px] font-semibold text-navy-900 transition-colors hover:bg-brand-500"
            >
              Materialbedarf melden
            </Link>
          )}

          <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-3 text-center">
            <Link href="/network" className="group">
              <div className="text-lg font-bold text-white group-hover:text-brand">{connections}</div>
              <div className="text-[11px] text-white/50">Verbindungen</div>
            </Link>
            <Link href="/pools" className="group">
              <div className="text-lg font-bold text-white group-hover:text-brand">{pools}</div>
              <div className="text-[11px] text-white/50">Aktive Pools</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Schnellzugriff (LinkedIn-Stil): Nachrichten · Termine · Gruppen */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-navy-900 text-white shadow-card">
        <div className="border-b border-white/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          Schnellzugriff
        </div>
        <div className="p-1.5">
          {[
            { href: "/messages", icon: MessageSquare, label: "Nachrichten", badge: "3" },
            { href: "/termine", icon: CalendarDays, label: "Termine & Ausschreibungen", badge: null },
            { href: "/network", icon: Boxes, label: "Beschaffungs-Gruppen", badge: "5" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
            >
              <l.icon className="h-4 w-4 text-brand/80" />
              <span className="flex-1">{l.label}</span>
              {l.badge ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-navy-900">
                  {l.badge}
                </span>
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Netzwerk verwalten (dunkel) */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-navy-900 text-white shadow-card">
        <div className="border-b border-white/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          Netzwerk verwalten
        </div>
        <div className="p-1.5">
          {[
            { href: "/network", icon: Users, label: "Verbindungen" },
            { href: "/network/requests", icon: Inbox, label: "Empfangene Anfragen" },
            { href: "/pools/saved", icon: Bookmark, label: "Gespeicherte Pools" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
            >
              <l.icon className="h-4 w-4 text-white/40" />
              <span className="flex-1">{l.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            </Link>
          ))}
        </div>
      </div>

      {/* Gewerke */}
      <div className="rounded-lg border border-white/10 bg-navy-900 p-4 text-white shadow-card">
        <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          <Hash className="h-3.5 w-3.5 text-brand" /> Deine Gewerke
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {GEWERKE.map((g) => (
            <span
              key={g}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/70"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
