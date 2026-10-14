import "server-only";

import { z } from "zod";

// Every channel whose key is set receives each lead: email (your own mailbox over
// SMTP, e.g. Gmail), WhatsApp (official Meta Cloud API) and/or Telegram. With none set, leads are printed to
// the server log (local development). Each channel is checked on its own, so one
// broken setup never stops the others.

const e164 = z.string().regex(/^\+[1-9]\d{6,14}$/, "must be E.164, e.g. +4915112345678");

const email = z
  .object({
    kind: z.literal("email"),
    // The mailbox that sends: a Gmail address and its App Password by default.
    SMTP_USER: z.email("must be an email address"),
    // Google shows App Passwords as "abcd efgh ijkl mnop"; the spaces don't matter.
    SMTP_PASS: z.string().min(1).transform((v) => v.replace(/\s+/g, "")),
    SMTP_HOST: z.string().min(1).default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
    // Where the leads go; the sending mailbox itself unless set.
    NOTIFY_EMAIL: z.email("must be an email address").optional(),
    EMAIL_FROM: z.string().min(3).optional(),
  })
  .transform((v) => ({
    ...v,
    NOTIFY_EMAIL: v.NOTIFY_EMAIL ?? v.SMTP_USER,
    EMAIL_FROM: v.EMAIL_FROM ?? `FairAnkauf <${v.SMTP_USER}>`,
  }));

const whatsappCloud = z.object({
  kind: z.literal("whatsapp_cloud"),
  WHATSAPP_CLOUD_TOKEN: z.string().min(1),
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: z.string().regex(/^\d+$/, "must be a number"),
  NOTIFY_PHONE: e164,
  WHATSAPP_CLOUD_TEMPLATE: z.string().min(1).default("new_car_lead"),
  WHATSAPP_CLOUD_TEMPLATE_LANG: z.string().min(2).default("de"),
});

const telegram = z.object({
  kind: z.literal("telegram"),
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[\w-]+$/, "must look like 123456789:ABC..."),
  // Your own chat id (a number; negative for groups).
  TELEGRAM_CHAT_ID: z.string().regex(/^-?\d+$/, "must be a number"),
});

export type EmailConfig = z.infer<typeof email>;
export type WhatsappCloudConfig = z.infer<typeof whatsappCloud>;
export type TelegramConfig = z.infer<typeof telegram>;
export type ChannelConfig = EmailConfig | WhatsappCloudConfig | TelegramConfig | { kind: "console" };

/** A configured channel, or why its settings are invalid. */
export type ChannelSetup = { ok: true; config: ChannelConfig } | { ok: false; kind: string; error: string };

const CHANNELS = [
  { kind: "email", key: "SMTP_USER", schema: email },
  { kind: "whatsapp_cloud", key: "WHATSAPP_CLOUD_TOKEN", schema: whatsappCloud },
  { kind: "telegram", key: "TELEGRAM_BOT_TOKEN", schema: telegram },
] as const;

export function notificationChannels(source: Record<string, string | undefined> = process.env): ChannelSetup[] {
  const env = stripEmpty(source);
  const setups: ChannelSetup[] = CHANNELS.filter((c) => env[c.key]).map((c) => {
    const parsed = c.schema.safeParse({ ...env, kind: c.kind });
    return parsed.success
      ? { ok: true, config: parsed.data }
      : { ok: false, kind: c.kind, error: `${c.kind} setup incomplete: ${z.prettifyError(parsed.error)}` };
  });
  if (setups.length > 0) return setups;
  // On the live site a missing setup must not look like success to the seller.
  if (env.VERCEL_ENV === "production") {
    return [{ ok: false, kind: "none", error: "No notification channel configured (set SMTP_USER/SMTP_PASS or WHATSAPP_CLOUD_TOKEN)" }];
  }
  return [{ ok: true, config: { kind: "console" } }];
}

// .env files often contain `KEY=` for unused keys; treat those as unset.
function stripEmpty(source: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== "")) as Record<
    string,
    string
  >;
}
