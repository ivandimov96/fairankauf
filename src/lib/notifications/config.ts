import "server-only";

import { z } from "zod";

// Parsed separately from lib/env.ts on purpose: a broken notification setup must
// never stop a lead from being saved. It only marks the notification as failed.

const e164 = z.string().regex(/^\+[1-9]\d{6,14}$/, "must be E.164, e.g. +4915112345678");

const schema = z.discriminatedUnion("NOTIFICATION_PROVIDER", [
  z.object({
    NOTIFICATION_PROVIDER: z.literal("console"),
  }),
  z.object({
    NOTIFICATION_PROVIDER: z.literal("callmebot"),
    NOTIFY_PHONE: e164,
    CALLMEBOT_API_KEY: z.string().min(1),
  }),
  z.object({
    NOTIFICATION_PROVIDER: z.literal("telegram"),
    TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[\w-]+$/, "must look like 123456789:ABC..."),
    // Your own chat id (a number; negative for groups).
    TELEGRAM_CHAT_ID: z.string().regex(/^-?\d+$/, "must be a number"),
  }),
  z.object({
    NOTIFICATION_PROVIDER: z.literal("whatsapp_cloud"),
    NOTIFY_PHONE: e164,
    WHATSAPP_CLOUD_TOKEN: z.string().min(1),
    WHATSAPP_CLOUD_PHONE_NUMBER_ID: z.string().regex(/^\d+$/),
    WHATSAPP_CLOUD_TEMPLATE: z.string().min(1).default("new_car_lead"),
    WHATSAPP_CLOUD_TEMPLATE_LANG: z.string().min(2).default("de"),
  }),
]);

export type NotificationConfig = z.infer<typeof schema>;

export function notificationConfig(source: Record<string, string | undefined> = process.env): NotificationConfig {
  const parsed = schema.safeParse({ NOTIFICATION_PROVIDER: "console", ...stripEmpty(source) });
  if (!parsed.success) {
    throw new Error(`Notification setup incomplete: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

// .env files often contain `KEY=` for unused keys; treat those as unset.
function stripEmpty(source: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== ""));
}
