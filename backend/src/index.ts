import cors from "cors";
import express from "express";
import { ZodError } from "zod";

import { runMigrations } from "./db";
import { publishLog, subscribeLogs } from "./events";
import { createMockExecutionLog } from "./mock-runner";
import {
  createExecutionLog,
  createWorkflow,
  getSettings,
  getWorkflowById,
  listConnectors,
  listLogs,
  listWorkflows,
  seedDatabaseIfEmpty,
  updateSettings,
  updateWorkflow,
} from "./repository";
import {
  logsFilterSchema,
  runWorkflowSchema,
  settingsUpdateSchema,
  workflowCreateSchema,
  workflowUpdateSchema,
} from "./schemas";

runMigrations();
seedDatabaseIfEmpty();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "autoflow-api" });
});

app.get("/api/workflows", (_req, res) => {
  res.json({ workflows: listWorkflows() });
});

app.get("/api/workflows/:id", (req, res) => {
  const workflow = getWorkflowById(req.params.id);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found." });
  }

  return res.json({ workflow });
});

app.post("/api/workflows", (req, res, next) => {
  try {
    const payload = workflowCreateSchema.parse(req.body);
    const workflow = createWorkflow(payload);
    return res.status(201).json({ workflow });
  } catch (error) {
    return next(error);
  }
});

app.put("/api/workflows/:id", (req, res, next) => {
  try {
    const payload = workflowUpdateSchema.parse(req.body);
    const workflow = updateWorkflow(req.params.id, payload);

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found." });
    }

    return res.json({ workflow });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/workflows/:id/run", (req, res, next) => {
  try {
    const workflow = getWorkflowById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found." });
    }

    const payload = runWorkflowSchema.parse(req.body ?? {});
    const log = createMockExecutionLog(workflow, payload.triggerType, payload.payload);

    createExecutionLog(log);
    publishLog(log);

    return res.status(201).json({ run: log });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/webhooks/:workflowId", (req, res, next) => {
  try {
    const workflow = getWorkflowById(req.params.workflowId);

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found." });
    }

    const payload = runWorkflowSchema.parse({
      triggerType: "webhook",
      payload: req.body && typeof req.body === "object" ? req.body : {},
    });

    const log = createMockExecutionLog(workflow, payload.triggerType, payload.payload);

    createExecutionLog(log);
    publishLog(log);

    return res.status(202).json({ accepted: true, runId: log.id });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/logs", (req, res, next) => {
  try {
    const filters = logsFilterSchema.parse(req.query);
    const logs = listLogs(filters);
    return res.json({ logs });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/logs/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const unsubscribe = subscribeLogs((log) => {
    res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);
  });

  const ping = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(ping);
    unsubscribe();
    res.end();
  });
});

app.get("/api/connectors", (_req, res) => {
  res.json({ connectors: listConnectors() });
});

app.get("/api/settings", (_req, res) => {
  res.json({ settings: getSettings() });
});

app.put("/api/settings", (req, res, next) => {
  try {
    const payload = settingsUpdateSchema.parse(req.body);
    const settings = updateSettings(payload);
    return res.json({ settings });
  } catch (error) {
    return next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid request payload.",
      details: error.issues,
    });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return res.status(500).json({ error: message });
});

const port = Number(process.env.API_PORT ?? 4000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`AutoFlow API listening on http://localhost:${port}`);
  });
}

export { app };
