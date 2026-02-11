"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

import { ExecutionLog } from "@/components/execution-log";
import { fetchLogs, fetchWorkflows, getApiBaseUrl } from "@/lib/api";
import type { LogStatus, WorkflowExecutionLog, WorkflowRecord } from "@/lib/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<WorkflowExecutionLog[] | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [workflowId, setWorkflowId] = useState("");
  const [status, setStatus] = useState<"" | LogStatus>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      const response = await fetchLogs({
        workflowId: workflowId || undefined,
        status: status || undefined,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined,
      });
      setLogs(response.logs);
      setError(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load logs.");
    }
  }, [dateEnd, dateStart, status, workflowId]);

  useEffect(() => {
    void fetchWorkflows().then((response) => {
      setWorkflows(response.workflows);
    });
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const source = new EventSource(`${getApiBaseUrl()}/api/logs/stream`);

    source.addEventListener("log", (event) => {
      const parsed = JSON.parse((event as MessageEvent<string>).data) as WorkflowExecutionLog;

      setLogs((current) => {
        if (!current) {
          return [parsed];
        }

        if (current.some((entry) => entry.id === parsed.id)) {
          return current;
        }

        return [parsed, ...current].slice(0, 200);
      });
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

  const runCount = useMemo(() => logs?.length ?? 0, [logs]);

  return (
    <section className="space-y-5">
      <header className="hero-panel">
        <div>
          <p className="hero-kicker">Execution Telemetry</p>
          <h2 className="hero-title">Inspect every run with node-level output snapshots.</h2>
          <p className="hero-description">
            Live stream includes trigger source, duration, and per-node payload output for fast debugging.
          </p>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            void loadLogs();
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <div className="card grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_170px_170px_170px] md:p-5">
        <select className="field-input" value={workflowId} onChange={(event) => setWorkflowId(event.target.value)}>
          <option value="">All workflows</option>
          {workflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name}
            </option>
          ))}
        </select>
        <select
          className="field-input"
          value={status}
          onChange={(event) => setStatus(event.target.value as "" | LogStatus)}
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="fail">Fail</option>
          <option value="running">Running</option>
        </select>
        <input
          type="datetime-local"
          className="field-input"
          value={dateStart}
          onChange={(event) => setDateStart(event.target.value)}
        />
        <input
          type="datetime-local"
          className="field-input"
          value={dateEnd}
          onChange={(event) => setDateEnd(event.target.value)}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <p>{runCount} runs in current filter window</p>
      </div>

      {error ? <div className="card p-5 text-sm text-[oklch(0.8_0.15_32)]">{error}</div> : null}

      {!logs ? (
        <div className="card flex items-center justify-center gap-3 p-10 text-sm text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading execution logs...
        </div>
      ) : (
        <ExecutionLog logs={logs} />
      )}
    </section>
  );
}
