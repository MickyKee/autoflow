"use client";

import { useMemo, useState } from "react";
import { Activity, Cable, CheckCircle2, Plus, Search, Zap } from "lucide-react";

import { WorkflowCard } from "@/components/workflow-card";
import type { WorkflowRecord } from "@/lib/types";

const DEMO_WORKFLOWS: WorkflowRecord[] = [
  {
    id: "wf_lead_slack_crm",
    name: "New Lead → Slack + CRM",
    description: "Route inbound leads to the sales Slack channel and create a contact in HubSpot CRM automatically.",
    status: "active",
    executionCount: 1247,
    lastRunAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    nodes: [
      { id: "n1", type: "trigger", position: { x: 0, y: 0 }, data: { label: "Webhook", description: "", connector: "webhook", category: "trigger", config: {} } },
      { id: "n2", type: "transform", position: { x: 0, y: 0 }, data: { label: "Enrich", description: "", connector: "transform", category: "transform", config: {} } },
      { id: "n3", type: "condition", position: { x: 0, y: 0 }, data: { label: "Score", description: "", connector: "condition", category: "condition", config: {} } },
      { id: "n4", type: "action", position: { x: 0, y: 0 }, data: { label: "Slack", description: "", connector: "slack", category: "action", config: {} } },
      { id: "n5", type: "action", position: { x: 0, y: 0 }, data: { label: "CRM", description: "", connector: "http_request", category: "action", config: {} } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", sourceHandle: "true" },
      { id: "e4", source: "n3", target: "n5", sourceHandle: "true" },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wf_github_pr_review",
    name: "GitHub PR → Code Review → Notify",
    description: "Trigger on new pull requests, run automated code analysis with OpenAI, and post review summary to Slack.",
    status: "active",
    executionCount: 89,
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nodes: [
      { id: "n1", type: "trigger", position: { x: 0, y: 0 }, data: { label: "GitHub Webhook", description: "", connector: "webhook", category: "trigger", config: {} } },
      { id: "n2", type: "action", position: { x: 0, y: 0 }, data: { label: "OpenAI Review", description: "", connector: "openai", category: "action", config: {} } },
      { id: "n3", type: "action", position: { x: 0, y: 0 }, data: { label: "Notify", description: "", connector: "slack", category: "action", config: {} } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wf_daily_report",
    name: "Daily Report Generator",
    description: "Every morning at 8 AM, aggregate KPIs from internal APIs and email a formatted summary to the team.",
    status: "active",
    executionCount: 156,
    lastRunAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    nodes: [
      { id: "n1", type: "trigger", position: { x: 0, y: 0 }, data: { label: "Schedule", description: "", connector: "schedule", category: "trigger", config: {} } },
      { id: "n2", type: "action", position: { x: 0, y: 0 }, data: { label: "Fetch KPIs", description: "", connector: "http_request", category: "action", config: {} } },
      { id: "n3", type: "transform", position: { x: 0, y: 0 }, data: { label: "Format", description: "", connector: "transform", category: "transform", config: {} } },
      { id: "n4", type: "action", position: { x: 0, y: 0 }, data: { label: "Email", description: "", connector: "email", category: "action", config: {} } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wf_customer_onboarding",
    name: "Customer Onboarding Flow",
    description: "Welcome new customers with a personalized email sequence, Slack notification to CS team, and CRM update.",
    status: "paused",
    executionCount: 342,
    lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nodes: [
      { id: "n1", type: "trigger", position: { x: 0, y: 0 }, data: { label: "Webhook", description: "", connector: "webhook", category: "trigger", config: {} } },
      { id: "n2", type: "action", position: { x: 0, y: 0 }, data: { label: "Welcome Email", description: "", connector: "email", category: "action", config: {} } },
      { id: "n3", type: "action", position: { x: 0, y: 0 }, data: { label: "Slack CS", description: "", connector: "slack", category: "action", config: {} } },
      { id: "n4", type: "action", position: { x: 0, y: 0 }, data: { label: "CRM Update", description: "", connector: "http_request", category: "action", config: {} } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n1", target: "n3" },
      { id: "e3", source: "n1", target: "n4" },
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wf_invoice_pipeline",
    name: "Invoice Processing Pipeline",
    description: "Parse incoming invoice emails, extract amounts with AI, validate against purchase orders, and update accounting.",
    status: "active",
    executionCount: 426,
    lastRunAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    nodes: [
      { id: "n1", type: "trigger", position: { x: 0, y: 0 }, data: { label: "Email Trigger", description: "", connector: "webhook", category: "trigger", config: {} } },
      { id: "n2", type: "action", position: { x: 0, y: 0 }, data: { label: "AI Extract", description: "", connector: "openai", category: "action", config: {} } },
      { id: "n3", type: "condition", position: { x: 0, y: 0 }, data: { label: "Validate", description: "", connector: "condition", category: "condition", config: {} } },
      { id: "n4", type: "action", position: { x: 0, y: 0 }, data: { label: "Update Books", description: "", connector: "http_request", category: "action", config: {} } },
      { id: "n5", type: "action", position: { x: 0, y: 0 }, data: { label: "Flag Review", description: "", connector: "email", category: "action", config: {} } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", sourceHandle: "true" },
      { id: "e4", source: "n3", target: "n5", sourceHandle: "false" },
    ],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

const STATS = [
  { label: "Executions this week", value: "1,247", icon: Zap, trend: "+12.3%" },
  { label: "Active workflows", value: "4", icon: Activity, trend: null },
  { label: "Success rate", value: "98.4%", icon: CheckCircle2, trend: "+0.3%" },
  { label: "Connectors", value: "12", icon: Cable, trend: null },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEMO_WORKFLOWS;
    return DEMO_WORKFLOWS.filter(
      (w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Workflows</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Build and manage your automation pipelines</p>
        </div>
        <button type="button" className="action-btn">
          <Plus className="h-4 w-4" />
          New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card px-4 py-3.5"
              style={{ animation: `fadeInUp 0.35s ease-out ${i * 50}ms both` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-subtle)]">
                  {stat.label}
                </span>
                <Icon className="h-4 w-4 text-[var(--text-subtle)]" />
              </div>
              <div className="mt-1.5 flex items-end gap-2">
                <span className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {stat.value}
                </span>
                {stat.trend ? (
                  <span className="mb-0.5 text-xs font-medium text-[var(--active)]">{stat.trend}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input pl-10"
          placeholder="Search workflows..."
        />
      </div>

      {/* Workflow Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((workflow, i) => (
          <div
            key={workflow.id}
            style={{ animation: `fadeInUp 0.4s ease-out ${200 + i * 80}ms both` }}
          >
            <WorkflowCard workflow={workflow} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card py-12 text-center text-sm text-[var(--text-muted)]">
          No workflows match your search.
        </div>
      )}
    </div>
  );
}
