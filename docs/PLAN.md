# Plan: FairAnkauf lead site (v1)

Updated 2026-10-13 after Ivan's scope decisions:

- **No photos.** Sellers don't upload photos, so there is no file storage.
- **No admin website.** That drops the admin login, lead inbox, status pipeline, notes,
  deal calculator, profit tracking, dashboard and CSV export from the original spec.
- **No database.** Leads go only to WhatsApp (or Telegram). If sending fails, the seller is
  asked to try again, so a lead is never lost silently.

## 1. Architecture

One Next.js 16 app (App Router, Server Actions, TypeScript strict) on Vercel, region `fra1`.

```
Seller's phone
   │ 4-step form (react-hook-form + Zod), draft kept in localStorage
   ▼
Server Action submitLead
   1. spam checks (honeypot, optional Turnstile, 5 leads/hour per IP in memory)
   2. Zod parse (same schema as the client)
   3. send the full lead to WhatsApp/Telegram (3 tries)
      → ok: thank-you page · failed: "please try again", form entries kept
```

- **Notifications** sit behind `NotificationProvider`, chosen by `NOTIFICATION_PROVIDER`:
  `console` (dev/tests), `callmebot` (start), `telegram` (if CallMeBot fails), `whatsapp_cloud` (official Meta API, template
  `new_car_lead`). Text comes from pure, unit-tested formatters and includes every field the seller entered. Setup: `docs/whatsapp-setup.md`.
- **Rate limiting** is an in-memory counter per serverless instance: best effort, resets on
  cold start. The honeypot and optional Turnstile catch bots.
- **German only.** Copy lives in the pages, option labels in `src/lib/options.ts`.

## 2. Folder structure

```
src/
  app/(public)/            landing, verkaufen/ (+ danke/), impressum/, datenschutz/
  components/ui/           shadcn
  components/form/         wizard, brand picker, choice buttons
  components/site/         logo, footer
  lib/validation/lead.ts   shared Zod schema
  lib/notifications/       providers, formatter, config, sendLeadNotification
  lib/rate-limit.ts, money.ts, phone.ts, options.ts
  server/actions/          submitLead
tests/unit, tests/e2e
```

## 3. Data

No database. A lead exists only as the message in WhatsApp/Telegram (and in the seller's
browser as a draft until it is sent). Money is integer cents internally.

## 4. Testing

- Vitest: Zod schema, message formatters, providers (mocked fetch), notification config.
- Vitest: the submit action (success, send failure → "try again", honeypot, rate limit).
- Playwright: one happy path on a phone viewport (fill form → console notification → thank-you page).

## 5. Risks

1. **WhatsApp is the only record.** No database means no backup and no daily re-send: if a
   message fails, the seller is asked to retry, but a seller who gives up is gone. Don't
   delete the chat.
2. **CallMeBot is unofficial**, free and rate-limited, with no SLA. Move to the Cloud API when leads flow.
3. **WhatsApp Cloud API needs its own sender number** (not your personal WhatsApp number) and an
   approved template; each message has a small Meta fee.
4. **GDPR:** the site stores no lead data; deletion requests are handled by deleting the
   WhatsApp/Telegram messages. The Datenschutzerklärung must say so and name the providers.
5. **Impressum/Datenschutz** placeholders must be replaced with real legal text before launch.
6. **Accounts needed before deploy:** Vercel and CallMeBot (or Telegram). Cloudflare only for optional Turnstile.

## 6. Phases

| Phase | Status |
|---|---|
| 0 Plan | done |
| 1 Setup | done |
| 2 Landing page + lead form | done |
| 3 WhatsApp notification | done |
| 4 Photos | dropped |
| 5 Admin area | dropped |
| 6 Deals, profit, dashboard, CSV | dropped |
| 7 Hardening: Turnstile (optional), rate limiting, honeypot, SEO, error pages, mobile review | done (Lighthouse mobile: 96–98 performance, 100 a11y/SEO/best practices) |
| 8 Deployment guide (Vercel, CallMeBot/Telegram) | done: docs/DEPLOY.md |
| Database | removed 2026-10-13 (Ivan: WhatsApp only) |
