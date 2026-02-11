import type { ConnectorExecutionContext, ConnectorExecutionResult, ConnectorHandler } from "./types";
import { conditionConnector } from "./condition";
import { delayConnector } from "./delay";
import { emailConnector } from "./email";
import { httpRequestConnector } from "./http-request";
import { openAiConnector } from "./openai";
import { slackConnector } from "./slack";
import { transformConnector } from "./transform";
import { triggerConnector } from "./trigger";

const connectorRegistry: Record<string, ConnectorHandler> = {
  webhook: triggerConnector,
  schedule: triggerConnector,
  http_request: httpRequestConnector,
  openai: openAiConnector,
  email: emailConnector,
  slack: slackConnector,
  condition: conditionConnector,
  transform: transformConnector,
  delay: delayConnector,
};

export async function executeConnector(
  context: ConnectorExecutionContext,
): Promise<ConnectorExecutionResult> {
  const handler = connectorRegistry[context.connector];

  if (!handler) {
    throw new Error(`Unsupported connector: ${context.connector}`);
  }

  return handler(context);
}
