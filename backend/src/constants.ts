import type {
  ConnectorDefinition,
  WorkflowEdge,
  WorkflowExecutionLog,
  WorkflowNode,
  WorkflowRecord,
} from "../../lib/types";

const nowIso = () => new Date().toISOString();

const primaryWorkflowNodes: WorkflowNode[] = [
  {
    id: "node_webhook_1",
    type: "trigger",
    position: { x: 80, y: 120 },
    data: {
      label: "Webhook Trigger",
      description: "Receives payloads from external systems.",
      connector: "webhook",
      category: "trigger",
      config: {
        endpoint: "/api/webhooks/wf_signup_router",
        secretHeader: "x-autoflow-signature",
      },
    },
  },
  {
    id: "node_transform_1",
    type: "transform",
    position: { x: 360, y: 120 },
    data: {
      label: "Normalize Lead",
      description: "Maps incoming payload into internal lead schema.",
      connector: "transform",
      category: "transform",
      config: {
        expression:
          "({ email: data.email ?? data.userEmail ?? '', source: data.source ?? 'unknown', score: Number(data.intentScore ?? 0) })",
      },
    },
  },
  {
    id: "node_condition_1",
    type: "condition",
    position: { x: 660, y: 120 },
    data: {
      label: "High Intent?",
      description: "Branches by intent score threshold.",
      connector: "condition",
      category: "condition",
      config: {
        path: "score",
        operator: "gte",
        value: 70,
      },
    },
  },
  {
    id: "node_slack_1",
    type: "action",
    position: { x: 940, y: 40 },
    data: {
      label: "Notify Sales",
      description: "Posts a high-priority message to Slack.",
      connector: "slack",
      category: "action",
      config: {
        channel: "#revenue-ops",
        template: "🔥 Hot lead: {{email}} (score: {{score}})",
      },
    },
  },
  {
    id: "node_email_1",
    type: "action",
    position: { x: 940, y: 220 },
    data: {
      label: "Nurture Email",
      description: "Sends an onboarding follow-up email.",
      connector: "email",
      category: "action",
      config: {
        to: "{{email}}",
        subject: "Welcome to AutoFlow",
        body: "Thanks for your interest. A specialist will follow up shortly.",
      },
    },
  },
  {
    id: "node_output_1",
    type: "output",
    position: { x: 1220, y: 120 },
    data: {
      label: "Execution Output",
      description: "Emits final payload to run log.",
      connector: "delay",
      category: "output",
      config: {
        destination: "workflow-log",
      },
    },
  },
];

const primaryWorkflowEdges: WorkflowEdge[] = [
  { id: "edge_1", source: "node_webhook_1", target: "node_transform_1" },
  { id: "edge_2", source: "node_transform_1", target: "node_condition_1" },
  {
    id: "edge_3",
    source: "node_condition_1",
    target: "node_slack_1",
    sourceHandle: "true",
  },
  {
    id: "edge_4",
    source: "node_condition_1",
    target: "node_email_1",
    sourceHandle: "false",
  },
  { id: "edge_5", source: "node_slack_1", target: "node_output_1" },
  { id: "edge_6", source: "node_email_1", target: "node_output_1" },
];

const scheduleWorkflowNodes: WorkflowNode[] = [
  {
    id: "node_schedule_1",
    type: "trigger",
    position: { x: 120, y: 180 },
    data: {
      label: "Hourly Schedule",
      description: "Runs once per hour.",
      connector: "schedule",
      category: "trigger",
      config: {
        cron: "0 * * * *",
      },
    },
  },
  {
    id: "node_http_1",
    type: "action",
    position: { x: 420, y: 180 },
    data: {
      label: "Fetch KPI",
      description: "Requests fresh KPI values from REST endpoint.",
      connector: "http_request",
      category: "action",
      config: {
        method: "GET",
        url: "https://api.example.com/metrics",
        timeoutMs: 8000,
      },
    },
  },
  {
    id: "node_openai_1",
    type: "action",
    position: { x: 740, y: 180 },
    data: {
      label: "Summarize Delta",
      description: "Summarizes KPI movement using OpenAI.",
      connector: "openai",
      category: "action",
      config: {
        model: "gpt-4.1-mini",
        prompt: "Summarize KPI deltas and call out anomalies.",
      },
    },
  },
  {
    id: "node_output_2",
    type: "output",
    position: { x: 1050, y: 180 },
    data: {
      label: "Output",
      description: "Writes run summary.",
      connector: "delay",
      category: "output",
      config: {
        destination: "run-summary",
      },
    },
  },
];

const scheduleWorkflowEdges: WorkflowEdge[] = [
  { id: "sched_edge_1", source: "node_schedule_1", target: "node_http_1" },
  { id: "sched_edge_2", source: "node_http_1", target: "node_openai_1" },
  { id: "sched_edge_3", source: "node_openai_1", target: "node_output_2" },
];

export const DEFAULT_CONNECTORS: ConnectorDefinition[] = [
  {
    key: "webhook",
    name: "Webhook Trigger",
    description: "Receive incoming HTTP POST events and start workflows instantly.",
    category: "trigger",
    accent: "oklch(0.73 0.17 232)",
  },
  {
    key: "schedule",
    name: "Schedule / Cron",
    description: "Run workflows on intervals using cron syntax.",
    category: "trigger",
    accent: "oklch(0.74 0.14 102)",
  },
  {
    key: "http_request",
    name: "HTTP Request",
    description: "Call REST APIs with headers, body, retries, and timeouts.",
    category: "action",
    accent: "oklch(0.76 0.13 250)",
  },
  {
    key: "openai",
    name: "OpenAI",
    description: "Generate summaries and decisions with language models.",
    category: "action",
    accent: "oklch(0.78 0.13 178)",
  },
  {
    key: "email",
    name: "Email (SMTP)",
    description: "Dispatch transactional emails through SMTP.",
    category: "action",
    accent: "oklch(0.75 0.16 28)",
  },
  {
    key: "slack",
    name: "Slack",
    description: "Send channel updates and incident notifications.",
    category: "action",
    accent: "oklch(0.71 0.2 316)",
  },
  {
    key: "condition",
    name: "Condition",
    description: "Split flow logic with if/else branch evaluation.",
    category: "condition",
    accent: "oklch(0.72 0.17 80)",
  },
  {
    key: "transform",
    name: "Transform",
    description: "Map and shape data payloads using safe expressions.",
    category: "transform",
    accent: "oklch(0.77 0.16 263)",
  },
  {
    key: "delay",
    name: "Delay",
    description: "Pause execution for a configured amount of time.",
    category: "output",
    accent: "oklch(0.7 0.08 260)",
  },
];

export const DEFAULT_WORKFLOWS: WorkflowRecord[] = [
  {
    id: "wf_signup_router",
    name: "Lead Qualification Router",
    description: "Routes inbound leads into sales or nurture pathways.",
    status: "active",
    executionCount: 187,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    nodes: primaryWorkflowNodes,
    edges: primaryWorkflowEdges,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "wf_hourly_summary",
    name: "Hourly KPI Summary",
    description: "Pulls KPI data and summarizes changes for ops.",
    status: "paused",
    executionCount: 52,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    nodes: scheduleWorkflowNodes,
    edges: scheduleWorkflowEdges,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "wf_incident_relay",
    name: "Incident Relay",
    description: "Relays webhook incidents to Slack with conditional escalation.",
    status: "error",
    executionCount: 16,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    nodes: primaryWorkflowNodes,
    edges: primaryWorkflowEdges,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const DEFAULT_EXECUTION_LOGS: WorkflowExecutionLog[] = [
  {
    id: "run_001",
    workflowId: "wf_signup_router",
    workflowName: "Lead Qualification Router",
    status: "success",
    startedAt: new Date(Date.now() - 1000 * 60 * 9 - 4800).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    durationMs: 4800,
    triggerType: "webhook",
    steps: [
      {
        nodeId: "node_webhook_1",
        nodeLabel: "Webhook Trigger",
        connector: "webhook",
        status: "success",
        startedAt: new Date(Date.now() - 1000 * 60 * 9 - 4800).toISOString(),
        endedAt: new Date(Date.now() - 1000 * 60 * 9 - 4200).toISOString(),
        durationMs: 600,
        input: { event: "lead.created", source: "website" },
        output: { email: "alex@example.com", intentScore: 87 },
      },
      {
        nodeId: "node_transform_1",
        nodeLabel: "Normalize Lead",
        connector: "transform",
        status: "success",
        startedAt: new Date(Date.now() - 1000 * 60 * 9 - 4200).toISOString(),
        endedAt: new Date(Date.now() - 1000 * 60 * 9 - 3200).toISOString(),
        durationMs: 1000,
        input: { email: "alex@example.com", intentScore: 87 },
        output: { email: "alex@example.com", source: "website", score: 87 },
      },
      {
        nodeId: "node_slack_1",
        nodeLabel: "Notify Sales",
        connector: "slack",
        status: "success",
        startedAt: new Date(Date.now() - 1000 * 60 * 9 - 3200).toISOString(),
        endedAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
        durationMs: 3200,
        input: { email: "alex@example.com", score: 87 },
        output: { delivered: true, channel: "#revenue-ops" },
      },
    ],
  },
  {
    id: "run_002",
    workflowId: "wf_incident_relay",
    workflowName: "Incident Relay",
    status: "fail",
    startedAt: new Date(Date.now() - 1000 * 60 * 32 - 2700).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    durationMs: 2700,
    triggerType: "webhook",
    steps: [
      {
        nodeId: "node_webhook_1",
        nodeLabel: "Webhook Trigger",
        connector: "webhook",
        status: "success",
        startedAt: new Date(Date.now() - 1000 * 60 * 32 - 2700).toISOString(),
        endedAt: new Date(Date.now() - 1000 * 60 * 32 - 2100).toISOString(),
        durationMs: 600,
        input: { incident: "api-latency" },
        output: { severity: "critical", service: "billing" },
      },
      {
        nodeId: "node_slack_1",
        nodeLabel: "Notify Sales",
        connector: "slack",
        status: "fail",
        startedAt: new Date(Date.now() - 1000 * 60 * 32 - 2100).toISOString(),
        endedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        durationMs: 2100,
        input: { severity: "critical", service: "billing" },
        output: {},
        error: "Slack webhook credentials missing.",
      },
    ],
  },
];

export const DEFAULT_SETTINGS = {
  openaiApiKey: "",
  smtpHost: "smtp.mailprovider.dev",
  smtpUser: "workflow-bot",
  smtpPassword: "",
  slackWebhookUrl: "",
  executionConcurrency: 4,
  runAlerts: true,
};
