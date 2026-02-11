"use client";

import { X } from "lucide-react";

import type { ConnectorKey } from "@/lib/types";
import type { FlowNode } from "@/lib/store";

type ConfigFieldType = "text" | "number" | "textarea" | "select";

type ConfigField = {
  key: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  hint?: string;
};

const configFields: Partial<Record<ConnectorKey, ConfigField[]>> = {
  webhook: [
    { key: "endpoint", label: "Endpoint", type: "text", placeholder: "/api/webhooks/workflow_id" },
    { key: "secretHeader", label: "Secret Header", type: "text", placeholder: "x-autoflow-signature" },
  ],
  schedule: [{ key: "cron", label: "Cron Expression", type: "text", placeholder: "*/15 * * * *" }],
  http_request: [
    {
      key: "method",
      label: "Method",
      type: "select",
      options: ["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ label: value, value })),
    },
    { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com" },
    { key: "timeoutMs", label: "Timeout (ms)", type: "number", placeholder: "8000" },
  ],
  openai: [
    { key: "model", label: "Model", type: "text", placeholder: "gpt-4.1-mini" },
    { key: "prompt", label: "Prompt Template", type: "textarea", placeholder: "Summarize {{payload}}" },
  ],
  email: [
    { key: "to", label: "To", type: "text", placeholder: "{{email}}" },
    { key: "subject", label: "Subject", type: "text", placeholder: "Workflow alert" },
    { key: "body", label: "Body", type: "textarea", placeholder: "Message body..." },
  ],
  slack: [
    { key: "channel", label: "Channel", type: "text", placeholder: "#automation" },
    { key: "template", label: "Message Template", type: "textarea", placeholder: "Workflow event: {{event}}" },
  ],
  condition: [
    { key: "path", label: "Payload Path", type: "text", placeholder: "score" },
    {
      key: "operator",
      label: "Operator",
      type: "select",
      options: [
        { label: "equals", value: "eq" },
        { label: "not equals", value: "neq" },
        { label: "greater than", value: "gt" },
        { label: "greater or equal", value: "gte" },
        { label: "less than", value: "lt" },
        { label: "less or equal", value: "lte" },
      ],
    },
    { key: "value", label: "Comparison Value", type: "text", placeholder: "50" },
  ],
  transform: [
    {
      key: "expression",
      label: "JS Expression",
      type: "textarea",
      placeholder: "({ ...data, normalized: true })",
      hint: "Expression runs in a sandbox with data and context in scope.",
    },
  ],
  delay: [{ key: "seconds", label: "Delay (seconds)", type: "number", placeholder: "1" }],
};

function normalizeConfigValue(input: string, type: ConfigFieldType) {
  if (type === "number") {
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (input.trim() === "true") {
    return true;
  }

  if (input.trim() === "false") {
    return false;
  }

  if (input.trim() !== "" && !Number.isNaN(Number(input))) {
    return Number(input);
  }

  return input;
}

type NodeConfigPanelProps = {
  node: FlowNode | null;
  onClose: () => void;
  onUpdateBasics: (nodeId: string, input: { label?: string; description?: string }) => void;
  onUpdateConfig: (nodeId: string, key: string, value: unknown) => void;
};

export function NodeConfigPanel({ node, onClose, onUpdateBasics, onUpdateConfig }: NodeConfigPanelProps) {
  const fields = node ? configFields[node.data.connector] ?? [] : [];

  return (
    <aside className={`node-config-panel ${node ? "node-config-panel-open" : ""}`}>
      <header className="node-config-header">
        <div>
          <p className="hero-kicker">Node Config</p>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {node ? node.data.label : "No node selected"}
          </h3>
        </div>
        <button type="button" className="ghost-btn" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </button>
      </header>

      {!node ? (
        <p className="text-sm text-[var(--text-muted)]">
          Select a node on the canvas to edit label, description, and connector parameters.
        </p>
      ) : (
        <div className="node-config-body">
          <label className="field-label">
            Label
            <input
              className="field-input"
              value={node.data.label}
              onChange={(event) => {
                onUpdateBasics(node.id, { label: event.target.value });
              }}
            />
          </label>

          <label className="field-label">
            Description
            <textarea
              className="field-input min-h-20"
              value={node.data.description}
              onChange={(event) => {
                onUpdateBasics(node.id, { description: event.target.value });
              }}
            />
          </label>

          {fields.map((field) => {
            const rawValue = node.data.config[field.key];
            const value = rawValue === undefined || rawValue === null ? "" : String(rawValue);

            if (field.type === "textarea") {
              return (
                <label key={field.key} className="field-label">
                  {field.label}
                  <textarea
                    className="field-input min-h-28 mono text-xs"
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(event) => {
                      onUpdateConfig(node.id, field.key, event.target.value);
                    }}
                  />
                  {field.hint ? <small className="text-[10px] text-[var(--text-subtle)]">{field.hint}</small> : null}
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <label key={field.key} className="field-label">
                  {field.label}
                  <select
                    className="field-input"
                    value={value}
                    onChange={(event) => {
                      onUpdateConfig(node.id, field.key, event.target.value);
                    }}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={field.key} className="field-label">
                {field.label}
                <input
                  type={field.type}
                  className="field-input"
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => {
                    onUpdateConfig(node.id, field.key, normalizeConfigValue(event.target.value, field.type));
                  }}
                />
              </label>
            );
          })}
        </div>
      )}
    </aside>
  );
}
