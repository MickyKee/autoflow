import type { ConnectorHandler } from "./types";
import { readPath } from "./utils";

type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";

function evaluate(operator: Operator, left: unknown, right: unknown) {
  if (operator === "eq") {
    return left === right;
  }

  if (operator === "neq") {
    return left !== right;
  }

  if (operator === "gt") {
    return Number(left) > Number(right);
  }

  if (operator === "gte") {
    return Number(left) >= Number(right);
  }

  if (operator === "lt") {
    return Number(left) < Number(right);
  }

  if (operator === "lte") {
    return Number(left) <= Number(right);
  }

  if (operator === "contains") {
    if (typeof left === "string") {
      return left.includes(String(right));
    }

    if (Array.isArray(left)) {
      return left.some((item) => item === right);
    }
  }

  return false;
}

export const conditionConnector: ConnectorHandler = ({ payload, node }) => {
  const path = String(node.data.config.path ?? "");
  const operator = String(node.data.config.operator ?? "eq") as Operator;
  const expectedValue = node.data.config.value;

  const currentValue = path ? readPath(payload, path) : payload;
  const branch = evaluate(operator, currentValue, expectedValue);

  return {
    branch,
    output: {
      ...payload,
      condition: {
        path,
        operator,
        expectedValue,
        currentValue,
        branch,
      },
    },
  };
};
