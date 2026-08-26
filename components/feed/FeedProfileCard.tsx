import Link from "next/link";
import { BadgeCheck, Users, Package, Bookmark, FileText, LineChart, Hash } from "lucide-react";
import type { Company } from "@/lib/company";
import { GEWERKE } from "@/data/feedMock";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk",
  ADMIN: "Admin",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function FeedProfileCard({
  company,
  connections,
  pools,
}: {
  company: Company;
  connections: number;
  pools: number;
}) {
  return (
    <div className="space-y-3">
      {/* Profilkarte */}
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="h-16 bg-gradient-to-r from-accent-600 via-accent-500 to-emerald" />
        <div className="px-4 pb-4">
          <Link href={`/company/${company.id}`} className="group block">
            <div className="-mt-9 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-4 border-white bg-slate-100 text-lg font-semibold text-slate-700 shadow-sm">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
              ) : (
                initials(company.company_name)
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <h2 className="font-semibold leading-tight text-slate-900 group-hover:text-brand">
                {company.company_name}
              </h2>
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald" />}
            </div>
          </Link>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {ROLE_LABEL[company.role] ?? company.role}
            {company.city ? ` · ${company.city}` : ""}
          </p>

          <div className="mt-4 grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 pt-3 text-center">
            <Link href="/network" className="group px-2">
              <div className="text-lg font-bold text-slate-900 group-hover:text-brand">{connections}</div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <Users className="h-3 w-3" /> Verbindungen
              </div>
            </Link>
            <Link href="/pools" className="group px-2">
              <div className="text-lg font-bold text-slate-900 group-hover:text-brand">{pools}</div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <Package className="h-3 w-3" /> Aktive Pools
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Meine Gewerke */}
      <div className={cn(CARD, "p-4")}>
        <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <Hash className="h-3.5 w-3.5 text-brand" /> Meine Gewerke
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {GEWERKE.map((g) => (
            <span
              key={g}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-brand/10 hover:text-brand"
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Quick-Links */}
      <div className={cn(CARD, "p-2")}>
        {[
          { href: "/dashboard", icon: FileText, label: "SIA-Verträge & Dashboard" },
          { href: "/pools", icon: Bookmark, label: "Gespeicherte Smart Pools" },
          { href: "/kbob", icon: LineChart, label: "KBOB-Favoriten" },
        ].map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <l.icon className="h-4 w-4 text-slate-400" />
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
