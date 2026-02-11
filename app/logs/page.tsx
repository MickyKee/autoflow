"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ExecutionLog } from "@/components/execution-log";
import type { WorkflowExecutionLog } from "@/lib/types";

const DEMO_LOGS: WorkflowExecutionLog[] = [
  {
    id: "run_a1b2c3",
    workflowId: "wf_lead_slack_crm",
    workflowName: "New Lead → Slack + CRM",
    status: "success",
    startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 12 * 60 * 1000 + 1240).toISOString(),
    durationMs: 1240,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "Lead Webhook", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 12 * 60 * 1000 + 80).toISOString(), durationMs: 80, input: { source: "marketing-site" }, output: { name: "Sarah Chen", email: "sarah@acme.co", company: "Acme Corp", revenue: 25000 } },
      { nodeId: "n2", nodeLabel: "Enrich Lead Data", connector: "transform", status: "success", startedAt: new Date(Date.now() - 12 * 60 * 1000 + 80).toISOString(), endedAt: new Date(Date.now() - 12 * 60 * 1000 + 120).toISOString(), durationMs: 40, input: {}, output: { score: 80, tier: "enterprise" } },
      { nodeId: "n3", nodeLabel: "Score Check", connector: "condition", status: "success", startedAt: new Date(Date.now() - 12 * 60 * 1000 + 120).toISOString(), endedAt: new Date(Date.now() - 12 * 60 * 1000 + 130).toISOString(), durationMs: 10, input: {}, output: { branch: "true" } },
      { nodeId: "n4", nodeLabel: "Notify Sales Team", connector: "slack", status: "success", startedAt: new Date(Date.now() - 12 * 60 * 1000 + 130).toISOString(), endedAt: new Date(Date.now() - 12 * 60 * 1000 + 540).toISOString(), durationMs: 410, input: {}, output: { channel: "#sales-leads", ok: true } },
      { nodeId: "n5", nodeLabel: "Update CRM", connector: "http_request", status: "success", startedAt: new Date(Date.now() - 12 * 60 * 1000 + 540).toISOString(), endedAt: new Date(Date.now() - 12 * 60 * 1000 + 1240).toISOString(), durationMs: 700, input: {}, output: { statusCode: 201, contactId: "ct_892" } },
    ],
  },
  {
    id: "run_d4e5f6",
    workflowId: "wf_github_pr_review",
    workflowName: "GitHub PR → Code Review → Notify",
    status: "success",
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 4200).toISOString(),
    durationMs: 4200,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "GitHub Webhook", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 50).toISOString(), durationMs: 50, input: { event: "pull_request.opened" }, output: { repo: "autoflow", pr: 142 } },
      { nodeId: "n2", nodeLabel: "OpenAI Review", connector: "openai", status: "success", startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 50).toISOString(), endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3800).toISOString(), durationMs: 3750, input: {}, output: { summary: "Clean refactor, good test coverage", score: "8/10" } },
      { nodeId: "n3", nodeLabel: "Notify Team", connector: "slack", status: "success", startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3800).toISOString(), endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 4200).toISOString(), durationMs: 400, input: {}, output: { channel: "#code-reviews", ok: true } },
    ],
  },
  {
    id: "run_g7h8i9",
    workflowId: "wf_daily_report",
    workflowName: "Daily Report Generator",
    status: "success",
    startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 2800).toISOString(),
    durationMs: 2800,
    triggerType: "schedule",
    steps: [
      { nodeId: "n1", nodeLabel: "Schedule Trigger", connector: "schedule", status: "success", startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 10).toISOString(), durationMs: 10, input: { cron: "0 8 * * *" }, output: { triggered: true } },
      { nodeId: "n2", nodeLabel: "Fetch KPIs", connector: "http_request", status: "success", startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 10).toISOString(), endedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 820).toISOString(), durationMs: 810, input: {}, output: { revenue: 48200, newUsers: 127, churn: 0.8 } },
      { nodeId: "n3", nodeLabel: "Format Report", connector: "transform", status: "success", startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 820).toISOString(), endedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 870).toISOString(), durationMs: 50, input: {}, output: { formatted: true, sections: 4 } },
      { nodeId: "n4", nodeLabel: "Email Team", connector: "email", status: "success", startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 870).toISOString(), endedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 2800).toISOString(), durationMs: 1930, input: {}, output: { sent: true, recipients: 8 } },
    ],
  },
  {
    id: "run_j1k2l3",
    workflowId: "wf_invoice_pipeline",
    workflowName: "Invoice Processing Pipeline",
    status: "success",
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 45 * 60 * 1000 + 3400).toISOString(),
    durationMs: 3400,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "Email Trigger", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 45 * 60 * 1000 + 60).toISOString(), durationMs: 60, input: {}, output: { from: "billing@vendor.com", subject: "Invoice #4821" } },
      { nodeId: "n2", nodeLabel: "AI Extract", connector: "openai", status: "success", startedAt: new Date(Date.now() - 45 * 60 * 1000 + 60).toISOString(), endedAt: new Date(Date.now() - 45 * 60 * 1000 + 2900).toISOString(), durationMs: 2840, input: {}, output: { amount: 4200, currency: "USD", vendor: "CloudHost Inc" } },
      { nodeId: "n3", nodeLabel: "Validate", connector: "condition", status: "success", startedAt: new Date(Date.now() - 45 * 60 * 1000 + 2900).toISOString(), endedAt: new Date(Date.now() - 45 * 60 * 1000 + 2920).toISOString(), durationMs: 20, input: {}, output: { branch: "true", matched: true } },
      { nodeId: "n4", nodeLabel: "Update Books", connector: "http_request", status: "success", startedAt: new Date(Date.now() - 45 * 60 * 1000 + 2920).toISOString(), endedAt: new Date(Date.now() - 45 * 60 * 1000 + 3400).toISOString(), durationMs: 480, input: {}, output: { statusCode: 200, entryId: "inv_4821" } },
    ],
  },
  {
    id: "run_m4n5o6",
    workflowId: "wf_lead_slack_crm",
    workflowName: "New Lead → Slack + CRM",
    status: "fail",
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 890).toISOString(),
    durationMs: 890,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "Lead Webhook", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 70).toISOString(), durationMs: 70, input: {}, output: { name: "Test User" } },
      { nodeId: "n2", nodeLabel: "Enrich Lead Data", connector: "transform", status: "fail", startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 70).toISOString(), endedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 890).toISOString(), durationMs: 820, input: {}, output: {}, error: "TypeError: Cannot read property 'revenue' of undefined" },
    ],
  },
  {
    id: "run_p7q8r9",
    workflowId: "wf_lead_slack_crm",
    workflowName: "New Lead → Slack + CRM",
    status: "success",
    startedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 28 * 60 * 1000 + 1100).toISOString(),
    durationMs: 1100,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "Lead Webhook", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 28 * 60 * 1000 + 65).toISOString(), durationMs: 65, input: {}, output: { name: "Mike Johnson", company: "Startup Labs" } },
      { nodeId: "n2", nodeLabel: "Enrich Lead Data", connector: "transform", status: "success", startedAt: new Date(Date.now() - 28 * 60 * 1000 + 65).toISOString(), endedAt: new Date(Date.now() - 28 * 60 * 1000 + 95).toISOString(), durationMs: 30, input: {}, output: { score: 35, tier: "startup" } },
      { nodeId: "n3", nodeLabel: "Score Check", connector: "condition", status: "success", startedAt: new Date(Date.now() - 28 * 60 * 1000 + 95).toISOString(), endedAt: new Date(Date.now() - 28 * 60 * 1000 + 105).toISOString(), durationMs: 10, input: {}, output: { branch: "false" } },
      { nodeId: "n6", nodeLabel: "Send Follow-up", connector: "email", status: "success", startedAt: new Date(Date.now() - 28 * 60 * 1000 + 105).toISOString(), endedAt: new Date(Date.now() - 28 * 60 * 1000 + 1100).toISOString(), durationMs: 995, input: {}, output: { sent: true, to: "mike@startuplabs.io" } },
    ],
  },
  {
    id: "run_s1t2u3",
    workflowId: "wf_customer_onboarding",
    workflowName: "Customer Onboarding Flow",
    status: "success",
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3200).toISOString(),
    durationMs: 3200,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "Webhook", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45).toISOString(), durationMs: 45, input: {}, output: { customerId: "cust_291", plan: "pro" } },
      { nodeId: "n2", nodeLabel: "Welcome Email", connector: "email", status: "success", startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45).toISOString(), endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800).toISOString(), durationMs: 1755, input: {}, output: { sent: true } },
      { nodeId: "n3", nodeLabel: "Slack CS", connector: "slack", status: "success", startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45).toISOString(), endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 420).toISOString(), durationMs: 375, input: {}, output: { ok: true } },
      { nodeId: "n4", nodeLabel: "CRM Update", connector: "http_request", status: "success", startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45).toISOString(), endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3200).toISOString(), durationMs: 3155, input: {}, output: { statusCode: 200 } },
    ],
  },
  {
    id: "run_v4w5x6",
    workflowId: "wf_daily_report",
    workflowName: "Daily Report Generator",
    status: "success",
    startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 2650).toISOString(),
    durationMs: 2650,
    triggerType: "schedule",
    steps: [
      { nodeId: "n1", nodeLabel: "Schedule Trigger", connector: "schedule", status: "success", startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 8).toISOString(), durationMs: 8, input: {}, output: { triggered: true } },
      { nodeId: "n2", nodeLabel: "Fetch KPIs", connector: "http_request", status: "success", startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 8).toISOString(), endedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 780).toISOString(), durationMs: 772, input: {}, output: { revenue: 45800, newUsers: 118 } },
      { nodeId: "n3", nodeLabel: "Format Report", connector: "transform", status: "success", startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 780).toISOString(), endedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 830).toISOString(), durationMs: 50, input: {}, output: { formatted: true } },
      { nodeId: "n4", nodeLabel: "Email Team", connector: "email", status: "success", startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 830).toISOString(), endedAt: new Date(Date.now() - 30 * 60 * 60 * 1000 + 2650).toISOString(), durationMs: 1820, input: {}, output: { sent: true, recipients: 8 } },
    ],
  },
  {
    id: "run_y7z8a9",
    workflowId: "wf_invoice_pipeline",
    workflowName: "Invoice Processing Pipeline",
    status: "fail",
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 8100).toISOString(),
    durationMs: 8100,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "Email Trigger", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 55).toISOString(), durationMs: 55, input: {}, output: { from: "ap@bigcorp.com" } },
      { nodeId: "n2", nodeLabel: "AI Extract", connector: "openai", status: "fail", startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 55).toISOString(), endedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 8100).toISOString(), durationMs: 8045, input: {}, output: {}, error: "OpenAI API timeout after 8000ms" },
    ],
  },
  {
    id: "run_b1c2d3",
    workflowId: "wf_github_pr_review",
    workflowName: "GitHub PR → Code Review → Notify",
    status: "success",
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5100).toISOString(),
    durationMs: 5100,
    triggerType: "webhook",
    steps: [
      { nodeId: "n1", nodeLabel: "GitHub Webhook", connector: "webhook", status: "success", startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), endedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 40).toISOString(), durationMs: 40, input: {}, output: { repo: "autoflow", pr: 139 } },
      { nodeId: "n2", nodeLabel: "OpenAI Review", connector: "openai", status: "success", startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 40).toISOString(), endedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 4700).toISOString(), durationMs: 4660, input: {}, output: { summary: "Minor style issues, approve with suggestions", score: "7/10" } },
      { nodeId: "n3", nodeLabel: "Notify Team", connector: "slack", status: "success", startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 4700).toISOString(), endedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5100).toISOString(), durationMs: 400, input: {}, output: { ok: true } },
    ],
  },
];

export default function LogsPage() {
  const [statusFilter, setStatusFilter] = useState<"" | "success" | "fail">("");
  const [workflowFilter, setWorkflowFilter] = useState("");

  const filteredLogs = useMemo(() => {
    return DEMO_LOGS.filter((log) => {
      if (statusFilter && log.status !== statusFilter) return false;
      if (workflowFilter && log.workflowId !== workflowFilter) return false;
      return true;
    });
  }, [statusFilter, workflowFilter]);

  const workflows = useMemo(() => {
    const unique = new Map<string, string>();
    for (const log of DEMO_LOGS) {
      unique.set(log.workflowId, log.workflowName);
    }
    return Array.from(unique.entries());
  }, []);

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Execution Logs</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Inspect every run with node-level output snapshots
          </p>
        </div>
        <button type="button" className="ghost-btn text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3 px-4 py-3">
        <select
          className="field-input w-auto min-w-[180px]"
          value={workflowFilter}
          onChange={(e) => setWorkflowFilter(e.target.value)}
        >
          <option value="">All workflows</option>
          {workflows.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          className="field-input w-auto min-w-[140px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "success" | "fail")}
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="fail">Failed</option>
        </select>
        <span className="ml-auto text-xs text-[var(--text-subtle)]">
          {filteredLogs.length} runs
        </span>
      </div>

      {/* Log Table */}
      <ExecutionLog logs={filteredLogs} />
    </div>
  );
}
