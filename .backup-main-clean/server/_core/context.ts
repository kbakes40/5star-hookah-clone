import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySupabaseToken } from "./supabaseAdmin";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Extract the Supabase access token from the Authorization: Bearer header.
 */
function extractBearerToken(req: CreateExpressContextOptions["req"]): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = extractBearerToken(opts.req);
    if (token) {
      const supabaseUser = await verifySupabaseToken(token);
      if (supabaseUser) {
        // Upsert the user in our DB using their Supabase UID as the openId key
        await db.upsertUser({
          openId: supabaseUser.id,
          email: supabaseUser.email,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
        user = (await db.getUserByOpenId(supabaseUser.id)) ?? null;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
