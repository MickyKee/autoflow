import type { ConnectorHandler } from "./types";

export const emailConnector: ConnectorHandler = async ({ payload, node, settings }) => {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    throw new Error("SMTP credentials are incomplete. Configure host, user, and password.");
  }

  const to = String(node.data.config.to ?? payload.email ?? "").trim();
  const subject = String(node.data.config.subject ?? "AutoFlow Notification");
  const body = String(node.data.config.body ?? JSON.stringify(payload));

  if (!to) {
    throw new Error("Email connector requires a recipient address.");
  }

  return {
    output: {
      ...payload,
      email: {
        to,
        subject,
        accepted: true,
        transport: `${settings.smtpUser}@${settings.smtpHost}`,
        preview: body.slice(0, 180),
      },
    },
  };
};
