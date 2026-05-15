import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[Supabase Admin] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * Supabase admin client — uses the service role key so it can verify JWTs
 * and manage users without RLS restrictions.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify a Supabase JWT access token and return the user's UID and email.
 * Returns null if the token is invalid or expired.
 */
export async function verifySupabaseToken(
  token: string
): Promise<{ id: string; email: string | null } | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
    };
  } catch (err) {
    console.error("[Supabase Admin] Token verification failed:", err);
    return null;
  }
}
