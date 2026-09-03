"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  HardHat,
  Home,
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
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/network", label: "Netzwerk", icon: Users },
  { href: "/pools", label: "Smart Pools", icon: Package },
  { href: "/messages", label: "Nachrichten", icon: MessageSquare },
  { href: "/kbob", label: "KBOB", icon: LineChart },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white shadow-sm shadow-brand/30">
        <HardHat className="h-5 w-5" />
      </span>
      <span className={cn("hidden text-[15px] sm:block", dark ? "text-white" : "text-white")}>
        Obta<span className="text-brand">net</span>
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

/** Schmale Rechtszeile unter dem Inhalt — auf dem Handy ueber der Navigation. */
function LegalBar() {
  return (
    <div className="border-t border-white/[0.08] bg-[#0B1522]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-4 text-[12px] text-white/40 sm:px-6">
        <span>© {new Date().getFullYear()} Obtanet</span>
        <span aria-hidden>·</span>
        <Link href="/impressum" className="transition-colors hover:text-brand">Impressum</Link>
        <Link href="/agb" className="transition-colors hover:text-brand">AGB</Link>
        <Link href="/datenschutz" className="transition-colors hover:text-brand">Datenschutz</Link>
      </div>
    </div>
  );
}

function MobileNav() {
  const isActive = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/[0.08] glass pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium leading-tight transition-colors",
              active ? "text-brand" : "text-white/55 hover:text-white",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="w-full truncate text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" dark />
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-md px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand/100"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Gate-/Coming-Soon-Seiten laufen bewusst ohne jede Navigation.
  if (pathname === "/coming-soon" || pathname === "/preview") {
    return <>{children}</>;
  }

  return (
    <>
      <SignedOut>
        <MarketingHeader />
        {children}
      </SignedOut>

      <SignedIn>
        <TopBar />
        <div className="pb-safe-nav md:pb-0">
          {children}
          <LegalBar />
        </div>
        <MobileNav />
      </SignedIn>
    </>
  );
}
