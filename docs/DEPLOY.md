# Go live: FairAnkauf on Vercel

About 10 minutes. You need a computer browser (the phone works too, but it's fiddly).
Everything here is free to start. There is no database: every lead goes straight to your
email and WhatsApp.

## 1. Set up where leads arrive

Follow [`notifications-setup.md`](notifications-setup.md):

- **Email** (5 minutes): a Google **App Password** for `vlado.dimov2@gmail.com`.
- **WhatsApp** (about 30 minutes): a Meta developer app → you end up with a **token**, a
  **phone number ID** and an approved **message template**.

Email alone is enough to go live; WhatsApp can be added later. Keep the values for step 3.

## 2. Create the Vercel project

1. Go to <https://vercel.com/signup> and sign up **with GitHub** (use the account `ivandimov96`).
2. Click **Add New… → Project**.
3. Find **fairankauf** in the list and click **Import**.
   If it's not listed, click "Adjust GitHub App Permissions" and give Vercel access to the repo.
4. Leave all build settings as they are.

## 3. Add the settings

Project → **Settings → Environment Variables**. Add these (Environment: Production and Preview):

| Name | Value |
|---|---|
| `APP_URL` | `https://fairankauf.vercel.app` (or your own domain later, no `/` at the end) |
| `SMTP_USER` | Email: `vlado.dimov2@gmail.com` |
| `SMTP_PASS` | Email: the App Password from step 1 |
| `WHATSAPP_CLOUD_TOKEN` | WhatsApp: the permanent token from step 1 |
| `WHATSAPP_CLOUD_PHONE_NUMBER_ID` | WhatsApp: the phone number ID from step 1 |
| `NOTIFY_PHONE` | WhatsApp: your own number, e.g. `+38971943038` |

The real name of your site is shown on the project's overview page (e.g.
`fairankauf.vercel.app` or `fairankauf-xyz.vercel.app`); use that for `APP_URL`.

## 4. Deploy

**Deployments** tab → on the latest deployment click **⋯ → Redeploy** (or click **Deploy**
if you haven't yet). Wait until it says **Ready**.

## 5. Test it

1. Open your site on your phone, click **"Jetzt Auto bewerten lassen"** and submit a test car
   with your own phone number.
2. The email (and the WhatsApp message) should arrive within seconds. Check the spam
   folder the first time.
3. If one channel is silent but the other works, or the form says "Das hat leider nicht
   geklappt": Vercel → project → **Logs**, search for `submitLead` or
   `sendLeadNotification`. The error text says what's wrong (most often a typo in a key or
   number). Fix the setting and redeploy.

## From now on

Every push to `main` on GitHub deploys automatically.

## Before you advertise the site

- Replace the placeholder **Impressum** and **Datenschutzerklärung** (legally required in
  Germany; e.g. generate them with eRecht24).
- Optional, if spam arrives: add Cloudflare Turnstile. Create a free site at <https://dash.cloudflare.com> → Turnstile, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. A hidden trap field and a limit of 5 requests per hour per visitor are always on.
- Optional: connect your own domain under Settings → Domains, then update `APP_URL`.
