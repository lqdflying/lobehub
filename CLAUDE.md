# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript — hybrid Next.js app router + SPA via `react-router-dom`
- **UI**: `@lobehub/ui`, Ant Design, `antd-style` (CSS-in-JS via `createStyles`)
- **State**: Zustand stores + SWR for server data fetching
- **Backend**: tRPC (type-safe API), Next.js API routes
- **Database**: PostgreSQL + PGLite (client-side), Drizzle ORM
- **Testing**: Vitest + Testing Library (unit), Playwright + Cucumber (e2e)
- **Monorepo**: pnpm workspaces; `bun` to run scripts, `bunx` for executables

## Commands

```bash
# Development
bun run dev                  # Start dev server on :3010
bun run dev:desktop          # Desktop (Electron) renderer on :3015

# Build
bun run build                # Production build
bun run build:docker         # Docker build

# Testing — NEVER run `bun run test` (runs all tests, ~10 min)
bunx vitest run --silent='passed-only' '[file-path]'
cd packages/database && bunx vitest run --silent='passed-only' '[file]'

# Type checking
bun run type-check            # Uses tsgo (fast)
bun run type-check:tsc        # Uses tsc (strict)

# Linting
bun run lint                  # ts + style + type-check + circular deps
bun run lint:ts               # ESLint only
bun run lint:style            # Stylelint only

# Database
bun run db:generate           # Generate Drizzle migrations
bun run db:migrate            # Run migrations
bun run db:studio             # Open Drizzle Studio
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (backend)/        # Server-only routes (API, tRPC endpoints)
│   └── [variants]/       # Client SPA entry points
├── features/             # Large self-contained UI feature areas
│   └── Conversation/     # Core chat UI
├── store/                # Zustand stores (one per domain)
│   ├── chat/             # Messages, streaming, tools
│   ├── session/          # Sessions/agents
│   ├── agent/            # Agent config
│   └── ...
├── services/             # Client-side service layer (calls tRPC/API)
├── server/
│   ├── routers/          # tRPC routers
│   │   ├── lambda/       # Synchronous routes
│   │   ├── async/        # Async/streaming routes
│   │   └── tools/        # Tool call routes
│   └── services/         # Server-side service implementations
├── locales/default/      # i18n source of truth (TypeScript)
└── libs/                 # Shared utilities and abstractions

packages/
├── database/             # Drizzle schemas, models, repositories (@lobechat/database)
├── agent-runtime/        # LLM provider adapters
├── model-runtime/        # Model definitions and capabilities
└── ...                   # Other shared packages
```

## Architecture Patterns

### Store Structure
Every Zustand store follows a consistent layout:
```
store/<domain>/
├── store.ts          # createWithEqualityFn, merges slices
├── initialState.ts   # Full state type + default values
├── selectors.ts      # Derived state selectors
└── slices/           # Action groups (each slice = one concern)
```
Prefer `vi.spyOn` over `vi.mock` when testing stores.

### Data Flow
`Component → useChatStore action → service (src/services/) → tRPC router → server service → DB`

### tRPC Router Locations
- `src/server/routers/lambda/` — standard request/response
- `src/server/routers/async/` — long-running / queued operations
- `src/server/routers/tools/` — agent tool calls

### Path Alias
`@/` resolves to `src/`. In tests, also: `@/database` → `packages/database/src`.

### CSS-in-JS
Use `createStyles` from `antd-style`. Avoid inline styles or plain CSS modules.

## Git Workflow

- Commit messages must be prefixed with a gitmoji
- Branch format: `<type>/<feature-name>`
- Use `git pull --rebase`
- PR titles with `✨ feat/` or `🐛 fix` trigger automated releases

## i18n

- Add new keys to `src/locales/default/<namespace>.ts` (TypeScript source of truth)
- For dev preview only: also add to `locales/zh-CN/` and `locales/en-US/`
- **Never run `pnpm i18n`** — CI handles all other locales automatically

## Testing Notes

- Wrap file paths in single quotes: `'src/store/chat/**'`
- After 2 failed fix attempts on a test, stop and ask for help
- Run `bun run type-check` after code changes — tests must also pass type checking
