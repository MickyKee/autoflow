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

function connectorColor(connector: ConnectorKey) {
  if (connector === "webhook") {
    return "oklch(0.73 0.17 232)";
  }

  if (connector === "schedule") {
    return "oklch(0.74 0.14 102)";
  }

  if (connector === "http_request") {
    return "oklch(0.76 0.13 250)";
  }

  if (connector === "openai") {
    return "oklch(0.78 0.13 178)";
  }

  if (connector === "email") {
    return "oklch(0.75 0.16 28)";
  }

  if (connector === "slack") {
    return "oklch(0.71 0.2 316)";
  }

  if (connector === "condition") {
    return "oklch(0.72 0.17 80)";
  }

  if (connector === "transform") {
    return "oklch(0.77 0.16 263)";
  }

  return "oklch(0.7 0.08 260)";
}

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

  return (
    <article className={cn("rf-node-shell", className)}>
      <header className="rf-node-head">
        <span className="rf-node-badge" style={{ color: connectorColor(connector) }}>
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
