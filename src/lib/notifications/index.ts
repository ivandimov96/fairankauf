import "server-only";

import { notificationChannels } from "./config";
import type { LeadSummary } from "./format";
import { createProvider } from "./providers";

const RETRY_DELAYS_MS = [1_000, 3_000];

/**
 * Sends the new lead to every configured channel (email, WhatsApp, Telegram) at
 * the same time, each with up to 3 tries. Succeeds when at least one channel
 * delivered; failures of the others are logged. Throws only when nothing got
 * through. There is no database, so the caller must then tell the seller to try again.
 */
export async function sendLeadNotification(
  lead: LeadSummary,
  delays: number[] = RETRY_DELAYS_MS,
  source: Record<string, string | undefined> = process.env,
): Promise<void> {
  const setups = notificationChannels(source);
  const results = await Promise.allSettled(
    setups.map((s) => (s.ok ? sendWithRetry(createProvider(s.config), lead, delays) : Promise.reject(new Error(s.error)))),
  );
  const errors = results.flatMap((r) => (r.status === "rejected" ? [describe(r.reason)] : []));
  if (errors.length === results.length) throw new Error(errors.join(" | "));
  for (const e of errors) console.error("sendLeadNotification: one channel failed:", e);
}

async function sendWithRetry(provider: ReturnType<typeof createProvider>, lead: LeadSummary, delays: number[]) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await provider.sendNewLead(lead);
    } catch (error) {
      const delay = delays[attempt];
      if (delay === undefined) throw new Error(`${provider.name}: ${describe(error)}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function describe(error: unknown) {
  // fetch() reports network problems as "fetch failed" with the real reason in `cause`.
  const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : "";
  return (error instanceof Error ? error.message : String(error)) + cause;
}
