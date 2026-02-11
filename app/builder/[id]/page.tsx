"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowLeftRight,
  Bot,
  Cable,
  Clock3,
  Loader2,
  Mail,
  PlayCircle,
  Plus,
  Save,
  Slack,
  Trash2,
  Webhook,
} from "lucide-react";

import { Canvas } from "@/components/Canvas";
import { NodeConfigPanel } from "@/components/NodeConfigPanel";
import { fetchConnectors, fetchWorkflow, runWorkflow, updateWorkflow } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useBuilderStore } from "@/lib/store";
import type { ConnectorDefinition } from "@/lib/types";

const connectorIcon: Record<string, LucideIcon> = {
  webhook: Webhook,
  schedule: AlarmClock,
  http_request: ArrowLeftRight,
  openai: Bot,
  email: Mail,
  slack: Slack,
  condition: Cable,
  transform: Cable,
  delay: Clock3,
};

const categoryOrder = ["trigger", "action", "condition", "transform", "output"] as const;

export default function BuilderPage() {
  const params = useParams<{ id: string | string[] }>();
  const workflowId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    workflowName,
    workflowDescription,
    nodes,
    edges,
    selectedNodeId,
    dirty,
    initialize,
    setNodesFromChanges,
    setEdgesFromChanges,
    connect,
    addNodeFromConnector,
    selectNode,
    updateWorkflowMeta,
    updateNodeBasics,
    updateNodeConfig,
    removeNode,
    serializeGraph,
    markSaved,
  } = useBuilderStore();

  const [connectors, setConnectors] = useState<ConnectorDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowId) {
      setLoading(false);
      setError("Invalid workflow id.");
      return;
    }

    setLoading(true);
    setError(null);

    void Promise.all([fetchWorkflow(workflowId), fetchConnectors()])
      .then(([workflowResponse, connectorsResponse]) => {
        initialize(workflowResponse.workflow);
        setConnectors(connectorsResponse.connectors);
        setNotice(null);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load workflow builder.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialize, workflowId]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const connectorGroups = useMemo(() => {
    const grouped = new Map<string, ConnectorDefinition[]>();

    for (const connector of connectors) {
      const current = grouped.get(connector.category) ?? [];
      current.push(connector);
      grouped.set(connector.category, current);
    }

    return categoryOrder
      .map((category) => ({
        category,
        items: grouped.get(category) ?? [],
      }))
      .filter((group) => group.items.length > 0);
  }, [connectors]);

  async function handleSave() {
    if (!workflowId) {
      return;
    }

    if (workflowName.trim().length < 3) {
      setError("Workflow name must contain at least 3 characters.");
      return;
    }

    if (workflowDescription.trim().length < 8) {
      setError("Workflow description must contain at least 8 characters.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const graph = serializeGraph();
      const response = await updateWorkflow(workflowId, {
        name: workflowName.trim(),
        description: workflowDescription.trim(),
        nodes: graph.nodes,
        edges: graph.edges,
      });

      initialize(response.workflow);
      markSaved();
      const now = new Date().toISOString();
      setLastSavedAt(now);
      setNotice(`Workflow saved at ${new Date(now).toLocaleTimeString()}.`);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save workflow.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRun() {
    if (!workflowId) {
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await runWorkflow(workflowId, {
        triggerType: "manual",
        payload: {
          source: "builder-ui",
          timestamp: new Date().toISOString(),
        },
      });
      setNotice(
        `Run ${response.run.id} finished with status "${response.run.status}" in ${response.run.durationMs}ms.`,
      );
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Workflow execution failed.");
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="card flex min-h-[500px] items-center justify-center gap-3 p-10 text-sm text-[var(--text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading workflow canvas...
      </div>
    );
  }

  if (error && nodes.length === 0) {
    return (
      <div className="card min-h-[300px] space-y-2 p-8">
        <p className="hero-kicker">Builder Error</p>
        <p className="text-sm text-[oklch(0.8_0.15_32)]">{error}</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="hero-panel">
        <div>
          <p className="hero-kicker">Visual Workflow Builder</p>
          <h2 className="hero-title">Compose branching automations on a live dataflow canvas.</h2>
          <p className="hero-description">
            Add connectors, wire dependencies, configure node payloads, and run workflows directly from the editor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="ghost-btn" disabled={!selectedNode} onClick={() => selectedNode && removeNode(selectedNode.id)}>
            <Trash2 className="h-4 w-4" />
            Remove node
          </button>
          <button type="button" className="ghost-btn" disabled={running} onClick={handleRun}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            {running ? "Running..." : "Run now"}
          </button>
          <button type="button" className="action-btn" disabled={saving || !dirty} onClick={handleSave}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : dirty ? "Save workflow" : "Saved"}
          </button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="card space-y-4 p-4 md:p-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Workflow metadata</h3>
            <label className="field-label">
              Name
              <input
                className="field-input"
                value={workflowName}
                onChange={(event) => {
                  updateWorkflowMeta({ name: event.target.value });
                }}
              />
            </label>
            <label className="field-label">
              Description
              <textarea
                className="field-input min-h-24"
                value={workflowDescription}
                onChange={(event) => {
                  updateWorkflowMeta({ description: event.target.value });
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="metric-cell">
              <dt>Nodes</dt>
              <dd>{nodes.length}</dd>
            </div>
            <div className="metric-cell">
              <dt>Edges</dt>
              <dd>{edges.length}</dd>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Add connector</h3>
            {connectorGroups.map((group) => (
              <div key={group.category} className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">{group.category}</p>
                <div className="grid gap-2">
                  {group.items.map((connector) => {
                    const Icon = connectorIcon[connector.key] ?? Cable;

                    return (
                      <button
                        key={connector.key}
                        type="button"
                        className="connector-add-btn"
                        onClick={() => {
                          addNodeFromConnector(connector);
                          setNotice(`${connector.name} node added to canvas.`);
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: connector.accent }} />
                          <span>{connector.name}</span>
                        </span>
                        <Plus className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="card builder-canvas-wrap relative min-h-[680px] overflow-hidden">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodesFromChanges}
            onEdgesChange={setEdgesFromChanges}
            onConnect={connect}
            onSelectNode={selectNode}
          />
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => {
              selectNode(null);
            }}
            onUpdateBasics={updateNodeBasics}
            onUpdateConfig={updateNodeConfig}
          />
        </div>
      </div>

      {(notice || error || lastSavedAt) && (
        <div className="card p-4 text-sm">
          {notice ? <p className="text-[var(--active)]">{notice}</p> : null}
          {error ? <p className="text-[oklch(0.8_0.15_32)]">{error}</p> : null}
          {lastSavedAt ? (
            <p className={cn("text-xs text-[var(--text-subtle)]", (notice || error) && "mt-1")}>
              Last saved: {new Date(lastSavedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
