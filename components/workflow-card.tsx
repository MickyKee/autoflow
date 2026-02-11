"use client";

import Link from "next/link";
import type { Route } from "next";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, PauseCircle, PlayCircle, RotateCw, TriangleAlert } from "lucide-react";

import type { WorkflowRecord } from "@/lib/types";
import { cn } from "@/lib/cn";

type WorkflowCardProps = {
  workflow: WorkflowRecord;
  running: boolean;
  onRun: (workflow: WorkflowRecord) => Promise<void>;
};

function statusConfig(status: WorkflowRecord["status"]) {
  if (status === "active") {
    return {
      label: "Active",
      icon: PlayCircle,
      className: "pill-active",
    };
  }

  if (status === "paused") {
    return {
      label: "Paused",
      icon: PauseCircle,
      className: "pill-paused",
    };
  }

  return {
    label: "Error",
    icon: TriangleAlert,
    className: "pill-error",
  };
}

export function WorkflowCard({ workflow, running, onRun }: WorkflowCardProps) {
  const status = statusConfig(workflow.status);
  const StatusIcon = status.icon;

  return (
    <article className="card workflow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{workflow.name}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{workflow.description}</p>
        </div>
        <span className={cn("status-pill", status.className)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="metric-cell">
          <dt>Last run</dt>
          <dd>
            {workflow.lastRunAt
              ? formatDistanceToNow(new Date(workflow.lastRunAt), { addSuffix: true })
              : "Never"}
          </dd>
        </div>
        <div className="metric-cell">
          <dt>Executions</dt>
          <dd>{workflow.executionCount.toLocaleString()}</dd>
        </div>
        <div className="metric-cell">
          <dt>Nodes</dt>
          <dd>{workflow.nodes.length}</dd>
        </div>
        <div className="metric-cell">
          <dt>Connections</dt>
          <dd>{workflow.edges.length}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="action-btn"
          onClick={() => {
            void onRun(workflow);
          }}
          disabled={running}
        >
          {running ? <RotateCw className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {running ? "Running..." : "Run now"}
        </button>
        <Link href={`/builder/${workflow.id}` as Route} className="ghost-btn">
          Open builder
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
