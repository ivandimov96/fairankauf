import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

import { notificationConfig } from "./config";
import { createProvider } from "./providers";

/**
 * Sends the new-lead notification and records the outcome on the lead.
 * Never throws: the lead is already saved, and a failure only sets FAILED
 * (the admin panel offers "Erneut senden").
 */
export async function notifyNewLead(leadId: string): Promise<"SENT" | "FAILED"> {
  const leads = schema.leads;
  try {
    const [lead] = await db().select().from(leads).where(eq(leads.id, leadId));
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    const provider = createProvider(notificationConfig(), env().APP_URL);
    await provider.sendNewLead(lead);

    await db().update(leads).set({ notificationStatus: "SENT", notificationError: null }).where(eq(leads.id, leadId));
    return "SENT";
  } catch (error) {
    // fetch() reports network problems as "fetch failed" with the real reason in `cause`.
    const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : "";
    const message = (error instanceof Error ? error.message : String(error)) + cause;
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
