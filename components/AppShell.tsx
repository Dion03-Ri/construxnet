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

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                 */
/* -------------------------------------------------------------------------- */

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/network", label: "Netzwerk", icon: Users },
  { href: "/pools", label: "Smart Pools", icon: Package },
  { href: "/kbob", label: "KBOB Index", icon: LineChart },
  { href: "/messages", label: "Nachrichten", icon: MessageSquare },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
}

/* -------------------------------------------------------------------------- */
/*  Logo                                                                       */
/* -------------------------------------------------------------------------- */

function Logo({ href = "/feed" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
        <HardHat className="h-5 w-5" />
      </span>
      <span className="text-[15px] text-slate-50">
        Construx<span className="text-brand">Net</span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Signed-in chrome: Top bar + Sidebar + Mobile nav                          */
/* -------------------------------------------------------------------------- */

function AppTopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        {/* Globale Suche */}
        <div className="relative ml-2 hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Firmen, Pools, Materialien suchen …"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-[13px] text-slate-100 placeholder:text-slate-500 transition-colors focus:border-brand/50 focus:bg-white/[0.07] focus:outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Benachrichtigungen"
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
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

function SideNav() {
  const isActive = useActive();
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-white/10 px-3 py-5 lg:block">
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-150",
                active
                  ? "bg-brand/12 text-brand"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                  active && "text-brand",
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-5 w-1 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileNav() {
  const isActive = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-navy-950/90 backdrop-blur-xl lg:hidden">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-brand" : "text-slate-400 hover:text-slate-100",
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

/* -------------------------------------------------------------------------- */
/*  Signed-out chrome: schlanker Marketing-Header                             */
/* -------------------------------------------------------------------------- */

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" />
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-slate-100"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-600"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shell                                                                      */
/* -------------------------------------------------------------------------- */

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <MarketingHeader />
        {children}
      </SignedOut>

      <SignedIn>
        <AppTopBar />
        <div className="mx-auto flex max-w-7xl">
          <SideNav />
          <div className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</div>
        </div>
        <MobileNav />
      </SignedIn>
    </>
  );
}
