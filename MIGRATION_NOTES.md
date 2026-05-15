# MIGRATION_NOTES.md — Supabase → Turso Auth Port

> **Agent 1 deliverable.** Audit only. No Turso work performed. Branch handed off to Agent 2.
> Generated 2026-05-15.

---

## ⚠️ READ THIS FIRST — the clone does not match the brief's premise

The Agent 2 brief assumes a working app with live Supabase **Google + Apple** OAuth. The
actual clone does **not** match that. Three premise-breaking facts:

1. **The repo is a static HTML mirror, not a running app.** Root `package.json` is named
   `davincidynamics-migration-preview`, has **zero dependencies**, and its only script is
   `node scripts/build-manus-mirror.mjs`. `vercel.json` builds a static mirror
   (`mirror/index.html`, output `dist/public`, SPA rewrite to `/index.html`). `pnpm install`
   at root is a no-op. The last commit is literally *"Simplify repo for static Vercel mirror deploy."*
2. **All Supabase/auth code is archived, not live.** Every Supabase touchpoint lives inside
   the dot-prefixed `/.backup-main-clean/` directory (a frozen snapshot of the pre-mirror
   app). Nothing in the deployed tree imports Supabase or runs auth.
3. **There is no Apple OAuth anywhere.** The only OAuth provider in the code is **Google**.
   The brief's Apple OAuth path, and Louis's note about regenerating the Apple JWT client
   secret, have no corresponding code. Auth methods that *do* exist: Google OAuth,
   email/password, and magic-link (email OTP).

**Open question for Agent 2 / Louis (blocking):** What is the real migration target — restore
`.backup-main-clean/` to the live tree and port that, or is there a different repo/branch that
holds the actual running app? Porting auth into a static mirror has no effect until the app
itself is restored. See "Open questions" at the bottom.

---

## 1. Branch

- Created: `migration/supabase-to-turso` (off `main` @ `1de30e1` — *"Simplify repo for static Vercel mirror deploy"*, 2026-03-22).
- Remote branches present: `origin/main`, `origin/backup-before-vercel-migration`,
  `origin/migration-work` (already merged into main via `11615e4`).

## 2. Upstream lineage (git / supabase / vercel)

- **Git origin:** `https://github.com/kbakes40/5star-hookah-clone` (public, default `main`,
  last pushed 2026-03-22). No non-`origin` upstream remote configured.
- **Provenance:** History shows a Manus ("DaVinci") site mirrored for a **Vercel** migration
  (`bf27c3d Mirror Manus DaVinci site for Vercel migration`), with a `migration-work` branch
  merged in. The app it mirrors used **Supabase** for auth + order data (commits
  `5aeeb57`/`a5843b9` "migrate ... to Supabase for order pipeline").
- **Vercel:** `vercel.json` is a static-mirror config (`framework: null`, build =
  `build-manus-mirror.mjs`). The specific Vercel **project** this branch should deploy to is
  **not determinable from the repo** — flagged for Louis (brief's "Notes for Louis" #1).
- A bare backup also exists locally at `~/5star-hookah-clone-backup.git` (not inspected).

## 3. Supabase touchpoints (file : line)

All under `/.backup-main-clean/`. 9 files:

**Client (`client/src/`)**
- `lib/supabase.ts` — browser client. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
  `flowType: "implicit"`, `detectSessionInUrl`, `persistSession`, `autoRefreshToken`.
- `lib/SupabaseAuthProvider.tsx` — React auth context. Methods: `signInWithGoogle`,
  `signInWithEmail`, `signUpWithEmail`, `signInWithMagicLink`, `signOut`/`logout`, `refresh`.
  `getSession()` + `onAuthStateChange()` subscription. **(this is the shim target for Agent 2)**
- `main.tsx:2,19` — bootstraps `supabase.auth.getSession()` on load.

**Server (`server/`)**
- `_core/supabaseAdmin.ts` — service-role admin client + `verifySupabaseToken(token)`
  (calls `supabaseAdmin.auth.getUser`). Env: `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `_core/context.ts:3,31-40` — tRPC context: verifies bearer token via
  `verifySupabaseToken`, maps to local user via `db.getUserByOpenId(supabaseUser.id)`.
- `_core/env.ts:9-10` — central env: `supabaseUrl`, `supabaseServiceRoleKey`.
- `stripe.ts` — `supabaseAdmin.from("bh_orders" / "bh_customers")` for the order pipeline (**data, not auth** — out of Agent 2 scope but coupled).
- `adminRouter.ts` — `supabaseAdmin.from("bh_orders" / "bh_customers" / "bh_products" / "bh_store_settings")` (**data, not auth**).

> Note: Supabase is used for **both auth and primary data** (`bh_*` tables). The brief scopes
> Agent 2 to auth only. Stripe/admin data paths still depend on Supabase Postgres and are
> *not* covered by the Turso auth port. Flag this coupling before any cutover.

## 4. Environment variables in use

No `.env`, `.env.example`, or `.env.*` file exists anywhere in the repo (root or backup).
Variables referenced in code:

| Var | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client `supabase.ts`, server `supabaseAdmin.ts`, `env.ts` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client `supabase.ts` | Public anon key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | server `supabaseAdmin.ts`, `env.ts` | Service role (JWT verify, admin RLS bypass) |
| `DATABASE_URL` | `drizzle.config.ts` | Drizzle connection — **dialect is `mysql`** |
| `OAUTH_SERVER_URL` | server `_core/sdk.ts` | Legacy OAuth server URL (warns if unset) |

No `GOOGLE_CLIENT_ID/SECRET`, no `APPLE_*`, no OAuth redirect-URL constants are committed —
OAuth provider config is held in the Supabase dashboard, not the repo.

## 5. Auth flow summary

**Google OAuth (only OAuth provider that exists):**
`signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: "google",
options: { redirectTo: ${origin}/auth/callback, queryParams: { access_type: "offline",
prompt: "consent" } } })`. Provider callback is handled by **Supabase's own domain**; the app
only receives the post-exchange session at the SPA route **`/auth/callback`** (implicit flow,
token in URL fragment, `detectSessionInUrl`).

> ⚠️ The brief's assumed callback paths `/api/auth/callback/google` and
> `/api/auth/callback/apple` **do not exist** in this codebase. Real redirect target is the
> single SPA path `/auth/callback`. Any Turso-native OAuth will need its own callback route
> built from scratch (Supabase was doing the OAuth exchange server-side on its domain).

**Apple OAuth:** ❌ Not implemented. No `provider: "apple"`, no Apple keys, no Apple route.

**Email/password:** `signInWithPassword` / `signUp` (redirect `/auth/callback`).
**Magic link:** `signInWithOtp({ shouldCreateUser: true })` (redirect `/auth/callback`).
**Server verification:** bearer token → `verifySupabaseToken` → `supabaseAdmin.auth.getUser`
→ map to local user by `openId` (= Supabase user id) in tRPC context.

## 6. Drizzle / DB note (impacts Agent 2)

`drizzle.config.ts` is configured for **`dialect: "mysql"`** against `DATABASE_URL`, schema at
`./drizzle/schema.ts`, with existing migrations in `/drizzle`. Turso is **libSQL/SQLite**.
The "repo already uses Drizzle so Turso drops in" assumption is **false** — Agent 2 must add a
separate SQLite/libSQL Drizzle setup (or use `@libsql/client` directly per the brief) rather
than reuse the MySQL config.

## 7. Schema snapshot status

`supabase-schema-snapshot.sql` was created but the live dump is **BLOCKED**: no Supabase URL,
anon key, or service-role key is present anywhere in the repo or environment, so the
`information_schema` query in the brief cannot be executed. The file contains: (a) the exact
inspection query to run once credentials are available, and (b) the schema **inferred from
code** (`auth.users` shape Supabase provides; app tables `bh_orders`, `bh_customers`,
`bh_products`, `bh_store_settings`). Louis/Agent 3 must run the real dump with the service-role key.

---

## Open questions for Agent 2 / Louis

1. **Blocking — what is the migration target?** The clone is a static mirror; auth code is
   archived in `/.backup-main-clean/`. Restore the backup to the live tree first, or point
   the migration at a different repo/branch that holds the running app?
2. **Apple OAuth does not exist.** The brief, schema (`provider 'google'|'apple'`), and
   Louis's Apple-JWT note assume it. Drop Apple from scope, or is it a net-new feature?
3. **Supabase also owns primary data** (`bh_*` tables via Stripe/admin routers). Auth-only
   Turso port leaves the app split across two backends. Confirm that's intended for the
   dual-write phase.
4. **Drizzle is MySQL, not SQLite.** Confirm Agent 2 should add a parallel libSQL setup
   rather than touch the existing MySQL Drizzle config.
5. **Vercel project** for deploying this branch is undetermined from the repo (brief's Louis
   note #1 stands).
6. **Supabase credentials** needed to produce the real schema snapshot — currently absent.

## Handoff

Agent 1 scope complete: clone, branch, install (no-op), full Supabase/auth audit, lineage,
schema-snapshot scaffold. **STOP — no Turso provisioning or code changes performed.**
Agent 2 should resolve open question #1 before writing any shim, because the target codebase
is not currently in the deployable tree.

---

# Phase A complete — Agent 2 handoff

> Generated 2026-05-15 by Agent 2. Branch: `feat/authnet-replace-stripe`.
> Agent 1's blocking open-question #1 was **resolved before Phase A started**: commit
> `759d190 chore(migration): restore canonical tree from .backup-main-clean` restored
> `api/ client/ server/ shared/` to the live tree and `package.json` is now the full
> `5star-hookah-clone` app (not the zero-dep static mirror Agent 1 audited). Step 1
> precondition satisfied.

## What Phase A delivered (autonomous, done)

**Step 1 — Branch state:** On `feat/authnet-replace-stripe`, canonical tree intact
(`api/ client/ server/ shared/`), `MIGRATION_NOTES.md` + `STRIPE_REMOVAL_NOTES.md` present.
Repo uses **pnpm** (not npm) — all dep work used pnpm to preserve the lockfile.

**Step 4 — Dependencies installed (pnpm):**
- `@auth/core@0.34.3` ✅
- `@libsql/client@0.17.3` ✅
- `@auth/drizzle-adapter@1.11.2` ✅ — **see Deviation 1 below**
- `drizzle-orm@^0.44.5` / `drizzle-kit@^0.31.4` already present (libSQL dialect built in)
- `mysql2` retained (Phase B may need it to dump the MySQL store) — mark for later removal

**Step 5 — Unified Turso schema:**
- New file `drizzle/schema-turso.ts` — all 10 tables exactly per brief (users, accounts,
  sessions, verification_tokens, orders, customers, products, store_settings,
  payment_transactions, webhook_events). Text UUIDs (Decision 5), unix-epoch integer
  timestamps (Decision 6), Stripe columns renamed not dropped (Decision 2:
  `paymentTransactionId` / `paymentSessionId`). Legacy `drizzle/schema.ts` (MySQL)
  **kept untouched** — the brief's explicit escape hatch — so existing Supabase/Stripe/
  tRPC code keeps compiling (see Deviation 2).
- New file `drizzle.turso.config.ts` (dialect `turso`, out `drizzle/migrations`),
  separate from the legacy MySQL `drizzle.config.ts` so existing migrations + config are
  untouched (Hard Stop compliance).
- Migration generated: `drizzle/migrations/0000_lush_crystal.sql` (10 tables, composite
  PKs + FK actions verified). **`drizzle-kit push` NOT run** — gated on Turso creds.

**Step 6 — Auth.js wiring:**
- New file `server/auth.ts`: `@auth/core` framework-agnostic `Auth()` handler + Express↔Web
  bridge, `@auth/drizzle-adapter` over a `drizzle-orm/libsql` client, providers Google +
  Apple, `session.strategy: "database"`, `basePath: "/api/auth"`, `trustHost: true`.
  Lazy + env-guarded: with placeholder `TURSO_*` it returns HTTP 503 instead of crashing
  boot (Step 8 startup-safety requirement).
- Mounted `app.all("/api/auth/*", authHandler)` in **both** `server/_core/index.ts` (dev)
  and `api/index.ts` (Vercel), placed **before** `express.json()` so POST signin/signout/
  csrf bodies reach Auth.js raw (same pattern as the existing Stripe webhook). Added
  `authHandler` to `server/_vercel_exports.ts`.
- **tsc:** baseline was **54 errors before Phase A; still exactly 54 after** (verified by
  stashing all Phase A changes and re-running `pnpm check`). Phase A code adds **zero**
  new type errors. The 54 are pre-existing Manus-SDK leftovers (`forgeApiUrl`,
  `oAuthServerUrl`, Stripe `shipping_details`, and the build-time-only `./_server.mjs`
  import) from the static-mirror simplification — out of Phase A scope, not touched.

## Deviations from the brief (surfaced, not silent)

1. **Auth adapter package substituted (Louis-approved 2026-05-15).** Brief locked Decision 1
   names `@auth/core` + `@auth/libsql-adapter`. **`@auth/libsql-adapter` does not exist on
   npm** (HTTP 404 confirmed directly against `registry.npmjs.org`). Louis chose
   `@auth/drizzle-adapter@1.11.2` over a `drizzle-orm/libsql` client — fully consistent
   with the brief's own locked Decision 4 (keep Drizzle, point it at libSQL). Our
   `schema-turso.ts` table/column property names match the adapter's expected shape exactly.
2. **Legacy MySQL `drizzle/schema.ts` kept (escape hatch taken).** Replacing it in place
   would break `server/db.ts` (`drizzle-orm/mysql2`, `onDuplicateKeyUpdate`) and the
   Supabase/Stripe code that imports the MySQL `User`/`users` types — all of which the Hard
   Stops forbid touching and Step 8 needs to keep compiling. Step 5's parenthetical
   explicitly permits a separate `schema-turso.ts`.
3. **tRPC session-check swap deferred to Phase B.** Step 6's prose says to replace the
   Supabase tRPC middleware check with Auth.js; the **Hard Stops** say "Do NOT touch
   Supabase code in this phase." The Hard Stop wins. `server/_core/context.ts` and
   `supabaseAdmin.ts` are **untouched**; Auth.js is purely additive. Phase B does the cutover.
4. **No CHECK constraint on `orders.payment_method`.** Decision 2's prose wants
   `text check in ('authnet','zelle','paypal')`, but the brief's literal schema code block
   (which Step 5 says to implement as-is) has only a comment, no `check()`. Implemented the
   literal code block; constraint can be added in Phase B if Louis wants it enforced at DB.

## Env vars — status

`AUTH_SECRET`: **not yet generated/stored** — deferred to the gated `vercel env add` step
to avoid leaving an unmanaged secret on disk. Generate at that time with:
`openssl rand -base64 32`.

All other env vars (`TURSO_*`, `AUTHNET_*`, `GOOGLE_*`, `APPLE_*`, `NEXT_PUBLIC_SITE_URL`,
`AUTH_URL`) are **not set** — Step 7 is gated (see blockers). No Supabase / Stripe / MySQL
`DATABASE_URL` vars were added anywhere.

## Phase A steps NOT completed — and why (all environment/credential-gated)

- **Step 2 (Vercel link):** `vercel` CLI v50.37.3, **not logged in**; `vercel whoami`
  failed with `ETIMEDOUT` to `api.vercel.com`. No `.vercel/project.json` exists. Needs
  Louis to resolve network + `vercel login`, then link under `kevin-7816s-projects`.
  (Agent 3 may do this in parallel — coordinate.)
- **Step 3 (Turso DB):** `turso` CLI installed (v1.0.19) but **not logged in**.
  `turso auth login` opens a browser — **Louis must click Authorize**. Then
  `turso db create 5star-hookah --location ord`.
- **Step 7 (env vars):** gated on Step 2 (needs `vercel` authenticated) + Louis's real
  credential values.
- **Step 8 (preview deploy):** gated on Step 2. **Additional blocker:** `vercel.json` is
  STILL the static-mirror config (`framework: null`,
  `buildCommand: node scripts/build-manus-mirror.mjs`, SPA rewrite `/(.*)` → `/index.html`).
  It does **not build or route** the serverless `api/index.ts`, so `/api/auth/*` would be
  rewritten to `index.html` even after a successful deploy. Converting static-mirror →
  app-build is an infra decision **owned by Agent 3 / Louis**, deliberately out of Phase A
  code scope (not unilaterally changed to avoid colliding with Agent 3's Vercel work).

## Phase B blockers (verbatim — what Louis must supply)

- **Supabase** project ref + DB connection string for the canonical project (`bh_*` tables)
- **MySQL** Drizzle `DATABASE_URL` (for inspection — port may be skippable if MySQL is
  fully vestigial)
- **Google OAuth** client ID + secret (redirect URI
  `https://www.bosshookah1.com/api/auth/callback/google` once domain is live, or the
  preview URL for now)
- **Apple OAuth** Services ID + key (redirect URI same pattern). NOTE: Agent 1 found no
  Apple OAuth anywhere in the prior codebase — this is **net-new**; confirm it's in scope.
- Confirmation that the **screenshot-exposed Authorize.net Signature Key was regenerated**
  before it's pasted via `vercel env add`
- Decision: convert `vercel.json` from static-mirror to an app build so `/api/auth/*` and
  tRPC actually serve (blocks any functional verification of the Auth.js wiring)
- Vercel: working network + `vercel login` + confirm clean project under
  `kevin-7816s-projects`; Turso: `turso auth login` (browser authorize)
