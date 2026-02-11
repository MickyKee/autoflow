import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const DEFAULT_DB_PATH = path.join(process.cwd(), "backend", "data", "autoflow.db");

function resolveSqlitePath(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return DEFAULT_DB_PATH;
  }

  if (databaseUrl.startsWith("file:")) {
    return databaseUrl.slice(5);
  }

  return databaseUrl;
}

const sqlitePath = resolveSqlitePath(process.env.DATABASE_URL);
fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });

export const db = new Database(sqlitePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'error')),
      execution_count INTEGER NOT NULL DEFAULT 0,
      last_run_at TEXT,
      graph_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workflow_logs (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      workflow_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success', 'fail', 'running')),
      trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'webhook', 'schedule')),
      started_at TEXT NOT NULL,
      ended_at TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      steps_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow_id ON workflow_logs(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_workflow_logs_created_at ON workflow_logs(created_at DESC);

    CREATE TABLE IF NOT EXISTS connectors (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      accent TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      openai_api_key TEXT NOT NULL,
      smtp_host TEXT NOT NULL,
      smtp_user TEXT NOT NULL,
      smtp_password TEXT NOT NULL,
      slack_webhook_url TEXT NOT NULL,
      execution_concurrency INTEGER NOT NULL,
      run_alerts INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}
