# ⚡ AutoFlow

Visual workflow automation builder — design, connect, and execute multi-step automations with a drag-and-drop canvas.

![AutoFlow Dashboard](./screenshot.png)

## Features

- **Visual workflow canvas** with custom node types: Trigger, Action, Condition (branching), Transform, Output/Delay
- **8 built-in connectors**: Webhook, Schedule/Cron, HTTP Request, OpenAI, Email (SMTP), Slack, Condition, Transform
- **Real-time execution logs** via Server-Sent Events — watch workflows run step by step
- **SQLite persistence** for workflows, logs, connector metadata, and settings
- **Multi-page dashboard**: Workflow list, visual builder, execution logs, connectors, settings
- **Typed API contracts** + Zod request validation

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-14-111111?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss&logoColor=white)
![React Flow](https://img.shields.io/badge/React_Flow-Canvas-ff0072)
![SQLite](https://img.shields.io/badge/SQLite-Database-003b57?logo=sqlite)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express)

## Architecture

```
[Next.js App Router UI]
          |
          | REST + SSE (/api/logs/stream)
          v
[Express API Server]
  |            |
  v            v
[SQLite]   [Workflow Engine]
               |
               v
        [Connector Adapters]
               |
               v
  [External APIs: OpenAI, SMTP, Slack, HTTP]
```

## Project Structure

```
autoflow/
├── app/                         # Next.js pages
│   ├── page.tsx                 # Workflow list + stats
│   ├── builder/[id]/page.tsx    # Visual drag-and-drop builder
│   ├── logs/page.tsx            # Execution logs
│   ├── connectors/page.tsx      # Connector library
│   └── settings/page.tsx        # Runtime settings
├── backend/src/                 # API server
│   ├── index.ts                 # Express server
│   ├── repository.ts            # SQLite data layer
│   └── schemas.ts               # Zod validation
├── components/                  # React components
│   ├── Canvas.tsx               # React Flow canvas
│   └── nodes/                   # Custom node types
└── lib/
    ├── engine.ts                # Workflow executor
    └── connectors/              # Connector implementations
```

## Quick Start

```bash
pnpm install
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Health: http://localhost:4000/health

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` — API URL (default: `http://localhost:4000`)
- `API_PORT` — API port (default: `4000`)
- `DATABASE_URL` — SQLite path (default: `backend/data/autoflow.db`)

## License

MIT
