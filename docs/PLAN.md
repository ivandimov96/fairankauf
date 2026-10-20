# Plan: FairAnkauf lead site (v1)

Updated 2026-10-13 after Ivan's scope decisions:

- **No photos.** Sellers don't upload photos, so there is no file storage.
- **No admin website.** That drops the admin login, lead inbox, status pipeline, notes,
  deal calculator, profit tracking, dashboard and CSV export from the original spec.
- **No database.** Leads reach Ivan by email (SMTP through his own mailbox) and WhatsApp
  (Meta Cloud API template) since 2026-10-20; before that every channel had been removed
  on 2026-10-14 to start over. Without configuration, leads
  are only logged.

## 1. Architecture

One Next.js 16 app (App Router, Server Actions, TypeScript strict) on Vercel, region `fra1`.

```
Seller's phone
   │ 4-step form (react-hook-form + Zod), draft kept in localStorage
   ▼
Server Action submitLead
   1. spam checks (honeypot, optional Turnstile, 5 leads/hour per IP in memory)
   2. Zod parse (same schema as the client)
   3. sendLeadNotification(lead): email + WhatsApp to every configured channel; logs only when none is configured
      → ok: thank-you page · throws: "please try again", entries kept
```

- **Notifications:** `sendLeadNotification()` in `lib/notifications/` is the one place to plug the
  next channel in. Text comes from a pure, unit-tested formatter and includes every field the seller entered.
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

No database. A lead exists only as the notification message (and in the seller's
browser as a draft until it is sent). Money is integer cents internally.

## 4. Testing

- Vitest: Zod schema, message formatters, providers (mocked fetch), notification config.
- Vitest: the submit action (success, send failure → "try again", honeypot, rate limit).
- Playwright: one happy path on a phone viewport (fill form → console notification → thank-you page).

## 5. Risks

1. **The notification is the only record.** No database means no backup; a seller who gets
   "try again" and gives up is gone. A lead counts as delivered when at least one channel got
   it; when none did, the lead is logged in full and the seller is asked to retry.
2. **Channels (decided 2026-10-20):** email to ivandimov@yahoo.com via SMTP app password, WhatsApp to two numbers via the Meta Cloud API. Dropped earlier: CallMeBot (unofficial), Resend (third-party mail service).
3. **WhatsApp Cloud API needs its own sender number** (not your personal WhatsApp number) and an
   approved template; each message has a small Meta fee.
4. **GDPR:** the site stores no lead data; deletion requests are handled by deleting the
   notification messages. The Datenschutzerklärung must say so and name the providers.
5. **Impressum/Datenschutz** placeholders must be replaced with real legal text before launch.
6. **Accounts needed before deploy:** Vercel; whatever the next channel needs. Cloudflare only for optional Turnstile.

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
| 8 Deployment guide (Vercel) | done: docs/DEPLOY.md |
| Notification channel v2 | done 2026-10-20: email (SMTP) + WhatsApp (Meta Cloud API template); Ivan sets the Vercel variables per docs/DEPLOY.md |
| Database | removed 2026-10-13 (Ivan: WhatsApp only) |
