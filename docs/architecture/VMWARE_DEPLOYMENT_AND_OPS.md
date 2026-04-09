# SITA OS — VMware Deployment & Ops

## Deployment Model

SITA OS supports deployment via Docker Compose on VMware infrastructure for enterprise/self-hosted scenarios.

## Container Architecture

| Container | Service | Port |
|-----------|---------|------|
| web | Frontend SPA (nginx) | 8080 |
| api-gateway | API routing | 3000 |
| brain-core | Orchestration | 3001 |
| supabase-* | Database, Auth, Storage | 5432, 8000 |

## Configuration

Environment variables:
- `VITE_SUPABASE_URL` — Supabase endpoint
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `BRAIN_CORE_URL` — Brain core service endpoint

## Health Checks

Each container exposes `/health` endpoint.
Docker Compose health checks ensure startup order.

## OTA Updates

Automated over-the-air updates via `scripts/release/iso/sita-ota-agent.sh`:
- Version check against update endpoint (`SITA_UPDATE_URL`)
- Docker image pull and rolling restart
- Health check validation post-update
- Automatic rollback on failure
- Managed by `sita-ota.service` + `sita-ota.timer` (systemd)

## Backup & Recovery

Automated backups via `scripts/release/iso/sita-backup.sh`:
- **Database**: `pg_dump` scheduled backups (daily via systemd timer)
- **Volumes**: Docker volume snapshots for `sita-*` volumes
- **Config**: Version-controlled env files backup
- **Retention**: 30-day rolling retention with automatic cleanup
- **Restore**: `scripts/restore-backup.sh` for database recovery

Managed by `sita-backup.service` + `sita-backup.timer` (systemd).

## ISO Build

For air-gapped or appliance deployments:
- Autoinstall profiles in `scripts/release/iso/autoinstall/`
- Device profiles in `scripts/release/iso/profiles/`
- OVA export via `scripts/build-ova.sh`

## Monitoring

- Container health via Docker health checks
- Application health via Mission Control
- Connector health via connector-control-plane

See `docs/vmware-deployment.md` for detailed setup instructions.
