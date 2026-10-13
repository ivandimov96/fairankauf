"use server";

import { db, schema } from "@/lib/db";
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

  try {
    await db().transaction(async (tx) => {
      const [lead] = await tx
        .insert(schema.leads)
        .values(toLeadRow(parsed.data, new Date()))
        .returning({ id: schema.leads.id });
      await tx.insert(schema.statusHistory).values({ leadId: lead!.id, toStatus: "NEU" });
    });
  } catch (error) {
    console.error("submitLead: insert failed", error);
    return {
      ok: false,
      message: "Das hat leider nicht geklappt. Bitte versuchen Sie es in einer Minute erneut.",
    };
  }

  // Phase 3: send the WhatsApp notification here, after the lead is saved.
  return { ok: true };
}

