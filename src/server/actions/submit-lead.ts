"use server";

import { db, schema } from "@/lib/db";
import { notifyNewLead } from "@/lib/notifications";
import { leadSchema, toLeadRow } from "@/lib/validation/lead";

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function submitLead(values: unknown): Promise<SubmitLeadResult> {
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Bitte prüfen Sie Ihre Angaben.", fieldErrors };
  }

  let leadId: string;
  try {
    const [lead] = await db()
      .insert(schema.leads)
      .values(toLeadRow(parsed.data, new Date()))
      .returning({ id: schema.leads.id });
    leadId = lead!.id;
  } catch (error) {
    console.error("submitLead: insert failed", error);
    return {
      ok: false,
      message: "Das hat leider nicht geklappt. Bitte versuchen Sie es in einer Minute erneut.",
    };
  }

  // The lead is saved; a failed notification is recorded on the lead (and retried
  // daily by /api/cron/retry-notifications), never shown to the seller.
  await notifyNewLead(leadId);
  return { ok: true };
}

