import vm from "node:vm";

import type { ConnectorHandler } from "./types";
import { asRecord } from "./utils";

function normalizeExpression(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "data";
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return `(${trimmed})`;
  }

  return trimmed;
}

export const transformConnector: ConnectorHandler = ({ payload, node }) => {
  const expression = String(node.data.config.expression ?? "data");
  const script = new vm.Script(normalizeExpression(expression));
  const context = vm.createContext({ data: payload });

  const value = script.runInContext(context, { timeout: 40 });

  return {
    output: {
      ...payload,
      ...asRecord(value),
    },
  };
};
