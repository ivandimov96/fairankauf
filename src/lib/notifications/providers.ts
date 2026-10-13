import { formatLeadMessage, formatTemplateParams, type LeadSummary } from "./format";
import type { NotificationConfig } from "./config";
import type { NotificationProvider } from "./types";

const TIMEOUT_MS = 10_000;
// Meta Graph API version. Versions live ~2 years; bump when Meta deprecates it.
export const GRAPH_API_VERSION = "v23.0";

type Fetch = typeof fetch;

export function consoleProvider(appUrl: string, log: (msg: string) => void = console.log): NotificationProvider {
  return {
    name: "console",
    async sendNewLead(lead) {
      log(`[notification:console]\n${formatLeadMessage(lead, appUrl)}`);
    },
  };
}

/** Free CallMeBot API for personal WhatsApp notifications. https://www.callmebot.com */
export function callmebotProvider(
  cfg: { phone: string; apiKey: string },
  appUrl: string,
  fetchImpl: Fetch = fetch,
): NotificationProvider {
  return {
    name: "callmebot",
    async sendNewLead(lead) {
      const url = new URL("https://api.callmebot.com/whatsapp.php");
      url.searchParams.set("phone", cfg.phone);
      url.searchParams.set("text", formatLeadMessage(lead, appUrl));
      url.searchParams.set("apikey", cfg.apiKey);

      const res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      const body = await res.text();
      // CallMeBot sometimes answers 200 with an error page, so check the text too.
      if (!res.ok || /apikey is invalid|not (yet )?activated|error:/i.test(body)) {
        throw new Error(`CallMeBot ${res.status}: ${summarize(body)}`);
      }
    },
  };
}

/** Official Meta WhatsApp Cloud API, using the approved `new_car_lead` template. */
export function whatsappCloudProvider(
  cfg: { phone: string; token: string; phoneNumberId: string; template: string; lang: string },
  fetchImpl: Fetch = fetch,
): NotificationProvider {
  return {
    name: "whatsapp_cloud",
    async sendNewLead(lead) {
      const res = await fetchImpl(`https://graph.facebook.com/${GRAPH_API_VERSION}/${cfg.phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cloudTemplatePayload(lead, cfg)),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new Error(`WhatsApp Cloud API ${res.status}: ${summarize(await res.text())}`);
      }
    },
  };
}

export function cloudTemplatePayload(
  lead: LeadSummary,
  cfg: { phone: string; template: string; lang: string },
) {
  return {
    messaging_product: "whatsapp",
    to: cfg.phone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: cfg.template,
      language: { code: cfg.lang },
      components: [
        {
          type: "body",
          parameters: formatTemplateParams(lead).map((text) => ({ type: "text", text })),
        },
        {
          // Dynamic URL button "Anfrage öffnen": base URL in the template ends with
          // /admin/leads/ and this parameter supplies the lead id.
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: lead.id }],
        },
      ],
    },
  };
}

export function createProvider(cfg: NotificationConfig, appUrl: string): NotificationProvider {
  switch (cfg.NOTIFICATION_PROVIDER) {
    case "console":
      return consoleProvider(appUrl);
    case "callmebot":
      return callmebotProvider({ phone: cfg.NOTIFY_PHONE, apiKey: cfg.CALLMEBOT_API_KEY }, appUrl);
    case "whatsapp_cloud":
      return whatsappCloudProvider(
        {
          phone: cfg.NOTIFY_PHONE,
          token: cfg.WHATSAPP_CLOUD_TOKEN,
          phoneNumberId: cfg.WHATSAPP_CLOUD_PHONE_NUMBER_ID,
          template: cfg.WHATSAPP_CLOUD_TEMPLATE,
          lang: cfg.WHATSAPP_CLOUD_TEMPLATE_LANG,
        },
      );
  }
}

function summarize(body: string) {
  return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
}
