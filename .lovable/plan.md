

# SITA OS — Repository-Wide Implementation and Hardening Plan

## Scope Assessment

This repository contains **~9,500 files** across 30+ domains, ~200 edge functions, ~420 database tables, 18 CI workflows, 2 standalone service manifests, and extensive OS/desktop/mobile layers. A single implementation pass cannot safely touch all systems simultaneously without regression risk. This plan prioritizes the **highest-impact, safest changes** organized into implementable batches.

---

## Batch 1 — Root Infrastructure Hardening

### 1.1 Service Manifest Standardization
- Add missing `dev`, `lint`, `typecheck`, `test`, `clean`, `health-check` scripts to `deploy/api-gateway/package.json` and `deploy/brain-core/package.json`
- Add `nats` dependency to `deploy/brain-core/package.json` (currently dynamically imported but not declared)
- Fix `remotion/package.json` React 19 conflict — pin to React 18 to match root

### 1.2 Deploy Service Hardening
- **api-gateway/server.ts**: Add graceful shutdown handler (SIGTERM/SIGINT), structured JSON logging, startup env validation (fail-fast on missing SUPABASE_ANON_KEY), and a `/ready` endpoint distinct from `/health`
- **brain-core/server.ts**: Same graceful shutdown, env validation, `/ready` endpoint, and NATS connection state in readiness check

### 1.3 Root Config Strengthening
- Add `typecheck` and `clean` scripts to root `package.json`
- Add `.env.production.example` with all production-required vars documented (currently exists but may be incomplete — will verify and sync with `docker-compose.yml` env references)
- Harden `Dockerfile`: add `HEALTHCHECK` instruction, non-root user, and `.dockerignore` if missing

### 1.4 ESLint Config Fix
- Change `eslint src/ --max-warnings 0 || true` in CI to actually report (the `|| true` swallows all failures)

---

## Batch 2 — Edge Function Governance and Consolidation

### 2.1 Shared Utilities Consolidation
- Audit `supabase/functions/_shared/` for duplicate CORS, auth, and validation helpers
- Ensure all edge functions import CORS from the shared location (not inline definitions)
- Add a shared `validate-service-role.ts` helper to deduplicate admin auth checks across `admin-reset-user-setup`, `admin-revoke-session`, `webhook-replay`, `generate-support-bundle`, and `release-env-gate`

### 2.2 Edge Function Health Standardization
- Add structured error response schemas to `health-check`, `health-ready`, `health-live` functions
- Ensure `health-ready` checks actual DB connectivity (not just function startup)

---

## Batch 3 — Frontend Canonicalization

### 3.1 Service Layer Deduplication
- `src/lib/services/` has **200+ directories** while the architecture targets **45 canonical services**
- Identify the top 20 duplicate/near-empty service directories and consolidate or mark as deprecated barrel re-exports
- Verify `src/services/index.ts` facade actually resolves all four layers without import errors

### 3.2 Context Provider Audit
- Verify all 22 React contexts in `src/contexts/` are actually consumed
- Identify unused providers and remove from the App.tsx provider tree if dead

### 3.3 Component Primitives Check
- Verify `src/components/primitives/` exists and contains the canonical base components (BaseCard, StatusBadge, etc.)
- Ensure no domain components duplicate primitive functionality

---

## Batch 4 — Database and Security

### 4.1 RLS Coverage Validation
- Run the Supabase linter to check for tables without RLS
- Review any new tables created by recent migrations for proper policies

### 4.2 Admin Audit Table Hardening
- Verify `admin_action_audit` table has append-only trigger (no UPDATE/DELETE policies for non-service roles)

---

## Batch 5 — Operational Layers

### 5.1 Support Bundle Edge Function Hardening
- Verify `generate-support-bundle` redacts PII fields
- Add timeout handling for long-running bundle generation

### 5.2 Release Gate Integration
- Wire `release-env-gate` into the CI pipeline (`release-gates.yml`) as a required check
- Add the env gate as a pre-deploy step in `deploy-backend.yml`

### 5.3 Missing Validators
- Create `scripts/root/check-service-manifest-completeness.ts` — validates all `deploy/*/package.json` files have required scripts
- Create `scripts/root/check-env-contract-completeness.ts` — validates `.env.example` covers all vars referenced in `docker-compose.yml`

---

## Batch 6 — Deployment Honesty

### 6.1 Docker Compose Modernization
- Change `version: "3.8"` to remove the deprecated version key (Compose V2 ignores it)
- Add missing healthcheck for `sita-supabase-storage`

### 6.2 .dockerignore Creation
- Create `.dockerignore` excluding `node_modules/`, `.git/`, `dist/`, `coverage/`, `generated/`, `archive/`, `docs/`, `backups/`

### 6.3 Stale Root File Cleanup
- Archive `WAVE2_ADVISORY_DISPOSITION.md`, `WAVE5_PRODUCTION_HARDENING.md`, `WAVE6_ISO_OVA_RAW_PRODUCTION.md`, `WAVE7_STUB_HARDENING.md` to `docs/waves/` — these are historical planning docs cluttering root

---

## Batch 7 — Test and Proof Infrastructure

### 7.1 Vitest Coverage Thresholds
- Current thresholds are very low (lines: 40%, branches: 30%). Add a ratchet mechanism that prevents regression below current actuals.

### 7.2 Edge Function Test Runner Integration
- Add a CI job that runs `supabase test` for all edge function `_test.ts` files
- Wire this into `ci.yml` as a non-blocking advisory job initially

---

## Implementation Priority Order

| Priority | Batch | Risk | Impact |
|----------|-------|------|--------|
| 1 | Batch 1 (Root Infra) | Low | High — fixes deployment fundamentals |
| 2 | Batch 6 (Deploy Honesty) | Low | Medium — Docker/cleanup |
| 3 | Batch 2 (Edge Functions) | Medium | High — reduces duplication |
| 4 | Batch 5 (Operational) | Low | Medium — adds missing safety nets |
| 5 | Batch 4 (DB Security) | Medium | High — security critical |
| 6 | Batch 3 (Frontend) | High | Medium — large surface area |
| 7 | Batch 7 (Tests) | Low | Medium — quality baseline |

---

## What Remains Intentionally Blocked

- **Desktop signing (macOS/Windows)**: Requires external Apple/Microsoft certificates. Closure path exists via `DesktopUpdateContract`.
- **Mobile native distribution**: Deferred per `PLATFORM_SCOPE.md`. PWA surface is active.
- **Full service consolidation (200 to 45)**: Requires extensive caller migration across 9,500 files. This plan addresses the top 20 duplicates; the remaining 135 require a dedicated consolidation sprint.
- **AI provider live verification**: Requires real API keys for nightly truth probes. Gated behind secrets configuration.

---

## Technical Details

### Graceful Shutdown Pattern (api-gateway & brain-core)
```text
SIGTERM → stop accepting new connections
       → drain in-flight requests (10s timeout)
       → close NATS connection (brain-core)
       → close rate-limit cleanup interval
       → process.exit(0)
```

### Env Validation Pattern (fail-fast)
```text
On startup:
  - Check all required env vars are non-empty
  - Validate URL format for SUPABASE_URL, BRAIN_CORE_URL
  - Validate numeric format for PORT, RATE_LIMIT_MAX
  - If any fail → log structured error → exit(1)
```

### .dockerignore Contents
```text
node_modules/
.git/
dist/
coverage/
generated/
archive/
docs/
backups/
*.md
.env
.env.*
```

