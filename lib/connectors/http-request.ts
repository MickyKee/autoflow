import type { ConnectorHandler } from "./types";
import { asRecord } from "./utils";

function parseBodyTemplate(
  body: unknown,
  payload: Record<string, unknown>,
): Record<string, unknown> | string | undefined {
  if (typeof body === "string") {
    return body.replaceAll("{{payload}}", JSON.stringify(payload));
  }

  if (body && typeof body === "object") {
    return body as Record<string, unknown>;
  }

  return undefined;
}

export const httpRequestConnector: ConnectorHandler = async ({ payload, node }) => {
  const url = String(node.data.config.url ?? "").trim();

  if (!url) {
    throw new Error("HTTP Request connector requires a target URL.");
  }

  const method = String(node.data.config.method ?? "GET").toUpperCase();
  const timeoutMs = Math.max(500, Math.min(Number(node.data.config.timeoutMs ?? 10000), 30000));
  const headers = asRecord(node.data.config.headers ?? {});
  const bodyTemplate = parseBodyTemplate(node.data.config.body, payload);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)])),
        ...(bodyTemplate ? { "Content-Type": "application/json" } : {}),
      },
      body: bodyTemplate ? JSON.stringify(bodyTemplate) : undefined,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const parsedBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(`HTTP request failed with status ${response.status}.`);
    }

    return {
      output: {
        ...payload,
        http: {
          url,
          method,
          status: response.status,
          data: asRecord(parsedBody),
        },
      },
    };
  } finally {
    clearTimeout(timer);
  }
};
