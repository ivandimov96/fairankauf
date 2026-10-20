import "server-only";

import nodemailer from "nodemailer";

import type { EmailConfig } from "./config";
import { formatLeadMessage, leadSubject, type LeadSummary } from "./format";

export type MailTransport = { sendMail: (mail: Record<string, unknown>) => Promise<unknown> };

function createTransport(cfg: EmailConfig): MailTransport {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    // A serverless function must not hang on a slow mail server.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

/** Sends the lead as a plain-text email through Ivan's own mailbox (SMTP). */
export async function sendLeadEmail(
  lead: LeadSummary,
  cfg: EmailConfig,
  transport: MailTransport = createTransport(cfg),
): Promise<void> {
  await transport.sendMail({
    from: { name: "FairAnkauf", address: cfg.from },
    to: cfg.to,
    subject: leadSubject(lead),
    text: formatLeadMessage(lead),
    // "Antworten" in the mail client goes straight to the seller when they left an address.
    ...(lead.email ? { replyTo: lead.email } : {}),
  });
}
