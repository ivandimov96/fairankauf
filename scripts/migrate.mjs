// Applies database migrations (drizzle/). Runs automatically before `next build` on
// Vercel, so a new deployment always has the right tables. Locally it does nothing
// unless you pass --force (use `pnpm db:migrate` locally instead).
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (!process.env.VERCEL && !process.argv.includes("--force")) process.exit(0);

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("migrate: DATABASE_URL is not set. Connect the Neon database to this Vercel project first.");
  process.exit(1);
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
await migrate(drizzle(client), { migrationsFolder: "drizzle" });
await client.end();
console.log("migrate: database is up to date");
