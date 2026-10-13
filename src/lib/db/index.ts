import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb() {
  // prepare: false keeps it compatible with Neon's pooled (PgBouncer) connection string.
  const client = postgres(env().DATABASE_URL, { prepare: false, max: 5 });
  return drizzle(client, { schema, casing: "snake_case" });
}

// Reuse one client across hot reloads in dev and across invocations in a warm function.
const globalForDb = globalThis as unknown as { db?: Db };

export function db(): Db {
  globalForDb.db ??= createDb();
  return globalForDb.db;
}

export { schema };
