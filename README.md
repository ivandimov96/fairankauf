# FairAnkauf

Website for buying used cars from private sellers in Germany: a German landing page with
a multi-step lead form. Every lead is sent to the owner's WhatsApp (or Telegram). There is no database.

Plan and architecture: [`docs/PLAN.md`](docs/PLAN.md). Conventions: [`CLAUDE.md`](CLAUDE.md).

## Local setup

Requirements: Node.js 22+, pnpm 10.

```bash
pnpm install
cp .env.example .env.local          # console provider: leads are printed in the terminal
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
| `pnpm test:e2e` | End-to-end test (Playwright) |

## Environment variables

Every variable is documented in [`.env.example`](.env.example).

## Deployment and WhatsApp setup

Lead notifications (CallMeBot, Telegram and the official WhatsApp Cloud API): [`docs/whatsapp-setup.md`](docs/whatsapp-setup.md).

Go live on Vercel: [`docs/DEPLOY.md`](docs/DEPLOY.md).
