import "server-only";

import { z } from "zod";

// All server env access goes through here. Variables for later phases are
// added as those phases land; .env.example documents every variable.
const schema = z.object({
  DATABASE_URL: z.url(),
  APP_URL: z.url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
  }
  return cached;
}
