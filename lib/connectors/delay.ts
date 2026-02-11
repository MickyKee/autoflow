import type { ConnectorHandler } from "./types";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const delayConnector: ConnectorHandler = async ({ payload, node }) => {
  const seconds = Number(node.data.config.seconds ?? node.data.config.delaySeconds ?? 1);
  const boundedMs = Math.max(0, Math.min(seconds, 15)) * 1000;

  if (boundedMs > 0) {
    await wait(boundedMs);
  }

  return {
    output: {
      ...payload,
      delayMs: boundedMs,
    },
  };
};
