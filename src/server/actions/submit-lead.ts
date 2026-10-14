"use server";

import { sendLeadNotification } from "@/lib/notifications";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { turnstileEnabled, verifyTurnstile } from "@/lib/turnstile";
import { leadSchema, toLeadSummary } from "@/lib/validation/lead";

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Spam signals sent alongside the form values. */
export type SubmitMeta = {
  /** Honeypot: a field hidden from people. Bots fill it in. */
  honeypot?: string;
  turnstileToken?: string;
};

const MAX_PER_HOUR = 5;

export async function submitLead(values: unknown, meta: SubmitMeta = {}): Promise<SubmitLeadResult> {
  // 1. Spam checks
  if (isBot(meta.honeypot, values)) {
    // Pretend it worked so the bot doesn't learn anything.
    console.warn("submitLead: honeypot filled, dropping submission");
    return { ok: true };
  }

  if (turnstileEnabled()) {
    const ok = await verifyTurnstile(meta.turnstileToken, process.env.TURNSTILE_SECRET_KEY!, await clientIp());
    if (!ok) {
      return { ok: false, message: "Die Sicherheitsprüfung ist fehlgeschlagen. Bitte laden Sie die Seite neu." };
    }
  }

  if (!rateLimit(`lead:${await clientIp()}`, MAX_PER_HOUR, 60 * 60)) {
    return {
      ok: false,
      message: "Sie haben bereits mehrere Anfragen gesendet. Bitte versuchen Sie es später erneut.",
    };
  }

  // 2. Validate
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Bitte prüfen Sie Ihre Angaben.", fieldErrors };
  }

  // 3. Send to email/WhatsApp. The messages are the only record (no database), so if
  // every channel fails the seller must know: their entries stay in the form and they can retry.
  try {
    await sendLeadNotification(toLeadSummary(parsed.data));
  } catch (error) {
    console.error("submitLead: notification failed", error instanceof Error ? error.message : error);
    return {
      ok: false,
      message: "Das hat leider nicht geklappt. Bitte versuchen Sie es in einer Minute erneut.",
    };
  }
  return { ok: true };
}

/**
 * The honeypot is filled: a bot, unless the value is one of the seller's own
 * entries, which means browser autofill copied it there (a real person).
 */
function isBot(honeypot: string | undefined, values: unknown): boolean {
  const filled = honeypot?.trim().toLowerCase();
  if (!filled) return false;
  const own =
    values && typeof values === "object"
      ? Object.values(values).filter((v): v is string => typeof v === "string").map((v) => v.trim().toLowerCase())
      : [];
  return !own.includes(filled);
}
