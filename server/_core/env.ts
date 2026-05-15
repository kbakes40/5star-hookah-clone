export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  // Supabase
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  // Admin emails - these users will always have admin role
  adminEmail: "kevin@bakerhub.com",
  adminEmails: ["kevin@bakerhub.com", "chillvibesss420@gmail.com"],
  /**
   * Authorize.Net (BOSS HOOKAH merchant via Fiserv/First Data gateway, MCC 5993).
   * Transaction Key is server-secret. API Login ID is also exposed to the client via
   * VITE_AUTHNET_API_LOGIN_ID (Accept.js needs it in the browser; safe per Auth.Net design).
   * Public Client Key is separately client-only (VITE_AUTHNET_PUBLIC_CLIENT_KEY).
   */
  authnetApiLoginId: (process.env.AUTHNET_API_LOGIN_ID ?? "").trim(),
  authnetTransactionKey: (process.env.AUTHNET_TRANSACTION_KEY ?? "").trim(),
  /**
   * HMAC-SHA512 signature key for webhook payload verification. Plumbed here for future
   * webhook work — no handler reads it yet.
   */
  authnetSignatureKey: (process.env.AUTHNET_SIGNATURE_KEY ?? "").trim(),
  /** `production` → api.authorize.net; everything else → sandbox (apitest.authorize.net). */
  authnetEnvironment: (() => {
    const r = (process.env.AUTHNET_ENVIRONMENT ?? "sandbox").trim().toLowerCase();
    if (r === "production" || r === "prod" || r === "live") return "production";
    return "sandbox";
  })() as "sandbox" | "production",
};
