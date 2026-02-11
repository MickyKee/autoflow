"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowLeftRight,
  Bot,
  Cable,
  Clock3,
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
import { cn } from "@/lib/cn";
import { useBuilderStore, toFlowGraph } from "@/lib/store";
import type { ConnectorDefinition, WorkflowRecord } from "@/lib/types";

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

const DEMO_CONNECTORS: ConnectorDefinition[] = [
  { key: "webhook", name: "Webhook", description: "Receive HTTP callbacks", category: "trigger", accent: "#3b82f6" },
  { key: "schedule", name: "Schedule", description: "Run on cron schedule", category: "trigger", accent: "#3b82f6" },
  { key: "http_request", name: "HTTP Request", description: "Make API calls", category: "action", accent: "#f97316" },
  { key: "openai", name: "OpenAI", description: "AI text completions", category: "action", accent: "#f97316" },
  { key: "email", name: "Email", description: "Send emails via SMTP", category: "action", accent: "#f97316" },
  { key: "slack", name: "Slack", description: "Post to channels", category: "action", accent: "#f97316" },
  { key: "condition", name: "Condition", description: "Branch on logic", category: "condition", accent: "#eab308" },
  { key: "transform", name: "Transform", description: "Transform data", category: "transform", accent: "#8b5cf6" },
  { key: "delay", name: "Delay", description: "Wait N seconds", category: "output", accent: "#6b7280" },
];

const DEMO_WORKFLOW: WorkflowRecord = {
  id: "wf_lead_slack_crm",
  name: "New Lead → Slack + CRM",
  description: "Route inbound leads to the sales Slack channel and create a contact in HubSpot CRM.",
  status: "active",
  executionCount: 1247,
  lastRunAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  nodes: [
    {
      id: "node_trigger",
      type: "trigger",
      position: { x: 50, y: 200 },
      data: {
        label: "Lead Webhook",
        description: "Receives new lead payload from marketing site",
        connector: "webhook",
        category: "trigger",
        config: { endpoint: "/api/webhooks/wf_lead", secretHeader: "x-autoflow-signature" },
      },
    },
    {
      id: "node_transform",
      type: "transform",
      position: { x: 340, y: 200 },
      data: {
        label: "Enrich Lead Data",
        description: "Normalize fields and compute lead score",
        connector: "transform",
        category: "transform",
        config: { expression: "({ ...data, score: data.revenue > 10000 ? 80 : 30 })" },
      },
    },
    {
      id: "node_condition",
      type: "condition",
      position: { x: 640, y: 200 },
      data: {
        label: "Score Check",
        description: "Route high-value leads to sales",
        connector: "condition",
        category: "condition",
        config: { path: "score", operator: "gte", value: 50 },
      },
    },
    {
      id: "node_slack",
      type: "action",
      position: { x: 960, y: 80 },
      data: {
        label: "Notify Sales Team",
        description: "Post qualified lead to #sales-leads",
        connector: "slack",
        category: "action",
        config: { channel: "#sales-leads", template: "New qualified lead: {{name}} ({{company}})" },
      },
    },
    {
      id: "node_crm",
      type: "action",
      position: { x: 960, y: 280 },
      data: {
        label: "Update CRM",
        description: "Create or update contact in HubSpot",
        connector: "http_request",
        category: "action",
        config: { method: "POST", url: "https://api.hubspot.com/contacts", timeoutMs: 8000 },
      },
    },
    {
      id: "node_email",
      type: "action",
      position: { x: 960, y: 460 },
      data: {
        label: "Send Follow-up",
        description: "Email nurture sequence for low-score leads",
        connector: "email",
        category: "action",
        config: { to: "{{email}}", subject: "Thanks for your interest", body: "Hi {{name}}, thanks for reaching out..." },
      },
    },
  ],
  edges: [
    { id: "e_1", source: "node_trigger", target: "node_transform" },
    { id: "e_2", source: "node_transform", target: "node_condition" },
    { id: "e_3", source: "node_condition", target: "node_slack", sourceHandle: "true" },
    { id: "e_4", source: "node_condition", target: "node_crm", sourceHandle: "true" },
    { id: "e_5", source: "node_condition", target: "node_email", sourceHandle: "false" },
  ],
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

const categoryOrder = ["trigger", "action", "condition", "transform", "output"] as const;

export default function BuilderPage() {
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
  } = useBuilderStore();

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    initialize(DEMO_WORKFLOW);
  }, [initialize]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const connectorGroups = useMemo(() => {
    const grouped = new Map<string, ConnectorDefinition[]>();
    for (const connector of DEMO_CONNECTORS) {
      const current = grouped.get(connector.category) ?? [];
      current.push(connector);
      grouped.set(connector.category, current);
    }
    return categoryOrder
      .map((category) => ({ category, items: grouped.get(category) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-[var(--stroke-1)] bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">{workflowName || "Untitled"}</h1>
          {dirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-600">
              Unsaved
            </span>
          )}
          {notice && (
            <span className="text-xs text-[var(--active)]">{notice}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="ghost-btn text-xs"
            disabled={!selectedNode}
            onClick={() => selectedNode && removeNode(selectedNode.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
          <button type="button" className="ghost-btn text-xs">
            <PlayCircle className="h-3.5 w-3.5" />
            Run
          </button>
          <button type="button" className="action-btn text-xs" disabled={!dirty}>
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[260px] shrink-0 overflow-y-auto border-r border-[var(--stroke-1)] bg-white p-4">
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Workflow
            </h3>
            <label className="field-label">
              Name
              <input
                className="field-input"
                value={workflowName}
                onChange={(e) => updateWorkflowMeta({ name: e.target.value })}
              />
            </label>
            <label className="field-label">
              Description
              <textarea
                className="field-input min-h-16 text-sm"
                value={workflowDescription}
                onChange={(e) => updateWorkflowMeta({ description: e.target.value })}
              />
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="metric-cell">
              <dt>Nodes</dt>
              <dd>{nodes.length}</dd>
            </div>
            <div className="metric-cell">
              <dt>Edges</dt>
              <dd>{edges.length}</dd>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Add connector
            </h3>
            {connectorGroups.map((group) => (
              <div key={group.category} className="space-y-1.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
                  {group.category}
                </p>
                <div className="grid gap-1.5">
                  {group.items.map((connector) => {
                    const Icon = connectorIcon[connector.key] ?? Cable;
                    return (
                      <button
                        key={connector.key}
                        type="button"
                        className="connector-add-btn"
                        onClick={() => {
                          addNodeFromConnector(connector);
                          setNotice(`${connector.name} added`);
                          setTimeout(() => setNotice(null), 2000);
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" style={{ color: connector.accent }} />
                          <span className="text-xs">{connector.name}</span>
                        </span>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="relative flex-1 builder-canvas-wrap overflow-hidden">
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
            onClose={() => selectNode(null)}
            onUpdateBasics={updateNodeBasics}
            onUpdateConfig={updateNodeConfig}
          />
        </div>
      </div>
    </div>
  );
}
