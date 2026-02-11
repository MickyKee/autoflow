"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";

import type { NodeCategory } from "@/lib/types";
import type { FlowEdge, FlowNode } from "@/lib/store";

import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { TransformNode } from "./nodes/TransformNode";
import { TriggerNode } from "./nodes/TriggerNode";

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  transform: TransformNode,
  output: ActionNode,
};

function nodeTint(type: NodeCategory) {
  if (type === "trigger") {
    return "oklch(0.73 0.17 232)";
  }

  if (type === "action") {
    return "oklch(0.75 0.16 28)";
  }

  if (type === "condition") {
    return "oklch(0.72 0.17 80)";
  }

  if (type === "transform") {
    return "oklch(0.77 0.16 263)";
  }

  return "oklch(0.7 0.08 260)";
}

type CanvasProps = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectNode: (nodeId: string | null) => void;
};

function CanvasInner({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onSelectNode }: CanvasProps) {
  return (
    <ReactFlow
      className="builder-flow"
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onNodeClick={(_event, node) => {
        onSelectNode(node.id);
      }}
      onPaneClick={() => {
        onSelectNode(null);
      }}
      onSelectionChange={({ nodes: selected }) => {
        onSelectNode(selected[0]?.id ?? null);
      }}
      fitView
      minZoom={0.3}
      maxZoom={1.6}
      connectionLineType={ConnectionLineType.SmoothStep}
      defaultEdgeOptions={{
        type: "smoothstep",
        animated: true,
        className: "builder-edge",
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        id="grid"
        gap={24}
        size={1.4}
        color="oklch(0.42 0.05 280 / 0.42)"
        style={{ backgroundColor: "oklch(0.15 0.03 292 / 0.8)" }}
      />
      <MiniMap
        className="builder-minimap"
        pannable
        zoomable
        nodeStrokeWidth={3}
        nodeColor={(node) => nodeTint(node.type as NodeCategory)}
      />
      <Controls className="builder-controls" />
    </ReactFlow>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
