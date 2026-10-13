# Go live: FairAnkauf on Vercel

About 10 minutes. You need a computer browser (the phone works too, but it's fiddly).
Everything here is free to start. There is no database: every lead goes straight to your
WhatsApp (or Telegram).

## 1. Set up where leads arrive (on your phone)

Pick one, following [`whatsapp-setup.md`](whatsapp-setup.md):

- **CallMeBot** for WhatsApp (Option 1, 2 minutes): you end up with an **API key**.
- **Telegram** (Option 2, 5 minutes, if CallMeBot doesn't answer): you end up with a **bot token** and your **chat Id**.

Keep these for step 3.

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
| `NOTIFICATION_PROVIDER` | `callmebot` (or `telegram`) |
| `NOTIFY_PHONE` | CallMeBot only: the number that activated CallMeBot, e.g. `+38971943038` |
| `CALLMEBOT_API_KEY` | CallMeBot only: the key from step 1 |
| `TELEGRAM_BOT_TOKEN` | Telegram only: the bot token from step 1 |
| `TELEGRAM_CHAT_ID` | Telegram only: your Id from step 1 |

The real name of your site is shown on the project's overview page (e.g.
`fairankauf.vercel.app` or `fairankauf-xyz.vercel.app`); use that for `APP_URL`.

## 4. Deploy

**Deployments** tab → on the latest deployment click **⋯ → Redeploy** (or click **Deploy**
if you haven't yet). Wait until it says **Ready**.

## 5. Test it

1. Open your site on your phone, click **"Jetzt Auto bewerten lassen"** and submit a test car
   with your own phone number.
2. The WhatsApp (or Telegram) message should arrive within seconds.
3. If the form says "Das hat leider nicht geklappt": Vercel → project → **Logs**, search for
   `submitLead`. The error text says what's wrong (most often a typo in the key, token,
   chat Id or phone number). Fix the setting and redeploy.

## From now on

Every push to `main` on GitHub deploys automatically.

## Before you advertise the site

- Replace the placeholder **Impressum** and **Datenschutzerklärung** (legally required in
  Germany; e.g. generate them with eRecht24).
- Optional, if spam arrives: add Cloudflare Turnstile. Create a free site at <https://dash.cloudflare.com> → Turnstile, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. A hidden trap field and a limit of 5 requests per hour per visitor are always on.
- Optional: connect your own domain under Settings → Domains, then update `APP_URL`.
