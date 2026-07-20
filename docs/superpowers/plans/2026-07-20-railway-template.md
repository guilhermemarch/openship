# OpenShip Railway Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy OpenShip's authenticated control plane on Railway and publish it as a reusable multi-service template.

**Architecture:** Run the API and dashboard as separate Dockerfile-backed Railway services, with managed PostgreSQL and Redis services connected through Railway variable references. Add an explicit control-plane-only boot mode so the API does not attempt to access Railway's unavailable host Docker socket or configure local OpenResty; deployments created through this hosted instance must target a separately registered SSH server.

**Tech Stack:** Bun 1.3.10, TypeScript, Hono, Next.js 16, PostgreSQL 16, Redis 7, Docker, Railway CLI 5.27.1.

## Global Constraints

- Preserve OpenShip's secure local Better Auth flow; do not expose desktop zero-auth mode.
- Keep `DEPLOY_MODE=docker` so runtime behavior and dashboard labeling remain self-hosted Docker mode.
- Use `OPENSHIP_CONTROL_PLANE_ONLY=true` only to skip initialization of the unavailable local runtime and routing stack.
- Generate unique `BETTER_AUTH_SECRET` and `INTERNAL_TOKEN` values in Railway; never commit secrets.
- Expose only the dashboard publicly; proxy browser API traffic from the dashboard to the private API service.
- Workloads deployed from OpenShip must use a remote SSH server, not the Railway container itself.

---

### Task 1: Add a control-plane-only platform boot mode

**Files:**

- Modify: `apps/api/src/config/env.ts`
- Modify: `apps/api/src/lib/controller-helpers.ts`
- Create: `apps/api/test/lib/control-plane-platform.test.ts`

**Interfaces:**

- Consumes: `OPENSHIP_CONTROL_PLANE_ONLY` as a Railway service environment variable.
- Produces: `env.OPENSHIP_CONTROL_PLANE_ONLY: boolean` and a no-local-infrastructure platform config from `resolvePlatformConfig()`.

- [ ] **Step 1: Write the failing platform-resolution test**

Create a Vitest test that resets modules, sets `DEPLOY_MODE=docker`, `OPENSHIP_CONTROL_PLANE_ONLY=true`, and secure required secrets, then imports `resolvePlatformConfig()` and expects `{ target: "desktop" }` while confirming `env.DEPLOY_MODE === "docker"`.

- [ ] **Step 2: Run the focused test and verify the current code fails**

Run: `bun run --cwd apps/api test -- test/lib/control-plane-platform.test.ts`

Expected: FAIL because `OPENSHIP_CONTROL_PLANE_ONLY` is absent and the resolver returns the self-hosted Docker platform.

- [ ] **Step 3: Implement the environment flag and resolver branch**

Add `OPENSHIP_CONTROL_PLANE_ONLY: envBool("false")` to the environment schema. In `resolvePlatformConfig()`, return `{ target: "desktop" }` when that flag is true, before normal self-hosted resolution, without changing `DEPLOY_MODE` or authentication behavior.

- [ ] **Step 4: Run focused and API test suites**

Run: `bun run --cwd apps/api test -- test/lib/control-plane-platform.test.ts`

Expected: PASS.

Run: `bun run --cwd apps/api test`

Expected: all API tests PASS.

### Task 2: Document Railway deployment semantics

**Files:**

- Modify: `.env.example`
- Create: `docs/railway.md`
- Modify: `README.md`

**Interfaces:**

- Consumes: the four-service Railway topology and control-plane-only environment flag.
- Produces: operator documentation covering security, service variables, public/private routing, first login, and mandatory remote SSH targets.

- [ ] **Step 1: Add the environment reference**

Document `OPENSHIP_CONTROL_PLANE_ONLY=false` beside deployment mode settings, including that it disables only local Docker/OpenResty initialization and is intended for hosted control planes.

- [ ] **Step 2: Add the Railway guide**

Document the services `api`, `dashboard`, `Postgres`, and `Redis`; the Dockerfile paths; Railway variable references; generated secrets; dashboard API proxy; health paths; and the limitation that Railway cannot act as the managed workload host.

- [ ] **Step 3: Link the guide from the README**

Add a concise Railway template section pointing to `docs/railway.md`.

- [ ] **Step 4: Verify formatting and repository state**

Run: `bunx prettier --check README.md docs/railway.md .env.example docs/superpowers/plans/2026-07-20-railway-template.md`

Expected: all matched files use Prettier formatting.

### Task 3: Publish the source fork

**Files:**

- No additional repository files.

**Interfaces:**

- Consumes: the tested Railway compatibility commit.
- Produces: GitHub repository `guilhermemarch/openship` with branch `railway-template` as a stable Railway template source.

- [ ] **Step 1: Create the GitHub fork and branch**

Run `gh repo fork oblien/openship --clone=false --remote` and create branch `railway-template` from the audited upstream commit.

- [ ] **Step 2: Commit the implementation**

Commit the compatibility code, test, and documentation with message `feat: support Railway control-plane deployments`.

- [ ] **Step 3: Push and verify**

Push `railway-template` to the authenticated user's fork and verify the remote branch SHA matches the local commit.

### Task 4: Provision and validate Railway

**Files:**

- No additional repository files; configuration is stored in Railway.

**Interfaces:**

- Consumes: the public GitHub fork branch and Railway account.
- Produces: a production Railway project with healthy `api`, `dashboard`, `Postgres`, and `Redis` services.

- [ ] **Step 1: Create a fresh Railway project**

Create project `openship-template` in the authenticated Railway workspace and use its `production` environment.

- [ ] **Step 2: Create and wire data services**

Create one managed PostgreSQL service and one managed Redis service. Wire API `DATABASE_URL` to `${{Postgres.DATABASE_URL}}` and `REDIS_URL` to `${{Redis.REDIS_URL}}`.

- [ ] **Step 3: Create and configure application services**

Configure `api` from the fork with Dockerfile `apps/api/Dockerfile`, port `4000`, health path `/api/health`, and the required control-plane and security variables. Configure `dashboard` from the same fork with Dockerfile `apps/dashboard/Dockerfile`, port `3001`, `NEXT_PUBLIC_API_PROXY=true`, and `INTERNAL_API_URL=http://${{api.RAILWAY_PRIVATE_DOMAIN}}:4000`.

- [ ] **Step 4: Generate the dashboard domain and deploy**

Expose only `dashboard`, deploy both source services, and poll each newest deployment until Railway reports terminal `SUCCESS`.

- [ ] **Step 5: Verify the live application**

Request the dashboard URL, the proxied health endpoint `/api/proxy/api/health`, and the registration page. Confirm HTTP success and inspect bounded runtime logs for migration, Redis, or authentication errors.

### Task 5: Publish the Railway template

**Files:**

- Create: `docs/railway-template-readme.md`

**Interfaces:**

- Consumes: the validated production project configuration.
- Produces: a public Railway template code and shareable deployment URL.

- [ ] **Step 1: Write the marketplace README**

Explain what is deployed, first-run registration, GitHub integration options, remote SSH server setup, required cost-bearing services, and the no-local-workload limitation.

- [ ] **Step 2: Create the template snapshot**

Create a Railway template from project `openship-template` and its `production` environment.

- [ ] **Step 3: Publish the template**

Publish it in category `Developer Tools` with a concise description and the marketplace README.

- [ ] **Step 4: Read back and test discoverability**

List owned templates, confirm the template is published, and use its returned code to confirm the deployment link is resolvable.
