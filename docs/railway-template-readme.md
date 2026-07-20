# OpenShip Mail Server

Run an authenticated control plane on Railway for self-hosted, multi-domain
email. OpenShip provisions and manages the actual mail stack on a separate
Linux VPS over SSH.

## What You Get

- Multiple email domains on one mail server
- Mailboxes, aliases, forwarding, quotas, and account controls
- SMTP with Postfix and IMAP with Dovecot
- DKIM, SPF, DMARC, TLS, anti-spam, antivirus, and fail2ban
- DNS guidance and delivery tests from the dashboard
- Mailbox backups, restore, and server migration workflows
- Optional Zero Email webmail
- The broader OpenShip application deployment platform

## How the Railway Architecture Works

Railway hosts the OpenShip **control plane**:

- Public Next.js dashboard
- Private Hono API with the bundled slim iRedMail provisioning engine
- Persistent Railway PostgreSQL for OpenShip state and authentication
- Persistent Railway Redis for queues, cache, and rate limiting

The SMTP/IMAP server does **not** run inside Railway. OpenShip connects to a
separate Linux VPS over SSH and installs the mail services, mail database,
certificates, and storage there. This separation gives the mail server its own
public IP, reverse DNS, raw mail ports, and persistent Maildir storage.

## External Mail Server Requirements

Before installing mail, provide a dedicated or clean Ubuntu 22.04/24.04 server
with:

- Root or passwordless-sudo SSH access
- A stable public IPv4 address
- Reverse DNS/PTR that you can configure
- Outbound TCP port 25 permitted by the VPS provider
- Inbound ports 25, 465/587, and 993 available
- Control of DNS for the primary and additional email domains

Your VPS provider and IP reputation materially affect deliverability. Railway
manages the control plane lifecycle; it cannot guarantee inbox placement.

## Multi-Domain Model

The first domain establishes the shared mail hostname, such as
`mail.example.com`. Additional domains keep independent mailboxes and DNS
identity while using that same SMTP/IMAP endpoint. OpenShip generates the MX,
SPF, DKIM, and DMARC records each domain needs.

## After Deployment

1. Open the generated dashboard domain.
2. Register the first administrator with email and password.
3. Add the external Linux server and verify its SSH connection.
4. Open **Emails**, choose the server, and run the resumable mail setup.
5. Publish the DNS records shown by OpenShip and configure reverse DNS.
6. Create mailboxes or add more domains, then run the delivery test.

Email/password login to the OpenShip dashboard works without external SMTP.
GitHub OAuth, Google OAuth, and notification SMTP are optional integrations.

## Cost and Responsibility

The template creates four Railway services and their persistent database
volumes. You also pay your chosen VPS provider for the external mail server.
You remain responsible for DNS, reverse DNS, IP reputation, abuse prevention,
updates, storage capacity, and off-server backups.

See `docs/railway.md` in the source repository for variables, networking, and
operational details.
