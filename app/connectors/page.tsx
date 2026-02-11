"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowLeftRight,
  Bot,
  Clock3,
  GitBranch,
  Mail,
  Plug,
  Slack,
  Webhook,
} from "lucide-react";

import { fetchConnectors } from "@/lib/api";
import type { ConnectorDefinition } from "@/lib/types";

const iconByConnector: Record<string, LucideIcon> = {
  webhook: Webhook,
  schedule: AlarmClock,
  http_request: ArrowLeftRight,
  openai: Bot,
  email: Mail,
  slack: Slack,
  condition: GitBranch,
  transform: Plug,
  delay: Clock3,
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<ConnectorDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchConnectors()
      .then((response) => {
        setConnectors(response.connectors);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load connectors.");
      });
  }, []);

  return (
    <section className="space-y-5">
      <header className="hero-panel">
        <div>
          <p className="hero-kicker">Integration Library</p>
          <h2 className="hero-title">Connector modules available on the workflow canvas.</h2>
          <p className="hero-description">
            Drag these into workflows to orchestrate triggers, API calls, AI decisions, and outbound notifications.
          </p>
        </div>
      </header>

      {error ? <div className="card p-5 text-sm text-[oklch(0.8_0.15_32)]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connectors.map((connector) => {
          const Icon = iconByConnector[connector.key] ?? Plug;

          return (
            <article key={connector.key} className="card connector-card">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--stroke-2)] bg-[oklch(0.26_0.03_282_/_0.86)]">
                <Icon className="h-5 w-5" style={{ color: connector.accent }} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{connector.name}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{connector.description}</p>
              <span className="mt-4 inline-flex w-fit rounded-full border border-[var(--stroke-1)] px-2.5 py-1 text-xs uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                {connector.category}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
