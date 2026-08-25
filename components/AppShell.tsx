"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  HardHat,
  Home,
  Users,
  Package,
  LineChart,
  MessageSquare,
  Search,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/network", label: "Netzwerk", icon: Users },
  { href: "/pools", label: "Smart Pools", icon: Package },
  { href: "/kbob", label: "KBOB", icon: LineChart },
  { href: "/messages", label: "Nachrichten", icon: MessageSquare },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

function Logo({ href = "/feed" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-600 text-white shadow-sm shadow-brand/30">
        <HardHat className="h-5 w-5" />
      </span>
      <span className="hidden text-[15px] text-slate-900 sm:block">
        Construx<span className="text-brand">Net</span>
      </span>
    </Link>
  );
}

function TopBar() {
  const isActive = useActive();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 glass">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />

        <div className="relative hidden w-full max-w-xs md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Firmen, Pools, Materialien …"
            className="w-full rounded-full border border-slate-200 bg-slate-100/70 py-2 pl-9 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-brand/50 focus:bg-white"
          />
        </div>

        <nav className="ml-auto hidden items-stretch gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex w-[68px] flex-col items-center justify-center gap-0.5 pt-1 text-[11px] font-medium transition-colors",
                  active ? "text-brand" : "text-slate-500 hover:text-slate-900",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-[9px] h-0.5 w-full rounded-full transition-colors",
                    active ? "bg-brand" : "bg-transparent",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-2">
          <button
            type="button"
            aria-label="Benachrichtigungen"
            className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-white" />
          </button>
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: "h-8 w-8" } }}
          />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const isActive = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 glass md:hidden">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              active ? "text-brand" : "text-slate-500 hover:text-slate-900",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" />
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-600"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <MarketingHeader />
        {children}
      </SignedOut>

      <SignedIn>
        <TopBar />
        <div className="pb-20 md:pb-0">{children}</div>
        <MobileNav />
      </SignedIn>
    </>
  );
}
