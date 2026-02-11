"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Activity, Cable, Cog, LayoutGrid, Zap } from "lucide-react";

import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Workflows", icon: LayoutGrid },
  { href: "/logs", label: "Logs", icon: Activity },
  { href: "/connectors", label: "Connectors", icon: Cable },
  { href: "/settings", label: "Settings", icon: Cog },
] as const;

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh bg-[var(--bg-app)]">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-[var(--stroke-1)] bg-white">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-[var(--stroke-1)] px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            AutoFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-3">
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
                className={cn("nav-link", active && "nav-link-active")}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--stroke-1)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-active" />
            <span className="text-xs text-[var(--text-subtle)]">All systems operational</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
