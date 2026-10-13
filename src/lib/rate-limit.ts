import "server-only";

import { createHash } from "node:crypto";

import { lt, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db, schema } from "@/lib/db";

/** The client's IP from the proxy headers (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** The client's IP, hashed so no raw IP address is stored (GDPR). */
export async function clientIpHash(): Promise<string> {
  const ip = await clientIp();
  const salt = process.env.IP_HASH_SALT || "fairankauf";
  return createHash("sha256").update(`${salt}:${ip}`).digest("base64url").slice(0, 32);
}

/**
 * Fixed-window counter in Postgres, so it works across serverless instances.
 * Returns true while `key` has made at most `limit` calls in the current window.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = new Date(now - (now % (windowSeconds * 1000)));
  const t = schema.rateLimits;

  const [row] = await db()
    .insert(t)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({ target: [t.key, t.windowStart], set: { count: sql`${t.count} + 1` } })
    .returning({ count: t.count });

  // Housekeeping: old windows are useless; keep the table tiny.
  if (Math.random() < 0.05) {
    await db().delete(t).where(lt(t.windowStart, new Date(now - 24 * 60 * 60 * 1000)));
  }

  return (row?.count ?? 1) <= limit;
}
