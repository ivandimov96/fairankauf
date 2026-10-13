# Plan: FairAnkauf lead site (v1)

Updated 2026-10-13 after Ivan's scope decisions:

- **No photos.** Sellers don't upload photos, so there is no file storage.
- **No admin website.** Leads reach Ivan only by WhatsApp. That drops the admin login,
  lead inbox, status pipeline, notes, deal calculator, profit tracking, dashboard and CSV
  export from the original spec. Leads are still saved in Postgres so a failed WhatsApp
  message never loses a lead.

## 1. Architecture

One Next.js 16 app (App Router, Server Actions, TypeScript strict) on Vercel, region `fra1`.

```
Seller's phone
   │ 4-step form (react-hook-form + Zod), draft kept in localStorage
   ▼
Server Action submitLead
   1. spam checks (honeypot, optional Turnstile, 5 leads/hour per IP)
   2. Zod parse (same schema as the client)
   3. INSERT lead (notificationStatus = PENDING)
   4. send WhatsApp (3 tries) → SENT / FAILED + error text
   ▼
Postgres (Neon, Frankfurt) via Drizzle
   ▲
Vercel Cron, daily 07:00 UTC → /api/cron/retry-notifications re-sends FAILED leads
```

- **Notifications** sit behind `NotificationProvider`, chosen by `NOTIFICATION_PROVIDER`:
  `console` (dev/tests), `callmebot` (start), `telegram` (if CallMeBot fails), `whatsapp_cloud` (official Meta API, template
  `new_car_lead`). Text comes from pure, unit-tested formatters. Setup: `docs/whatsapp-setup.md`.
- **Rate limiting** uses a Postgres `rate_limits` table (hashed IP + action), because
  in-memory counters don't work across serverless instances.
- **German only.** Copy lives in the pages, option labels in `src/lib/options.ts`.

## 2. Folder structure

```
src/
  app/(public)/            landing, verkaufen/ (+ danke/), impressum/, datenschutz/
  app/api/cron/            retry-notifications
  components/ui/           shadcn
  components/form/         wizard, brand picker, choice buttons
  components/site/         logo, footer
  lib/db/                  Drizzle schema + client
  lib/validation/lead.ts   shared Zod schema
  lib/notifications/       providers, formatter, config, notifyNewLead
  lib/rate-limit.ts, env.ts, money.ts, phone.ts, options.ts
  server/actions/          submitLead
drizzle/                   migrations
tests/unit, tests/e2e
```

## 3. Data model

| table | columns |
|---|---|
| `leads` | id, car fields (brand, model, firstRegYear/Month, mileageKm, fuel, gearbox, powerKw, bodyType), condition fields (condition, accident, drivable, huDueYear/Month, serviceBook, previousOwners, defects), desiredPriceCents, plz, city, name, phone (E.164), email, contactMethod, consentAt, notificationStatus, notificationError, createdAt, updatedAt |
| `rate_limits` | key, windowStart, count |

Money is integer cents, timestamps are UTC (`timestamptz`).

## 4. Testing

- Vitest: Zod schema, message formatters, providers (mocked fetch), notification config.
- Playwright: one happy path on a phone viewport (fill form → lead saved → console notification sent).

## 5. Risks

1. **WhatsApp is the only inbox.** If a message is lost you won't notice from the site. Mitigated by
   save-first, 3 tries, the daily retry job, and leads always being in the Neon console.
2. **CallMeBot is unofficial**, free and rate-limited, with no SLA. Move to the Cloud API when leads flow.
3. **WhatsApp Cloud API needs its own sender number** (not your personal WhatsApp number) and an
   approved template; each message has a small Meta fee.
4. **GDPR without an admin area:** deletion requests are handled in the Neon console (delete the
   row). The Datenschutzerklärung must say so and name the providers.
5. **Impressum/Datenschutz** placeholders must be replaced with real legal text before launch.
6. **Accounts needed before deploy:** Vercel, Neon, Cloudflare (Turnstile), CallMeBot activation.

## 6. Phases

| Phase | Status |
|---|---|
| 0 Plan | done |
| 1 Setup | done |
| 2 Landing page + lead form | done |
| 3 WhatsApp notification | done |
| 4 Photos | dropped |
| 5 Admin area | dropped; replaced by retries + daily retry job |
| 6 Deals, profit, dashboard, CSV | dropped |
| 7 Hardening: Turnstile (optional), rate limiting, honeypot, SEO, error pages, mobile review | done (Lighthouse mobile: 96–98 performance, 100 a11y/SEO/best practices) |
| 8 Deployment guide (Vercel, Neon, CallMeBot) | done: docs/DEPLOY.md |
