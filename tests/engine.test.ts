import { describe, expect, it } from "vitest";

import { executeWorkflow } from "../lib/engine";
import type { AppSettings, WorkflowRecord } from "../lib/types";

const baseSettings: AppSettings = {
  openaiApiKey: "",
  smtpHost: "smtp.example.com",
  smtpUser: "bot",
  smtpPassword: "secret",
  slackWebhookUrl: "",
  executionConcurrency: 4,
  runAlerts: true,
};

function makeWorkflow(nodes: WorkflowRecord["nodes"], edges: WorkflowRecord["edges"]): WorkflowRecord {
  const now = new Date().toISOString();

  return {
    id: "wf_test",
    name: "Test Workflow",
    description: "Workflow used for engine testing.",
    status: "active",
    executionCount: 0,
    lastRunAt: null,
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  };
}

describe("executeWorkflow", () => {
  it("routes condition branches by source handle", async () => {
    const workflow = makeWorkflow(
      [
        {
          id: "trigger",
          type: "trigger",
          position: { x: 0, y: 0 },
          data: {
            label: "Webhook",
            description: "Start",
            connector: "webhook",
            category: "trigger",
            config: {},
          },
        },
        {
          id: "condition",
          type: "condition",
          position: { x: 100, y: 0 },
          data: {
            label: "If score >= 50",
            description: "Branch",
            connector: "condition",
            category: "condition",
            config: {
              path: "score",
              operator: "gte",
              value: 50,
            },
          },
        },
        {
          id: "trueTransform",
          type: "transform",
          position: { x: 220, y: -40 },
          data: {
            label: "True branch",
            description: "Transform",
            connector: "transform",
            category: "transform",
            config: {
              expression: "({ route: 'high-intent', score: data.score })",
            },
          },
        },
        {
          id: "falseTransform",
          type: "transform",
          position: { x: 220, y: 40 },
          data: {
            label: "False branch",
            description: "Transform",
            connector: "transform",
            category: "transform",
            config: {
              expression: "({ route: 'nurture', score: data.score })",
            },
          },
        },
      ],
      [
        { id: "e1", source: "trigger", target: "condition" },
        { id: "e2", source: "condition", target: "trueTransform", sourceHandle: "true" },
        { id: "e3", source: "condition", target: "falseTransform", sourceHandle: "false" },
      ],
    );

    const run = await executeWorkflow({
      workflow,
      settings: baseSettings,
      triggerType: "webhook",
      payload: { score: 88 },
    });

    expect(run.status).toBe("success");
    expect(run.steps.some((step) => step.nodeId === "trueTransform")).toBe(true);
    expect(run.steps.some((step) => step.nodeId === "falseTransform")).toBe(false);
  });

  it("fails execution on invalid transform expression", async () => {
    const workflow = makeWorkflow(
      [
        {
          id: "trigger",
          type: "trigger",
          position: { x: 0, y: 0 },
          data: {
            label: "Webhook",
            description: "Start",
            connector: "webhook",
            category: "trigger",
            config: {},
          },
        },
        {
          id: "badTransform",
          type: "transform",
          position: { x: 100, y: 0 },
          data: {
            label: "Bad Transform",
            description: "Broken expression",
            connector: "transform",
            category: "transform",
            config: {
              expression: "(() => {",
            },
          },
        },
      ],
      [{ id: "e1", source: "trigger", target: "badTransform" }],
    );

    const run = await executeWorkflow({
      workflow,
      settings: baseSettings,
      triggerType: "webhook",
      payload: { score: 22 },
    });

    expect(run.status).toBe("fail");
    const failedStep = run.steps.find((step) => step.status === "fail");
    expect(failedStep).toBeTruthy();
    expect(failedStep?.nodeId).toBe("badTransform");
  });

  it("throws when the graph has a cycle", async () => {
    const workflow = makeWorkflow(
      [
        {
          id: "a",
          type: "trigger",
          position: { x: 0, y: 0 },
          data: {
            label: "A",
            description: "Start",
            connector: "webhook",
            category: "trigger",
            config: {},
          },
        },
        {
          id: "b",
          type: "action",
          position: { x: 100, y: 0 },
          data: {
            label: "B",
            description: "Action",
            connector: "delay",
            category: "action",
            config: { seconds: 0 },
          },
        },
      ],
      [
        { id: "e1", source: "a", target: "b" },
        { id: "e2", source: "b", target: "a" },
      ],
    );

    await expect(
      executeWorkflow({
        workflow,
        settings: baseSettings,
        triggerType: "webhook",
        payload: {},
      }),
    ).rejects.toThrow(/cycle/i);
  });
});
