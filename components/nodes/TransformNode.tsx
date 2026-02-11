"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { WorkflowNodeData } from "@/lib/types";

import { NodeChrome } from "./node-chrome";

export function TransformNode({ data }: NodeProps) {
  const nodeData = data as WorkflowNodeData;

  return (
    <div className="rf-node rf-node-transform">
      <Handle type="target" position={Position.Left} className="rf-handle rf-handle-target" />
      <NodeChrome
        connector={nodeData.connector}
        categoryLabel="Transform"
        title={nodeData.label}
        description={nodeData.description}
      />
      <Handle type="source" position={Position.Right} className="rf-handle rf-handle-source" />
    </div>
  );
}
