"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";
import { mainNav } from "@/config/site";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/tools") return pathname === "/tools";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close with Escape and lock background scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      active ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/tools"
            className="hidden rounded-xl bg-brand-gradient px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:opacity-95 hover:shadow-lg sm:inline-flex"
          >
            Browse Tools
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-slate-200 bg-white transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
        hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          <Container className="py-3">
            <ul className="flex flex-col gap-1">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-xl px-4 py-3 text-base font-semibold ${
                        active ? "bg-brand-50 text-brand-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </nav>
      </div>
    </header>
  );
}
