import { EventEmitter } from "node:events";

import type { WorkflowExecutionLog } from "../../lib/types";

const emitter = new EventEmitter();
const LOG_EVENT = "execution_log";

export function publishLog(log: WorkflowExecutionLog) {
  emitter.emit(LOG_EVENT, log);
}

export function subscribeLogs(callback: (log: WorkflowExecutionLog) => void) {
  emitter.on(LOG_EVENT, callback);
  return () => {
    emitter.off(LOG_EVENT, callback);
  };
}
