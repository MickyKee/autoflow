"use client";

import { Fragment, useMemo, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { WorkflowExecutionLog } from "@/lib/types";
import { cn } from "@/lib/cn";

type ExecutionLogProps = {
  logs: WorkflowExecutionLog[];
};

function rowTone(status: WorkflowExecutionLog["status"]) {
  if (status === "success") {
    return "terminal-success";
  }

  if (status === "running") {
    return "terminal-running";
  }

  return "terminal-fail";
}

export function ExecutionLog({ logs }: ExecutionLogProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const orderedLogs = useMemo(
    () => [...logs].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)),
    [logs],
  );

  if (orderedLogs.length === 0) {
    return (
      <div className="terminal-panel p-6 text-sm text-[var(--text-muted)]">
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
                <tr className={cn("terminal-row", rowTone(log.status))}>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 font-medium text-[var(--text-primary)]"
                      onClick={() => {
                        setExpanded((current) => (current === log.id ? null : log.id));
                      }}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {log.id}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{log.workflowName}</td>
                  <td className="px-4 py-3 uppercase tracking-[0.08em]">{log.status}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{log.durationMs}ms</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {formatDistanceToNowStrict(new Date(log.startedAt), { addSuffix: true })}
                  </td>
                </tr>
                {isOpen && (
                  <tr className="terminal-row-expanded">
                    <td colSpan={5} className="px-4 pb-5 pt-2">
                      <div className="space-y-3 rounded-xl border border-[var(--stroke-1)] bg-[oklch(0.2_0.02_276_/_0.92)] p-4">
                        {log.steps.map((step) => (
                          <div key={`${log.id}-${step.nodeId}-${step.startedAt}`} className="step-row">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-[var(--text-primary)]">
                                {step.nodeLabel} <span className="text-[var(--text-subtle)]">({step.connector})</span>
                              </p>
                              <span className={cn("status-pill", step.status === "success" ? "pill-active" : "pill-error")}>
                                {step.status}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-[var(--text-subtle)]">
                              {step.durationMs}ms · {new Date(step.startedAt).toLocaleString()}
                            </p>
                            <pre className="mono mt-2 overflow-x-auto rounded-lg border border-[var(--stroke-1)] bg-[oklch(0.18_0.02_273_/_0.96)] p-3 text-xs text-[var(--text-muted)]">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                            {step.error ? (
                              <p className="mt-2 text-xs text-[oklch(0.8_0.15_32)]">{step.error}</p>
                            ) : null}
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
