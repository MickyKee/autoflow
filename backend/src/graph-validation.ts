import type { WorkflowEdge, WorkflowNode } from "../../lib/types";

const MAX_NODES = 200;
const MAX_EDGES = 400;

const branchHandles = new Set(["true", "false", "yes", "no", "pass", "fail", "1", "0"]);

type GraphInput = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

function hasDuplicateIds(items: { id: string }[]) {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      return true;
    }
    seen.add(item.id);
  }

  return false;
}

export function validateWorkflowGraph(graph: GraphInput) {
  const errors: string[] = [];

  if (graph.nodes.length === 0) {
    errors.push("Workflow graph must contain at least one node.");
  }

  if (graph.nodes.length > MAX_NODES) {
    errors.push(`Workflow graph exceeds node limit (${MAX_NODES}).`);
  }

  if (graph.edges.length > MAX_EDGES) {
    errors.push(`Workflow graph exceeds edge limit (${MAX_EDGES}).`);
  }

  if (hasDuplicateIds(graph.nodes)) {
    errors.push("Workflow graph contains duplicate node IDs.");
  }

  if (hasDuplicateIds(graph.edges)) {
    errors.push("Workflow graph contains duplicate edge IDs.");
  }

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  for (const edge of graph.edges) {
    if (!nodeMap.has(edge.source)) {
      errors.push(`Edge "${edge.id}" points to missing source node "${edge.source}".`);
    }

    if (!nodeMap.has(edge.target)) {
      errors.push(`Edge "${edge.id}" points to missing target node "${edge.target}".`);
    }

    if (edge.source === edge.target) {
      errors.push(`Edge "${edge.id}" cannot connect a node to itself.`);
    }

    const sourceNode = nodeMap.get(edge.source);
    if (sourceNode?.data.connector === "condition" && edge.sourceHandle) {
      const normalized = edge.sourceHandle.toLowerCase().trim();
      if (!branchHandles.has(normalized)) {
        errors.push(`Condition edge "${edge.id}" must use a true/false branch handle.`);
      }
    }
  }

  return errors;
}
