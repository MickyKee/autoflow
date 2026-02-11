"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Activity, Cable, Cog, LayoutGrid, Network } from "lucide-react";

import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Workflows", icon: LayoutGrid },
  { href: "/logs", label: "Execution Logs", icon: Activity },
  { href: "/connectors", label: "Connectors", icon: Cable },
  { href: "/settings", label: "Settings", icon: Cog },
] as const;

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1520px] gap-6 px-4 py-5 md:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8">
      <aside className="card neon-border flex flex-col gap-5 p-4 md:p-5">
        <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.52_0.12_296_/_0.55)] bg-[oklch(0.25_0.05_290_/_0.75)] px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.72_0.18_300_/_0.24)]">
            <Network className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Portfolio Build</p>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">AutoFlow</h1>
          </div>
        </div>

        <nav className="grid gap-2 md:gap-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "nav-link",
                  active && "nav-link-active",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-[oklch(0.52_0.07_201_/_0.38)] bg-[oklch(0.24_0.04_243_/_0.7)] p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">System State</p>
          <div className="mt-3 grid gap-2">
            <div className="status-row">
              <span className="status-dot status-dot-active" />
              <span>Execution API connected</span>
            </div>
            <div className="status-row">
              <span className="status-dot status-dot-cyan" />
              <span>Realtime log stream live</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
