import type {
  AppSettings,
  AppSettingsView,
  ConnectorDefinition,
  LogStatus,
  WorkflowExecutionLog,
  WorkflowRecord,
  WorkflowTriggerType,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Unknown error." }))) as {
      error?: string;
    };

    throw new Error(body.error ?? `Request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function fetchWorkflows() {
  return apiRequest<{ workflows: WorkflowRecord[] }>("/api/workflows");
}

export async function fetchWorkflow(id: string) {
  return apiRequest<{ workflow: WorkflowRecord }>(`/api/workflows/${id}`);
}

export async function updateWorkflow(id: string, payload: Partial<WorkflowRecord>) {
  return apiRequest<{ workflow: WorkflowRecord }>(`/api/workflows/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createWorkflow(payload: {
  name: string;
  description: string;
  nodes: WorkflowRecord["nodes"];
  edges: WorkflowRecord["edges"];
}) {
  return apiRequest<{ workflow: WorkflowRecord }>("/api/workflows", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runWorkflow(id: string, payload: { triggerType: WorkflowTriggerType; payload: Record<string, unknown> }) {
  return apiRequest<{ run: WorkflowExecutionLog }>(`/api/workflows/${id}/run`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLogs(filters: {
  workflowId?: string;
  status?: LogStatus;
  dateStart?: string;
  dateEnd?: string;
}) {
  const params = new URLSearchParams();

  if (filters.workflowId) {
    params.set("workflowId", filters.workflowId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.dateStart) {
    params.set("dateStart", filters.dateStart);
  }

  if (filters.dateEnd) {
    params.set("dateEnd", filters.dateEnd);
  }

  return apiRequest<{ logs: WorkflowExecutionLog[] }>(`/api/logs?${params.toString()}`);
}

export async function fetchConnectors() {
  return apiRequest<{ connectors: ConnectorDefinition[] }>("/api/connectors");
}

export async function fetchSettings() {
  return apiRequest<{ settings: AppSettingsView }>("/api/settings");
}

export async function updateSettings(payload: Partial<AppSettings>) {
  return apiRequest<{ settings: AppSettingsView }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
