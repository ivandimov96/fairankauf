# Plan: car-buying lead app (v1)

Status: Phase 0 draft, 2026-10-13. Decisions marked **(default)** apply unless Ivan says otherwise.

## 1. Architecture

One Next.js 16 app (App Router, Server Actions, TypeScript strict) deployed on Vercel, region `fra1`.

```
Browser (seller)                     Browser (Ivan, /admin)
   │ multi-step form (RHF + Zod)        │ signed session cookie
   ▼                                    ▼
Server Action submitLead          Server Actions (each calls requireAdmin())
   1. honeypot + Turnstile + rate limit
   2. Zod parse (same schema as client)
   3. upload photos → Blob
   4. INSERT lead (notificationStatus = pending)
   5. NotificationProvider.send() → update status sent/failed
   ▼
Postgres (Neon, Frankfurt) via Drizzle        Vercel Blob (photos)
```

Key choices and why:

- **Admin auth: signed cookie, no Auth.js.** One user, one password. `ADMIN_PASSWORD_HASH` (scrypt, Node built-in) in env, session = HMAC-signed cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, 7 days) verified with Web Crypto. Checked in `proxy.ts` (Next 16's name for middleware) for `/admin/*` **and** again inside every admin Server Action, since actions can be called directly. Auth.js would add a dependency, adapter config and concepts we do not need.
- **Rate limiting in Postgres, not memory.** Vercel runs many short-lived instances, so an in-memory counter does not work. A tiny `rate_limits` table (key = hashed IP + action, window counter) avoids adding Redis/Upstash.
- **Photos in the same submit.** Client compresses each photo to max 1600px JPEG (~250–400 KB) with a canvas, then the form submits once. 8 photos stay under Vercel's 4.5 MB request limit, and there are no orphaned uploads from abandoned forms. Compression is ~40 lines of our own code, no library.
- **Notifications** behind `NotificationProvider { send(lead): Promise<Result> }`, chosen by `NOTIFICATION_PROVIDER=console|callmebot|whatsapp_cloud`. Message text comes from one pure `formatLeadMessage()` function, unit-tested.
- **Dashboard chart:** plain SVG/CSS bars, no chart library.
- **Phone validation:** `libphonenumber-js` (min metadata), default country DE. Worth the one dependency.
- **German only (default).** No i18n framework in v1; strings live in one `messages/de.ts` file so English can be added later.

## 2. Folder structure

```
src/
  app/
    (public)/page.tsx            landing
    (public)/verkaufen/          form wizard + danke/
    (public)/impressum/, datenschutz/
    admin/login/
    admin/(protected)/           inbox, leads/[id], dashboard
    api/export/route.ts          CSV (auth-checked)
    sitemap.ts, robots.ts
  components/ui/                 shadcn
  components/form/, admin/
  lib/
    db/schema.ts, db/index.ts    Drizzle
    validation/lead.ts           shared Zod schemas
    notifications/               provider interface, 3 impls, formatter
    auth.ts, rate-limit.ts, turnstile.ts, money.ts, dates.ts
    deal.ts                      calculator + profit (pure functions)
  server/actions/                Server Actions
drizzle/                         migrations
tests/unit/, tests/e2e/
```

## 3. Data model

Money = integer cents. Timestamps = `timestamptz` UTC, shown in Europe/Berlin.

| table | columns (main) |
|---|---|
| `leads` | id (uuid), brand, model, firstRegYear, firstRegMonth?, mileageKm, fuel, gearbox, powerKw?, bodyType?, condition, accident, drivable, huDue? (yyyy-mm), serviceBook, previousOwners, defects?, desiredPriceCents?, plz, city, name, phone (E.164), email?, contactMethod, consentAt, status, lostReason?, notificationStatus (pending/sent/failed), notificationError?, createdAt, updatedAt |
| `lead_photos` | id, leadId (cascade), url, pathname, position |
| `status_history` | id, leadId (cascade), fromStatus?, toStatus, note?, createdAt |
| `notes` | id, leadId (cascade), text, createdAt |
| `deals` | leadId (PK, 1:1, cascade), estMarketValueCents, reconEstimateCents, feesEstimateCents, targetMarginType (eur/pct), targetMarginValue, purchasePriceCents?, purchaseDate?, salePriceCents?, saleDate? |
| `deal_costs` | id, dealId (cascade), description, amountCents, date |
| `rate_limits` | key, windowStart, count |

Changes vs. your suggestion: `deals` keyed by `leadId` (always 1:1, one fewer id), plus `lostReason` on leads, `consentAt` for GDPR proof, and the `rate_limits` table. Status and fuel etc. are Postgres enums. Profit and days in stock are computed, not stored. GDPR delete = delete lead row (cascades) + delete its Blob files.

## 4. Testing

- Vitest: Zod schemas, `deal.ts` (max purchase price, profit, days in stock), `formatLeadMessage`.
- Playwright: one happy path (fill form → lead in admin → console provider logged the message).
- DB for dev and e2e: local Postgres in Docker; production Neon.

## 5. Risks and things I'd push back on

1. **WhatsApp Cloud API needs its own sender number.** The number that sends must not be an active WhatsApp app account, so it cannot be your personal number. You need a second number (a cheap SIM or virtual number) for Meta, and messages go *to* your personal number. Each template message has a small Meta fee. Template must be approved first (usually minutes to a day).
2. **CallMeBot is unofficial**, free, rate-limited, and has no SLA. Fine to start, but a lead must never depend on it: that is why save-first + "Resend" matters. Plan to move to Cloud API once leads flow.
3. **Photos can't survive a page reload.** localStorage holds text fields only (a few MB limit); photos must be re-added after a reload. I'll show a hint.
4. **Free-tier databases sleep.** Neon free suspends compute after idle and wakes in under a second on the next request, so no leads are lost. Supabase free *pauses the whole project* after 7 days without activity, which would break the form. This is the main reason I recommend Neon.
5. **Impressum/Datenschutz are legal requirements** for a German business site. I'll add placeholders, but the real text needs a generator (e.g. eRecht24) or a lawyer before launch. Turnstile and Vercel Blob must be listed in the Datenschutzerklärung.
6. **Vercel Blob region:** needs checking in Phase 1 that the store can be placed in the EU; if not, Supabase Storage or Cloudflare R2 (EU jurisdiction) is the fallback.
7. **Accounts you'll need before deploy:** Vercel, Neon, Cloudflare (Turnstile), CallMeBot activation, later Meta Business. None needed for Phases 1–6; I develop locally with the console provider.

## 6. Phases

As in your spec (0–8), pausing for "go" after each, with typecheck, lint, tests, a real run in the browser and a commit at the end of every phase.
