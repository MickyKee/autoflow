"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowLeftRight,
  Bot,
  Clock3,
  GitBranch,
  Mail,
  Slack,
  Webhook,
  Wrench,
} from "lucide-react";

import type { ConnectorKey } from "@/lib/types";
import { cn } from "@/lib/cn";

const iconByConnector: Record<ConnectorKey, LucideIcon> = {
  webhook: Webhook,
  schedule: AlarmClock,
  http_request: ArrowLeftRight,
  openai: Bot,
  email: Mail,
  slack: Slack,
  condition: GitBranch,
  transform: Wrench,
  delay: Clock3,
};

const connectorColors: Record<ConnectorKey, string> = {
  webhook: "#3b82f6",
  schedule: "#3b82f6",
  http_request: "#f97316",
  openai: "#10b981",
  email: "#f97316",
  slack: "#e11d48",
  condition: "#eab308",
  transform: "#8b5cf6",
  delay: "#6b7280",
};

export function NodeChrome({
  connector,
  categoryLabel,
  title,
  description,
  className,
}: {
  connector: ConnectorKey;
  categoryLabel: string;
  title: string;
  description: string;
  className?: string;
}) {
  const Icon = iconByConnector[connector];
  const color = connectorColors[connector];

  return (
    <article className={cn("rf-node-shell", className)}>
      <header className="rf-node-head">
        <span className="rf-node-badge" style={{ color }}>
          <Icon className="h-3.5 w-3.5" />
          {categoryLabel}
        </span>
        <span className="rf-node-connector mono">{connector}</span>
      </header>
      <h4 className="rf-node-title">{title}</h4>
      <p className="rf-node-description">{description}</p>
    </article>
  );
}
