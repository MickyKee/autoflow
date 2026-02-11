"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, PauseCircle, PlayCircle, TriangleAlert } from "lucide-react";

import type { WorkflowRecord } from "@/lib/types";
import { cn } from "@/lib/cn";

type WorkflowCardProps = {
  workflow: WorkflowRecord;
};

const statusMap = {
  active: {
    label: "Active",
    icon: PlayCircle,
    className: "pill-active",
    borderColor: "border-l-emerald-500",
  },
  paused: {
    label: "Paused",
    icon: PauseCircle,
    className: "pill-paused",
    borderColor: "border-l-amber-500",
  },
  error: {
    label: "Error",
    icon: TriangleAlert,
    className: "pill-error",
    borderColor: "border-l-red-500",
  },
} as const;

function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const status = statusMap[workflow.status];
  const StatusIcon = status.icon;

  return (
    <article className={cn("card workflow-card border-l-[3px]", status.borderColor)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{workflow.name}</h3>
        <span className={cn("status-pill shrink-0", status.className)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>

      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
        {workflow.description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text-subtle)]">
        <span>{workflow.executionCount.toLocaleString()} runs</span>
        <span className="text-[var(--stroke-2)]">·</span>
        <span>{workflow.nodes.length} nodes</span>
        <span className="text-[var(--stroke-2)]">·</span>
        <span>{timeAgo(workflow.lastRunAt)}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/builder/${workflow.id}` as Route}
          className="ghost-btn text-xs"
        >
          Open builder
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
