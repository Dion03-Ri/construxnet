"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  MapPin,
  Camera,
  Pencil,
  MoreHorizontal,
  Eye,
  Megaphone,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Sparkles,
} from "lucide-react";
import type { Company } from "@/lib/company";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk / Lieferant",
  ADMIN: "Administrator",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Stabile Pseudo-Zahl aus der Firmen-ID – identisch über Reloads. */
function seeded(id: string, salt: number, min: number, max: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  }
  const n = (h >>> 0) / 4294967295;
  return Math.round(min + n * (max - min));
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : `${n}`;
}

function strength(company: Company) {
  const checks = [
    !!company.company_name,
    !!company.uid_number,
    !!company.city,
    !!company.canton,
    !!company.bio,
    !!company.logo_url,
    company.verified,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function strengthLabel(pct: number) {
  if (pct >= 90) return "Experte";
  if (pct >= 65) return "Fortgeschritten";
  if (pct >= 40) return "Aufbauend";
  return "Einsteiger";
}

export default function ProfileHero({
  company,
  connections,
  pools,
}: {
  company: Company;
  connections: number;
  pools: number;
}) {
  const [openForWork, setOpenForWork] = useState(true);
  const pct = strength(company);

  const views = seeded(company.id, 11, 340, 2400);
  const impressions = seeded(company.id, 23, 120, 1400);
  const searches = seeded(company.id, 37, 60, 900);

  const kpis = [
    {
      label: "Profilaufrufe",
      value: fmt(views),
      trend: `+${seeded(company.id, 41, 4, 22)}%`,
      icon: Eye,
      tint: "from-brand/10 to-brand/5",
      ring: "text-brand",
    },
    {
      label: "Angebots-Impressionen",
      value: fmt(impressions),
      trend: `+${seeded(company.id, 43, 3, 18)}%`,
      icon: Megaphone,
      tint: "from-emerald/10 to-emerald/5",
      ring: "text-emerald",
    },
    {
      label: "Such-Treffer",
      value: fmt(searches),
      trend: `+${seeded(company.id, 47, 2, 14)}%`,
      icon: Search,
      tint: "from-accent/10 to-accent/5",
      ring: "text-accent",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(CARD, "overflow-hidden")}
    >
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-r from-brand via-brand-600 to-emerald sm:h-40">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            {company.verified ? "Verifizierter Baupartner" : "Profil in Verifizierung"}
          </span>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            aria-label="Cover bearbeiten"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Identity */}
          <div className="min-w-0">
            <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-4 border-white bg-slate-100 text-2xl font-bold text-slate-700 shadow-card sm:-mt-14 sm:h-28 sm:w-28">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
              ) : (
                initials(company.company_name)
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {company.company_name}
              </h1>
              {company.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-emerald" />}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {ROLE_LABEL[company.role] ?? company.role}
              {company.bio ? ` · ${company.bio}` : ""}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
              {(company.city || company.canton) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[company.city, company.canton].filter(Boolean).join(", ")}
                </span>
              )}
              <Link href="/network" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                <Users className="h-3.5 w-3.5" />
                {connections >= 500 ? "500+" : connections} Verbindungen
              </Link>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald" />
                {pools} aktive Pools
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenForWork((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                openForWork
                  ? "bg-emerald text-white shadow-sm shadow-emerald/30 hover:bg-emerald-500"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", openForWork ? "bg-white" : "bg-emerald")} />
              Offen für Aufträge
            </button>
            <Link
              href={`/company/${company.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Profil bearbeiten
            </Link>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
              aria-label="Mehr"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Profilstärke */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium text-slate-600">
              Profilstärke: <span className="font-semibold text-brand">{strengthLabel(pct)}</span>
            </span>
            <span className="font-semibold text-slate-900">{pct}% vollständig</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-brand to-emerald"
            />
          </div>
          {pct < 100 && (
            <p className="mt-2 text-[11px] text-slate-400">
              Vervollständige Bio, Logo und Verifizierung, um in Smart-Pool-Suchen weiter oben zu erscheinen.
            </p>
          )}
        </div>

        {/* Dashboard-KPIs */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Analytics · nur für dich sichtbar
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {kpis.map((k) => (
              <div
                key={k.label}
                className={cn(
                  "rounded-lg border border-slate-200 bg-gradient-to-br p-3",
                  k.tint,
                )}
              >
                <div className="flex items-center justify-between">
                  <k.icon className={cn("h-4 w-4", k.ring)} />
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald">
                    <ArrowUpRight className="h-3 w-3" />
                    {k.trend}
                  </span>
                </div>
                <div className="mt-1.5 text-lg font-bold text-slate-900">{k.value}</div>
                <div className="truncate text-[11px] text-slate-500">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
