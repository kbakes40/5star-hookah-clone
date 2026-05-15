/**
 * Auth.js v5 wiring — Phase A scaffolding.
 *
 * Locked decisions implemented:
 *  - Decision 1: Auth.js framework-agnostic mode via `@auth/core` (Vite+Express+tRPC app).
 *    Providers: Google + Apple. Session storage: database sessions in Turso.
 *  - Decision 1 adapter override (approved by Louis 2026-05-15): `@auth/libsql-adapter`
 *    does NOT exist on npm; using `@auth/drizzle-adapter` over a `drizzle-orm/libsql`
 *    client instead — consistent with Decision 4 (keep Drizzle, point it at libSQL).
 *  - Decision 4: Drizzle ORM over libSQL (`drizzle-orm/libsql`) against schema-turso.ts.
 *
 * SCOPE NOTE (Phase A Hard Stop compliance): this module is purely ADDITIVE. The
 * existing Supabase-based tRPC session verification in `server/_core/context.ts`
 * is intentionally left untouched. Swapping tRPC middleware to Auth.js sessions is
 * deferred to Phase B (the "Do NOT touch Supabase code in this phase" Hard Stop
 * overrides Step 6's inline-swap wording). See MIGRATION_NOTES.md.
 *
 * Startup safety: with placeholder TURSO_* / OAuth env values the libSQL client and
 * Auth handler are built lazily and guarded, so a preview deploy does NOT crash on
 * boot (Phase A Step 8 requirement).
 */
import { Auth, type AuthConfig } from "@auth/core";
import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "../drizzle/schema-turso";

const AUTH_BASE_PATH = "/api/auth";

function hasTursoEnv(): boolean {
  const url = process.env.TURSO_DATABASE_URL;
  // libsql accepts libsql://, https://, http://, file:, ws://. Reject obvious placeholders.
  return (
    !!url &&
    !!process.env.TURSO_AUTH_TOKEN &&
    /^(libsql|https?|wss?|file):/i.test(url) &&
    !/placeholder|changeme|TODO/i.test(url)
  );
}

let _authConfig: AuthConfig | null = null;

function getAuthConfig(): AuthConfig {
  if (_authConfig) return _authConfig;

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const db = drizzle(client);

  _authConfig = {
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      Apple({
        clientId: process.env.APPLE_CLIENT_ID!,
        clientSecret: process.env.APPLE_CLIENT_SECRET!,
      }),
    ],
    session: { strategy: "database" },
    secret: process.env.AUTH_SECRET!,
    basePath: AUTH_BASE_PATH,
    // Framework-agnostic mode behind Vercel/preview hostnames — required so
    // Auth.js trusts the X-Forwarded-Host the platform sets.
    trustHost: true,
  };
  return _authConfig;
}

/** Convert an Express request into a Web `Request` for `@auth/core`. */
async function toWebRequest(req: ExpressRequest): Promise<Request> {
  const protocol =
    (req.headers["x-forwarded-proto"] as string)?.split(",")[0] ||
    req.protocol ||
    "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `${protocol}://${host}${req.originalUrl}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach(v => headers.append(key, v));
    else if (value != null) headers.set(key, value);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  // The /api/auth router is mounted BEFORE express.json(), so the raw stream
  // is still intact for POST signin/signout/csrf.
  let body: string | undefined;
  if (hasBody) {
    body = await new Promise<string>((resolve, reject) => {
      let data = "";
      req.on("data", chunk => (data += chunk));
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody && body ? body : undefined,
  });
}

/** Pipe a Web `Response` from `@auth/core` back through Express. */
async function sendWebResponse(
  res: ExpressResponse,
  webRes: Response
): Promise<void> {
  res.status(webRes.status);
  webRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") res.append("set-cookie", value);
    else res.setHeader(key, value);
  });
  const buf = Buffer.from(await webRes.arrayBuffer());
  res.end(buf);
}

/**
 * Express handler for all `/api/auth/*` routes. Mount with:
 *   app.use("/api/auth", authHandler)
 * BEFORE `express.json()` so POST bodies (csrf/signout) reach Auth.js raw.
 */
export async function authHandler(
  req: ExpressRequest,
  res: ExpressResponse
): Promise<void> {
  if (!hasTursoEnv()) {
    // Placeholder env (pre-Phase-B): respond cleanly instead of crashing boot.
    res
      .status(503)
      .json({ error: "auth_unconfigured", detail: "TURSO_* env not set yet (Phase B)" });
    return;
  }
  try {
    const webReq = await toWebRequest(req);
    const webRes = await Auth(webReq, getAuthConfig());
    await sendWebResponse(res, webRes);
  } catch (err) {
    console.error("[Auth.js] handler error:", err);
    res.status(500).json({ error: "auth_handler_error" });
  }
}

export { AUTH_BASE_PATH };
