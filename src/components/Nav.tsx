"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession, type CitizenSession } from "@/lib/auth";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/city", label: "Cidade" },
  { href: "/news", label: "Notícias" },
  { href: "/report", label: "Reportar" },
  { href: "/transparency", label: "Transparência" },
  { href: "/stats", label: "Estatísticas" },
  { href: "/privacy", label: "Privacidade" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/city" ? pathname.startsWith("/city") : pathname === href;
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSessionState] = useState<CitizenSession | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // localStorage is unavailable during SSR, so session must start null and
    // sync after mount — reading it during render would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionState(getSession());
    setOpen(false);
  }, [pathname]);

  if (pathname === "/" || pathname === "/login") return null;

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-3/60 bg-ink-1/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 px-3 py-1.5 text-sm transition-colors ${
                isActive(pathname, link.href)
                  ? "border-accent text-text-on-ink font-medium"
                  : "border-transparent text-text-on-ink-secondary hover:text-text-on-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {session && (
            <span className="text-sm text-text-on-ink-secondary">
              {session.name} · Zona {session.zone}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full border border-ink-3 px-3 py-1.5 text-sm text-text-on-ink-secondary transition-colors hover:border-accent/50 hover:text-text-on-ink"
          >
            Sair
          </button>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-full border border-ink-3 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menu"
        >
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-text-on-ink" />
            <span className="block h-0.5 w-4 bg-text-on-ink" />
            <span className="block h-0.5 w-4 bg-text-on-ink" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-3/60 px-4 pb-4 pt-2 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                isActive(pathname, link.href)
                  ? "bg-accent/10 text-text-on-ink font-medium"
                  : "text-text-on-ink-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-2 rounded-lg border border-ink-3 px-3 py-2 text-left text-sm text-text-on-ink-secondary"
          >
            Sair{session ? ` (${session.name})` : ""}
          </button>
        </nav>
      )}
    </header>
  );
}
