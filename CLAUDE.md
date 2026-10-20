# CLAUDE.md

Car-buying lead app for **FairAnkauf**, a solo founder's used-car buying business in Germany. Public German landing page + multi-step lead form. A lead reaches Ivan by email (SMTP through his own mailbox, nodemailer) and by WhatsApp (Meta WhatsApp Business Platform, an approved template with one parameter per line); both are configured only through environment variables (`lib/notifications/config.ts`, setup in `docs/DEPLOY.md`), and without any configuration `sendLeadNotification()` just logs the lead. Earlier channels he rejected: CallMeBot (unreliable), Resend and other third-party mail services. Ask him before adding another channel. **There is no database, no admin website, no photos, no pipeline or profit tracking** (Ivan's decisions, 2026-10-13); don't add them back unless he asks. Concept similar to wirkaufendeinauto.de, but **never copy their name, logo, colors, wording, images or layout**. Full plan: `docs/PLAN.md`. Next.js 16 differs from older versions: read the bundled docs in `node_modules/next/dist/docs/` before using an API (see `AGENTS.md`).

## Working agreement

- Work in phases (0–8). End of each phase: `pnpm typecheck && pnpm lint && pnpm test`, run the app and check the feature in a browser, commit, short summary, then **wait for Ivan's "go"**.
- Simple over clever. Fewest dependencies. No features Ivan did not ask for.
- If something in the spec seems wrong, say so and propose an alternative. Never guess silently.
- Ask before pushing, merging or opening a PR.

## Stack

Next.js 16 (App Router, Server Actions, TS strict) · Tailwind + shadcn/ui · Zod (shared client/server) · react-hook-form · Vitest + Playwright · pnpm · Vercel (`fra1`).

## Commands

```
pnpm dev            # local dev server
pnpm build
pnpm lint
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest run
pnpm test:e2e       # playwright (builds + starts on :3100; in cloud sandboxes set PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium)
```

## Conventions

- **Language:** all user-facing text German. Page copy lives in the page, option labels in `src/lib/options.ts`, validation messages in the Zod schemas. Code, comments, commits in English.
- **Money:** integer cents everywhere (`*Cents` fields). Format only at the edge via `lib/money.ts` (`de-DE`, EUR).
- **Dates:** store UTC (`timestamptz`).
- **Phones:** store E.164 (`+49…`). Parse with libphonenumber-js, default country DE, international accepted.
- **Validation:** one Zod schema per form in `lib/validation/`, used by react-hook-form and re-parsed in the Server Action. Never trust client input.
- **Security:** no secrets in client code or the repo; env access is Zod-validated where it is read (`lib/notifications/config.ts`). Server-only modules import `server-only`.
- **Lead submit order:** spam checks → validate → `sendLeadNotification()`. Nothing is stored: a lead counts as delivered when at least one channel got it; if none did, the full lead is logged and the action throws, so the seller sees "try again" with entries kept. The lead text (`formatLeadMessage()`, email) and the template parameters (`formatTemplateParams()`, WhatsApp) must carry every field the seller entered.
- **Notifications:** `lib/notifications/index.ts` dispatches to `email.ts` and `whatsapp.ts`; `config.ts` Zod-validates the env per channel (off / on / invalid, never echoing values); `format.ts` holds `LeadSummary` and the pure, unit-tested formatters. WhatsApp template parameters may not contain line breaks, tabs or 4+ spaces and may not be empty.
- **GDPR:** no tracking cookies; the site stores no lead data.
- **UI:** mobile-first, min 44px touch targets, visible focus states, labels on every input.

## Architecture notes

- `next.config.ts` has `cacheComponents: true`: uncached data access (headers, cookies) in a page must sit inside `<Suspense>` or the build fails. Read `node_modules/next/dist/docs/01-app/02-guides/` before using caching APIs.
- Shell gotcha: `pkill -f next` also matches the agent's own shell; use `pkill -f "[n]ext-server"`.
- shadcn components live in `src/components/ui/`. If the shadcn CLI can't reach ui.shadcn.com (some sandboxes block it), copy the component source in by hand, keeping `components.json` conventions.

- Rate limiting: in-memory per serverless instance (best effort, 5/hour per IP).

## Environment

See `.env.example` (every variable documented there).
