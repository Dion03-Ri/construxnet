"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { HardHat, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/feed", label: "Netzwerk Feed" },
  { href: "/pools", label: "Smart Pools" },
  { href: "/kbob", label: "KBOB Index" },
  { href: "/messages", label: "Nachrichten" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="text-slate-50">
            Construx<span className="text-brand">Net</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-white/10 text-slate-50"
                  : "text-slate-400 hover:text-slate-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-600"
            >
              Login
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-slate-100"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/10 bg-navy-950/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-white/10 text-slate-50"
                    : "text-slate-300 hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            ))}
            <SignedOut>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-medium text-white"
              >
                Login
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="mt-1 flex items-center gap-3 px-3 py-2">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-slate-400">Mein Konto</span>
              </div>
            </SignedIn>
          </div>
        </nav>
      )}
    </header>
  );
}
