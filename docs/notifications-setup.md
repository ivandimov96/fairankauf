# Lead notifications: email and WhatsApp

Every new lead is sent to **every channel you set up**, at the same time:

| Channel | What you get | Turned on by |
|---|---|---|
| **Email** (Resend) | The complete lead, every field | `RESEND_API_KEY` |
| **WhatsApp** (official Meta Cloud API) | The main details, with a link to reply on WhatsApp | `WHATSAPP_CLOUD_TOKEN` |
| Telegram (optional) | The complete lead | `TELEGRAM_BOT_TOKEN` |

With no channel set up (local development), leads are printed in the terminal.

There is no database: the messages are the only record of a lead. Each channel is tried
3 times. The seller sees the thank-you page as soon as **one** channel delivered. Only if
**all** fail does the seller see "please try again in a minute", with their entries kept.
So with email and WhatsApp both set up, one of them failing loses nothing.

---

## 1. Email (Resend, free, 5 minutes)

1. Sign up at <https://resend.com/signup> **with the email address that should receive the
   leads** (`vlado.dimov2@gmail.com`). This matters: without your own domain, Resend only
   delivers to the address the account was created with.
2. Confirm the sign-up email.
3. **API Keys → Create API Key**, name `fairankauf`, permission **Sending access**.
   Copy the key (starts with `re_`). Treat it like a password.

### Configure

```
RESEND_API_KEY=<the key, re_...>
NOTIFY_EMAIL=vlado.dimov2@gmail.com
```

Emails come from `FairAnkauf <onboarding@resend.dev>` with the subject
"Neue Anfrage: <Marke> <Modell>". If the seller entered an email, **Reply** goes straight
to them. Check your spam folder the first time and mark it "Not spam".

Later, with your own domain (e.g. fairankauf.de): verify it in Resend → Domains and set
`EMAIL_FROM=FairAnkauf <anfragen@fairankauf.de>`. Then you can also send to any address.

### What the message looks like

```
🚗 Neue Anfrage: Volkswagen Golf 1.4 TSI
EZ 05/2016 · 123.000 km
Benzin · Manuell · 92 kW
Zustand: Gut · Unfall: Ja, repariert · Fahrbereit: Ja
Karosserie: Kombi · HU: 03/2027 · Scheckheft: Ja · Vorbesitzer: 2
Mängel: Kratzer hinten links
Preisvorstellung: 9.500 €
Ort: 10115 Berlin

👤 Erika Musterfrau
📞 +49 1511 2345678 (bevorzugt: WhatsApp)
✉️ erika@example.de
💬 https://wa.me/4915112345678
```

---

## 2. WhatsApp (official Meta Cloud API)

Use this when you want an official, reliable setup. Important facts first:

- Messages are sent **from** a business number **to** your own WhatsApp number.
  - **Quick start:** Meta gives every app a free **test sender number**. It can message up to
    5 numbers you verify, which is enough to notify yourself.
  - **Later:** your own sender number. It must not be registered in the normal WhatsApp or
    WhatsApp Business app (or you must delete that account first). A cheap prepaid SIM works.
- Messages to you are started by the business, so Meta requires an **approved message
  template**. Free-form text is only allowed within 24 hours after you wrote to that
  number yourself.
- Meta charges a small fee per template message (category "Utility"). Check current prices
  at <https://developers.facebook.com/docs/whatsapp/pricing>.

### 1. Create the app and phone number

1. Go to <https://business.facebook.com> and create a business portfolio (FairAnkauf) if you
   don't have one.
2. Go to <https://developers.facebook.com/apps> → **Create app** → use case
   **"Connect with customers through WhatsApp"** → select your business portfolio.
3. In the app: **WhatsApp → API Setup**. Meta shows a **test number** under "From".
   Under "To", add **your own WhatsApp number** (e.g. `+389 71 943 038`) and confirm the code
   Meta sends you on WhatsApp. (For your own sender number instead: "Add phone number".)
4. Copy the **Phone number ID** shown under "From" (not the phone number itself)
   → `WHATSAPP_CLOUD_PHONE_NUMBER_ID`.

### 2. Create a permanent access token

The token shown on the API Setup page expires after 24 hours. Create a permanent one:

1. Business settings → **Users → System users** → **Add** (role: Admin).
2. **Assign assets**: your WhatsApp app (full control) and your WhatsApp account (full control).
3. **Generate new token** → select the app → expiration **Never** → permissions
   `whatsapp_business_messaging` and `whatsapp_business_management`.
4. Copy the token → `WHATSAPP_CLOUD_TOKEN`. Treat it like a password.

### 3. Register the message template `new_car_lead`

Business Manager → **WhatsApp Manager → Message templates → Create template**:

| Setting | Value |
|---|---|
| Category | **Utility** |
| Name | `new_car_lead` |
| Language | **German** (`de`) |

**Body** (copy exactly; each `{{n}}` is filled in by the app):

```
Neue Anfrage: {{1}}
Erstzulassung und Kilometer: {{2}}
Motor: {{3}}
Zustand: {{4}}
Preisvorstellung: {{5}}
Ort: {{6}}
Verkäufer: {{7}}
Telefon: {{8}}
Antworten per WhatsApp: {{9}}
Diese Nachricht wurde automatisch von FairAnkauf gesendet.
```

Meta asks for an example per variable. Use these:

| Var | Example |
|---|---|
| {{1}} | Volkswagen Golf 1.4 TSI |
| {{2}} | 05/2016, 123.000 km |
| {{3}} | Benzin, Manuell, 92 kW |
| {{4}} | Gut, Unfall: Nein, fahrbereit: ja |
| {{5}} | 9.500 € |
| {{6}} | 10115 Berlin |
| {{7}} | Erika Musterfrau |
| {{8}} | +49 1511 2345678 (bevorzugt: WhatsApp) |
| {{9}} | https://wa.me/4915112345678 |

Don't add buttons.

Submit. Approval usually takes minutes, sometimes up to a day. The status must be
**Active** before it works.

### 4. Configure

```
NOTIFY_PHONE=<your WhatsApp number, e.g. +38971943038>
WHATSAPP_CLOUD_TOKEN=<permanent token>
WHATSAPP_CLOUD_PHONE_NUMBER_ID=<phone number ID>
WHATSAPP_CLOUD_TEMPLATE=new_car_lead
WHATSAPP_CLOUD_TEMPLATE_LANG=de
```

Redeploy and submit a test lead.

### Troubleshooting

The exact error is in the Vercel logs (search for `submitLead`). The WhatsApp template
shows the main fields only; the email has everything. Common errors:

| Error | Fix |
|---|---|
| `Template name does not exist in the translation` | Template not approved yet, or language is not `de` |
| `Number of parameters does not match` | The template body differs from the text above |
| `(#131030) Recipient phone number not in allowed list` | You are still using Meta's test number: add your number as a test recipient, or use your own sender number |
| `Error validating access token` | Token expired: create a permanent system-user token (step 2) |

---

## 3. Telegram (optional)

Optional extra channel: each lead as a Telegram message from your own bot.

1. Install **Telegram** on your phone and sign up with your phone number.
2. Open the chat with **@BotFather** (blue tick), send `/newbot`, and answer its two questions:
   a name (e.g. `FairAnkauf Leads`) and a username ending in `bot` (e.g. `fairankauf_leads_bot`).
   It replies with a **token** like `123456789:AAH...`. Keep it secret: anyone with it controls the bot.
3. Tap the link to your new bot in that reply and press **Start**. (A bot can only write to
   people who started it.)
4. Open the chat with **@userinfobot** and press **Start**. It replies with your **Id**, a number.

### Configure

```
TELEGRAM_BOT_TOKEN=<the token from step 2>
TELEGRAM_CHAT_ID=<your Id from step 4>
```

The message text is the same as the email.

If the log says `chat not found`, you haven't pressed **Start** in your bot's chat (step 3),
or the Id is wrong.
