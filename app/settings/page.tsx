"use client";

import { useState } from "react";
import { Bell, Key, Mail, Save, Server, Slack, Zap } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    openaiApiKey: "",
    smtpHost: "smtp.sendgrid.net",
    smtpUser: "apikey",
    smtpPassword: "",
    slackWebhookUrl: "",
    executionConcurrency: 4,
    runAlerts: true,
  });

  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="mx-auto max-w-[800px] space-y-6 px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage connector credentials and execution preferences
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSave}>
        {/* AI Section */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--stroke-1)] bg-[var(--surface-2)] px-5 py-3">
            <Zap className="h-4 w-4 text-[var(--text-subtle)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI Provider</h2>
          </div>
          <div className="space-y-4 p-5">
            <label className="field-label">
              OpenAI API Key
              <input
                className="field-input"
                type="password"
                placeholder="sk-..."
                value={settings.openaiApiKey}
                onChange={(e) => setSettings((s) => ({ ...s, openaiApiKey: e.target.value }))}
              />
            </label>
            <p className="text-xs text-[var(--text-subtle)]">
              Used by the OpenAI connector for text completions and analysis.
            </p>
          </div>
        </div>

        {/* Slack Section */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--stroke-1)] bg-[var(--surface-2)] px-5 py-3">
            <Slack className="h-4 w-4 text-[var(--text-subtle)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Slack</h2>
          </div>
          <div className="space-y-4 p-5">
            <label className="field-label">
              Webhook URL
              <input
                className="field-input"
                type="password"
                placeholder="https://hooks.slack.com/services/..."
                value={settings.slackWebhookUrl}
                onChange={(e) => setSettings((s) => ({ ...s, slackWebhookUrl: e.target.value }))}
              />
            </label>
          </div>
        </div>

        {/* Email Section */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--stroke-1)] bg-[var(--surface-2)] px-5 py-3">
            <Mail className="h-4 w-4 text-[var(--text-subtle)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Email (SMTP)</h2>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="field-label">
              SMTP Host
              <input
                className="field-input"
                value={settings.smtpHost}
                onChange={(e) => setSettings((s) => ({ ...s, smtpHost: e.target.value }))}
              />
            </label>
            <label className="field-label">
              SMTP User
              <input
                className="field-input"
                value={settings.smtpUser}
                onChange={(e) => setSettings((s) => ({ ...s, smtpUser: e.target.value }))}
              />
            </label>
            <label className="field-label sm:col-span-2">
              SMTP Password
              <input
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={settings.smtpPassword}
                onChange={(e) => setSettings((s) => ({ ...s, smtpPassword: e.target.value }))}
              />
            </label>
          </div>
        </div>

        {/* Execution Section */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--stroke-1)] bg-[var(--surface-2)] px-5 py-3">
            <Server className="h-4 w-4 text-[var(--text-subtle)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Execution</h2>
          </div>
          <div className="space-y-4 p-5">
            <label className="field-label">
              Concurrency Limit
              <input
                className="field-input w-24"
                type="number"
                min={1}
                max={20}
                value={settings.executionConcurrency}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    executionConcurrency: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
            <label className="field-toggle">
              <input
                type="checkbox"
                checked={settings.runAlerts}
                onChange={(e) => setSettings((s) => ({ ...s, runAlerts: e.target.checked }))}
              />
              <span>
                <strong>Failure alerts</strong>
                <small>Send notifications when workflow executions fail.</small>
              </span>
            </label>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button type="submit" className="action-btn">
            <Save className="h-4 w-4" />
            Save settings
          </button>
          {savedAt && (
            <span className="text-xs text-[var(--text-subtle)]">Saved at {savedAt}</span>
          )}
        </div>
      </form>
    </div>
  );
}
