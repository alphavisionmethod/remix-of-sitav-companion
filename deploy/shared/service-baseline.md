# SITA OS — Deploy Service Baseline Contract

Every deployable service under `deploy/` MUST have a `package.json` with these scripts:

| Script | Purpose | Required |
|--------|---------|----------|
| `build` | Compile TypeScript to `dist/` | ✅ |
| `start` | Run compiled output (`node dist/server.js`) | ✅ |
| `dev` | Watch-mode development (`tsx --watch`) | ✅ |
| `typecheck` | `tsc --noEmit` — CI gate | ✅ |
| `lint` | ESLint the entrypoint | ✅ |
| `clean` | Remove `dist/` | ✅ |
| `health-check` | `curl` the `/health` endpoint | ✅ |
| `ready-check` | `curl` the `/ready` endpoint | ✅ |
| `test` | Unit tests (stub OK if none yet) | ✅ |
| `smoke` | Integration smoke against running service | ✅ |

## Runtime Hardening Checklist

Every server entrypoint (`server.ts`) MUST implement:

- [x] Env validation (fail-fast on missing required vars)
- [x] Structured JSON logging (`{ ts, level, service, msg, ... }`)
- [x] Request-ID propagation (`X-Request-Id` header)
- [x] Body size limiting (default 1MB)
- [x] In-memory metrics (`/metrics` endpoint)
- [x] Health endpoint (`/health`)
- [x] Readiness endpoint (`/ready`)
- [x] Graceful shutdown (SIGTERM/SIGINT with drain timeout)
- [x] `unhandledRejection` / `uncaughtException` handlers
- [x] Timeout on upstream proxy calls (default 30s)
- [x] Error normalization with `_requestId` in responses

## Dependency Alignment

All services MUST use aligned versions of shared dependencies:
- `hono`: `^4.4.0`
- `@hono/node-server`: `^1.11.0`
- `@supabase/supabase-js`: `^2.101.1`
- `typescript`: `^5.8.3`
- `@types/node`: `^22.16.5`