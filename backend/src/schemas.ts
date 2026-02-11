import { z } from "zod";

const connectorKeySchema = z.enum([
  "webhook",
  "schedule",
  "http_request",
  "openai",
  "email",
  "slack",
  "condition",
  "transform",
  "delay",
]);

const nodeCategorySchema = z.enum(["trigger", "action", "condition", "transform", "output"]);

const workflowNodeSchema = z.object({
  id: z.string().min(1),
  type: nodeCategorySchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string().min(1),
    description: z.string().min(1),
    connector: connectorKeySchema,
    category: nodeCategorySchema,
    config: z.record(z.string(), z.unknown()),
  }),
});

const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

export const workflowCreateSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(8).max(300),
  nodes: z.array(workflowNodeSchema).min(1).max(200),
  edges: z.array(workflowEdgeSchema).max(400),
});

export const workflowUpdateSchema = z.object({
  name: z.string().min(3).max(80).optional(),
  description: z.string().min(8).max(300).optional(),
  status: z.enum(["active", "paused", "error"]).optional(),
  nodes: z.array(workflowNodeSchema).min(1).max(200).optional(),
  edges: z.array(workflowEdgeSchema).max(400).optional(),
});

export const logsFilterSchema = z.object({
  workflowId: z.string().optional(),
  status: z.enum(["success", "fail", "running"]).optional(),
  dateStart: z.string().datetime().optional(),
  dateEnd: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export const settingsUpdateSchema = z.object({
  openaiApiKey: z.string().max(600).optional(),
  smtpHost: z.string().max(300).optional(),
  smtpUser: z.string().max(300).optional(),
  smtpPassword: z.string().max(300).optional(),
  slackWebhookUrl: z.string().max(500).optional(),
  executionConcurrency: z.number().int().min(1).max(20).optional(),
  runAlerts: z.boolean().optional(),
});

export const runWorkflowSchema = z.object({
  triggerType: z.enum(["manual", "webhook", "schedule"]).default("manual"),
  payload: z.record(z.string(), z.unknown()).default({}),
});
