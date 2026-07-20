# Deploy OpenShip on Railway

The Railway deployment runs OpenShip as an authenticated control plane. It is a
four-service stack:

| Service     | Source                      | Purpose                                                   |
| ----------- | --------------------------- | --------------------------------------------------------- |
| `dashboard` | `apps/dashboard/Dockerfile` | Public Next.js UI and same-origin API proxy               |
| `api`       | `apps/api/Dockerfile`       | Private Hono API, migrations, jobs, and SSH orchestration |
| `Postgres`  | Railway PostgreSQL          | Durable application and authentication data               |
| `Redis`     | Railway Redis               | Queue, cache, and rate-limit state                        |

## Important limitation

Railway does not expose its host Docker socket and is not a general-purpose VPS.
The API therefore runs with `OPENSHIP_CONTROL_PLANE_ONLY=true`: it does not try
to initialize Docker or OpenResty inside its Railway container. Add a separate
Linux server in the OpenShip dashboard and deploy workloads to that server over
SSH. Selecting the local Railway container as a workload target is unsupported.

## API configuration

Build the repository root with `apps/api/Dockerfile`, use port `4000`, and set
the health-check path to `/api/health`.

```dotenv
NODE_ENV=production
PORT=4000
CLOUD_MODE=false
DEPLOY_MODE=docker
OPENSHIP_CONTROL_PLANE_ONLY=true
OPENSHIP_REQUIRE_REDIS=true
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
BETTER_AUTH_SECRET=<generated 32-byte-or-longer secret>
INTERNAL_TOKEN=<generated 32-byte-or-longer secret>
BETTER_AUTH_URL=https://${{dashboard.RAILWAY_PUBLIC_DOMAIN}}/api/proxy
TRUST_PROXY=true
```

`BETTER_AUTH_SECRET` and `INTERNAL_TOKEN` must be different random values. Do
not reuse the examples from `.env.example`.

## Dashboard configuration

Build the repository root with `apps/dashboard/Dockerfile`, use port `3001`,
and expose only this service with a Railway-generated or custom domain.

```dotenv
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_PROXY=true
INTERNAL_API_URL=http://${{api.RAILWAY_PRIVATE_DOMAIN}}:4000
OPENSHIP_PUBLIC_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

`NEXT_PUBLIC_API_PROXY` is consumed during the dashboard image build, so changing
it requires a rebuild. The proxy keeps authentication cookies same-origin and
lets the API remain private.

## First run

1. Open the dashboard domain and register the first local account.
2. Add a Linux server under the server settings and verify its SSH connection.
3. Install the required Docker and routing components on that server through
   OpenShip, or preinstall them yourself.
4. Create a project and choose the registered server as its deployment target.

GitHub and Google OAuth are optional. Email/password registration works without
SMTP; password reset and email verification mail require SMTP configuration.

## Persistence and operations

Postgres and Redis are managed Railway services. The API automatically applies
database migrations at startup. Backups configured as local filesystem paths
are ephemeral inside Railway; use a remote/S3-compatible backup destination for
durability. Keep the API at one replica unless every scheduled/background path
has been validated for multi-replica execution.
