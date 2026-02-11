"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowLeftRight,
  Bot,
  Clock3,
  Database,
  GitBranch,
  CreditCard,
  Github,
  Mail,
  Plug,
  Search,
  Slack,
  Webhook,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/cn";

type Connector = {
  key: string;
  name: string;
  description: string;
  category: string;
  accent: string;
  available: boolean;
};

const CONNECTORS: Connector[] = [
  { key: "webhook", name: "Webhook", description: "Receive inbound HTTP callbacks and trigger workflows from external services.", category: "Trigger", accent: "#3b82f6", available: true },
  { key: "schedule", name: "Schedule", description: "Execute workflows on a recurring cron schedule — hourly, daily, or custom.", category: "Trigger", accent: "#3b82f6", available: true },
  { key: "http_request", name: "HTTP Request", description: "Make outbound API calls with configurable method, headers, and body templating.", category: "Action", accent: "#f97316", available: true },
  { key: "openai", name: "OpenAI", description: "Generate text completions, classifications, and summaries using GPT-4 models.", category: "Action", accent: "#10b981", available: true },
  { key: "email", name: "Email (SMTP)", description: "Send transactional emails via any SMTP provider with template interpolation.", category: "Action", accent: "#f97316", available: true },
  { key: "slack", name: "Slack", description: "Post formatted messages to Slack channels via incoming webhooks.", category: "Action", accent: "#e11d48", available: true },
  { key: "condition", name: "Condition", description: "Branch workflow execution based on payload comparisons (eq, gt, contains).", category: "Logic", accent: "#eab308", available: true },
  { key: "transform", name: "Transform", description: "Run JavaScript expressions in a sandboxed VM to reshape data between nodes.", category: "Logic", accent: "#8b5cf6", available: true },
  { key: "delay", name: "Delay", description: "Pause workflow execution for a configurable number of seconds before continuing.", category: "Logic", accent: "#6b7280", available: true },
  { key: "github", name: "GitHub", description: "Listen to repository events — push, PR, issue — and trigger automated workflows.", category: "Trigger", accent: "#24292f", available: false },
  { key: "stripe", name: "Stripe", description: "React to payment events: charges, subscriptions, refunds, and disputes.", category: "Trigger", accent: "#635bff", available: false },
  { key: "postgres", name: "PostgreSQL", description: "Query and write to PostgreSQL databases with parameterized SQL statements.", category: "Action", accent: "#336791", available: false },
];

const iconMap: Record<string, LucideIcon> = {
  webhook: Webhook,
  schedule: AlarmClock,
  http_request: ArrowLeftRight,
  openai: Bot,
  email: Mail,
  slack: Slack,
  condition: GitBranch,
  transform: Wrench,
  delay: Clock3,
  github: Github,
  stripe: CreditCard,
  postgres: Database,
};

const categories = ["All", "Trigger", "Action", "Logic"];

export default function ConnectorsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = CONNECTORS.filter((c) => {
    if (filter !== "All" && c.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Connectors</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Integration modules available for your workflow canvas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-[var(--stroke-1)] bg-white p-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                filter === cat
                  ? "bg-[var(--brand)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input w-56 pl-9 text-sm"
            placeholder="Search connectors..."
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((connector, i) => {
          const Icon = iconMap[connector.key] ?? Plug;
          return (
            <article
              key={connector.key}
              className={cn("card connector-card", !connector.available && "opacity-60")}
              style={{ animation: `fadeInUp 0.35s ease-out ${i * 60}ms both` }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${connector.accent}12` }}
                >
                  <Icon className="h-5 w-5" style={{ color: connector.accent }} />
                </div>
                {!connector.available && (
                  <span className="rounded-full border border-[var(--stroke-1)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-subtle)]">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-[var(--text-primary)]">{connector.name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">{connector.description}</p>
              <span
                className="mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${connector.accent}10`, color: connector.accent }}
              >
                {connector.category}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
