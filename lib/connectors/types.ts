import type { AppSettings, ConnectorKey, WorkflowNode, WorkflowTriggerType } from "../types";

export type ConnectorExecutionContext = {
  connector: ConnectorKey;
  node: WorkflowNode;
  payload: Record<string, unknown>;
  settings: AppSettings;
  triggerType: WorkflowTriggerType;
};

export type ConnectorExecutionResult = {
  output: Record<string, unknown>;
  branch?: boolean;
};

export type ConnectorHandler = (
  context: ConnectorExecutionContext,
) => Promise<ConnectorExecutionResult> | ConnectorExecutionResult;
