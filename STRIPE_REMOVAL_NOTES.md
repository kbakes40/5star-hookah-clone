# STRIPE_REMOVAL_NOTES.md — Phase 1 audit (Stripe → Authorize.net)

> Phase 1 deliverable per the "Replace Stripe with Authorize.net" brief. **Audit only —
> nothing deleted.** Generated 2026-05-15 on branch `feat/authnet-replace-stripe`
> (branched from `migration/supabase-to-turso`, which carries the restored canonical tree).

---

## ⚠️ Conflict between the two source docs — resolved

- `authnet-integration-handoff.md` (located at
  `~/Websites/bosshookahclonethehookahshop/authnet-integration-handoff.md`, read end-to-end)
  explicitly lists **"Removing or rewriting the existing Stripe code"** as *out of scope*
  ("just disconnect it from the button … keep its server code in place, no deletions").
- The current brief **overrides** this: *"This brief is the source of truth for what's
  different here — namely, Stripe must be removed first."*
- **Resolution:** brief wins on Stripe removal (Phase 3). Handoff doc remains authoritative
  for the Authorize.net wiring **architecture** (Accept.js, official `authorizenet` SDK,
  `checkout.chargeAuthNet` tRPC procedure, server-side amount recompute, reuse orders table
  with no new column). Phase 2 still follows the handoff doc exactly.

## ⚠️ Two parallel order systems in this repo (not the handoff doc's repo)

This codebase is **not** identical to the handoff doc's reference repo. It has **two** order
stores, and Stripe only touches one of them:

| System | Store | Written by | Uses Stripe? |
|---|---|---|---|
| A | **Supabase** `bh_orders` / `bh_customers` (via `supabaseAdmin`) | `server/stripe.ts` webhook handler | **Yes — Stripe-only** |
| B | **MySQL Drizzle** `orders` table (via `server/db.ts`) | Zelle path + `storeRouter` | **No** — but reuses Stripe-*named* columns |

Consequence for Phase 3: the Supabase-side Stripe code/route/env is genuinely Stripe-only and
removable. The **Drizzle `orders` Stripe-named columns are NOT Stripe-only** — see "DB" below.

---

## 1. Files importing `stripe` / `@stripe/*`

| File | What it is | Phase 3 disposition |
|---|---|---|
| `server/stripe.ts` | Stripe SDK init + `createCheckoutSession()` (hosted Checkout) + `handleWebhookEvent()` → writes to Supabase `bh_orders`/`bh_customers` | **DELETE (Stripe-only)** |
| `server/checkoutRouter.ts` | tRPC `checkout.createSession` → `createCheckoutSession` | **KEEP file** (Phase 2 adds `checkout.chargeAuthNet` here); gut/remove the Stripe `createSession` procedure |
| `server/_core/index.ts` (≈L33–60) | Mounts `POST /api/stripe/webhook` w/ `express.raw` before `express.json()` | Remove the Stripe webhook block; **preserve the raw-body-before-json ordering note** |
| `api/index.ts` (L5, L9–29) | Vercel serverless entry; imports `stripe, handleWebhookEvent, ENV` from `./_server.mjs`; mounts same `/api/stripe/webhook` | Remove Stripe import + webhook block |
| `server/_vercel_exports.ts` (L4) | `export { stripe, handleWebhookEvent } from "./stripe"` | **DELETE that export line** |
| `server/_core/env.ts` (L6–7) | `stripeSecretKey`, `stripeWebhookSecret` in typed `ENV` | Remove the two keys |
| `package.json` | dep `"stripe": "^20.3.0"` (no `@stripe/stripe-js`/`@stripe/react-stripe-js` — no client Elements) | `pnpm remove stripe` in Phase 3 |

No client-side Stripe SDK exists (the Credit Card button uses a **hosted Stripe Checkout
redirect**, not Stripe Elements/Payment Intents).

## 2. API routes handling Stripe

- `POST /api/stripe/webhook` — defined **twice**: `server/_core/index.ts` (local Express
  server) and `api/index.ts` (Vercel serverless). Both verify `stripe-signature` via
  `stripe.webhooks.constructEvent` with `ENV.stripeWebhookSecret`, call
  `handleWebhookEvent`. Handles: `checkout.session.completed`,
  `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
  **Stripe-only — remove both in Phase 3.**
- tRPC `checkout.createSession` (`server/checkoutRouter.ts`) — creates the hosted Stripe
  Checkout session. Triggered by the cart's Credit Card button. **Phase 2 replaces what the
  button calls; Phase 3 removes this procedure.** Per handoff doc step 7, the old mutation
  may be kept defined-but-unreferenced during Phase 2 (`void stripeMutation;`), then deleted
  in Phase 3.

## 3. UI components rendering Stripe

- `client/src/components/CartDrawer.tsx:244` — `// Stripe checkout`; the **Credit Card
  button** invokes the `checkout.createSession` tRPC mutation and redirects to Stripe's
  hosted page. **This is the exact button Phase 2 rewires to the Accept.js modal.**
- `client/src/pages/CheckoutSuccess.tsx:60` — cosmetic: renders `Stripe Session: {orderId}`.
  Relabel in Phase 3 (no logic).
- No Stripe Elements / `loadStripe` / PaymentIntent client code anywhere.

## 4. DB columns / tables tied to Stripe

**Supabase (System A — true Stripe surface, written by `server/stripe.ts`):**
- `bh_orders`: `stripe_session_id`, `stripe_payment_intent`, `payment_method` (`'stripe'`)
- `bh_customers`: `stripe_customer_id`
- Per handoff doc persistence rule these columns are **REUSED, not dropped**:
  `stripe_payment_intent` ← Authnet `transId`, `stripe_session_id` ← internal invoice id,
  `payment_method` ← `"authnet"`, plus a `payment_metadata` JSON blob. **No new column.**

**MySQL Drizzle `orders`/`users` (System B — NOT Stripe-only; DO NOT DROP):**
- `drizzle/schema.ts`: `users.stripeCustomerId`; `orders.stripePaymentIntentId`
  (**NOT NULL UNIQUE**), `orders.stripeCheckoutSessionId`, `orders.customerName`,
  `orders.paymentMethod` enum `["stripe","zelle"]` default `"stripe"`.
- ⚠️ **These columns are reused by the Zelle path** — `server/checkout.zelle.test.ts`
  inserts `orders` rows with `stripePaymentIntentId: "zelle_test_*"`, and
  `server/storeRouter.ts:43–59` queries orders by `stripeCheckoutSessionId`. The column
  name is Stripe-flavored but it's a **generic payment-ref column** (exactly the pattern the
  handoff doc relies on). **Dropping any of these breaks Zelle + the checkout-success
  lookup.** Phase 3 schema cleanup must NOT drop them — at most rename later (separate task)
  and widen the `paymentMethod` enum to include `"authnet"`.
- Drizzle migrations referencing stripe: `drizzle/0001_luxuriant_roughhouse.sql`,
  `drizzle/0008_broken_ultimates.sql` (historical — do not rewrite history).

**Peripheral (verified, NOT Stripe-coupled):** `server/admin.test.ts` (just sets
`stripeCustomerId: null`), `server/adminRouter.ts` (no Stripe). Safe to leave.

## 5. Env vars referenced

- `STRIPE_SECRET_KEY` — `server/_core/env.ts:6` (used in `server/stripe.ts`)
- `STRIPE_WEBHOOK_SECRET` — `server/_core/env.ts:7` (used in both webhook mounts)
- No client publishable key (hosted-redirect model → none exists).
- No `.env` / `.env.example` in the repo. `.gitignore` correctly ignores `.env*`
  (lines 11–15, 109). Phase 2 must create `.env.example` with **blank** Authnet placeholders
  only (handoff doc §"Env vars").

## 6. Out-of-scope confirmations (per brief + handoff doc)

- ❌ No webhook wiring in the Stripe-replacement pass (Authnet webhooks = separate brief).
- ❌ No void/refund flow. **Risk:** Stripe's `charge.refunded`/`payment_intent.*` webhook
  handlers are being removed and Authnet has no refund flow in scope → after Phase 3 there is
  **no programmatic refund/void path at all**. Flag for Louis.
- ❌ Subscriptions/recurring billing: **none found** in this codebase (no Stripe
  subscription/customer-portal code). Nothing to migrate.
- ❌ Live-mode portal flip = Louis only.

## 7. Open items / blockers for Phase 2+

1. **Auth library** (Lucia vs Auth.js vs custom) for the Supabase→Turso auth port — still
   unanswered from the prior round. Independent of Stripe but blocks the broader migration.
2. **Authnet credentials** (4): `AUTHNET_API_LOGIN_ID`, `AUTHNET_TRANSACTION_KEY`,
   `AUTHNET_SIGNATURE_KEY`, `AUTHNET_PUBLIC_CLIENT_KEY` (+ `AUTHNET_ENVIRONMENT`). Handoff
   doc requires the `authenticateTest` probe to confirm sandbox-vs-production *before* wiring.
   Values come from Louis → Vercel env, never chat. **Signature Key must be regenerated**
   (was screenshot-exposed per the earlier brief).
3. **Persistence target ambiguity:** handoff doc says reuse the orders table the non-Stripe
   methods use. Here that's split — Stripe used Supabase `bh_orders`; Zelle uses Drizzle
   `orders`. And a Supabase→Turso migration is separately in flight. **Confirm which store
   Authnet orders write to** (Supabase `bh_orders` now, or the new Turso DB) before Phase 2
   persistence code.
4. `authorizenet` npm package ships no types + ~28 transitive deps — handoff doc says stop
   and surface if install conflicts with the build.

## Phase 1 status

Audit complete and committed. **STOP — per brief: "Do not proceed to removal until the audit
is committed."** Awaiting go-ahead + the Phase 2 inputs in §7 before Phase 2 (wire Authnet
alongside Stripe). No packages installed, no code changed, nothing deleted.
