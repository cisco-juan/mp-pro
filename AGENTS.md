<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## Cursor Cloud specific instructions

### Services overview

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| PostgreSQL | `docker compose up -d` | 5432 | Credentials: mp_pro/mp_pro/mp_pro |
| NestJS API | `npm run dev:api` | 3000 | Depends on DB being up + migrations |
| Next.js Dashboard | `npm run dev:dashboard` | 3001* | *Uses 3001 when API occupies 3000 |

### Startup sequence

1. Ensure Docker daemon is running (`sudo dockerd` if not already up)
2. `docker compose up -d` (PostgreSQL)
3. `npx nx run database:prisma-generate` (only needed after schema changes)
4. `npm run dev:api` then `npm run dev:dashboard`

### Gotchas

- A stale `pnpm-lock.yaml` may appear in the repo. If Nx fails with "Failed to parse pnpm lockfile" or `.modules.yaml` errors, delete `pnpm-lock.yaml` — the project uses npm (see `package-lock.json`).
- The `database` library uses `rootDir: "."` in its tsconfig because Prisma 7 generates `.ts` files that must be compiled. The build target creates a forwarding `dist/index.js` barrel so the `@nx/js:node` serve executor can resolve the package at runtime.
- The API e2e tests (`api-e2e`) require `ts-node` for Jest config parsing, which may not be installed. Core lint/typecheck/build verification: `npm run verify`.
- The Docker daemon must be started manually in Cloud Agent VMs: `sudo dockerd &>/tmp/dockerd.log &` — wait a few seconds, then `sudo chmod 666 /var/run/docker.sock` for non-root access.
- Environment variables: copy `.env.example` → `.env` at root and `libs/database/.env.example` → `libs/database/.env`. Both need `DATABASE_URL=postgresql://mp_pro:mp_pro@localhost:5432/mp_pro`.
