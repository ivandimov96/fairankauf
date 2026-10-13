# FairAnkauf

Website for buying used cars from private sellers in Germany: a German landing page with
a multi-step lead form. Every lead is saved to Postgres and sent to the owner's WhatsApp or Telegram.

Plan and architecture: [`docs/PLAN.md`](docs/PLAN.md). Conventions: [`CLAUDE.md`](CLAUDE.md).

## Local setup

Requirements: Node.js 22+, pnpm 10, PostgreSQL 16 (local install or Docker).

```bash
pnpm install
cp .env.example .env.local          # then adjust DATABASE_URL if needed

# Postgres via Docker (or use any local Postgres and create a "fairankauf" database)
docker run -d --name fairankauf-db -p 5432:5432 \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=fairankauf postgres:16

pnpm db:migrate                     # create tables
pnpm dev                            # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end test (Playwright, needs a running database) |
| `pnpm db:generate` | Create a migration after changing `src/lib/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` |
| `pnpm db:studio` | Browse the database |

## Environment variables

Every variable is documented in [`.env.example`](.env.example).

## Deployment and WhatsApp setup

Lead notifications (CallMeBot, Telegram and the official WhatsApp Cloud API): [`docs/whatsapp-setup.md`](docs/whatsapp-setup.md).

Go live on Vercel + Neon: [`docs/DEPLOY.md`](docs/DEPLOY.md).
