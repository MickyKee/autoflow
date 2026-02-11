import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../backend/src/index";

const sampleNode = {
  id: "sample-node",
  type: "trigger",
  position: { x: 0, y: 0 },
  data: {
    label: "Webhook",
    description: "Trigger",
    connector: "webhook",
    category: "trigger",
    config: {},
  },
} as const;

describe("workflow endpoints", () => {
  it("returns seeded workflows", async () => {
    const response = await request(app).get("/api/workflows");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.workflows)).toBe(true);
    expect(response.body.workflows.length).toBeGreaterThanOrEqual(3);
  });

  it("creates and updates a workflow", async () => {
    const createResponse = await request(app).post("/api/workflows").send({
      name: "API Test Workflow",
      description: "Workflow created during API test coverage.",
      nodes: [sampleNode],
      edges: [],
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.workflow.name).toBe("API Test Workflow");

    const workflowId: string = createResponse.body.workflow.id;

    const updateResponse = await request(app)
      .put(`/api/workflows/${workflowId}`)
      .send({
        status: "active",
        description: "Updated description for test coverage.",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.workflow.status).toBe("active");
    expect(updateResponse.body.workflow.description).toContain("Updated description");
  });

  it("rejects invalid workflow payload", async () => {
    const response = await request(app).post("/api/workflows").send({
      name: "x",
      description: "short",
      nodes: [],
      edges: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request payload.");
  });

  it("runs a workflow and writes a log", async () => {
    const createResponse = await request(app).post("/api/workflows").send({
      name: "Runnable Workflow",
      description: "Workflow used to validate run endpoint and log persistence.",
      nodes: [
        sampleNode,
        {
          id: "delay-node",
          type: "output",
          position: { x: 200, y: 120 },
          data: {
            label: "Output",
            description: "Finish execution",
            connector: "delay",
            category: "output",
            config: {
              seconds: 0,
            },
          },
        },
      ],
      edges: [{ id: "edge-a", source: "sample-node", target: "delay-node" }],
    });
    const workflowId = createResponse.body.workflow.id as string;

    const runResponse = await request(app)
      .post(`/api/workflows/${workflowId}/run`)
      .send({
        triggerType: "manual",
        payload: { test: true, email: "qa@example.com" },
      });

    expect(runResponse.status).toBe(201);
    expect(runResponse.body.run.workflowId).toBe(workflowId);
    expect(runResponse.body.run.steps.length).toBeGreaterThan(0);
    expect(runResponse.body.run.status).toBe("success");

    const logsResponse = await request(app).get("/api/logs").query({ workflowId, limit: 20 });
    expect(logsResponse.status).toBe(200);
    expect(logsResponse.body.logs.some((log: { id: string }) => log.id === runResponse.body.run.id)).toBe(true);
  });
});
