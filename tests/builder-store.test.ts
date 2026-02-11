import { describe, expect, it } from "vitest";

import {
  createNodeFromConnector,
  defaultConfigForConnector,
  resetBuilderStore,
  toFlowGraph,
  toWorkflowGraph,
  useBuilderStore,
} from "../lib/store";
import type { WorkflowRecord } from "../lib/types";

function sampleWorkflow(): WorkflowRecord {
  const now = new Date().toISOString();

  return {
    id: "wf_builder_test",
    name: "Builder Test",
    description: "Workflow used to validate builder store behavior.",
    status: "paused",
    executionCount: 0,
    lastRunAt: null,
    createdAt: now,
    updatedAt: now,
    nodes: [
      {
        id: "node_start",
        type: "trigger",
        position: { x: 40, y: 80 },
        data: {
          label: "Webhook Trigger",
          description: "Start node",
          connector: "webhook",
          category: "trigger",
          config: { endpoint: "/api/webhooks/wf_builder_test" },
        },
      },
      {
        id: "node_output",
        type: "output",
        position: { x: 340, y: 80 },
        data: {
          label: "Output",
          description: "Finish",
          connector: "delay",
          category: "output",
          config: { seconds: 1 },
        },
      },
    ],
    edges: [{ id: "edge_start_output", source: "node_start", target: "node_output" }],
  };
}

describe("builder store helpers", () => {
  it("returns connector defaults for condition nodes", () => {
    const defaults = defaultConfigForConnector("condition");

    expect(defaults).toMatchObject({
      path: "score",
      operator: "gte",
      value: 50,
    });
  });

  it("creates a node from connector definition", () => {
    const node = createNodeFromConnector(
      {
        key: "slack",
        name: "Slack",
        description: "Post message",
        category: "action",
      },
      2,
    );

    expect(node.id.startsWith("node_")).toBe(true);
    expect(node.type).toBe("action");
    expect(node.data.connector).toBe("slack");
    expect(node.data.config).toHaveProperty("channel");
  });

  it("round-trips flow graph conversion", () => {
    const workflow = sampleWorkflow();
    const flowGraph = toFlowGraph(workflow);
    const roundTrip = toWorkflowGraph(flowGraph);

    expect(roundTrip.nodes).toEqual(workflow.nodes);
    expect(roundTrip.edges).toEqual([
      { id: "edge_start_output", source: "node_start", target: "node_output", sourceHandle: undefined, targetHandle: undefined },
    ]);
  });
});

describe("useBuilderStore", () => {
  it("updates node config and removes nodes", () => {
    resetBuilderStore();

    const workflow = sampleWorkflow();
    useBuilderStore.getState().initialize(workflow);
    useBuilderStore.getState().updateNodeConfig("node_output", "seconds", 9);

    const updated = useBuilderStore.getState().nodes.find((node) => node.id === "node_output");
    expect(updated?.data.config.seconds).toBe(9);

    useBuilderStore.getState().removeNode("node_output");

    const state = useBuilderStore.getState();
    expect(state.nodes.some((node) => node.id === "node_output")).toBe(false);
    expect(state.edges).toHaveLength(0);
    expect(state.dirty).toBe(true);
  });

  it("does not mark dirty for selection-only edge changes", () => {
    resetBuilderStore();
    const workflow = sampleWorkflow();
    useBuilderStore.getState().initialize(workflow);

    useBuilderStore.getState().setEdgesFromChanges([
      { id: "edge_start_output", type: "select", selected: true },
    ]);

    expect(useBuilderStore.getState().dirty).toBe(false);
  });

  it("prevents duplicate edges when connecting the same handles", () => {
    resetBuilderStore();
    const workflow = sampleWorkflow();
    useBuilderStore.getState().initialize(workflow);

    useBuilderStore.getState().connect({
      source: "node_start",
      target: "node_output",
      sourceHandle: null,
      targetHandle: null,
    });

    expect(useBuilderStore.getState().edges).toHaveLength(1);
  });
});
