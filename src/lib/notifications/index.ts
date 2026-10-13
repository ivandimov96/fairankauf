import "server-only";

import { notificationConfig } from "./config";
import type { LeadSummary } from "./format";
import { createProvider } from "./providers";

const RETRY_DELAYS_MS = [1_000, 3_000];

/**
 * Sends the new-lead message. Tries up to 3 times, then throws with a readable
 * message. There is no database, so the caller must tell the seller to try again.
 */
export async function sendLeadNotification(lead: LeadSummary, delays: number[] = RETRY_DELAYS_MS): Promise<void> {
  const provider = createProvider(notificationConfig());
  for (let attempt = 0; ; attempt++) {
    try {
      return await provider.sendNewLead(lead);
    } catch (error) {
      const delay = delays[attempt];
      if (delay === undefined) throw new Error(describe(error), { cause: error });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function describe(error: unknown) {
  // fetch() reports network problems as "fetch failed" with the real reason in `cause`.
  const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : "";
  return (error instanceof Error ? error.message : String(error)) + cause;
}
