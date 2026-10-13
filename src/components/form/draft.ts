import type { LeadFormValues } from "@/lib/validation/lead";

// The form draft lives in localStorage so a reload or a later visit keeps the
// seller's entries. The landing page's quick start writes into the same draft.
export const DRAFT_KEY = "fairankauf:lead-draft:v1";

export type Draft = { step: number; values: Partial<LeadFormValues> };

export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked (private mode): the form still works without it.
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
