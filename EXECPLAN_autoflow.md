# EXECPLAN — AutoFlow (Grounded Plan)

## 1) Spec Critique (Grounded in This Codebase)

### What the spec gets wrong or leaves ambiguous
1. Workspace assumption is wrong: `/tmp/upwork-portfolio` is **not** a single git repo; it contains multiple standalone repos (`flowconnect`, `docuchat-ai`, `scrapepilot`). AutoFlow must be created as a new standalone project folder/repo.
2. Backend location is underspecified: spec says "Node.js/Express API server" but proposed file tree has no `backend/` folder. We need an explicit backend directory and API contract.
3. Execution model is underspecified: "sequential/parallel" is requested, but no branch semantics are defined for Condition nodes (true/false edge mapping, merge behavior, cycle handling).
4. Real-time logs are underspecified: no transport choice (polling/SSE/websocket). We need an explicit streaming mechanism.
5. Credential vault is underspecified: no encryption/key management guidance. For local SQLite portability, we can safely store masked/opaque values for demo with clear warning in README.
6. Schedule/Cron trigger is underspecified: no worker/runtime process model in spec. Need explicit background scheduler strategy.
7. Security gap: Transform node requests JavaScript expressions; naïve eval is unsafe. We need bounded execution and strict input constraints.
8. Error/empty/loading states are not defined for pages and APIs.
9. Test strategy is missing despite strict DoD requirements (`lint/typecheck/build/test`).
10. GitHub repo creation is requested but depends on external auth/permissions; local repo setup and remote wiring will be performed, push attempted if credentials exist.

### Reuse opportunities found
1. `flowconnect/` provides a strong baseline for:
   - Next.js 14 App Router + Tailwind setup
   - oklch token-driven dark theme styling
   - utility patterns (`cn`, dashboard card primitives)
   - SQLite-backed persistence patterns (currently Prisma)
2. Existing portfolio pattern favors self-contained app folders with their own `.git`, `README.md`, and `LICENSE`.
3. Existing code style: strict TypeScript, functional components, API validation and defensive route handlers.

### Additional edge cases the spec missed
1. Cycles in workflow graph (must detect and reject execution).
2. Disconnected nodes and orphan outputs.
3. Condition node with missing branches.
4. HTTP connector timeout/retry behavior.
5. Missing credentials at runtime (OpenAI/SMTP/Slack).
6. Concurrent workflow runs and log ordering.
7. Large payload previews (must truncate in UI/log DB).
8. Unknown node types in persisted workflows (migration compatibility).
9. Builder autosave conflicts / stale updates.
10. SSE disconnect/reconnect behavior for logs page.

## 2) Architecture Decision (Improved)

- Create new standalone project at `autoflow/`.
- Frontend: Next.js 14 App Router + Tailwind + React Flow.
- Backend: Express TypeScript server in `autoflow/backend/`.
- Database: SQLite via `better-sqlite3` with bootstrap SQL migrations.
- Realtime logs: Server-Sent Events (`/api/logs/stream`).
- Execution engine:
  - DAG traversal with branch routing
  - Condition node via constrained comparator DSL
  - Transform node via sandboxed `vm` execution with timeout
  - Delay node via async wait
  - Connector adapters with graceful fallback when credentials absent

## 3) Phase Plan

### Phase 0 — Scaffold + Contracts
- Status: ✅ Done (2026-02-11)
- Create `autoflow/` project, package scripts, lint/typecheck/test/build pipeline.
- Add shared workflow types and API response contracts.
- Add MIT license and initial README skeleton.
- Commit: `feat: scaffold autoflow project and contracts`

### Phase 1 — Backend Core (Express + SQLite + Seed)
- Status: ✅ Done (2026-02-11)
- Build Express server, DB init/migrations, seed connectors/workflows/logs/settings.
- Implement endpoints for workflows, logs, connectors, settings, and run trigger.
- Add SSE stream for realtime logs.
- Commit: `feat: implement backend api sqlite persistence and realtime logs`

### Phase 2 — Execution Engine + Connector Adapters
- Status: ✅ Done (2026-02-11)
- Implement engine graph traversal, condition branching, transform, delay.
- Implement connector modules (webhook/http/openai/email/slack/schedule mock-ready).
- Add robust error propagation and structured step logs.
- Add unit tests for engine and branch behavior.
- Commit: `feat: add workflow engine and connector execution modules`

### Phase 3 — Frontend App Shell + Core Pages
- Status: ⏳ In progress
- Implement App Router pages:
  - `/` workflow list
  - `/logs`
  - `/connectors`
  - `/settings`
- Implement reusable components (`WorkflowCard`, `ExecutionLog`, navigation shell).
- Hook to backend APIs with loading/error/empty states.
- Commit: `feat: build workflow list logs connectors and settings pages`

### Phase 4 — Visual Builder (React Flow)
- Implement `/builder/[id]` with animated canvas, custom nodes, edge styles, add/connect/configure flows.
- Build `Canvas`, `NodeConfigPanel`, and custom node components.
- Persist workflow graph edits to backend.
- Add run-now interaction and live status feedback.
- Commit: `feat: ship visual workflow builder with configurable nodes`

### Phase 5 — Hardening + Self Review + Break-it
- Security pass (input validation, transform sandbox, payload limits, CORS defaults).
- Break-it scenarios (invalid configs, nulls, race/concurrency, bad filters, malformed graph).
- Fix all discovered defects immediately.
- Commit: `fix: harden autoflow execution and edge case handling`

### Phase 6 — Test + Visual Verification + Docs
- Run and pass: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:run`.
- Visual verification with `agent-browser` CLI across all affected pages and flows.
- Save screenshots to `autoflow/tmp/`.
- Final README update with architecture diagram and setup.
- Update this EXECPLAN with completed timestamps.
- Commit: `docs: finalize readme verification evidence and execution plan status`

## 4) Verification Matrix

- Static checks: lint/typecheck/build must all pass with zero warnings/errors.
- Unit tests: engine traversal, condition branching, transform safety, API validation.
- Integration checks: create/save workflow, execute run, log appears in stream and logs list.
- Visual checks: desktop + mobile for all pages, builder interactions, node config drawer.

## 5) Completion Checklist (will be marked true only when verified)

- [ ] EXECPLAN exists and all phases marked done
- [ ] `pnpm lint` zero warnings
- [ ] `pnpm typecheck` zero errors
- [ ] `pnpm build` succeeds
- [ ] `pnpm test:run` all pass
- [ ] Break-it defects fixed
- [ ] Visual verification complete with screenshots in `autoflow/tmp/`
- [ ] New code covered by tests
- [ ] No TODO/FIXME in new code
- [ ] PR quality bar met without hesitation
