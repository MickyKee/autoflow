import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../backend/src/index";

describe("GET /health", () => {
  it("returns API health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, service: "autoflow-api" });
  });
});
