import { timingSafeEqual } from "node:crypto";

import { retryFailedNotifications } from "@/lib/notifications";

// Called once a day by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>"; anything else is rejected.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await retryFailedNotifications());
}
