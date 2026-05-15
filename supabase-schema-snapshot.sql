-- supabase-schema-snapshot.sql
-- Agent 1 deliverable. Status: LIVE DUMP BLOCKED.
--
-- Reason: no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
-- is present anywhere in the repo or environment (no .env / .env.example exists).
-- The query below could NOT be executed against the real Supabase project.
-- Louis / Agent 3: run section (1) with the service-role connection, paste the
-- output below the marker, then proceed.

-- ============================================================================
-- (1) RUN THIS against the live Supabase project (psql / SQL editor)
-- ============================================================================
select table_schema, table_name
from information_schema.tables
where table_schema in ('auth','public')
order by 1,2;

-- Also useful for the auth port (column shapes of auth.users):
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'auth' and table_name = 'users'
-- order by ordinal_position;

-- ============================================================================
-- (2) >>> PASTE REAL DUMP OUTPUT BELOW THIS LINE <<<
-- ============================================================================
-- (empty — pending Supabase credentials)


-- ============================================================================
-- (3) Schema INFERRED FROM CODE ONLY (not authoritative — verify against #2)
-- ============================================================================
-- Supabase-managed auth schema (standard Supabase; app reads id + email via
--   supabaseAdmin.auth.getUser / supabase.auth.getSession):
--   auth.users(
--     id uuid primary key,
--     email text,
--     raw_user_meta_data jsonb,        -- provider profile (google)
--     raw_app_meta_data jsonb,         -- { provider: 'google', providers: [...] }
--     created_at timestamptz,
--     last_sign_in_at timestamptz,
--     ...                              -- full Supabase auth.users columns
--   )
--   auth.identities(... provider, provider_id, user_id ...)   -- OAuth identity links
--
-- Application tables referenced via supabaseAdmin.from(...) in
-- .backup-main-clean/server/{stripe.ts,adminRouter.ts} (public schema):
--   public.bh_orders         -- columns seen: status, total_amount,
--                             --   fulfillment_status, customer_email (+ more)
--   public.bh_customers
--   public.bh_products
--   public.bh_store_settings
--
-- Local app user mapping: server context maps Supabase user.id -> local user
-- via db.getUserByOpenId(openId) where openId == Supabase auth.users.id.
-- (Local user table lives in the MySQL Drizzle schema at ./drizzle/schema.ts,
--  dialect mysql — see MIGRATION_NOTES.md §6.)
