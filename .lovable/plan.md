

# SITA OS — VMware ISO Launch Readiness Audit

## What Is Already Solid

The deployment infrastructure is surprisingly complete:

- **docker-compose.yml**: Full 13-service stack (Traefik, Web, API Gateway, Brain Core, NATS, Supabase DB/REST/Auth/Realtime/Storage/Kong/Meta/Studio, Edge Functions) with health checks, resource limits, network segmentation, logging
- **build-iso.sh**: 239-line production script that downloads Ubuntu 24.04, injects autoinstall, GRUB config, repacks ISO with xorriso
- **build-ova.sh**: 253-line OVF/OVA packager with VMDK generation
- **autoinstall/user-data**: Complete cloud-init with A/B root partitions, LUKS2 encryption, UFW firewall, fail2ban, auditd, Docker preinstall
- **autoinstall/network-config**: Multi-NIC support (VMware ens160/192, KVM eth0, VirtIO enp0s3)
- **sita-first-boot.sh**: 8-step provisioning (Docker wait, image load, secret generation, validation, network creation, stack start, health check, completion marker)
- **sita-os.service**: systemd unit with security hardening
- **Traefik**: TLS termination with Let's Encrypt + self-signed fallback, rate limiting, security headers
- **API Gateway + Brain Core**: Fully implemented Hono servers with real logic
- **Edge Functions main router**: Self-hosted runtime entrypoint
- **.env.example**: Complete with all required variables documented
- **nginx/default.conf**: Security headers, gzip, SPA routing

---

## What Is Missing for 100% ISO-on-VMware Launch

### CRITICAL (Blocks Boot/Operation)

1. **No `dist/` folder in the repo for self-hosted deployment**
   - docker-compose mounts `./dist:/usr/share/nginx/html:ro` but `dist/` is a build artifact not committed
   - The ISO build script does NOT run `npm run build` before injecting files
   - **Fix**: Add a `pre-iso-build` step in `build-iso.sh` that runs `npm run build` and copies `dist/` into the ISO sita/deploy directory

2. **Supabase Auth service missing from docker-compose.yml**
   - The stack has Kong, REST, Realtime, Storage, Meta, Studio, Edge Functions — but NO GoTrue/Auth container (`supabase/gotrue`)
   - Without this, login/signup/JWT issuance will fail entirely on self-hosted
   - **Fix**: Add `sita-supabase-auth` service using `supabase/gotrue:v2.151.0` with proper env vars (GOTRUE_JWT_SECRET, GOTRUE_DB_DATABASE_URL, etc.)

3. **Kong configuration missing from docker-compose**
   - Kong container references `kong.yml` via volume mount but docker-compose does NOT mount it
   - The `deploy/kong.yml` file exists but is not volume-mapped to the Kong container
   - **Fix**: Add volume mount `./deploy/kong.yml:/var/lib/kong/kong.yml:ro` to the Kong service, and ensure Kong routes include the auth service

4. **Edge Functions volume mount path mismatch**
   - docker-compose mounts `./supabase/functions:/home/deno/functions:ro`
   - But the main router imports from `/home/deno/functions/{name}/index.ts` — this path is correct
   - However, edge functions use `https://esm.sh/` and Deno imports that may fail in air-gapped environments
   - **Fix**: Add an import map or pin dependencies for offline edge function operation

5. **No Supabase database seed/init SQL for self-hosted**
   - `supabase/migrations/` has 33 migration files, but the docker-compose mounts them to `/docker-entrypoint-initdb.d/migrations`
   - PostgreSQL only auto-runs `.sql` files in `/docker-entrypoint-initdb.d/` (not subdirectories without explicit ordering)
   - Supabase postgres image may handle this differently, but the init role setup (anon, authenticator, service_role) is likely missing
   - **Fix**: Create `supabase/init/00-roles.sql` that creates required Supabase roles (anon, authenticator, service_role, supabase_admin) and grants, mount it before migrations

### HIGH (Breaks Key Functionality)

6. **No Supabase Storage service in docker-compose**
   - `supabase-storage-data` volume is defined but no storage container exists
   - File uploads (documents bucket) will fail on self-hosted
   - **Fix**: Add `sita-supabase-storage` service using `supabase/storage-api:v0.43.11`

7. **Frontend build uses hosted Supabase URL, not self-hosted**
   - `.env` hardcodes `VITE_SUPABASE_URL=https://icrkipwlnuopqbsabngy.supabase.co`
   - Self-hosted needs `VITE_SUPABASE_URL=http://localhost:8000` baked at build time
   - **Fix**: `build-iso.sh` must set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as build args before `npm run build`

8. **No database role initialization script**
   - Self-hosted Supabase postgres needs roles: `anon`, `authenticated`, `service_role`, `authenticator`, `supabase_admin` with proper grants
   - Without these, PostgREST, Auth, and RLS policies will all fail
   - **Fix**: Create `deploy/db-init/00-roles.sql` with all required role definitions

9. **PostgREST port conflict**
   - PostgREST defaults to port 3000 (same as API Gateway)
   - docker-compose doesn't expose PostgREST port externally (correct) but Kong needs to proxy to it
   - Kong config in `deploy/kong.yml` may reference wrong upstream ports
   - **Fix**: Verify Kong routes match actual container ports

10. **Generated VMware artifacts directory is empty**
    - `generated/vmware-appliance/` exists but is empty
    - `generated/vmware-deliverable/` does not exist
    - VMware readiness check scripts (`check-vmware-readiness.ts`) will report warnings
    - **Fix**: Run the 9 `generate-vmware-*.ts` scripts as part of the ISO/OVA build pipeline, or wire them into a `pre-release` npm script

### MEDIUM (Operational Gaps)

11. **No update/upgrade mechanism**
    - First boot works, but there is no OTA update, A/B root swap, or `sita-update.sh` script
    - The A/B partition scheme is defined but never used post-install
    - **Fix**: Create `scripts/release/sita-update.sh` that pulls new images, does health check, swaps root partition label

12. **No recovery/rollback script**
    - Boot chain manifest defines failure modes but no recovery tooling exists
    - **Fix**: Create `scripts/release/sita-recovery.sh` that swaps back to previous root partition

13. **No backup/restore automation**
    - Docs mention `pg_dump` scheduled backups but no script exists
    - **Fix**: Create `deploy/backup.sh` with pg_dump + volume snapshot logic and a cron entry

14. **No log rotation beyond Docker json-file driver**
    - Docker log rotation is configured (good) but no host-level syslog/journald rotation for sita-first-boot.log, audit logs
    - **Fix**: Add logrotate config for `/var/log/sita-*.log`

15. **No monitoring/alerting stack**
    - Traefik exposes Prometheus metrics but no Prometheus/Grafana containers exist
    - Health checks exist per-container but no unified health dashboard endpoint
    - **Fix**: Add optional `monitoring` profile with Prometheus + Grafana containers

16. **Air-gapped deployment not fully supported**
    - `build-iso.sh --include-images` exports Docker images but `docker-compose.yml` uses `image:` directives that will try to pull
    - **Fix**: Add `pull_policy: never` or ensure all images are pre-loaded, add flag to skip pull

17. **No smoke test script for post-deployment validation**
    - First boot checks health endpoints but no comprehensive post-deploy smoke test
    - **Fix**: Create `scripts/release/smoke-test.sh` that validates all endpoints, DB connectivity, auth flow, edge functions

### LOW (Polish)

18. **Supabase Studio exposed on port 3000 (conflict with PostgREST)**
    - Studio health check hits `http://localhost:3000/` — same port as PostgREST
    - Studio is behind a `studio` profile (opt-in), so not critical
    - **Fix**: Change Studio port binding or document clearly

19. **No VMware Tools / open-vm-tools in autoinstall packages**
    - VMware guest needs `open-vm-tools` for proper integration (shutdown, time sync, copy-paste)
    - **Fix**: Add `open-vm-tools` to the packages list in `user-data`

20. **MOTD version placeholder not substituted**
    - `user-data` late-commands write `__VERSION__` in MOTD but sed substitution only happens on `user-data`, `meta-data`, `network-config` — MOTD is written inline
    - **Fix**: Use `${VERSION}` variable in the late-commands MOTD block

21. **No EULA/license acceptance screen**
    - Enterprise OS typically shows license on first login
    - **Fix**: Add `/etc/profile.d/sita-eula.sh` that shows EULA on first interactive login

22. **Missing `docker-compose.override.yml` for development**
    - No dev-mode override for local development without TLS, with hot-reload
    - **Fix**: Create `docker-compose.dev.yml` with port exposures and volume mounts for development

---

## Exact Remediation Plan

### Phase 1 — Critical (Must Fix to Boot)
| # | File | Fix |
|---|------|-----|
| 1 | `build-iso.sh` | Add `npm run build` step before ISO packaging; copy `dist/` into sita/deploy |
| 2 | `docker-compose.yml` | Add `sita-supabase-auth` (GoTrue) service with full env config |
| 3 | `docker-compose.yml` | Fix Kong volume mount to include `deploy/kong.yml` |
| 4 | `deploy/kong.yml` | Verify/add auth service upstream route |
| 5 | `deploy/db-init/00-roles.sql` | Create all Supabase-required DB roles and grants |
| 6 | `docker-compose.yml` | Add `sita-supabase-storage` service |
| 7 | `build-iso.sh` | Inject self-hosted env vars before frontend build |

### Phase 2 — High (Must Fix for Real Usage)
| # | File | Fix |
|---|------|-----|
| 8 | `deploy/db-init/01-extensions.sql` | Enable required PG extensions (uuid-ossp, pgcrypto, pgjwt) |
| 9 | Run all `generate-vmware-*.ts` scripts | Wire into npm `pre-release` script |
| 10 | `deploy/kong.yml` | Audit all upstream port mappings |

### Phase 3 — Medium (Operational Readiness)
| # | File | Fix |
|---|------|-----|
| 11 | `scripts/release/sita-update.sh` | Create A/B root swap + image update script |
| 12 | `scripts/release/sita-recovery.sh` | Create rollback script |
| 13 | `deploy/backup.sh` | Create pg_dump + volume backup automation |
| 14 | `deploy/logrotate-sita.conf` | Add log rotation for host logs |
| 15 | `scripts/release/smoke-test.sh` | Post-deploy validation script |
| 16 | `user-data` | Add `open-vm-tools` package |

### Phase 4 — Polish
| # | File | Fix |
|---|------|-----|
| 17 | `docker-compose.yml` | Add monitoring profile (Prometheus + Grafana) |
| 18 | `docker-compose.dev.yml` | Dev-mode override |
| 19 | `user-data` | Fix MOTD version placeholder |
| 20 | Air-gapped support | Add `pull_policy: never` for offline deployments |

---

## Summary

**Total issues found: 22**
- Critical: 7 (blocks boot or core functionality)
- High: 3 (breaks key features)
- Medium: 6 (operational gaps)
- Low: 6 (polish)

The biggest blockers are: **missing GoTrue auth container**, **missing DB role init**, **missing Storage container**, and **build-iso.sh not running `npm run build`**. Without these four fixes, the ISO will boot Ubuntu successfully and start Docker, but the SITA OS stack will fail at startup because PostgREST/Kong cannot authenticate, auth won't work, and the frontend will try to reach the hosted Supabase instead of local.

