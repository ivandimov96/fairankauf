# WhatsApp notification setup

Every new lead sends one WhatsApp message to your phone. Which service sends it is chosen
with `NOTIFICATION_PROVIDER`:

| Value | What it is | When to use |
|---|---|---|
| `console` | Prints the message in the server log | Local development and tests |
| `callmebot` | Free CallMeBot service | **Start here.** Set up in 2 minutes |
| `whatsapp_cloud` | Official Meta WhatsApp Cloud API | Later, for a reliable official setup |

WhatsApp is the only place you see leads; there is no admin website. The lead is still
saved in the database first, so nothing is lost: each message is tried 3 times, and a
daily job (07:00 UTC) re-sends any that still failed. You can always look up leads in the
Neon console (Tables → leads).

---

## Option 1: CallMeBot (recommended to start)

CallMeBot is a free service for sending WhatsApp messages **to yourself**. It is not an
official Meta product: it has no guarantee and limits how many messages you can send in a
short time. That's fine for lead notifications.

### One-time activation

1. Open <https://www.callmebot.com/blog/free-api-whatsapp-messages/> on your phone.
2. Save the CallMeBot phone number shown on that page in your phone's contacts
   (the number changes from time to time, so always take it from that page).
3. In WhatsApp, send this exact text to that contact:
   `I allow callmebot to send me messages`
4. You get a reply with your personal **API key** (a number like `1234567`).
   If no reply arrives within 2 minutes, try again after 24 hours (their documented advice).

### Configure

In Vercel (Project → Settings → Environment Variables) or `.env.local`:

```
NOTIFICATION_PROVIDER=callmebot
NOTIFY_PHONE=+4915156041400
CALLMEBOT_API_KEY=<the key from step 4>
```

Redeploy, submit a test lead, and the message should arrive within seconds.

### What the message looks like

```
🚗 *Neue Anfrage: Volkswagen Golf 1.4 TSI*
EZ 05/2016 · 123.000 km
Benzin · Manuell · 92 kW
Zustand: Gut · Unfall: Ja, repariert · Fahrbereit: Ja
Preisvorstellung: 9.500 €
Ort: 10115 Berlin

👤 Erika Musterfrau
📞 +49 1511 2345678 (bevorzugt: WhatsApp)
💬 https://wa.me/4915112345678
```

Tap the phone number to call, or the 💬 link to write to the seller on WhatsApp.

---

## Option 2: WhatsApp Cloud API (official, Meta)

Use this when you want an official, reliable setup. Important facts first:

- **You need a second phone number** to send from. It must not be registered in the
  normal WhatsApp or WhatsApp Business app (or you must delete that account first). A cheap
  prepaid SIM works. Messages are sent **to** your personal number `+49 1515 6041400`.
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
3. In the app: **WhatsApp → API Setup**. Under "Step 5: Add a phone number", add the second
   number and verify it by SMS or call.
4. Copy the **Phone number ID** (not the phone number itself) → `WHATSAPP_CLOUD_PHONE_NUMBER_ID`.

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
NOTIFICATION_PROVIDER=whatsapp_cloud
NOTIFY_PHONE=+4915156041400
WHATSAPP_CLOUD_TOKEN=<permanent token>
WHATSAPP_CLOUD_PHONE_NUMBER_ID=<phone number ID>
WHATSAPP_CLOUD_TEMPLATE=new_car_lead
WHATSAPP_CLOUD_TEMPLATE_LANG=de
```

Redeploy and submit a test lead.

### Troubleshooting

The exact error is stored on the lead (`notification_error` column, visible in the Neon
console) and in the Vercel logs. Common ones:

| Error | Fix |
|---|---|
| `Template name does not exist in the translation` | Template not approved yet, or language is not `de` |
| `Number of parameters does not match` | The template body differs from the text above |
| `(#131030) Recipient phone number not in allowed list` | You are still using Meta's test number: add your number as a test recipient, or use your own sender number |
| `Error validating access token` | Token expired: create a permanent system-user token (step 2) |
