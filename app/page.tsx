"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { WorkflowCard } from "@/components/workflow-card";
import { fetchWorkflows, runWorkflow } from "@/lib/api";
import type { WorkflowRecord } from "@/lib/types";

function useWorkflowData() {
  const [workflows, setWorkflows] = useState<WorkflowRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchWorkflows()
      .then((response) => {
        setWorkflows(response.workflows);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load workflows.");
      });
  }, []);

  return {
    workflows,
    error,
    setWorkflows,
  };
}

export default function HomePage() {
  const { workflows, error, setWorkflows } = useWorkflowData();
  const [search, setSearch] = useState("");
  const [runningId, setRunningId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!workflows) {
      return [];
    }

    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return workflows;
    }

    return workflows.filter((workflow) => {
      return (
        workflow.name.toLowerCase().includes(normalized) ||
        workflow.description.toLowerCase().includes(normalized)
      );
    });
  }, [search, workflows]);

  async function handleRun(workflow: WorkflowRecord) {
    setRunningId(workflow.id);

    try {
      const result = await runWorkflow(workflow.id, {
        triggerType: "manual",
        payload: {
          source: "manual-ui",
          initiatedBy: "portfolio-reviewer",
          email: "reviewer@example.com",
        },
      });

      setWorkflows((current) => {
        if (!current) {
          return current;
        }

        return current.map((item) =>
          item.id === workflow.id
            ? {
                ...item,
                executionCount: item.executionCount + 1,
                lastRunAt: result.run.endedAt,
                status: result.run.status === "success" ? "active" : "error",
              }
            : item,
        );
      });
    } catch {
      setWorkflows((current) => {
        if (!current) {
          return current;
        }

        return current.map((item) =>
          item.id === workflow.id
            ? {
                ...item,
                status: "error",
              }
            : item,
        );
      });
    } finally {
      setRunningId(null);
    }
  }

  return (
    <section className="space-y-5">
      <header className="hero-panel">
        <div>
          <p className="hero-kicker">Workflow Control Room</p>
          <h2 className="hero-title">Build, run, and monitor autonomous data workflows.</h2>
          <p className="hero-description">
            AutoFlow combines a visual node canvas, live run telemetry, and connector-based automations in one neon control surface.
          </p>
        </div>
      </header>

      <div className="card p-4 md:p-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            className="field-input pl-9"
            placeholder="Search workflows"
          />
        </div>
      </div>

      {error ? (
        <div className="card p-6 text-sm text-[oklch(0.8_0.15_32)]">{error}</div>
      ) : null}

      {!workflows ? (
        <div className="card flex items-center justify-center gap-3 p-12 text-sm text-[var(--text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading workflows...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              running={runningId === workflow.id}
              onRun={handleRun}
            />
          ))}
        </div>
      )}
    </section>
  );
}
