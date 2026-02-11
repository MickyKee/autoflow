import { nanoid } from "nanoid";

import { executeConnector } from "./connectors";
import type {
  AppSettings,
  WorkflowEdge,
  WorkflowExecutionLog,
  WorkflowNode,
  WorkflowRecord,
  WorkflowTriggerType,
} from "./types";

type QueueItem = {
  nodeId: string;
  payload: Record<string, unknown>;
};

type ExecuteWorkflowInput = {
  workflow: WorkflowRecord;
  settings: AppSettings;
  triggerType: WorkflowTriggerType;
  payload: Record<string, unknown>;
};

const MAX_STEPS = 300;

function getTriggerConnectors(triggerType: WorkflowTriggerType) {
  if (triggerType === "webhook") {
    return ["webhook"];
  }

  if (triggerType === "schedule") {
    return ["schedule"];
  }

  return ["webhook", "schedule"];
}

function buildAdjacency(edges: WorkflowEdge[]) {
  const map = new Map<string, WorkflowEdge[]>();

  for (const edge of edges) {
    const existing = map.get(edge.source) ?? [];
    existing.push(edge);
    map.set(edge.source, existing);
  }

  return map;
}

function assertAcyclic(workflow: WorkflowRecord) {
  const adjacency = buildAdjacency(workflow.edges);
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (nodeId: string) => {
    if (visiting.has(nodeId)) {
      throw new Error(`Workflow contains a cycle involving node ${nodeId}.`);
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    const outgoing = adjacency.get(nodeId) ?? [];

    for (const edge of outgoing) {
      visit(edge.target);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  for (const node of workflow.nodes) {
    visit(node.id);
  }
}

function pickStartNodes(workflow: WorkflowRecord, triggerType: WorkflowTriggerType): WorkflowNode[] {
  const triggerConnectorSet = new Set(getTriggerConnectors(triggerType));

  const triggerNodes = workflow.nodes.filter(
    (node) => node.type === "trigger" && triggerConnectorSet.has(node.data.connector),
  );

  if (triggerNodes.length > 0) {
    return triggerNodes;
  }

  const incomingTargetIds = new Set(workflow.edges.map((edge) => edge.target));
  const roots = workflow.nodes.filter((node) => !incomingTargetIds.has(node.id));

  return roots;
}

function normalizeBranchHandle(handle: string | undefined) {
  if (!handle) {
    return null;
  }

  const value = handle.trim().toLowerCase();

  if (["true", "yes", "pass", "1"].includes(value)) {
    return true;
  }

  if (["false", "no", "fail", "0"].includes(value)) {
    return false;
  }

  return null;
}

function selectOutgoingEdges(
  node: WorkflowNode,
  edges: WorkflowEdge[],
  branch: boolean | undefined,
): WorkflowEdge[] {
  if (node.data.connector !== "condition") {
    return edges;
  }

  const labeled = edges.filter((edge) => {
    return normalizeBranchHandle(edge.sourceHandle) !== null;
  });

  if (labeled.length === 0) {
    return branch === false ? [] : edges;
  }

  return labeled.filter((edge) => normalizeBranchHandle(edge.sourceHandle) === (branch ?? false));
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value };
}

function createStepError(
  node: WorkflowNode,
  startedAt: Date,
  error: unknown,
  payload: Record<string, unknown>,
): WorkflowExecutionLog["steps"][number] {
  const endedAt = new Date();
  const message = error instanceof Error ? error.message : "Unknown execution failure.";

  return {
    nodeId: node.id,
    nodeLabel: node.data.label,
    connector: node.data.connector,
    status: "fail",
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    input: payload,
    output: {},
    error: message,
  };
}

async function executeQueueItem(
  queueItem: QueueItem,
  workflow: WorkflowRecord,
  nodeMap: Map<string, WorkflowNode>,
  adjacency: Map<string, WorkflowEdge[]>,
  settings: AppSettings,
  triggerType: WorkflowTriggerType,
) {
  const node = nodeMap.get(queueItem.nodeId);

  if (!node) {
    throw new Error(`Node not found: ${queueItem.nodeId}`);
  }

  const startedAt = new Date();

  try {
    const connectorResult = await executeConnector({
      connector: node.data.connector,
      node,
      payload: queueItem.payload,
      settings,
      triggerType,
    });

    const endedAt = new Date();
    const output = toRecord(connectorResult.output);

    const step: WorkflowExecutionLog["steps"][number] = {
      nodeId: node.id,
      nodeLabel: node.data.label,
      connector: node.data.connector,
      status: "success",
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMs: endedAt.getTime() - startedAt.getTime(),
      input: queueItem.payload,
      output,
    };

    const outgoing = selectOutgoingEdges(node, adjacency.get(node.id) ?? [], connectorResult.branch);

    const next: QueueItem[] = outgoing.map((edge) => ({
      nodeId: edge.target,
      payload: output,
    }));

    return {
      step,
      next,
      failed: false as const,
    };
  } catch (error) {
    return {
      step: createStepError(node, startedAt, error, queueItem.payload),
      next: [] as QueueItem[],
      failed: true as const,
    };
  }
}

export async function executeWorkflow({
  workflow,
  settings,
  triggerType,
  payload,
}: ExecuteWorkflowInput): Promise<WorkflowExecutionLog> {
  if (workflow.nodes.length === 0) {
    throw new Error("Workflow does not contain any nodes.");
  }

  assertAcyclic(workflow);

  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));
  const adjacency = buildAdjacency(workflow.edges);
  const startNodes = pickStartNodes(workflow, triggerType);

  if (startNodes.length === 0) {
    throw new Error("Workflow has no valid starting node for this trigger type.");
  }

  const startedAt = new Date();
  const steps: WorkflowExecutionLog["steps"] = [];

  let queue: QueueItem[] = startNodes.map((node) => ({
    nodeId: node.id,
    payload,
  }));

  let processed = 0;
  let failed = false;

  while (queue.length > 0) {
    if (processed > MAX_STEPS) {
      throw new Error("Execution exceeded safety limits. Verify graph size and branching logic.");
    }

    const currentBatch = [...queue];
    queue = [];

    const results = await Promise.all(
      currentBatch.map((item) =>
        executeQueueItem(item, workflow, nodeMap, adjacency, settings, triggerType),
      ),
    );

    for (const result of results) {
      steps.push(result.step);
      processed += 1;

      if (result.failed) {
        failed = true;
        queue = [];
        break;
      }

      queue.push(...result.next);
    }
  }

  const endedAt = new Date();

  return {
    id: `run_${nanoid(12)}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: failed ? "fail" : "success",
    triggerType,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    steps,
  };
}
