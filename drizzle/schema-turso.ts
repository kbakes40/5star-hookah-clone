/**
 * Unified Turso (libSQL/SQLite) schema — Phase A target.
 *
 * This is the consolidated processor-agnostic schema per the Agent 2 Phase A brief
 * (auth + orders + customers + products + store settings + payment_transactions +
 * webhook_events). It REPLACES the MySQL schema conceptually, but the legacy
 * `drizzle/schema.ts` (mysql-core) is intentionally kept untouched so the existing
 * Supabase/Stripe/tRPC code keeps compiling until Phase B removes it.
 *
 * Conventions (locked decisions):
 *  - Decision 5: text UUIDs everywhere (libSQL has no native uuid).
 *  - Decision 6: unix epoch integer timestamps (default (unixepoch())).
 *  - Decision 2: Stripe-specific order columns renamed, NOT dropped (Zelle depends on them).
 */
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Auth (Auth.js adapter shape) ───────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  role: text("role").notNull().default("customer"), // 'customer' | 'admin' | 'staff'
  openId: text("open_id"), // preserved from MySQL schema for any external SSO
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(), // 'google' | 'apple'
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ─── Orders (renamed from Stripe-specific columns — Decision 2) ──────
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  paymentTransactionId: text("payment_transaction_id").notNull().unique(),
  paymentSessionId: text("payment_session_id"),
  paymentMethod: text("payment_method").notNull(), // check: in ('authnet','zelle','paypal')
  status: text("status").notNull(),
  fulfillmentStatus: text("fulfillment_status").notNull(),
  items: text("items").notNull(), // JSON string
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  shippingAddress: text("shipping_address"), // JSON string
  notes: text("notes"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

// ─── Customers (ported from Supabase bh_customers) ──────────────────
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").unique().notNull(),
  name: text("name"),
  phone: text("phone"),
  addresses: text("addresses"), // JSON array
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

// ─── Products (ported from Supabase bh_products) ────────────────────
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").unique(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  inventoryQty: integer("inventory_qty").notNull().default(0),
  imageUrl: text("image_url"),
  category: text("category"),
  active: integer("active").notNull().default(1), // 1 = true, 0 = false
  metadata: text("metadata"), // JSON
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

// ─── Store settings (ported from Supabase bh_store_settings) ────────
export const storeSettings = sqliteTable("store_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON string
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

// ─── Payment transactions (Authorize.net + Zelle audit trail) ───────
export const paymentTransactions = sqliteTable("payment_transactions", {
  id: text("id").primaryKey(), // UUID
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  processor: text("processor").notNull(), // 'authnet' | 'zelle' | 'paypal'
  externalId: text("external_id"), // Authnet transaction ID, Zelle confirmation, etc.
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(), // 'pending'|'authorized'|'captured'|'voided'|'refunded'|'declined'
  rawResponse: text("raw_response"), // JSON blob from processor
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});

// ─── Webhook events (Authnet webhook audit trail) ───────────────────
export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(), // event ID from processor
  processor: text("processor").notNull(), // 'authnet'
  eventType: text("event_type").notNull(),
  payload: text("payload").notNull(), // raw JSON
  signatureVerified: integer("signature_verified").notNull().default(0),
  processed: integer("processed").notNull().default(0),
  receivedAt: integer("received_at").notNull().default(sql`(unixepoch())`),
});

// Inferred types for the app layer (Phase B wires these into tRPC routers).
export type TursoUser = typeof users.$inferSelect;
export type InsertTursoUser = typeof users.$inferInsert;
export type TursoOrder = typeof orders.$inferSelect;
export type InsertTursoOrder = typeof orders.$inferInsert;
export type TursoCustomer = typeof customers.$inferSelect;
export type TursoProduct = typeof products.$inferSelect;
export type TursoStoreSetting = typeof storeSettings.$inferSelect;
export type TursoPaymentTransaction = typeof paymentTransactions.$inferSelect;
export type TursoWebhookEvent = typeof webhookEvents.$inferSelect;
