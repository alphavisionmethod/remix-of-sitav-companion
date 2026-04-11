

# SITA OS — VMware ISO Deployment: Gap Analysis & Fix Plan

## What's Already Working
Your ISO pipeline is 90% complete. The `build-iso.sh` script, autoinstall config, first-boot provisioning, Docker Compose stack, OTA/backup/metrics agents — all solid.

## What's Missing (5 items)

### 1. `.env.example` File — BLOCKER
Multiple scripts reference `.env.example` but it doesn't exist. The first-boot script copies it to `.env` and generates secrets from it. Without it, the stack won't start.

**Create `.env.example`** with all required variables:
```
POSTGRES_PASSWORD=change-me-to-a-secure-password
JWT_SECRET=change-me-to-a-secure-jwt-secret
SUPABASE_ANON_KEY=placeholder-will-be-generated
SUPABASE_SERVICE_KEY=placeholder-will-be-generated
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=placeholder-will-be-generated
SITE_URL=http://localhost:8080
API_EXTERNAL_URL=http://localhost:8000
ACME_EMAIL=admin@sita.local
NATS_URL=nats://sita-nats:4222
RATE_LIMIT_MAX=500
RATE_LIMIT_WINDOW_MS=60000
```

### 2. DB Init Scripts — Incomplete
`deploy/db-init/00-roles.sql` and `01-extensions.sql` exist but may not create the `authenticator`, `anon`, `service_role`, and `supabase_auth_admin` roles that self-hosted Supabase requires. Need to verify and fix.

**Action:** Read both SQL files, ensure they create all required Supabase roles with proper grants.

### 3. Traefik Config — Referenced but Possibly Missing
`docker-compose.yml` mounts `./deploy/traefik/traefik.yml` and `./deploy/traefik/dynamic.yml`. Need to verify these exist.

**Action:** Check `deploy/traefik/` directory; create configs if missing (HTTP→HTTPS redirect, Let's Encrypt ACME, Docker provider).

### 4. Nginx Config for Self-Hosted
`docker-compose.yml` mounts `./deploy/nginx.conf` (not `nginx/default.conf`). The ISO copies `dist/` as static files served by nginx. Need to verify the deploy nginx.conf exists and has SPA fallback + API proxy rules.

**Action:** Verify `deploy/nginx.conf` exists with proper upstream proxying to Kong on port 8000.

### 5. Supabase Migrations Bundling
The ISO script copies `supabase/migrations/*.sql` into the ISO. These run via Docker entrypoint. Need to confirm the migration files are compatible with the self-hosted Supabase Postgres image init order (they run after `00-roles.sql` and `01-extensions.sql`).

**Action:** Verify migration compatibility — no dependency on Lovable Cloud-specific features.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `.env.example` | **Create** — all env vars with safe defaults |
| `deploy/db-init/00-roles.sql` | **Verify/fix** — all Supabase roles |
| `deploy/db-init/01-extensions.sql` | **Verify/fix** — required PG extensions |
| `deploy/traefik/traefik.yml` | **Verify/create** — entrypoints, ACME, Docker provider |
| `deploy/traefik/dynamic.yml` | **Verify/create** — routers, middlewares, TLS |
| `deploy/nginx.conf` | **Verify/fix** — SPA fallback, API proxy |

## Summary
Once these 5 gaps are filled, `build-iso.sh` will produce a fully bootable ISO that auto-installs Ubuntu 24.04, provisions Docker, generates all secrets, starts the complete SITA OS stack, and is ready to use at `http://<vm-ip>:8080` within ~10 minutes of boot.
