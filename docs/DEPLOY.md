# Go live: FairAnkauf on Vercel

About 10 minutes. You need a computer browser (the phone works too, but it's fiddly).
Everything here is free to start. There is no database.

## 1. Where leads arrive

Every lead is sent **by email** to ivandimov@yahoo.com and **by WhatsApp** to
+389 71 943 038 and +49 1515 6041400. Both need settings in Vercel (step 3). A lead
counts as delivered when at least one channel got it; problems with the other one
show up in Vercel → **Logs**. Without any settings, leads only appear in those logs.

### 1a. Email (about 3 minutes)

The site sends the email through your own Yahoo mailbox, so no mail service is needed.
It needs an **app password**, which is a separate password Yahoo makes for apps.

1. Log in at <https://mail.yahoo.com>, click your name (top right) → **Account Info** →
   **Security** → **Generate and manage app passwords** (German: *App-Passwörter*).
2. Name it `FairAnkauf`, click **Generate**, copy the 16-character password. It is shown once.
3. Settings for step 3:

   | Name | Value |
   |---|---|
   | `SMTP_HOST` | `smtp.mail.yahoo.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `ivandimov@yahoo.com` |
   | `SMTP_PASS` | the app password |
   | `LEAD_EMAIL_TO` | `ivandimov@yahoo.com` |

   To send through Gmail instead: `SMTP_HOST=smtp.gmail.com`, the Gmail address as
   `SMTP_USER`, and an app password from <https://myaccount.google.com/apppasswords>
   (2-step verification must be on). `LEAD_EMAIL_TO` stays the Yahoo address.

### 1b. WhatsApp (about 30 minutes, once)

WhatsApp messages come from Meta's **WhatsApp Business Platform**. Two things to know:

- A business may only start a chat with a **message template** that Meta has approved.
  The template below is the lead; approval usually takes minutes to a few hours.
- Meta gives every app a free **test number** as sender. It can message up to 5 numbers
  that you confirm, which is exactly what we need. (A sender number cannot be a number
  you use in the normal WhatsApp app.)

1. Go to <https://developers.facebook.com>, log in with Facebook, **My Apps → Create App**.
   Use case **Other**, type **Business**, name `FairAnkauf`. Create a Business portfolio if asked.
2. In the app, under **Add product** choose **WhatsApp → Set up**.
3. Open **WhatsApp → API Setup**:
   - Note the **Phone number ID** shown under the test number ("From").
   - Under "To" click **Manage phone number list** and add `+38971943038` and
     `+4915156041400`. Each number gets a code on WhatsApp; enter it to confirm.
4. **Permanent token** (the token on the API Setup page expires after 24 hours):
   <https://business.facebook.com/settings> → **Users → System users → Add**,
   name `fairankauf-server`, role **Admin**. Then **Assign assets → Apps → FairAnkauf**
   with full control. Then **Generate new token**: app FairAnkauf, expiration **Never**,
   permissions `whatsapp_business_messaging` and `whatsapp_business_management`. Copy the token.
5. **Template**: in the app go to **WhatsApp → Message templates → Create template**
   (also reachable at <https://business.facebook.com/wa/manage/message-templates>).
   Category **Utility**, name `neue_anfrage`, language **German**. Paste this as the body
   (Meta rejects a template with "too many variables for its length", so the fixed text
   around the nine variables is deliberately this long):

   ```
   🚗 Neue Anfrage über das Formular auf der FairAnkauf Website.
   Fahrzeug: {{1}}
   Zulassung und Laufleistung: {{2}}
   Motor und Antrieb: {{3}}
   Zustand: {{4}}
   Weitere Details: {{5}}
   Preisvorstellung des Verkäufers: {{6}}
   Gewünschter Verkaufszeitpunkt: {{7}}
   Standort des Fahrzeugs: {{8}}
   Kontakt des Verkäufers: {{9}}
   Bitte melden Sie sich zeitnah beim Verkäufer. Diese Nachricht wurde automatisch von FairAnkauf gesendet.
   ```

   The template for Ivan's account was created this way on 2026-10-20 (template id
   2073162733332826); these steps are for recreating it in another account.

   Meta asks for a sample for each variable; use these:
   1 `Volkswagen Golf 1.4 TSI` · 2 `EZ 05/2016 · 123.000 km` · 3 `Benzin · Manuell · Frontantrieb · 92 kW` ·
   4 `Gut · Unfall: Nein · Fahrbereit: Ja` · 5 `Karosserie: Kombi · Vorbesitzer: 2` · 6 `9.500 €` ·
   7 `So schnell wie möglich` · 8 `10115 Berlin` · 9 `Erika Musterfrau · +49 1511 2345678 (WhatsApp)`.
   Submit and wait until the status is **Active**.
6. Settings for step 3:

   | Name | Value |
   |---|---|
   | `WHATSAPP_ACCESS_TOKEN` | the permanent token |
   | `WHATSAPP_PHONE_NUMBER_ID` | the Phone number ID |
   | `LEAD_WHATSAPP_TO` | `+38971943038, +4915156041400` |

   `WHATSAPP_TEMPLATE_NAME` (`neue_anfrage`) and `WHATSAPP_TEMPLATE_LANGUAGE` (`de`) only
   need setting if you named the template differently.

Later, to message more than 5 numbers or to send from your own business number, add a
real phone number under API Setup and complete Meta's business verification.

## 2. Create the Vercel project

1. Go to <https://vercel.com/signup> and sign up **with GitHub** (use the account `ivandimov96`).
2. Click **Add New… → Project**.
3. Find **fairankauf** in the list and click **Import**.
   If it's not listed, click "Adjust GitHub App Permissions" and give Vercel access to the repo.
4. Leave all build settings as they are.

## 3. Add the settings

Project → **Environment Variables** (direct link:
`https://vercel.com/<team>/fairankauf/settings/environment-variables`) → **Add Environment
Variable**. In the dialog pick a **Type** first: **Secret** for `SMTP_PASS` and
`WHATSAPP_ACCESS_TOKEN` (hidden after saving), **Config** for everything else. Several
Config values can go in at once: paste lines like `NAME=value` into the Key field and
Vercel splits them. Environment **Production** is enough.

| Name | Value |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEAD_EMAIL_TO` | from step 1a |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `LEAD_WHATSAPP_TO` | from step 1b |
| `APP_URL` | optional on Vercel; set it only once you use your own domain (no `/` at the end) |

Paste secrets straight into Vercel; never send them in a chat or commit them.

## 4. Deploy

**Deployments** tab → on the latest deployment click **⋯ → Redeploy** (or click **Deploy**
if you haven't yet). Wait until it says **Ready**.

## 5. Test it

1. Open your site on your phone, click **"Jetzt Auto bewerten lassen"** and submit a test car
   with your own phone number.
2. The thank-you page appears, the email arrives in Yahoo and the WhatsApp message on both
   phones. If one is missing, Vercel → project → **Logs** (search for `[lead]`) says why,
   e.g. a wrong app password or a template that is not approved yet.

## From now on

Every push to `main` on GitHub deploys automatically.

## Before you advertise the site

- Replace the placeholder **Impressum** and **Datenschutzerklärung** (legally required in
  Germany; e.g. generate them with eRecht24).
- Optional, if spam arrives: add Cloudflare Turnstile. Create a free site at <https://dash.cloudflare.com> → Turnstile, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and redeploy. A hidden trap field and a limit of 5 requests per hour per visitor are always on.
- Optional: connect your own domain under Settings → Domains, then update `APP_URL`.
