# Deploy and Host OpenShip

Deploy **OpenShip — Self-Hosted PaaS** on Railway and manage applications,
databases, workers, Docker Compose stacks, and optional multi-domain email
infrastructure on Linux servers you control.

## Why Deploy OpenShip on Railway

OpenShip is an open-source deployment platform with a web dashboard, CLI, REST
API, and built-in CI/CD. Connect a repository, choose a registered server, and
manage the deployment lifecycle from one place.

- Deploy Node.js, Python, Go, Rust, PHP, Ruby, Java, .NET, and Docker projects
- Run existing Docker Compose stacks and monorepos
- Manage environment variables, domains, TLS, logs, metrics, and rollbacks
- Provision databases, Redis, workers, WebSockets, and persistent volumes
- Schedule backups and restore databases or volumes
- Operate multiple Linux servers from one authenticated dashboard
- Optionally provision multi-domain email with SMTP, IMAP, DKIM/SPF/DMARC,
  mailboxes, aliases, quotas, backups, and webmail

## About Hosting OpenShip

Railway hosts the OpenShip **control plane**:

- Public Next.js dashboard
- Private Hono API and background jobs
- Persistent Railway PostgreSQL for OpenShip state and authentication
- Persistent Railway Redis for queues, cache, and rate limiting

Application and email workloads do **not** run inside the Railway control-plane
containers. OpenShip connects over SSH to one or more external Linux servers,
where it manages Docker, routing, certificates, application data, and optional
mail services. The backend enforces this separation and rejects local workload
deployments in hosted control-plane mode.

## Dependencies for OpenShip

### Deployment Dependencies

The template creates a dashboard, API, persistent Railway PostgreSQL, and
persistent Railway Redis. Workloads require at least one external Linux server
registered over SSH.

### External Server Requirements

Provide at least one Linux VPS, dedicated server, or homelab host with:

- Root or passwordless-sudo SSH access
- A stable reachable IP address
- Enough CPU, RAM, and disk for the workloads you plan to run
- DNS control for application domains

Email hosting additionally requires a dedicated or clean Ubuntu 22.04/24.04
server, configurable reverse DNS/PTR, outbound TCP port 25, inbound mail ports,
and an IP with suitable reputation.

## Common Use Cases

- Replace per-service PaaS costs with applications consolidated on your VPS
- Give a small team a shared deployment interface without broad SSH access
- Manage staging and production servers from one control plane
- Operate client infrastructure for an agency
- Deploy side projects, internal tools, APIs, workers, and Compose stacks
- Add self-hosted multi-domain email when the infrastructure requirements fit

## After Deployment

1. Open the generated dashboard domain.
2. Register the first administrator with email and password.
3. Add an external Linux server and verify its SSH connection.
4. Connect a repository or import a Docker Compose project.
5. Select the registered server and deploy.
6. Optionally open **Emails** to provision a separate mail-capable server.

Email/password login to the dashboard works immediately. GitHub OAuth, Google
OAuth, and notification SMTP are optional integrations.

## Cost and Responsibility

The template creates four Railway services and persistent PostgreSQL/Redis
volumes. External workload servers are billed separately by your chosen
provider. You remain responsible for server capacity, operating-system updates,
DNS, firewall policy, abuse prevention, and off-server backups.

See `docs/railway.md` in the source repository for variables, networking, and
operational details.
