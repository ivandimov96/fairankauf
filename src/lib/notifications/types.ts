import type { LeadSummary } from "./format";

export type NotificationProviderName = "console" | "email" | "telegram" | "whatsapp_cloud";

export interface NotificationProvider {
  readonly name: NotificationProviderName;
  /** Sends the new-lead notification. Throws with a readable message on failure. */
  sendNewLead(lead: LeadSummary): Promise<void>;
}
