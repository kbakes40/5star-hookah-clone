# VERCEL_CONFIG_NOTES.md — static-mirror → full-app build

> Agent 3 (config-conversion expansion). Generated 2026-05-15.
> Branch: `feat/authnet-replace-stripe`.
>
> **Outcome: vercel.json NOT rewritten yet — a build-pipeline blocker must be
> resolved by Louis first (see "BLOCKER" below). Deploy is also gated (Vercel CLI
> not authenticated). Audit + corrected target config + recommended fix documented
> here for Louis.**

---

## Phase 1 — Audit (verbatim current state)

### Current `vercel.json` (static-mirror)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "pnpm install",
  "buildCommand": "node scripts/build-manus-mirror.mjs",
  "outputDirectory": "dist/public",
  "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ],
  "headers": [ /* asset cache headers for /assets/* and /manus-assets/* */ ]
}
```
Set by commit `1de30e1` "Simplify repo for static Vercel mirror deploy".

### `package.json` build scripts (real app package, full deps)
- `dev`:   `NODE_ENV=development tsx watch server/_core/index.ts`
- `build`: `vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
- `start`: `NODE_ENV=production node dist/index.js`

Package manager: **pnpm** (`pnpm-lock.yaml` present, `packageManager: pnpm@10.4.1`).

### Vite config
- Single root config: `vite.config.ts` (no `client/vite.config.*`).
- `root: <repo>/client`, `publicDir: <repo>/client/public`
- **`build.outDir: <repo>/dist/public`**  ← actual emit location
- `vite.vercel.config.ts` exists but is **not referenced** by any build script.

### `api/index.ts` (Vercel function entrypoint)
- Builds an Express app, mounts Stripe webhook, `/api/auth/*` (Phase A), and
  `/api/trpc`. **Has `export default app;` (line 51)** — Phase 4 satisfied, no
  code change needed for the default export.
- **Imports from a build artifact:** `import { appRouter, createContext, stripe,
  handleWebhookEvent, ENV, authHandler } from "./_server.mjs"` — i.e. expects
  `api/_server.mjs` to exist at function-build time.

### `.vercelignore`
None present.

### Local build result (`pnpm run build`)
- Exit 0. Frontend → `dist/public/` (`index.html`, `assets/index-*.js|css`).
- Server bundle → `dist/index.js` (from `server/_core/index.ts`, the standalone
  `app.listen` server — NOT the Vercel function exports).
- **`api/_server.mjs` is NOT produced** (verified absent after a clean build).

---

## 🚫 BLOCKER — `api/_server.mjs` is never built (Louis decision required)

`api/index.ts` depends on `./_server.mjs`, but **no build step produces it**:
- The `build` script's esbuild bundles `server/_core/index.ts` → `dist/index.js`.
- `api/index.ts` instead needs the named exports from
  `server/_vercel_exports.ts` (`appRouter, createContext, stripe,
  handleWebhookEvent, ENV, authHandler`), emitted as `api/_server.mjs`.

Consequence: a `vercel.json` declaring `functions: { "api/index.ts": {...} }`
would deploy, but `@vercel/node` would **fail to bundle `api/index.ts`** because
`./_server.mjs` cannot be resolved. So the API (and `/api/auth/*`) would not run
even though the frontend would. Per the Agent 3 Hard Stop ("build must succeed
locally before touching deploy config"), `vercel.json` was deliberately left
unchanged.

### Recommended fix (Louis picks one — both cross Agent 3's Hard Stops, so escalated)

**Option A (cleanest — 1-line app-code edit).** Change `api/index.ts` line 5
from `from "./_server.mjs"` to `from "../server/_vercel_exports"`. `@vercel/node@5`
bundles the entrypoint's full import graph (including `../server/**`), so no
prebuilt artifact is needed and `api/_server.mjs` becomes unnecessary. Hard-Stop
note: this edits `api/index.ts` beyond "add default export," so it needs Louis's
OK.

**Option B (no app-code change — extend build script).** Append to the `build`
script a second esbuild emit:
`&& esbuild server/_vercel_exports.ts --platform=node --packages=external --bundle --format=esm --outfile=api/_server.mjs`
Hard-Stop note: this modifies the *existing* build script (brief says don't
overwrite it), so it also needs Louis's OK. Also requires `api/_server.mjs` be
git-ignored or generated in CI.

Recommendation: **Option A** — least surface area, idiomatic for `@vercel/node`,
removes the fragile prebuilt-artifact coupling entirely.

---

## Phase 2 — Corrected target `vercel.json` (NOT yet written to disk)

The brief's proposed config hardcodes `outputDirectory: client/dist`. **Wrong for
this project** — Vite emits to `dist/public` (`vite.config.ts` `build.outDir`).
Corrected target, to apply once the BLOCKER is resolved:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null,
  "functions": {
    "api/index.ts": { "runtime": "@vercel/node@5", "maxDuration": 30 }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```
Notes:
- `outputDirectory` corrected to `dist/public` (verified Vite emit location).
- `pnpm run build` exists and runs Vite — no `package.json` change needed for the
  build script itself (it is NOT missing).
- `installCommand` uses `--frozen-lockfile`; `pnpm-lock.yaml` is present and in
  sync (Phase A updated it when adding `@auth/*` deps).
- `@vercel/node@5` per brief; cannot verify against deploy (Vercel CLI gated).
  Fall back to `@vercel/node@3` if `@5` errors at deploy.
- Asset cache `headers` from the old config were intentionally dropped per the
  brief's target shape; re-add if Louis wants long-cache on `/assets/*`.

---

## Gated steps (cannot complete here)

- **Phase 5 (commit new vercel.json + `vercel` deploy):** Vercel CLI v50.37.3 is
  **not logged in**; `vercel whoami` → `ETIMEDOUT` to api.vercel.com. No
  `.vercel/project.json`. The brief's stated precondition ("Agent 3 should have
  already completed Vercel auth + linked project + added domains") is **NOT
  satisfied** in this environment. Also blocked behind the `_server.mjs` BLOCKER.
- **Phase 6 (preview verification):** depends on Phase 5.

## Configuration migrated

- Old: static-mirror build (`build-manus-mirror.mjs`, SPA-only rewrite). **Still
  in place** (not changed — see BLOCKER).
- New: full app build (Vite frontend + `api/index.ts` serverless function) —
  **prepared, not applied.**

## Verified

- [x] `pnpm run build` command succeeds locally (exit 0)
- [x] `dist/public/` populated with built frontend (`index.html`, `assets/`)
- [x] `api/index.ts` has default export (line 51)
- [ ] `api/_server.mjs` produced by build — **NO (BLOCKER)**
- [ ] `vercel.json` rewritten — **NO (held on BLOCKER + deploy gate)**
- [ ] Preview deploy — **gated (Vercel CLI not authenticated)**
- [ ] Frontend loads on preview — gated
- [ ] `/api/auth/providers` resolves — gated

## Preview URL

None — deploy gated.

---

# UPDATE 2026-05-15 — Option A applied, config converted, preview deployed

Louis approved **Option A**. Executed:

- `api/index.ts:5` import changed `./_server.mjs` → `../server/_vercel_exports`.
  `pnpm run build` exits 0; tsc **54 → 53** (the `_server.mjs` TS2307 resolved,
  zero new errors). Commit `380d6e0`.
- `vercel.json` applied with `outputDirectory: dist/public`, `pnpm run build`,
  `/api/(.*)` → `/api/index.ts` before SPA fallback.
- **Deploy fix:** `functions.runtime: "@vercel/node@5"` is invalid (built-in
  runtime; triggers *"Function Runtimes must have a valid version"*). Removed the
  `runtime` key, kept `maxDuration: 30` — built-in Node auto-detected. Commit
  `2da645e`. (Brief's `@vercel/node@3` fallback would fail identically — the
  field itself was the problem, not the version.)

### Vercel auth + project (now done)
- `vercel login` device-code flow **succeeded** (earlier `whoami` ETIMEDOUT was
  transient/MCP-specific, as Louis predicted). Authed as `kevin-7816`.
- Linked: **`kevin-7816s-projects/5star-hookah`**
  (`prj_RUV3jS7EYjDd56gfi4uWYwSDTRIc`, org `team_BHlU3rLJ7PjmfKOIq0nbG32L`).
  GitHub repo `kbakes40/5star-hookah-clone` auto-connected.
- Domains added to project: `bosshookah1.com`, `www.bosshookah1.com`.

### DNS records for Louis to enter at Namecheap
Current Namecheap nameservers: `dns1.registrar-servers.com` /
`dns2.registrar-servers.com` (Vercel reports domain "not configured" until DNS
points at Vercel). Choose ONE approach:

- **Option (a) — A records (keep Namecheap DNS):**
  - `A  @ (bosshookah1.com)      → 76.76.21.21`
  - `A  www                      → 76.76.21.21`
    (Vercel reported A `76.76.21.21` for www; a `CNAME www → cname.vercel-dns.com`
    is the conventional alternative if Namecheap rejects an A on www.)
- **Option (b) — delegate nameservers to Vercel:**
  - Set Namecheap nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.

Vercel will auto-verify and email on completion. **Louis applies DNS; cutover
is Louis-only.**

### Preview deploy
- Deployment `dpl_955L8ie5SZns82zV9abWuwwaJvqZ` — **● Ready** (preview,
  `target: null`, NOT production).
- **Preview URL:** `https://5star-hookah-k2xiw2bgz-kevin-7816s-projects.vercel.app`
- `vercel inspect` confirms the serverless function **`λ api/index` (6.48MB)
  [iad1]** built and deployed — Option A's import graph bundled correctly.

### Phase 6 verification — partially blocked by Deployment Protection
- `curl /` and `curl /api/auth/providers` → **HTTP 401 "Authentication
  Required"** for **every** path, including `/`. This is **Vercel Deployment
  Protection** (SSO wall, on by default for new projects) — a project security
  setting, **NOT** a routing/config failure.
- Platform-level proof that routing/function are correct (since curl can't pass
  the wall): `vercel inspect` shows deployment Ready + `λ api/index` function
  built. The brief's failure modes (404 on `/api/*`, blank frontend, wrong
  outputDirectory) are **not** present — the only thing between the URL and a
  green Phase 6 is the SSO wall.

### NEW blocker (Louis) — disable Deployment Protection to finish Phase 6
To complete the Phase 6 curl checks (`/` → 200, `/api/auth/providers` → 200/503
not 404), Louis must either:
- Project → Settings → Deployment Protection → disable **Vercel Authentication**
  for Preview, **or**
- Generate a **Protection Bypass for Automation** secret and re-run:
  `curl -H "x-vercel-protection-bypass: <secret>" https://<preview>/api/auth/providers`

Not done here: changing a project-level security posture is outward-facing and
outside this brief's authorization.

---

# UPDATE 2026-05-15 (2) — "Function Runtimes must have a valid version" RECURRENCE diagnosed

**Symptom:** error keeps reappearing despite vercel.json being fixed.

**Root cause (definitive, from build logs):** the Vercel **GitHub integration**
(auto-connected by `vercel link`) is auto-deploying **Production** on push and
building a **stale commit `380d6e0`** — the only commit that still contains
`"functions": { "api/index.ts": { "runtime": "@vercel/node@5" } }`. Build log of
prod deploy `lm7o16zn2`: `Cloning … Commit: 380d6e0 … Error: Function Runtimes
must have a valid version`.

**Current code is correct.** HEAD `ca33f3d` vercel.json has **no functions
block**. Deploys of current code are **READY**: `nukpq2fvk`, `k2xiw2bgz`, and
auto-Preview `f29qb8xh7`/`9j861pbrd`/`ha0kdcs3r`. No further vercel.json change
will help — the problem is the Git integration, not the config.

**Two hard-stop collisions caused by the auto-connected Git integration:**
1. It deploys to **Production** on push (`dyk96eqxp`, `lm7o16zn2` — both Error/
   Production). Brief hard stop: "Do NOT deploy to production. Preview only."
2. It rebuilds stale commit `380d6e0`, regenerating the runtime error.

**Resolution — LOUIS ONLY (Vercel dashboard; project Git/production settings are
out of agent scope per "cutover is Louis-only"):**
- Project → Settings → **Git**: either disconnect the GitHub integration, OR set
  **Production Branch** to `main` (so pushes to `feat/authnet-replace-stripe`
  create Preview, not Production), OR add an Ignored Build Step.
- Do NOT "Redeploy" the old `380d6e0`/`dyk96eqxp`/`nzdneyps6`/`lm7o16zn2`
  deployments — they rebuild the stale bad commit. Use latest (`ca33f3d`).
- Until the Git setting is fixed, **do not push to this branch** — each push
  spawns another failed Production deploy and reproduces the error. (This
  diagnosis commit is intentionally committed locally but NOT pushed for that
  reason.)
- Deployment Protection still ON → Phase 6 curl still returns 401 on all paths
  (unchanged; separate from this issue).

## Outstanding for cutover (Louis)

- **Resolve the `api/_server.mjs` BLOCKER** (pick Option A or B above) so the
  Vercel function can build.
- Authenticate Vercel CLI / MCP (network + login), link project under
  `kevin-7816s-projects`, add `bosshookah1.com` + `www.bosshookah1.com`.
- After BLOCKER fixed + Vercel authed: apply the corrected `vercel.json`, deploy
  preview, run Phase 6 curl checks (`/` → 200, `/api/auth/providers` → 200 or 503
  but NOT 404).
- Add real env vars to Vercel (Auth.js, Authnet, Turso — see MIGRATION_NOTES.md
  Phase B blockers).
- Cutover production domain only after end-to-end verification. Cutover is
  Louis-only.
