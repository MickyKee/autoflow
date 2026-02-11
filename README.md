# AutoFlow

AutoFlow is a visual workflow automation builder with a React Flow canvas, connector-based execution engine, realtime logs, and settings management.

## Status

Project scaffolding is complete. See `EXECPLAN_autoflow.md` for phased delivery.

## Stack

- Next.js 14 (App Router) + Tailwind CSS
- Express API server
- SQLite (planned in backend phases)
- React Flow for workflow graph editing

## Development

```bash
pnpm install
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/health

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test:run
```

## License

MIT
