import type { ConnectorHandler } from "./types";

export const triggerConnector: ConnectorHandler = async ({ payload, triggerType, node }) => {
  return {
    output: {
      ...payload,
      triggerType,
      triggerNodeId: node.id,
    },
  };
};
