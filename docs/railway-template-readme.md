# OpenShip Control Plane

Deploy the OpenShip dashboard and API on Railway with managed PostgreSQL and
Redis. The template exposes one public dashboard and keeps the API private
behind a same-origin proxy.

## After deployment

1. Open the generated dashboard domain.
2. Register the first local account with email and password.
3. Add a separate Linux server over SSH.
4. Deploy applications to that registered server.

## What this template creates

- OpenShip dashboard
- OpenShip API
- Railway PostgreSQL
- Railway Redis
- Generated authentication and internal-service secrets

## Hosting model

This template hosts the OpenShip **control plane**, not application workloads.
Railway intentionally does not expose the host Docker socket, so the API starts
with `OPENSHIP_CONTROL_PLANE_ONLY=true`. A separate Linux VPS or dedicated
server is required as the workload target. Do not select the Railway API
container as a local deployment target.

The dashboard is public. The API, PostgreSQL, and Redis communicate over
Railway private networking. Email/password login works immediately; SMTP,
GitHub OAuth, and Google OAuth are optional integrations you can add later.

See the repository's `docs/railway.md` for configuration and operational notes.
