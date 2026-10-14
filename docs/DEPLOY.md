# Go live: FairAnkauf on Vercel

About 10 minutes. You need a computer browser (the phone works too, but it's fiddly).
Everything here is free to start. There is no database.

## 1. Where leads arrive

Not decided yet (all channels were removed on 2026-10-14 to start over). Until a new
channel is built, a submitted lead is only visible under Vercel → project → **Logs**.

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

The real name of your site is shown on the project's overview page (e.g.
`fairankauf.vercel.app` or `fairankauf-xyz.vercel.app`); use that for `APP_URL`.

## 4. Deploy

**Deployments** tab → on the latest deployment click **⋯ → Redeploy** (or click **Deploy**
if you haven't yet). Wait until it says **Ready**.

## 5. Test it

1. Open your site on your phone, click **"Jetzt Auto bewerten lassen"** and submit a test car
   with your own phone number.
2. The thank-you page appears, and the lead is in Vercel → project → **Logs** (search for
   `[lead]`), until a notification channel is added.

## From now on

Every push to `main` on GitHub deploys automatically.

## Before you advertise the site

- Replace the placeholder **Impressum** and **Datenschutzerklärung** (legally required in
  Germany; e.g. generate them with eRecht24).
- Optional, if spam arrives: add Cloudflare Turnstile. Create a free site at <https://dash.cloudflare.com> → Turnstile, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. A hidden trap field and a limit of 5 requests per hour per visitor are always on.
- Optional: connect your own domain under Settings → Domains, then update `APP_URL`.
