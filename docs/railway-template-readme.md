# Deploy and Host OpenShip

Deploy the OpenShip dashboard and API on Railway with managed PostgreSQL and
Redis. The template exposes one public dashboard and keeps the API private
behind a same-origin proxy.

## About Hosting OpenShip

This template hosts the OpenShip **control plane**, not application workloads.
Railway intentionally does not expose the host Docker socket, so the API starts
with `OPENSHIP_CONTROL_PLANE_ONLY=true`. A separate Linux VPS or dedicated
server is required as the workload target. Do not select the Railway API
container as a local deployment target.

The dashboard is public. The API, PostgreSQL, and Redis communicate over
Railway private networking. Email/password login works immediately; SMTP,
GitHub OAuth, and Google OAuth are optional integrations you can add later.

## Why Deploy OpenShip on Railway

Railway provides managed lifecycle, private networking, persistent PostgreSQL
and Redis volumes, health checks, generated TLS, and automatic deployments from
the maintained template branch. This keeps the control plane separate from the
Linux servers where OpenShip builds and runs customer workloads.

## Common Use Cases

- Manage deployments across one or more Linux VPS hosts from a central UI.
- Keep deployment metadata, authentication, queues, and cache on managed
  Railway services.
- Evaluate OpenShip without installing its control plane directly on a workload
  server.
- Provide a shared, authenticated deployment dashboard for a small team.

## Dependencies for OpenShip

The template creates all control-plane dependencies automatically. You must
provide at least one external Linux server with SSH access before deploying an
application through OpenShip.

### Deployment Dependencies

- OpenShip dashboard built from `apps/dashboard/Dockerfile`
- OpenShip API built from `apps/api/Dockerfile`
- Railway PostgreSQL with persistent storage
- Railway Redis with persistent storage
- A separate Linux server reachable over SSH for application workloads

## After Deployment

1. Open the generated dashboard domain.
2. Register the first local account with email and password.
3. Add a separate Linux server over SSH.
4. Deploy applications to that registered server.

See the repository's `docs/railway.md` for configuration and operational notes.
