import Link from "next/link";
import { BadgeCheck, Users, Package, Bookmark, FileText } from "lucide-react";
import type { Company } from "@/lib/company";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk",
  ADMIN: "Admin",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="h-16 bg-gradient-to-r from-brand/40 via-brand/20 to-emerald/30" />
        <div className="px-4 pb-4">
          <Link href={`/company/${company.id}`} className="group block">
            <div className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-900 bg-navy-800 text-lg font-semibold text-slate-200">
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
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <h2 className="font-semibold leading-tight text-slate-50 group-hover:text-brand">
                {company.company_name}
              </h2>
              {company.verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald" />
              )}
            </div>
          </Link>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {ROLE_LABEL[company.role] ?? company.role}
            {company.city ? ` · ${company.city}` : ""}
          </p>

          <div className="mt-4 space-y-1 border-t border-slate-800 pt-3">
            <Link
              href="/network"
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Verbindungen
              </span>
              <span className="font-semibold text-brand">{connections}</span>
            </Link>
            <Link
              href="/pools"
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Aktive Pools
              </span>
              <span className="font-semibold text-brand">{pools}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick-Links */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-2 backdrop-blur">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-slate-100"
        >
          <FileText className="h-4 w-4 text-slate-500" />
          SIA-Verträge & Dashboard
        </Link>
        <Link
          href="/pools"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-slate-100"
        >
          <Bookmark className="h-4 w-4 text-slate-500" />
          Gespeicherte Pools
        </Link>
      </div>
    </div>
  );
}
