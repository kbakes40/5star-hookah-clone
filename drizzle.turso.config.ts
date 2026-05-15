import { defineConfig } from "drizzle-kit";

/**
 * Dedicated Turso/libSQL Drizzle config (Phase A).
 *
 * Kept SEPARATE from the legacy `drizzle.config.ts` (MySQL) so the existing
 * MySQL migrations under `./drizzle/*.sql` and the old config remain untouched
 * (Phase A Hard Stop: do NOT run drizzle-kit push against any existing database;
 * do NOT delete Agent 1 artifacts).
 *
 * Generate (no DB required):  pnpm exec drizzle-kit generate --config drizzle.turso.config.ts
 * Push (requires Turso creds): pnpm exec drizzle-kit push --config drizzle.turso.config.ts
 */
export default defineConfig({
  schema: "./drizzle/schema-turso.ts",
  out: "./drizzle/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
