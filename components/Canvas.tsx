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
  if (type === "trigger") return "#3b82f6";
  if (type === "action") return "#f97316";
  if (type === "condition") return "#eab308";
  if (type === "transform") return "#8b5cf6";
  return "#6b7280";
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
        gap={20}
        size={1}
        color="#d1d5db"
        style={{ backgroundColor: "#f3f4f6" }}
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
