import "server-only";

import type { WhatsAppConfig } from "./config";
import { formatTemplateParams, type LeadSummary } from "./format";

// WhatsApp Business Platform (Cloud API) by Meta. A business may only start a
// conversation with an approved message template, so the lead is sent as the
// template WHATSAPP_TEMPLATE_NAME with one parameter per line (see docs/DEPLOY.md).
const GRAPH_API = "https://graph.facebook.com/v22.0";

export type WhatsAppResult = { delivered: number; failures: string[] };

/**
 * Sends the lead to every configured number. Resolves when at least one message
 * went out (the failures are listed in the result); throws when none did.
 */
export async function sendLeadWhatsApp(
  lead: LeadSummary,
  cfg: WhatsAppConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<WhatsAppResult> {
  const params = formatTemplateParams(lead);
  const results = await Promise.allSettled(cfg.to.map((to) => sendTemplate(to, params, cfg, fetchImpl)));
  const failures = results.flatMap((r) => (r.status === "rejected" ? [errorMessage(r.reason)] : []));
  const delivered = results.length - failures.length;
  if (delivered === 0) throw new Error(`WhatsApp: ${failures.join("; ")}`);
  return { delivered, failures };
}

async function sendTemplate(to: string, params: string[], cfg: WhatsAppConfig, fetchImpl: typeof fetch) {
  const res = await fetchImpl(`${GRAPH_API}/${cfg.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: cfg.template,
        language: { code: cfg.language },
        components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = (await res.json()) as { error?: { message?: string } };
      detail = data.error?.message ?? "";
    } catch {
      // No JSON body; the status code has to do.
    }
    // Only the last digits of the number: the log should not spell out phone numbers.
    throw new Error(`HTTP ${res.status} to …${to.slice(-4)}${detail ? ` (${detail})` : ""}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
