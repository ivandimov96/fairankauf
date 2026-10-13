import "server-only";

import { and, eq, gt } from "drizzle-orm";

import { db, schema } from "@/lib/db";

import { notificationConfig } from "./config";
import type { LeadSummary } from "./format";
import { createProvider } from "./providers";

const RETRY_DELAYS_MS = [1_000, 3_000];

/**
 * Sends the new-lead WhatsApp message and records the outcome on the lead.
 * Tries up to 3 times. Never throws: the lead is already saved, and a failure
 * only sets FAILED (the daily cron job tries those again).
 */
export async function notifyNewLead(leadId: string): Promise<"SENT" | "FAILED"> {
  const leads = schema.leads;
  try {
    const [lead] = await db().select().from(leads).where(eq(leads.id, leadId));
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    await sendWithRetry(lead);

    await db().update(leads).set({ notificationStatus: "SENT", notificationError: null }).where(eq(leads.id, leadId));
    return "SENT";
  } catch (error) {
    const message = describe(error);
    console.error(`notifyNewLead(${leadId}) failed:`, message);
    try {
      await db()
        .update(leads)
        .set({ notificationStatus: "FAILED", notificationError: message.slice(0, 1000) })
        .where(eq(leads.id, leadId));
    } catch (dbError) {
      console.error("notifyNewLead: could not record failure", dbError);
    }
    return "FAILED";
  }
}

/** Re-sends every FAILED notification from the last 7 days. Used by the cron route. */
export async function retryFailedNotifications() {
  const leads = schema.leads;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const failed = await db()
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.notificationStatus, "FAILED"), gt(leads.createdAt, since)));

  let sent = 0;
  for (const { id } of failed) if ((await notifyNewLead(id)) === "SENT") sent++;
  return { failed: failed.length, sent };
}

async function sendWithRetry(lead: LeadSummary) {
  const provider = createProvider(notificationConfig());
  for (let attempt = 0; ; attempt++) {
    try {
      return await provider.sendNewLead(lead);
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) throw error;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function describe(error: unknown) {
  // fetch() reports network problems as "fetch failed" with the real reason in `cause`.
  const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : "";
  return (error instanceof Error ? error.message : String(error)) + cause;
}
