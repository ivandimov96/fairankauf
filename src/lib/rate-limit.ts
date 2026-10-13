import "server-only";

import { headers } from "next/headers";

/** The client's IP from the proxy headers (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

const windows = new Map<string, { start: number; count: number }>();

/**
 * Fixed-window counter in memory. Best effort: each serverless instance keeps its
 * own counts and they reset on cold start (there is no database). Enough to stop
 * one visitor from flooding the WhatsApp inbox; the honeypot catches simple bots.
 * Returns true while `key` has made at most `limit` calls in the current window.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number, now = Date.now()): boolean {
  const start = now - (now % (windowSeconds * 1000));
  const entry = windows.get(key);
  if (!entry || entry.start !== start) {
    if (windows.size > 10_000) windows.clear();
    windows.set(key, { start, count: 1 });
    return 1 <= limit;
  }
  entry.count++;
  return entry.count <= limit;
}
