import { afterEach, describe, expect, it, vi } from "vitest";

describe("env()", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("parses valid variables and applies defaults", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://u@localhost:5432/db");
    vi.stubEnv("APP_URL", undefined);
    const { env } = await import("@/lib/env");
    expect(env()).toMatchObject({
      DATABASE_URL: "postgres://u@localhost:5432/db",
      APP_URL: "http://localhost:3000",
    });
  });

  it("throws a readable error when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", undefined);
    const { env } = await import("@/lib/env");
    expect(() => env()).toThrow(/DATABASE_URL/);
  });
});
