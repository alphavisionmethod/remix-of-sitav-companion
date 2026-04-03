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

## Monitoring

- Container health via Docker health checks
- Application health via Mission Control
- Connector health via connector-control-plane

## Backup

- Database: pg_dump scheduled backups
- File storage: Volume snapshots
- Configuration: Version-controlled env files

See `docs/vmware-deployment.md` for detailed setup instructions.
