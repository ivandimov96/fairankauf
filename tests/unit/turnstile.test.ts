import { describe, expect, it, vi } from "vitest";

import { verifyTurnstile } from "@/lib/turnstile";

describe("verifyTurnstile", () => {
  it("posts token, secret and IP and accepts success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ success: true }));
    expect(await verifyTurnstile("tok", "sec", "1.2.3.4", fetchMock)).toBe(true);
    const body = fetchMock.mock.calls[0]![1].body as URLSearchParams;
    expect(Object.fromEntries(body)).toEqual({ secret: "sec", response: "tok", remoteip: "1.2.3.4" });
  });

  it("rejects a failed or missing token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ success: false, "error-codes": ["invalid-input-response"] }));
    expect(await verifyTurnstile("bad", "sec", undefined, fetchMock)).toBe(false);
    expect(await verifyTurnstile(undefined, "sec", undefined, fetchMock)).toBe(false);
  });

  it("lets the seller through when Cloudflare is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    expect(await verifyTurnstile("tok", "sec", undefined, fetchMock)).toBe(true);
  });
});
