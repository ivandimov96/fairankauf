import "server-only";

import { formatLeadMessage, type LeadSummary } from "./format";

/**
 * Where a new lead goes. Ivan removed all channels on 2026-10-14 to start over,
 * so for now the lead is only written to the server log (Vercel → Logs). There
 * is no database either: a lead exists nowhere else until a channel is added here.
 * Throwing makes the seller see "please try again" with their entries kept.
 */
export async function sendLeadNotification(lead: LeadSummary): Promise<void> {
  console.log(`[lead]\n${formatLeadMessage(lead)}`);
  if (process.env.VERCEL_ENV === "production") {
    console.warn("sendLeadNotification: no channel configured, the lead above is only in this log");
  }
}
