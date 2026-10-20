import "server-only";

import { getNotificationConfig } from "./config";
import { sendLeadEmail } from "./email";
import { formatLeadMessage, type LeadSummary } from "./format";
import { sendLeadWhatsApp } from "./whatsapp";

/**
 * Where a new lead goes: email (SMTP) and WhatsApp (Meta Cloud API), both set up
 * through environment variables (see .env.example and docs/DEPLOY.md). There is no
 * database, so the messages are the only record of a lead.
 *
 * Every configured channel is tried. The lead counts as delivered when at least
 * one of them got it; problems with the others go to the log. When none got it,
 * the full lead is logged and this throws, so the seller sees "please try again"
 * with their entries kept.
 */
export async function sendLeadNotification(lead: LeadSummary): Promise<void> {
  const cfg = getNotificationConfig();
  const jobs: { name: string; run: () => Promise<unknown> }[] = [];
  const problems: string[] = [];

  if (cfg.email.status === "on") {
    const email = cfg.email.config;
    jobs.push({ name: "email", run: () => sendLeadEmail(lead, email) });
  } else if (cfg.email.status === "invalid") {
    problems.push(`email: ${cfg.email.reason}`);
  }

  if (cfg.whatsapp.status === "on") {
    const whatsapp = cfg.whatsapp.config;
    jobs.push({
      name: "whatsapp",
      run: async () => {
        const result = await sendLeadWhatsApp(lead, whatsapp);
        for (const f of result.failures) problems.push(`whatsapp: ${f}`);
      },
    });
  } else if (cfg.whatsapp.status === "invalid") {
    problems.push(`whatsapp: ${cfg.whatsapp.reason}`);
  }

  if (jobs.length === 0 && problems.length === 0) {
    // Nothing configured (local development): the log is the only place the lead goes.
    console.log(`[lead] no channel configured, logging only\n${formatLeadMessage(lead)}`);
    if (process.env.VERCEL_ENV === "production") {
      console.warn("sendLeadNotification: no channel configured, the lead above is only in this log");
    }
    return;
  }

  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  results.forEach((r, i) => {
    if (r.status === "rejected") problems.push(`${jobs[i]!.name}: ${errorMessage(r.reason)}`);
  });
  const delivered = results.filter((r) => r.status === "fulfilled").length;

  if (delivered === 0) {
    // Keep the lead recoverable from the log (Vercel → Logs), then make the seller retry.
    console.error(`[lead] NOT delivered (${problems.join(" | ")}). The lead:\n${formatLeadMessage(lead)}`);
    throw new Error(`lead not delivered: ${problems.join(" | ")}`);
  }
  if (problems.length > 0) {
    console.error(`[lead] delivered via ${delivered} of ${jobs.length} channel(s); problems: ${problems.join(" | ")}`);
  } else {
    console.log(`[lead] delivered via ${jobs.map((j) => j.name).join(", ")}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
