# Go live: FairAnkauf on Vercel

About 15 minutes. You need a computer browser (the phone works too, but it's fiddly).
Everything here is free to start.

## 1. Set up where leads arrive (on your phone)

Pick one, following [`whatsapp-setup.md`](whatsapp-setup.md):

- **Telegram** (Option 2, recommended, 5 minutes): you end up with a **bot token** and your **chat Id**.
- **CallMeBot** for WhatsApp (Option 1, 2 minutes, but its bot often doesn't answer): you end up with an **API key**.

Keep these for step 4.

## 2. Create the Vercel project

1. Go to <https://vercel.com/signup> and sign up **with GitHub** (use the account `ivandimov96`).
2. Click **Add New… → Project**.
3. Find **fairankauf** in the list and click **Import**.
   If it's not listed, click "Adjust GitHub App Permissions" and give Vercel access to the repo.
4. Leave all build settings as they are. **Don't click Deploy yet** — first add the database
   (step 3) and settings (step 4). If you already clicked Deploy, that's fine: the first
   build fails without a database; finish steps 3–4 and then redeploy (step 5).

## 3. Add the database (Neon)

1. In the Vercel project, open the **Storage** tab → **Create Database** → choose **Neon** (Postgres).
2. Region: **Frankfurt (eu-central-1)**. Plan: **Free**.
3. Connect it to the project for **Production** and **Preview**.

Vercel now sets `DATABASE_URL` for you. The tables are created automatically on every deploy.

## 4. Add the settings

Project → **Settings → Environment Variables**. Add these (Environment: Production and Preview):

| Name | Value |
|---|---|
| `APP_URL` | `https://fairankauf.vercel.app` (or your own domain later, no `/` at the end) |
| `NOTIFICATION_PROVIDER` | `telegram` (or `callmebot`) |
| `TELEGRAM_BOT_TOKEN` | Telegram only: the bot token from step 1 |
| `TELEGRAM_CHAT_ID` | Telegram only: your Id from step 1 |
| `NOTIFY_PHONE` | CallMeBot only: `+4915156041400` |
| `CALLMEBOT_API_KEY` | CallMeBot only: the key from step 1 |
| `CRON_SECRET` | any long random text, e.g. from <https://www.random.org/strings/> (32 characters) |

The real name of your site is shown on the project's overview page (e.g.
`fairankauf.vercel.app` or `fairankauf-xyz.vercel.app`); use that for `APP_URL`.

## 5. Deploy

**Deployments** tab → on the latest deployment click **⋯ → Redeploy** (or click **Deploy**
if you haven't yet). Wait until it says **Ready**.

## 6. Test it

1. Open your site on your phone, click **"Jetzt Auto bewerten lassen"** and submit a test car
   with your own phone number.
2. The Telegram (or WhatsApp) message should arrive within seconds.
3. If nothing arrives: Vercel → project → **Logs**, search for `notifyNewLead`. The error
   text says what's wrong (most often a typo in the token, chat Id or key).
   Fix the setting and redeploy; the daily job re-sends missed messages at 07:00 UTC.

You can see every lead in Neon: Vercel → **Storage** → your database → **Open in Neon** →
**Tables → leads**. Delete your test lead there.

## From now on

Every push to `main` on GitHub deploys automatically.

## Before you advertise the site

- Replace the placeholder **Impressum** and **Datenschutzerklärung** (legally required in
  Germany; e.g. generate them with eRecht24).
- Optional, if spam arrives: add Cloudflare Turnstile. Create a free site at <https://dash.cloudflare.com> → Turnstile, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. A hidden trap field and a limit of 5 requests per hour per visitor are always on.
- Optional: connect your own domain under Settings → Domains, then update `APP_URL`.
