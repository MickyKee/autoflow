export type WorkflowStatus = "active" | "paused" | "error";

export type NodeCategory = "trigger" | "action" | "condition" | "transform" | "output";

export type ConnectorKey =
  | "webhook"
  | "schedule"
  | "http_request"
  | "openai"
  | "email"
  | "slack"
  | "condition"
  | "transform"
  | "delay";

export type WorkflowNodeData = {
  label: string;
  description: string;
  connector: ConnectorKey;
  category: NodeCategory;
  config: Record<string, unknown>;
};

export type WorkflowNode = {
  id: string;
  type: NodeCategory;
  position: { x: number; y: number };
  data: WorkflowNodeData;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

export type WorkflowRecord = {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  executionCount: number;
  lastRunAt: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
};

export type LogStatus = "success" | "fail" | "running";

export type WorkflowStepLog = {
  nodeId: string;
  nodeLabel: string;
  connector: ConnectorKey;
  status: LogStatus;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
};

export type WorkflowExecutionLog = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: LogStatus;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  triggerType: "manual" | "webhook" | "schedule";
  steps: WorkflowStepLog[];
};

export type ConnectorDefinition = {
  key: ConnectorKey;
  name: string;
  description: string;
  category: NodeCategory;
  accent: string;
};

export type AppSettings = {
  openaiApiKey: string;
  smtpHost: string;
  smtpUser: string;
  smtpPassword: string;
  slackWebhookUrl: string;
  executionConcurrency: number;
  runAlerts: boolean;
};
