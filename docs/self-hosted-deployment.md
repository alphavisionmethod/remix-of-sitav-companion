# SITA OS — Self-Hosted Deployment Guide

## Overview

SITA OS supports full self-hosted deployment via Docker Compose for enterprise/air-gapped environments.
The stack runs identically to the cloud version, with all services containerized.

## Architecture

| Container | Service | Port | Description |
|-----------|---------|------|-------------|
| `sita-traefik` | Reverse Proxy | 80, 443 | TLS termination, routing |
| `sita-web` | Frontend SPA | 80 (internal) | Nginx-served React app |
| `sita-api-gateway` | API Gateway | 3000 | Auth, rate limiting, proxying |
| `sita-brain-core` | Brain Core | 3001 | Intent parsing, council, model routing, NATS |
| `sita-nats` | NATS JetStream | 4222, 8222 | Event bus |
| `sita-supabase-*` | Database, Auth, Storage | 5432, 8000 | Supabase self-hosted |

## API Gateway Features

- **JWT Authentication**: Validates Supabase JWTs on all `/api/*` routes
- **Rate Limiting**: In-memory per-IP rate limiting (configurable via `RATE_LIMIT_MAX`)
  - General: 500 req/min (default)
  - Auth paths: 20 req/min (hardened)
- **Brain Core Proxy**: Routes `/api/intent`, `/api/council`, `/api/model/route`, `/api/advisors`, `/api/simulation`, `/api/approval`
- **Edge Functions Proxy**: Routes `/api/functions/*` to Supabase Edge Functions runtime
- **Supabase Proxy**: Routes `/api/supabase/*` with apikey injection
- **CORS**: Configurable allowed origins
- **Health Check**: `GET /health` returns service status + uptime

## Brain Core Features

- **Intent Parsing**: NLP-based intent classification (query/action/simulation/approval/boardroom/diagnostic)
- **Council System**: Multi-advisor deliberation with consensus scoring
- **Model Router**: Tier-based model selection (nano/standard/premium/reasoning) with budget constraints
- **Advisor Selection**: Trust-weighted advisor pool with domain matching
- **Simulation Builder**: Multi-scenario simulation with parameter ranges
- **Approval Builder**: Risk-assessed approval packages with evidence chains
- **NATS JetStream**: All events published to `brain.*` subjects with 7-day retention
- **Supabase Persistence**: Service-key Supabase client for server-side writes

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only) |
| `VITE_SUPABASE_URL` | Frontend Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend Supabase anon key |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Supabase JWT secret |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | `http://localhost:8080` | Frontend origin for CORS |
| `RATE_LIMIT_MAX` | `500` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `NATS_URL` | `nats://sita-nats:4222` | NATS server URL |
| `ACME_EMAIL` | `admin@sita.local` | Let's Encrypt email |

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your secrets

# 2. Build and deploy
./scripts/deploy-vmware.sh

# 3. Verify
curl http://localhost:8080/health.json
curl http://localhost:3000/health
curl http://localhost:3001/health
```

## Health Checks

All containers expose health endpoints. Docker Compose uses these for startup ordering:

```bash
# Frontend
curl http://localhost:8080/health.json

# API Gateway
curl http://localhost:3000/health
# Returns: { status, service, version, uptime, timestamp }

# Brain Core
curl http://localhost:3001/health
# Returns: { status, service, version, uptime, nats_connected, supabase_connected, timestamp }

# NATS
curl http://localhost:8222/healthz
```

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
- **Retention**: 30-day rolling with automatic cleanup

## ISO/OVA Build

For air-gapped appliance deployments:

```bash
./scripts/build-ova.sh
# Creates sita-os-1.0.0.tar.gz with all images + deploy script
```

## Security

- All API routes require valid JWT (except `/health`)
- Rate limiting prevents brute-force attacks
- CORS restricted to configured origins
- Supabase service key never exposed to frontend
- NATS uses internal Docker network only
- Traefik handles TLS termination with Let's Encrypt
