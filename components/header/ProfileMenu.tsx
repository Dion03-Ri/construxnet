"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  ChevronDown,
  LayoutDashboard,
  Users,
  Layers,
  Newspaper,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

function initials(name?: string | null) {
  if (!name) return "DU";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function ProfileMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const name = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Konto";
  const email = user?.primaryEmailAddress?.emailAddress;
  const img = user?.imageUrl;

  const avatar = (size: string) =>
    img ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={img} alt="" className={cn(size, "rounded-full object-cover")} />
    ) : (
      <span className={cn(size, "grid place-items-center rounded-full bg-brand text-[11px] font-bold text-navy-900")}>
        {initials(name)}
      </span>
    );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full p-0.5 text-white/70 transition-colors hover:text-white"
        aria-label="Profilmenü"
        aria-expanded={open}
      >
        {avatar("h-8 w-8")}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-cardhover">
          {/* Kopf */}
          <div className="flex items-center gap-3 border-b border-slate-100 p-4">
            {avatar("h-11 w-11")}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{name}</div>
              {email && <div className="truncate text-[11px] text-slate-400">{email}</div>}
            </div>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mx-3 mb-2 mt-3 flex items-center justify-center rounded-md border border-brand/40 bg-brand/10 py-1.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand/20"
          >
            Profil &amp; Dashboard ansehen
          </Link>

          <div className="px-1.5 pb-1.5">
            <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Konto</div>
            {[
              { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/network", icon: Users, label: "Mein Netzwerk" },
              { href: "/pools", icon: Layers, label: "Smart Pools" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <l.icon className="h-4 w-4 text-slate-400" /> {l.label}
              </Link>
            ))}

            <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Verwalten</div>
            {[
              { href: "/feed", icon: Newspaper, label: "Meine Beiträge" },
              { href: "/dashboard", icon: Settings, label: "Einstellungen" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <l.icon className="h-4 w-4 text-slate-400" /> {l.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" /> Ausloggen
          </button>
        </div>
      )}
    </div>
  );
}
