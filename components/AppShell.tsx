"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  HardHat,
  Users,
  Package,
  LineChart,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/header/NotificationBell";
import GlobalSearch from "@/components/header/GlobalSearch";
import ProfileMenu from "@/components/header/ProfileMenu";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/network", label: "Netzwerk", icon: Users },
  { href: "/pools", label: "Bündeln", icon: Package },
  { href: "/messages", label: "Nachrichten", icon: MessageSquare },
  { href: "/kbob", label: "KBOB", icon: LineChart },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

function Logo({ href = "/network", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white shadow-sm shadow-brand/30">
        <HardHat className="h-5 w-5" />
      </span>
      <span className={cn("hidden text-[15px] sm:block", dark ? "text-white" : "text-slate-900")}>
        Construx<span className="text-brand">Net</span>
      </span>
    </Link>
  );
}

function TopBar() {
  const isActive = useActive();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo dark />

        <GlobalSearch />

        <nav className="ml-auto hidden items-stretch gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex w-[68px] flex-col items-center justify-center gap-0.5 pt-1 text-[11px] transition-colors",
                  active ? "font-semibold text-white" : "font-medium text-white/55 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-[10px] h-[2px] w-full transition-colors",
                    active ? "bg-brand" : "bg-transparent",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <NotificationBell />
          <span className="hidden h-6 w-px bg-white/10 sm:block" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const isActive = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 glass md:hidden">
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
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
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
