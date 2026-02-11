import type { ConnectorHandler } from "./types";

function interpolateTemplate(template: string, payload: Record<string, unknown>) {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, key: string) => {
    const value = payload[key.trim()];
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  });
}

export const slackConnector: ConnectorHandler = async ({ payload, node, settings }) => {
  if (!settings.slackWebhookUrl) {
    throw new Error("Slack webhook URL is missing. Configure it in settings.");
  }

  const template = String(node.data.config.template ?? "Workflow event: {{event}}.");
  const channel = String(node.data.config.channel ?? "#general");
  const text = interpolateTemplate(template, payload);

  const response = await fetch(settings.slackWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      channel,
    }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed with status ${response.status}.`);
  }

  return {
    output: {
      ...payload,
      slack: {
        channel,
        delivered: true,
      },
    },
  };
};
