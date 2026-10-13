"use server";

import { db, schema } from "@/lib/db";
import { notifyNewLead } from "@/lib/notifications";
import { clientIp, clientIpHash, rateLimit } from "@/lib/rate-limit";
import { turnstileEnabled, verifyTurnstile } from "@/lib/turnstile";
import { leadSchema, toLeadRow } from "@/lib/validation/lead";

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Spam signals sent alongside the form values. */
export type SubmitMeta = {
  /** Honeypot: a field hidden from people. Bots fill it in. */
  website?: string;
  turnstileToken?: string;
};

const MAX_PER_HOUR = 5;

export async function submitLead(values: unknown, meta: SubmitMeta = {}): Promise<SubmitLeadResult> {
  // 1. Spam checks
  if (meta.website) {
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

  try {
    if (!(await rateLimit(`lead:${await clientIpHash()}`, MAX_PER_HOUR, 60 * 60))) {
      return {
        ok: false,
        message: "Sie haben bereits mehrere Anfragen gesendet. Bitte versuchen Sie es später erneut.",
      };
    }
  } catch (error) {
    // The rate limit must never block a real seller because of a database hiccup.
    console.error("submitLead: rate limit check failed", error);
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

  // 3. Save
  let leadId: string;
  try {
    const [lead] = await db()
      .insert(schema.leads)
      .values(toLeadRow(parsed.data, new Date()))
      .returning({ id: schema.leads.id });
    leadId = lead!.id;
  } catch (error) {
    console.error("submitLead: insert failed", error);
    return {
      ok: false,
      message: "Das hat leider nicht geklappt. Bitte versuchen Sie es in einer Minute erneut.",
    };
  }

  // 4. Notify. The lead is saved; a failed notification is recorded on the lead
  // (and retried daily by /api/cron/retry-notifications), never shown to the seller.
  await notifyNewLead(leadId);
  return { ok: true };
}
