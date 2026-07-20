# OpenShip PaaS Template Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a clearly branded Railway template for OpenShip's self-hosted PaaS, presenting multi-domain email as one optional capability rather than the product identity.

**Architecture:** Railway continues to host the dashboard, API, Postgres, and Redis. The API image also ships OpenShip's slim iRedMail engine and transfers it over SSH to a separately registered Linux mail server. A versioned marketplace image in the public fork provides a stable URL for the Railway card.

**Tech Stack:** Railway CLI 5.27.1, Docker, Bun 1.3.10, Vitest, GitHub, OpenShip/iRedMail.

## Global Constraints

- Keep Railway as the authenticated control plane; never claim the Railway container is the SMTP/IMAP host.
- Require a separate Linux VPS with SSH, a public IP, working reverse DNS, and mail ports.
- Use the marketplace name `OpenShip — Self-Hosted PaaS` and lead with application deployment.
- Preserve the existing four-service Railway topology and generated secrets.

---

### Task 1: Package the mail provisioning engine

**Files:**
- Modify: `apps/api/Dockerfile`
- Test: `apps/api/test/lib/control-plane-platform.test.ts`

**Interfaces:**
- Consumes: repository directory `apps/email/engine`
- Produces: runtime path `/app/apps/email/engine` and `MAIL_SERVER_ENGINE_DIR`

- [ ] **Step 1: Write a failing Dockerfile contract test**

Assert that `apps/api/Dockerfile` copies `/app/apps/email/engine` into the runner and declares `MAIL_SERVER_ENGINE_DIR=/app/apps/email/engine`.

- [ ] **Step 2: Run the focused API test and verify RED**

Run `bun run --cwd apps/api test test/lib/control-plane-platform.test.ts`. Expect failure because the runner currently copies only `apps/api`.

- [ ] **Step 3: Add the engine to the production image**

Copy the builder's `apps/email/engine` directory to the same path in the runner and set the explicit environment variable.

- [ ] **Step 4: Verify GREEN and build the API**

Run the focused test, `bun run --cwd apps/api lint`, and `bun run --cwd apps/api build`. Expect all to pass.

### Task 2: Publish honest PaaS-first branding

**Files:**
- Add: `docs/assets/openship-template.png`
- Modify: `docs/railway-template-readme.md`
- Modify: `docs/railway.md`

**Interfaces:**
- Consumes: generated 16:9 marketplace artwork
- Produces: stable raw GitHub image URL and a PaaS-first Railway overview

- [ ] **Step 1: Rewrite the template overview**

Lead with applications, containers, CI/CD, domains, backups, and external Linux servers. Present multi-domain email as an optional feature.

- [ ] **Step 2: Update the operator guide**

Document that the API image includes the slim iRedMail engine and list the external mail-server prerequisites.

- [ ] **Step 3: Commit and push the engine and branding**

Commit to `railway-template` and push to the public fork so both Railway services rebuild and the card image becomes publicly addressable.

### Task 3: Verify the live control plane

**Files:** None.

**Interfaces:**
- Consumes: Railway project `7302f8bf-86a2-4be1-9d18-092f0e863c7f`
- Produces: two source deployments at terminal `SUCCESS`

- [ ] **Step 1: Poll API and dashboard deployments**

Require the newest commit on both services and terminal `SUCCESS`.

- [ ] **Step 2: Verify public endpoints**

Check `/register`, `/api/proxy/api/health`, and `/api/auth/get-session` for successful responses.

### Task 4: Replace the marketplace listing safely

**Files:** None.

**Interfaces:**
- Consumes: the healthy Railway production environment and public raw image URL
- Produces: a published `OpenShip — Self-Hosted PaaS` listing with a new share URL

- [ ] **Step 1: Rename the source Railway project**

Use `projectUpdate` with name `OpenShip — Self-Hosted PaaS`, then read it back.

- [ ] **Step 2: Generate and publish the renamed template**

Create a new template snapshot from production and publish it under category `Automation` with a PaaS-first description that labels email infrastructure as optional, plus the README and image URL.

- [ ] **Step 3: Verify marketplace metadata and URL**

Read back the template name, description, image, status, and HTTP accessibility.

- [ ] **Step 4: Retire the zero-deployment old listing**

Only after the new listing is verified, unpublish the previous `openship-template` listing so the marketplace does not contain two confusing entries.
