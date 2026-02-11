import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../backend/src/index";

describe("settings endpoints", () => {
  it("returns masked secret settings", async () => {
    const response = await request(app).get("/api/settings");

    expect(response.status).toBe(200);
    expect(response.body.settings).toHaveProperty("hasOpenaiApiKey");
    expect(response.body.settings).toHaveProperty("hasSlackWebhookUrl");
    expect(response.body.settings.openaiApiKey).toBe("");
    expect(response.body.settings.slackWebhookUrl).toBe("");
  });

  it("updates settings and keeps secret value when omitted", async () => {
    const firstUpdate = await request(app).put("/api/settings").send({
      smtpHost: "smtp.example.com",
      smtpUser: "ops",
      smtpPassword: "super-secret",
      runAlerts: false,
      executionConcurrency: 3,
    });

    expect(firstUpdate.status).toBe(200);
    expect(firstUpdate.body.settings.smtpHost).toBe("smtp.example.com");
    expect(firstUpdate.body.settings.runAlerts).toBe(false);
    expect(firstUpdate.body.settings.hasSmtpPassword).toBe(true);

    const secondUpdate = await request(app).put("/api/settings").send({
      smtpHost: "smtp.example.com",
      smtpUser: "ops-team",
    });

    expect(secondUpdate.status).toBe(200);
    expect(secondUpdate.body.settings.smtpUser).toBe("ops-team");
    expect(secondUpdate.body.settings.hasSmtpPassword).toBe(true);
  });
});
