import nodemailer from "nodemailer";

import { formatLeadMessage, formatTemplateParams, plainLeadMessage, type LeadSummary } from "./format";
import type { ChannelConfig } from "./config";
import type { NotificationProvider } from "./types";

const TIMEOUT_MS = 10_000;
// Meta Graph API version. Versions live ~2 years; bump when Meta deprecates it.
export const GRAPH_API_VERSION = "v23.0";

type Fetch = typeof fetch;

export function consoleProvider(log: (msg: string) => void = console.log): NotificationProvider {
  return {
    name: "console",
    async sendNewLead(lead) {
      log(`[notification:console]\n${formatLeadMessage(lead)}`);
    },
  };
}

export type SmtpConfig = { host: string; port: number; user: string; pass: string; to: string; from: string };

/** The part of a nodemailer transport the provider uses; swapped out in tests. */
export type MailTransport = { sendMail(message: ReturnType<typeof emailPayload>): Promise<unknown> };

function smtpTransport(cfg: SmtpConfig): MailTransport {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
  });
}

/**
 * Email from your own mailbox over SMTP (Gmail with an App Password by default).
 * Plain text with every field; replies go to the seller.
 */
export function emailProvider(cfg: SmtpConfig, transport: MailTransport = smtpTransport(cfg)): NotificationProvider {
  return {
    name: "email",
    async sendNewLead(lead) {
      try {
        await transport.sendMail(emailPayload(lead, cfg));
      } catch (error) {
        throw new Error(`Email (SMTP ${cfg.host}): ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  };
}

export function emailPayload(lead: LeadSummary, cfg: { to: string; from: string }) {
  return {
    from: cfg.from,
    to: cfg.to,
    subject: `Neue Anfrage: ${lead.brand} ${lead.model}`.replace(/\s+/g, " "),
    text: plainLeadMessage(lead),
    ...(lead.email ? { replyTo: lead.email } : {}),
  };
}

/** Official Telegram Bot API: the bot sends the lead to your chat. https://core.telegram.org/bots/api */
export function telegramProvider(
  cfg: { botToken: string; chatId: string },
  fetchImpl: Fetch = fetch,
): NotificationProvider {
  return {
    name: "telegram",
    async sendNewLead(lead) {
      const res = await fetchImpl(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramPayload(lead, cfg.chatId)),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new Error(`Telegram ${res.status}: ${summarize(await res.text())}`);
      }
    },
  };
}

export function telegramPayload(lead: LeadSummary, chatId: string) {
  // Plain text: the WhatsApp *bold* markers would show up literally, and Telegram's
  // Markdown mode rejects messages whose user text contains stray _ or *.
  return { chat_id: chatId, text: plainLeadMessage(lead), disable_web_page_preview: true };
}

/** Official Meta WhatsApp Cloud API, using the approved `new_car_lead` template. */
export function whatsappCloudProvider(
  cfg: { phone: string; token: string; phoneNumberId: string; template: string; lang: string },
  fetchImpl: Fetch = fetch,
): NotificationProvider {
  return {
    name: "whatsapp_cloud",
    async sendNewLead(lead) {
      const res = await fetchImpl(`https://graph.facebook.com/${GRAPH_API_VERSION}/${cfg.phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cloudTemplatePayload(lead, cfg)),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new Error(`WhatsApp Cloud API ${res.status}: ${summarize(await res.text())}`);
      }
    },
  };
}

export function cloudTemplatePayload(
  lead: LeadSummary,
  cfg: { phone: string; template: string; lang: string },
) {
  return {
    messaging_product: "whatsapp",
    to: cfg.phone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: cfg.template,
      language: { code: cfg.lang },
      components: [
        {
          type: "body",
          parameters: formatTemplateParams(lead).map((text) => ({ type: "text", text })),
        }
      ],
    },
  };
}

export function createProvider(cfg: ChannelConfig): NotificationProvider {
  switch (cfg.kind) {
    case "console":
      return consoleProvider();
    case "email":
      return emailProvider({
        host: cfg.SMTP_HOST,
        port: cfg.SMTP_PORT,
        user: cfg.SMTP_USER,
        pass: cfg.SMTP_PASS,
        to: cfg.NOTIFY_EMAIL,
        from: cfg.EMAIL_FROM,
      });
    case "telegram":
      return telegramProvider({ botToken: cfg.TELEGRAM_BOT_TOKEN, chatId: cfg.TELEGRAM_CHAT_ID });
    case "whatsapp_cloud":
      return whatsappCloudProvider({
        phone: cfg.NOTIFY_PHONE,
        token: cfg.WHATSAPP_CLOUD_TOKEN,
        phoneNumberId: cfg.WHATSAPP_CLOUD_PHONE_NUMBER_ID,
        template: cfg.WHATSAPP_CLOUD_TEMPLATE,
        lang: cfg.WHATSAPP_CLOUD_TEMPLATE_LANG,
      });
  }
}

function summarize(body: string) {
  return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
}
