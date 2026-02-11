import { nanoid } from "nanoid";
import { z } from "zod";

import type {
  AppSettings,
  ConnectorDefinition,
  WorkflowExecutionLog,
  WorkflowRecord,
} from "../../lib/types";
import {
  DEFAULT_CONNECTORS,
  DEFAULT_EXECUTION_LOGS,
  DEFAULT_SETTINGS,
  DEFAULT_WORKFLOWS,
} from "./constants";
import { db } from "./db";

const workflowGraphSchema = z.object({
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
});

type WorkflowRow = {
  id: string;
  name: string;
  description: string;
  status: WorkflowRecord["status"];
  execution_count: number;
  last_run_at: string | null;
  graph_json: string;
  created_at: string;
  updated_at: string;
};

type LogRow = {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: WorkflowExecutionLog["status"];
  trigger_type: WorkflowExecutionLog["triggerType"];
  started_at: string;
  ended_at: string;
  duration_ms: number;
  steps_json: string;
};

type ConnectorRow = {
  key: ConnectorDefinition["key"];
  name: string;
  description: string;
  category: ConnectorDefinition["category"];
  accent: string;
};

type SettingsRow = {
  openai_api_key: string;
  smtp_host: string;
  smtp_user: string;
  smtp_password: string;
  slack_webhook_url: string;
  execution_concurrency: number;
  run_alerts: number;
};

function toWorkflowRecord(row: WorkflowRow): WorkflowRecord {
  const parsedGraph = workflowGraphSchema.safeParse(JSON.parse(row.graph_json));

  if (!parsedGraph.success) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: "error",
      executionCount: row.execution_count,
      lastRunAt: row.last_run_at,
      nodes: [],
      edges: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  const graph = parsedGraph.data as {
    nodes: WorkflowRecord["nodes"];
    edges: WorkflowRecord["edges"];
  };

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    executionCount: row.execution_count,
    lastRunAt: row.last_run_at,
    nodes: graph.nodes,
    edges: graph.edges,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toLogRecord(row: LogRow): WorkflowExecutionLog {
  const parsedSteps = z.array(z.unknown()).safeParse(JSON.parse(row.steps_json));

  return {
    id: row.id,
    workflowId: row.workflow_id,
    workflowName: row.workflow_name,
    status: row.status,
    triggerType: row.trigger_type,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMs: row.duration_ms,
    steps: parsedSteps.success ? (parsedSteps.data as WorkflowExecutionLog["steps"]) : [],
  };
}

function mapSettings(row: SettingsRow): AppSettings {
  return {
    openaiApiKey: row.openai_api_key,
    smtpHost: row.smtp_host,
    smtpUser: row.smtp_user,
    smtpPassword: row.smtp_password,
    slackWebhookUrl: row.slack_webhook_url,
    executionConcurrency: row.execution_concurrency,
    runAlerts: Boolean(row.run_alerts),
  };
}

export function seedDatabaseIfEmpty() {
  const workflowCount = db.prepare("SELECT COUNT(*) as count FROM workflows").get() as { count: number };

  if (workflowCount.count === 0) {
    const insert = db.prepare(
      `INSERT INTO workflows (
        id, name, description, status, execution_count, last_run_at, graph_json, created_at, updated_at
      ) VALUES (
        @id, @name, @description, @status, @execution_count, @last_run_at, @graph_json, @created_at, @updated_at
      )`,
    );

    const tx = db.transaction((workflows: WorkflowRecord[]) => {
      for (const workflow of workflows) {
        insert.run({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          execution_count: workflow.executionCount,
          last_run_at: workflow.lastRunAt,
          graph_json: JSON.stringify({ nodes: workflow.nodes, edges: workflow.edges }),
          created_at: workflow.createdAt,
          updated_at: workflow.updatedAt,
        });
      }
    });

    tx(DEFAULT_WORKFLOWS);
  }

  const connectorCount = db.prepare("SELECT COUNT(*) as count FROM connectors").get() as { count: number };

  if (connectorCount.count === 0) {
    const insert = db.prepare(
      `INSERT INTO connectors (
        key, name, description, category, accent, created_at, updated_at
      ) VALUES (
        @key, @name, @description, @category, @accent, @created_at, @updated_at
      )`,
    );
    const now = new Date().toISOString();

    const tx = db.transaction((connectors: ConnectorDefinition[]) => {
      for (const connector of connectors) {
        insert.run({
          key: connector.key,
          name: connector.name,
          description: connector.description,
          category: connector.category,
          accent: connector.accent,
          created_at: now,
          updated_at: now,
        });
      }
    });

    tx(DEFAULT_CONNECTORS);
  }

  const settings = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };

  if (settings.count === 0) {
    db.prepare(
      `INSERT INTO settings (
        id, openai_api_key, smtp_host, smtp_user, smtp_password, slack_webhook_url, execution_concurrency, run_alerts, updated_at
      ) VALUES (
        1, @openai_api_key, @smtp_host, @smtp_user, @smtp_password, @slack_webhook_url, @execution_concurrency, @run_alerts, @updated_at
      )`,
    ).run({
      openai_api_key: DEFAULT_SETTINGS.openaiApiKey,
      smtp_host: DEFAULT_SETTINGS.smtpHost,
      smtp_user: DEFAULT_SETTINGS.smtpUser,
      smtp_password: DEFAULT_SETTINGS.smtpPassword,
      slack_webhook_url: DEFAULT_SETTINGS.slackWebhookUrl,
      execution_concurrency: DEFAULT_SETTINGS.executionConcurrency,
      run_alerts: DEFAULT_SETTINGS.runAlerts ? 1 : 0,
      updated_at: new Date().toISOString(),
    });
  }

  const logCount = db.prepare("SELECT COUNT(*) as count FROM workflow_logs").get() as { count: number };

  if (logCount.count === 0) {
    const insert = db.prepare(
      `INSERT INTO workflow_logs (
        id,
        workflow_id,
        workflow_name,
        status,
        trigger_type,
        started_at,
        ended_at,
        duration_ms,
        steps_json,
        created_at
      ) VALUES (
        @id,
        @workflow_id,
        @workflow_name,
        @status,
        @trigger_type,
        @started_at,
        @ended_at,
        @duration_ms,
        @steps_json,
        @created_at
      )`,
    );

    const tx = db.transaction((logs: WorkflowExecutionLog[]) => {
      for (const log of logs) {
        insert.run({
          id: log.id,
          workflow_id: log.workflowId,
          workflow_name: log.workflowName,
          status: log.status,
          trigger_type: log.triggerType,
          started_at: log.startedAt,
          ended_at: log.endedAt,
          duration_ms: log.durationMs,
          steps_json: JSON.stringify(log.steps),
          created_at: log.endedAt,
        });
      }
    });

    tx(DEFAULT_EXECUTION_LOGS);
  }
}

export function listWorkflows() {
  const rows = db
    .prepare(
      `SELECT id, name, description, status, execution_count, last_run_at, graph_json, created_at, updated_at
       FROM workflows
       ORDER BY updated_at DESC`,
    )
    .all() as WorkflowRow[];

  return rows.map(toWorkflowRecord);
}

export function getWorkflowById(id: string) {
  const row = db
    .prepare(
      `SELECT id, name, description, status, execution_count, last_run_at, graph_json, created_at, updated_at
       FROM workflows WHERE id = ?`,
    )
    .get(id) as WorkflowRow | undefined;

  if (!row) {
    return null;
  }

  return toWorkflowRecord(row);
}

export function createWorkflow(input: Pick<WorkflowRecord, "name" | "description" | "nodes" | "edges">) {
  const now = new Date().toISOString();
  const id = `wf_${nanoid(10)}`;

  db.prepare(
    `INSERT INTO workflows (
      id, name, description, status, execution_count, last_run_at, graph_json, created_at, updated_at
    ) VALUES (
      @id, @name, @description, 'paused', 0, NULL, @graph_json, @created_at, @updated_at
    )`,
  ).run({
    id,
    name: input.name,
    description: input.description,
    graph_json: JSON.stringify({ nodes: input.nodes, edges: input.edges }),
    created_at: now,
    updated_at: now,
  });

  return getWorkflowById(id);
}

export function updateWorkflow(
  id: string,
  input: Partial<Pick<WorkflowRecord, "name" | "description" | "status" | "nodes" | "edges">>,
) {
  const existing = getWorkflowById(id);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  const name = input.name ?? existing.name;
  const description = input.description ?? existing.description;
  const status = input.status ?? existing.status;
  const nodes = input.nodes ?? existing.nodes;
  const edges = input.edges ?? existing.edges;

  db.prepare(
    `UPDATE workflows
     SET name = @name,
         description = @description,
         status = @status,
         graph_json = @graph_json,
         updated_at = @updated_at
     WHERE id = @id`,
  ).run({
    id,
    name,
    description,
    status,
    graph_json: JSON.stringify({ nodes, edges }),
    updated_at: now,
  });

  return getWorkflowById(id);
}

export function listConnectors() {
  const rows = db
    .prepare(
      `SELECT key, name, description, category, accent
       FROM connectors
       ORDER BY name ASC`,
    )
    .all() as ConnectorRow[];

  return rows as ConnectorDefinition[];
}

export function listLogs(input: {
  workflowId?: string;
  status?: WorkflowExecutionLog["status"];
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
}) {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (input.workflowId) {
    conditions.push("workflow_id = @workflowId");
    params.workflowId = input.workflowId;
  }

  if (input.status) {
    conditions.push("status = @status");
    params.status = input.status;
  }

  if (input.dateStart) {
    conditions.push("created_at >= @dateStart");
    params.dateStart = input.dateStart;
  }

  if (input.dateEnd) {
    conditions.push("created_at <= @dateEnd");
    params.dateEnd = input.dateEnd;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const statement = db.prepare(
    `SELECT id, workflow_id, workflow_name, status, trigger_type, started_at, ended_at, duration_ms, steps_json
     FROM workflow_logs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT @limit`,
  );

  const rows = statement.all({ ...params, limit: input.limit ?? 120 }) as LogRow[];

  return rows.map(toLogRecord);
}

export function createExecutionLog(log: WorkflowExecutionLog) {
  db.prepare(
    `INSERT INTO workflow_logs (
      id, workflow_id, workflow_name, status, trigger_type,
      started_at, ended_at, duration_ms, steps_json, created_at
    ) VALUES (
      @id, @workflow_id, @workflow_name, @status, @trigger_type,
      @started_at, @ended_at, @duration_ms, @steps_json, @created_at
    )`,
  ).run({
    id: log.id,
    workflow_id: log.workflowId,
    workflow_name: log.workflowName,
    status: log.status,
    trigger_type: log.triggerType,
    started_at: log.startedAt,
    ended_at: log.endedAt,
    duration_ms: log.durationMs,
    steps_json: JSON.stringify(log.steps),
    created_at: log.endedAt,
  });

  db.prepare(
    `UPDATE workflows
     SET execution_count = execution_count + 1,
         last_run_at = @last_run_at,
         status = @status,
         updated_at = @updated_at
     WHERE id = @workflow_id`,
  ).run({
    workflow_id: log.workflowId,
    last_run_at: log.endedAt,
    status: log.status === "success" ? "active" : "error",
    updated_at: log.endedAt,
  });
}

export function getSettings() {
  const row = db
    .prepare(
      `SELECT openai_api_key, smtp_host, smtp_user, smtp_password, slack_webhook_url, execution_concurrency, run_alerts
       FROM settings WHERE id = 1`,
    )
    .get() as SettingsRow | undefined;

  if (!row) {
    throw new Error("Settings row is missing.");
  }

  const mapped = mapSettings(row);

  return {
    ...mapped,
    openaiApiKey: "",
    smtpPassword: "",
    slackWebhookUrl: "",
    hasOpenaiApiKey: Boolean(mapped.openaiApiKey),
    hasSmtpPassword: Boolean(mapped.smtpPassword),
    hasSlackWebhookUrl: Boolean(mapped.slackWebhookUrl),
  };
}

export function getSecretSettings() {
  const row = db
    .prepare(
      `SELECT openai_api_key, smtp_host, smtp_user, smtp_password, slack_webhook_url, execution_concurrency, run_alerts
       FROM settings WHERE id = 1`,
    )
    .get() as SettingsRow | undefined;

  if (!row) {
    throw new Error("Settings row is missing.");
  }

  return mapSettings(row);
}

export function updateSettings(input: Partial<AppSettings>) {
  const current = getSecretSettings();

  const payload: AppSettings = {
    openaiApiKey: input.openaiApiKey && input.openaiApiKey.trim() ? input.openaiApiKey : current.openaiApiKey,
    smtpHost: input.smtpHost ?? current.smtpHost,
    smtpUser: input.smtpUser ?? current.smtpUser,
    smtpPassword: input.smtpPassword && input.smtpPassword.trim() ? input.smtpPassword : current.smtpPassword,
    slackWebhookUrl:
      input.slackWebhookUrl && input.slackWebhookUrl.trim()
        ? input.slackWebhookUrl
        : current.slackWebhookUrl,
    executionConcurrency: input.executionConcurrency ?? current.executionConcurrency,
    runAlerts: input.runAlerts ?? current.runAlerts,
  };

  db.prepare(
    `UPDATE settings
     SET openai_api_key = @openai_api_key,
         smtp_host = @smtp_host,
         smtp_user = @smtp_user,
         smtp_password = @smtp_password,
         slack_webhook_url = @slack_webhook_url,
         execution_concurrency = @execution_concurrency,
         run_alerts = @run_alerts,
         updated_at = @updated_at
     WHERE id = 1`,
  ).run({
    openai_api_key: payload.openaiApiKey,
    smtp_host: payload.smtpHost,
    smtp_user: payload.smtpUser,
    smtp_password: payload.smtpPassword,
    slack_webhook_url: payload.slackWebhookUrl,
    execution_concurrency: payload.executionConcurrency,
    run_alerts: payload.runAlerts ? 1 : 0,
    updated_at: new Date().toISOString(),
  });

  return getSettings();
}
