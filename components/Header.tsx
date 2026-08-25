"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Boxes, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/preise", label: "Preise" },
  { href: "/buyer", label: "Bauunternehmer" },
  { href: "/supplier", label: "Lieferant" },
  { href: "/admin", label: "Admin" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kbob-blue/15 text-kbob-blue">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="text-neutral-50">
            Construx<span className="text-kbob-blue">Net</span>
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
                  ? "bg-white/10 text-neutral-50"
                  : "text-neutral-400 hover:text-neutral-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/buyer"
            className="rounded-lg bg-kbob-blue px-4 py-2 text-sm font-medium text-white shadow-sm shadow-kbob-blue/30 transition-colors hover:bg-kbob-blue/90"
          >
            Login
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 md:hidden"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/10 bg-neutral-950/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-white/10 text-neutral-50"
                    : "text-neutral-300 hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/buyer"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-kbob-blue px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
