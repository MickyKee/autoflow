import {
  MarkerType,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { create } from "zustand";

import type {
  ConnectorDefinition,
  ConnectorKey,
  NodeCategory,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowRecord,
} from "./types";

export type FlowNode = Node<WorkflowNodeData, NodeCategory>;
export type FlowEdge = Edge;

type BuilderStoreState = {
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  dirty: boolean;
};

type BuilderStoreActions = {
  initialize: (workflow: WorkflowRecord) => void;
  setNodesFromChanges: (changes: NodeChange<FlowNode>[]) => void;
  setEdgesFromChanges: (changes: EdgeChange<FlowEdge>[]) => void;
  connect: (connection: Connection) => void;
  addNodeFromConnector: (connector: ConnectorDefinition) => void;
  selectNode: (nodeId: string | null) => void;
  updateWorkflowMeta: (input: { name?: string; description?: string }) => void;
  updateNodeBasics: (nodeId: string, input: { label?: string; description?: string }) => void;
  updateNodeConfig: (nodeId: string, key: string, value: unknown) => void;
  removeNode: (nodeId: string) => void;
  serializeGraph: () => Pick<WorkflowRecord, "nodes" | "edges">;
  markSaved: () => void;
};

type BuilderStore = BuilderStoreState & BuilderStoreActions;

function createInitialBuilderState(): BuilderStoreState {
  return {
    workflowId: null,
    workflowName: "",
    workflowDescription: "",
    nodes: [],
    edges: [],
    selectedNodeId: null,
    dirty: false,
  };
}

function styleFlowEdge(edge: WorkflowEdge): FlowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: "smoothstep",
    animated: true,
    className: "builder-edge",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };
}

function connectorCategory(connector: ConnectorKey): NodeCategory {
  if (connector === "webhook" || connector === "schedule") {
    return "trigger";
  }

  if (connector === "condition") {
    return "condition";
  }

  if (connector === "transform") {
    return "transform";
  }

  if (connector === "delay") {
    return "output";
  }

  return "action";
}

export function defaultConfigForConnector(connector: ConnectorKey): Record<string, unknown> {
  if (connector === "webhook") {
    return {
      endpoint: `/api/webhooks/wf_${nanoid(6)}`,
      secretHeader: "x-autoflow-signature",
    };
  }

  if (connector === "schedule") {
    return {
      cron: "*/15 * * * *",
    };
  }

  if (connector === "http_request") {
    return {
      method: "GET",
      url: "https://api.example.com",
      timeoutMs: 8000,
    };
  }

  if (connector === "openai") {
    return {
      model: "gpt-4.1-mini",
      prompt: "Summarize the incoming payload and highlight anomalies.",
    };
  }

  if (connector === "email") {
    return {
      to: "{{email}}",
      subject: "AutoFlow notification",
      body: "Your workflow has completed successfully.",
    };
  }

  if (connector === "slack") {
    return {
      channel: "#automation",
      template: "Workflow event received: {{event}}",
    };
  }

  if (connector === "condition") {
    return {
      path: "score",
      operator: "gte",
      value: 50,
    };
  }

  if (connector === "transform") {
    return {
      expression: "({ ...data, processedAt: new Date().toISOString() })",
    };
  }

  return {
    seconds: 1,
  };
}

function toFlowNode(node: WorkflowNode): FlowNode {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      config: { ...node.data.config },
    },
  };
}

export function toFlowGraph(workflow: Pick<WorkflowRecord, "nodes" | "edges">): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  return {
    nodes: workflow.nodes.map(toFlowNode),
    edges: workflow.edges.map(styleFlowEdge),
  };
}

function toWorkflowNode(node: FlowNode): WorkflowNode {
  return {
    id: node.id,
    type: node.type,
    position: {
      x: Number.isFinite(node.position.x) ? node.position.x : 0,
      y: Number.isFinite(node.position.y) ? node.position.y : 0,
    },
    data: {
      label: node.data.label,
      description: node.data.description,
      connector: node.data.connector,
      category: node.data.category,
      config: { ...node.data.config },
    },
  };
}

function toWorkflowEdge(edge: FlowEdge): WorkflowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  };
}

export function toWorkflowGraph(input: {
  nodes: FlowNode[];
  edges: FlowEdge[];
}): Pick<WorkflowRecord, "nodes" | "edges"> {
  return {
    nodes: input.nodes.map(toWorkflowNode),
    edges: input.edges.map(toWorkflowEdge),
  };
}

export function createNodeFromConnector(
  connector: Pick<ConnectorDefinition, "key" | "name" | "description" | "category">,
  nodeCount: number,
): FlowNode {
  const id = `node_${nanoid(10)}`;
  const category = connectorCategory(connector.key);

  return {
    id,
    type: category,
    position: {
      x: 140 + (nodeCount % 4) * 240,
      y: 90 + Math.floor(nodeCount / 4) * 150,
    },
    data: {
      label: connector.name,
      description: connector.description,
      connector: connector.key,
      category,
      config: defaultConfigForConnector(connector.key),
    },
  };
}

function makeEdge(connection: Connection): FlowEdge | null {
  if (!connection.source || !connection.target) {
    return null;
  }

  return {
    id: `edge_${nanoid(10)}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? undefined,
    targetHandle: connection.targetHandle ?? undefined,
    type: "smoothstep",
    animated: true,
    className: "builder-edge",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  ...createInitialBuilderState(),

  initialize: (workflow) => {
    const graph = toFlowGraph(workflow);
    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowDescription: workflow.description,
      nodes: graph.nodes,
      edges: graph.edges,
      selectedNodeId: null,
      dirty: false,
    });
  },

  setNodesFromChanges: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      dirty: true,
    })),

  setEdgesFromChanges: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      dirty: true,
    })),

  connect: (connection) =>
    set((state) => {
      const edge = makeEdge(connection);

      if (!edge) {
        return state;
      }

      return {
        edges: addEdge(edge, state.edges),
        dirty: true,
      };
    }),

  addNodeFromConnector: (connector) =>
    set((state) => ({
      nodes: [...state.nodes, createNodeFromConnector(connector, state.nodes.length)],
      dirty: true,
    })),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  updateWorkflowMeta: (input) =>
    set((state) => ({
      workflowName: input.name ?? state.workflowName,
      workflowDescription: input.description ?? state.workflowDescription,
      dirty: true,
    })),

  updateNodeBasics: (nodeId, input) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: input.label ?? node.data.label,
                description: input.description ?? node.data.description,
              },
            }
          : node,
      ),
      dirty: true,
    })),

  updateNodeConfig: (nodeId, key, value) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  [key]: value,
                },
              },
            }
          : node,
      ),
      dirty: true,
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      dirty: true,
    })),

  serializeGraph: () => {
    const { nodes, edges } = get();
    return toWorkflowGraph({ nodes, edges });
  },

  markSaved: () => set({ dirty: false }),
}));

export function resetBuilderStore() {
  useBuilderStore.setState(createInitialBuilderState());
}
