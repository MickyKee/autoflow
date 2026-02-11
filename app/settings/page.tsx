"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { fetchSettings, updateSettings } from "@/lib/api";
import type { AppSettingsView } from "@/lib/types";

const initialState: AppSettingsView = {
  openaiApiKey: "",
  smtpHost: "",
  smtpUser: "",
  smtpPassword: "",
  slackWebhookUrl: "",
  executionConcurrency: 4,
  runAlerts: true,
  hasOpenaiApiKey: false,
  hasSmtpPassword: false,
  hasSlackWebhookUrl: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettingsView>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    void fetchSettings()
      .then((response) => {
        setSettings(response.settings);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load settings.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await updateSettings({
        openaiApiKey: settings.openaiApiKey,
        smtpHost: settings.smtpHost,
        smtpUser: settings.smtpUser,
        smtpPassword: settings.smtpPassword,
        slackWebhookUrl: settings.slackWebhookUrl,
        executionConcurrency: settings.executionConcurrency,
        runAlerts: settings.runAlerts,
      });

      setSettings(response.settings);
      setSavedAt(new Date().toISOString());
      setError(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <header className="hero-panel">
        <div>
          <p className="hero-kicker">Runtime Configuration</p>
          <h2 className="hero-title">Secure connector credentials and execution preferences.</h2>
          <p className="hero-description">
            Secrets are masked on read. Providing a new value replaces the stored secret.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="card flex items-center justify-center gap-3 p-10 text-sm text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading settings...
        </div>
      ) : (
        <form className="card grid gap-4 p-5 md:grid-cols-2" onSubmit={handleSave}>
          <label className="field-label">
            OpenAI API key
            <input
              className="field-input"
              type="password"
              placeholder={settings.hasOpenaiApiKey ? "••••••••" : "sk-..."}
              value={settings.openaiApiKey}
              onChange={(event) => setSettings((current) => ({ ...current, openaiApiKey: event.target.value }))}
            />
          </label>

          <label className="field-label">
            Slack webhook URL
            <input
              className="field-input"
              type="password"
              placeholder={settings.hasSlackWebhookUrl ? "••••••••" : "https://hooks.slack.com/..."}
              value={settings.slackWebhookUrl}
              onChange={(event) => setSettings((current) => ({ ...current, slackWebhookUrl: event.target.value }))}
            />
          </label>

          <label className="field-label">
            SMTP host
            <input
              className="field-input"
              value={settings.smtpHost}
              onChange={(event) => setSettings((current) => ({ ...current, smtpHost: event.target.value }))}
            />
          </label>

          <label className="field-label">
            SMTP user
            <input
              className="field-input"
              value={settings.smtpUser}
              onChange={(event) => setSettings((current) => ({ ...current, smtpUser: event.target.value }))}
            />
          </label>

          <label className="field-label">
            SMTP password
            <input
              className="field-input"
              type="password"
              placeholder={settings.hasSmtpPassword ? "••••••••" : "password"}
              value={settings.smtpPassword}
              onChange={(event) => setSettings((current) => ({ ...current, smtpPassword: event.target.value }))}
            />
          </label>

          <label className="field-label">
            Execution concurrency
            <input
              className="field-input"
              type="number"
              min={1}
              max={20}
              value={settings.executionConcurrency}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  executionConcurrency: Number(event.target.value) || 1,
                }))
              }
            />
          </label>

          <label className="field-toggle md:col-span-2">
            <input
              type="checkbox"
              checked={settings.runAlerts}
              onChange={(event) => setSettings((current) => ({ ...current, runAlerts: event.target.checked }))}
            />
            <span>
              <strong>Run notifications</strong>
              <small>Send notifications when workflow executions fail.</small>
            </span>
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button type="submit" className="action-btn" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save settings"}
            </button>
            {savedAt ? (
              <p className="text-xs text-[var(--text-subtle)]">Saved {new Date(savedAt).toLocaleTimeString()}</p>
            ) : null}
            {error ? <p className="text-xs text-[oklch(0.8_0.15_32)]">{error}</p> : null}
          </div>
        </form>
      )}
    </section>
  );
}
