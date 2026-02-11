"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { WorkflowExecutionLog } from "@/lib/types";
import { cn } from "@/lib/cn";

type ExecutionLogProps = {
  logs: WorkflowExecutionLog[];
};

function rowTone(status: WorkflowExecutionLog["status"]) {
  if (status === "success") return "terminal-success";
  if (status === "running") return "terminal-running";
  return "terminal-fail";
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ExecutionLog({ logs }: ExecutionLogProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const orderedLogs = useMemo(
    () => [...logs].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)),
    [logs],
  );

  if (orderedLogs.length === 0) {
    return (
      <div className="terminal-panel p-8 text-center text-sm text-[var(--text-muted)]">
        No runs found for the selected filters.
      </div>
    );
  }

  return (
    <div className="terminal-panel overflow-hidden">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="terminal-header">
            <th className="px-4 py-3">Run</th>
            <th className="px-4 py-3">Workflow</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Started</th>
          </tr>
        </thead>
        <tbody>
          {orderedLogs.map((log) => {
            const isOpen = expanded === log.id;

            return (
              <Fragment key={log.id}>
                <tr className={cn("terminal-row cursor-pointer hover:bg-[var(--surface-2)]", rowTone(log.status))}>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 font-medium text-[var(--text-primary)]"
                      onClick={() => setExpanded((c) => (c === log.id ? null : log.id))}
                    >
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <span className="mono text-xs">{log.id}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{log.workflowName}</td>
                  <td className="px-4 py-3">
                    <span className={cn("status-pill", log.status === "success" ? "pill-active" : log.status === "running" ? "pill-paused" : "pill-error")}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 mono text-xs text-[var(--text-muted)]">{log.durationMs}ms</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{timeAgo(log.startedAt)}</td>
                </tr>
                {isOpen && (
                  <tr className="terminal-row-expanded">
                    <td colSpan={5} className="px-4 pb-4 pt-2">
                      <div className="space-y-2 rounded-lg border border-[var(--stroke-1)] bg-white p-4">
                        {log.steps.map((step) => (
                          <div key={`${log.id}-${step.nodeId}-${step.startedAt}`} className="step-row">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {step.nodeLabel}
                                <span className="ml-2 text-xs text-[var(--text-subtle)]">({step.connector})</span>
                              </p>
                              <span className={cn("status-pill text-[10px]", step.status === "success" ? "pill-active" : "pill-error")}>
                                {step.status}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--text-subtle)]">
                              {step.durationMs}ms
                            </p>
                            {Object.keys(step.output).length > 0 && (
                              <pre className="mono mt-1.5 overflow-x-auto rounded-md border border-[var(--stroke-1)] bg-[var(--surface-2)] p-2.5 text-[11px] text-[var(--text-muted)]">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            )}
                            {step.error && (
                              <p className="mt-1.5 text-xs text-[var(--danger)]">{step.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
