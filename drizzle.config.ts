import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

// Next.js reads .env.local itself; drizzle-kit does not, so load it here.
if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
