"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { WorkflowNodeData } from "@/lib/types";

import { NodeChrome } from "./node-chrome";

export function ConditionNode({ data }: NodeProps) {
  const nodeData = data as WorkflowNodeData;

  return (
    <div className="rf-node rf-node-condition">
      <Handle type="target" position={Position.Left} className="rf-handle rf-handle-target" />
      <NodeChrome
        connector={nodeData.connector}
        categoryLabel="Condition"
        title={nodeData.label}
        description={nodeData.description}
      />
      <Handle id="true" type="source" position={Position.Right} className="rf-handle rf-handle-true">
        <span className="rf-handle-label">T</span>
      </Handle>
      <Handle
        id="false"
        type="source"
        position={Position.Right}
        className="rf-handle rf-handle-false"
        style={{ top: "72%" }}
      >
        <span className="rf-handle-label">F</span>
      </Handle>
    </div>
  );
}
