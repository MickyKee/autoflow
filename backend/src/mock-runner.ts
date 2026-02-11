import { nanoid } from "nanoid";

import type { ConnectorKey, WorkflowExecutionLog, WorkflowNode, WorkflowRecord } from "../../lib/types";

function toNodeInput(input: Record<string, unknown>, node: WorkflowNode) {
  return {
    ...input,
    nodeId: node.id,
    connector: node.data.connector,
  };
}

function simulateConnectorOutput(connector: ConnectorKey, input: Record<string, unknown>) {
  if (connector === "http_request") {
    return { statusCode: 200, body: { ok: true }, input };
  }

  if (connector === "openai") {
    return {
      summary: "AI summary unavailable in mock mode. Configure API keys in settings for live execution.",
      input,
    };
  }

  if (connector === "email") {
    return { queued: true, provider: "smtp", input };
  }

  if (connector === "slack") {
    return { posted: true, channel: "#ops", input };
  }

  if (connector === "transform") {
    return { transformed: true, input };
  }

  if (connector === "condition") {
    return { passed: true, input };
  }

  if (connector === "delay") {
    return { delayedMs: 500, input };
  }

  return { accepted: true, input };
}

export function createMockExecutionLog(
  workflow: WorkflowRecord,
  triggerType: WorkflowExecutionLog["triggerType"],
  triggerPayload: Record<string, unknown>,
): WorkflowExecutionLog {
  const startedAt = new Date();
  const steps: WorkflowExecutionLog["steps"] = [];

  let runningPayload = triggerPayload;

  for (const node of workflow.nodes) {
    const stepStart = new Date();
    const input = toNodeInput(runningPayload, node);
    const output = simulateConnectorOutput(node.data.connector, input);
    const stepEnd = new Date(stepStart.getTime() + 300);

    steps.push({
      nodeId: node.id,
      nodeLabel: node.data.label,
      connector: node.data.connector,
      status: "success",
      startedAt: stepStart.toISOString(),
      endedAt: stepEnd.toISOString(),
      durationMs: stepEnd.getTime() - stepStart.getTime(),
      input,
      output,
    });

    runningPayload = {
      ...runningPayload,
      ...output,
    };
  }

  const endedAt = new Date(startedAt.getTime() + steps.length * 320 + 280);

  return {
    id: `run_${nanoid(12)}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: "success",
    triggerType,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    steps,
  };
}
