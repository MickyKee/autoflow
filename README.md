# AutoFlow

AutoFlow is a visual workflow automation builder built as a portfolio-grade "mini Zapier/n8n" app. It includes a neon-themed React Flow canvas, a SQLite-backed execution API, realtime execution logs, and configurable connector settings.

## Highlights

- Visual workflow canvas with custom node types:
  - Trigger
  - Action
  - Condition (true/false branches)
  - Transform
  - Output/Delay
- Connectors:
  - Webhook
  - Schedule/Cron
  - HTTP Request
  - OpenAI
  - Email (SMTP)
  - Slack
  - Condition
  - Transform
  - Delay
- Realtime log streaming via Server-Sent Events (`/api/logs/stream`)
- SQLite persistence for workflows, logs, connector metadata, and settings
- Typed API contracts + strict request validation

## Architecture

```mermaid
flowchart LR
  UI[Next.js App Router UI] -->|REST| API[Express API]
  UI -->|SSE /api/logs/stream| API
  API --> ENGINE[Workflow Engine]
  ENGINE --> CONNECTORS[Connector Adapters]
  API --> DB[(SQLite)]
  CONNECTORS --> EXT[External APIs\n(OpenAI/SMTP/Slack/HTTP)]
```

## Project Structure

```txt
autoflow/
├── app/
│   ├── page.tsx                 # Workflow list
│   ├── builder/[id]/page.tsx    # Visual builder
│   ├── logs/page.tsx            # Execution logs
│   ├── connectors/page.tsx      # Connector library
│   └── settings/page.tsx        # Runtime settings / secrets
├── backend/src/
│   ├── index.ts                 # API server
│   ├── repository.ts            # SQLite data layer
│   ├── graph-validation.ts      # Graph hardening rules
│   └── schemas.ts               # Zod request validation
├── components/
│   ├── Canvas.tsx
│   ├── NodeConfigPanel.tsx
│   └── nodes/                   # React Flow custom nodes
├── lib/
│   ├── engine.ts                # Workflow executor
│   ├── connectors/              # Connector implementations
│   └── store.ts                 # Builder state management
└── tests/
    ├── workflows-api.test.ts
    ├── settings-api.test.ts
    ├── engine.test.ts
    └── builder-store.test.ts
```

## Local Setup

```bash
pnpm install
pnpm dev
```

Services:

- Frontend: `http://localhost:3000` (or next available port)
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health`

Optional environment variables:

- `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:4000`)
- `API_PORT` (defaults to `4000`)
- `DATABASE_URL` (SQLite path; defaults to `backend/data/autoflow.db`)

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:run
```

## Visual Verification Evidence

Screenshots captured with `agent-browser` are saved under `tmp/` (gitignored), including:

- `tmp/verify-home.png`
- `tmp/verify-home-run.png`
- `tmp/verify-connectors.png`
- `tmp/verify-logs-expanded.png`
- `tmp/verify-settings-save.png`
- `tmp/verify-builder-initial.png`
- `tmp/verify-builder-selected-panel.png`
- `tmp/verify-builder-saved.png`
- `tmp/verify-builder-ran.png`
- `tmp/verify-home-mobile.png`
- `tmp/verify-builder-mobile.png`

## Notes

- Secrets are masked on read in settings responses.
- This project is designed for local/portfolio use; production secret encryption and distributed execution workers are out of scope for this version.

## License

MIT
