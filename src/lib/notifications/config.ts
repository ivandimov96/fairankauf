import "server-only";

import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { z } from "zod";

/**
 * Notification settings, read from the environment (Vercel → Settings → Environment
 * Variables, locally .env.local). Each channel is "off" when none of its variables
 * is set, "on" when all required ones are valid, and "invalid" otherwise, so a typo
 * in one channel shows up in the log instead of silently losing leads.
 */
export type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** Sender address; mail providers want it to match the account. */
  from: string;
  to: string[];
};

export type WhatsAppConfig = {
  token: string;
  phoneNumberId: string;
  template: string;
  language: string;
  /** Recipients as digits without "+", as the Graph API wants them. */
  to: string[];
};

export type ChannelSetting<T> = { status: "off" } | { status: "on"; config: T } | { status: "invalid"; reason: string };

export type NotificationConfig = {
  email: ChannelSetting<EmailConfig>;
  whatsapp: ChannelSetting<WhatsAppConfig>;
};

const EMAIL_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "LEAD_EMAIL_TO"] as const;
const WHATSAPP_VARS = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_TEMPLATE_NAME",
  "WHATSAPP_TEMPLATE_LANGUAGE",
  "LEAD_WHATSAPP_TO",
] as const;

const nonEmpty = z.string().trim().min(1, "fehlt");

/** "a, b; c" → ["a", "b", "c"]. Commas, not spaces: phone numbers may contain spaces. */
const list = (value: string) =>
  value
    .split(/[,;\n]+/)
    .map((v) => v.trim())
    .filter(Boolean);

const emailSchema = z
  .object({
    SMTP_HOST: nonEmpty,
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
    SMTP_USER: nonEmpty,
    SMTP_PASS: nonEmpty,
    SMTP_FROM: z.string().trim().optional(),
    LEAD_EMAIL_TO: nonEmpty.refine((v) => list(v).every((a) => z.email().safeParse(a).success), "keine gültige E-Mail-Adresse"),
  })
  .transform(
    (v): EmailConfig => ({
      host: v.SMTP_HOST,
      port: v.SMTP_PORT,
      user: v.SMTP_USER,
      pass: v.SMTP_PASS,
      from: v.SMTP_FROM || v.SMTP_USER,
      to: list(v.LEAD_EMAIL_TO),
    }),
  );

/** "+49 1515 6041400" → "4915156041400"; null when not a valid number. */
function toDigits(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value, "DE");
  return parsed?.isValid() ? parsed.number.replace("+", "") : null;
}

const whatsappSchema = z
  .object({
    WHATSAPP_ACCESS_TOKEN: nonEmpty,
    WHATSAPP_PHONE_NUMBER_ID: z.string().trim().regex(/^\d+$/, "muss die numerische Phone number ID sein"),
    WHATSAPP_TEMPLATE_NAME: z.string().trim().min(1).default("neue_anfrage"),
    WHATSAPP_TEMPLATE_LANGUAGE: z.string().trim().min(2).default("de"),
    LEAD_WHATSAPP_TO: nonEmpty.refine((v) => list(v).every((n) => toDigits(n) !== null), "keine gültige Telefonnummer"),
  })
  .transform(
    (v): WhatsAppConfig => ({
      token: v.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: v.WHATSAPP_PHONE_NUMBER_ID,
      template: v.WHATSAPP_TEMPLATE_NAME,
      language: v.WHATSAPP_TEMPLATE_LANGUAGE,
      to: list(v.LEAD_WHATSAPP_TO).map((n) => toDigits(n)!),
    }),
  );

type Env = Record<string, string | undefined>;

/** Blank values count as unset, so an empty line in .env.local turns a channel off. */
function pick(env: Env, names: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) out[name] = value;
  }
  return out;
}

function channel<T>(env: Env, names: readonly string[], schema: z.ZodType<T, unknown>): ChannelSetting<T> {
  const values = pick(env, names);
  if (Object.keys(values).length === 0) return { status: "off" };
  const result = schema.safeParse(values);
  if (result.success) return { status: "on", config: result.data };
  // Variable names only; never echo values, some of them are secrets.
  const reason = result.error.issues.map((i) => `${String(i.path[0])} ${i.message}`).join(", ");
  return { status: "invalid", reason };
}

export function getNotificationConfig(env: Env = process.env): NotificationConfig {
  return {
    email: channel(env, EMAIL_VARS, emailSchema),
    whatsapp: channel(env, WHATSAPP_VARS, whatsappSchema),
  };
}
