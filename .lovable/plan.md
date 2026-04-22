

# Backend / Runtime / Service Hardening Plan

This is a 13-phase implementation plan to harden, canonicalize, and production-ready the backend, service, runtime, database, and deployment layers.

---

## Phase 1 — Standardize Deploy Service Manifests

**Goal:** Ensure all deployable service manifests are complete and consistent.

**Files to modify:**
- `deploy/api-gateway/package.json` — add missing `dev`, `test`, `smoke` scripts; pin dependency versions to match brain-core
- `deploy/brain-core/package.json` — add missing `test`, `smoke` scripts; align dependency versions with api-gateway
- Create `deploy/shared/service-baseline.md` — document the canonical script contract (`build`, `start`, `dev`, `typecheck`, `lint`, `clean`, `health-check`, `ready-check`, `test`, `smoke`)

**Details:**
- Both services already have `build`, `start`, `dev`, `typecheck`, `lint`, `clean`, `health-check`, `ready-check` — good baseline
- Add `"test": "echo 'No tests yet' && exit 0"` and `"smoke": "curl -sf http://localhost:$PORT/health || exit 1"` to both
- Align hono/supabase-js versions across both manifests (currently identical — verify stays that way)

---

## Phase 2 — Harden API Gateway Server (`deploy/api-gateway/server.ts`)

**Goal:** Production-grade hardening of the gateway entry point.

**Changes:**
- Add request-ID propagation (`X-Request-Id` header generation + forwarding to brain-core proxy)
- Add timeout handling on brain-core and Supabase proxy calls (currently no `AbortController` timeout — add 30s default)
- Add request body size limiting middleware (reject bodies > 1MB)
- Add `/metrics` endpoint stub (request count, error count, latency percentiles — in-memory)
- Improve error response normalization — ensure all error paths include `_requestId`
- Add `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers with structured logging

---

## Phase 3 — Harden Brain Core Server (`deploy/brain-core/server.ts`)

**Goal:** Production-grade hardening of the brain core entry point.

**Changes:**
- Add request-ID propagation (accept from gateway, generate if missing)
- Add timeout handling on Supabase calls
- Add `/metrics` endpoint stub
- Add request body size limiting
- Add `process.on('unhandledRejection')` / `process.on('uncaughtException')` handlers
- Add NATS health check to `/health` endpoint (currently present but could include last-publish latency)
- Add model budget persistence — currently in-memory (`budgetSpentCents` resets on restart); add Supabase persistence for budget state
- Add input validation (use inline Zod-like validation for all POST endpoints)

---

## Phase 4 — Create Missing `docker-compose.yml` Base Completeness Checks

**Goal:** Ensure the Docker Compose stack is self-consistent.

**Changes:**
- `docker-compose.yml` lines 80+ reference `sita-supabase-db` as dependency but API gateway should also depend on brain-core being healthy
- Add explicit `depends_on` with `service_healthy` for brain-core in api-gateway (currently only depends on db)
- Validate all referenced config files exist: `deploy/traefik/traefik.yml`, `deploy/traefik/dynamic.yml`, `nginx/default.conf`
- Create missing Traefik config files if absent (`deploy/traefik/traefik.yml`, `deploy/traefik/dynamic.yml`)

---

## Phase 5 — Consolidate `src/lib/services/` Sprawl

**Goal:** Reduce 200+ service directories to governed, domain-canonical groupings.

**Approach:** This is the largest phase. Rather than mass-rename/delete (which would break hundreds of imports), we:

1. **Create `src/lib/services/README.md`** — document the canonical domain taxonomy:
   - Core Platform: `brain-core`, `policy-engine`, `approval-engine`, `capability-router`, `executor-service`, `receipt-service`, `verification-engine`, `event-bus`
   - Trust & Security: `trust-governor`, `keyvault`, `duress-detection`, `emergency-halt`, `injection-firewall`, `tenant-firewall`, `trusted-device`
   - AI & Intelligence: `ai-workforce`, `ai-economics`, `model-router`, `inference-gateway`, `council-orchestrator`, `boardroom-service`
   - Business/Finance/Concierge: `business-os`, `finance-os`, `concierge-os`
   - Communications: `communication-service`, `messaging-gateway`, `notifications`, `push-notification`
   - Platform Infrastructure: `realtime-gateway`, `service-registry`, `database`, `degraded-mode`, `observability`
   - Connectors: `connector-control-plane`, `connector-engine`, `connector-runners`, `connector-truth`
   - Support/Recovery: `support-diagnostics`, `self-healing`, `incident-management`

2. **Add `src/lib/services/_domain-ownership.ts`** — a typed registry mapping every service directory to its canonical domain, owner, and status (active/deprecated/experimental)

3. **Create validator `scripts/validators/check-service-domain-ownership.sh`** — ensures every directory under `src/lib/services/` has an entry in the domain ownership registry

---

## Phase 6 — Harden Edge Function Shared Code

**Goal:** Ensure `supabase/functions/_shared/` is production-grade.

**Changes:**
- `_shared/auth.ts` — add timeout to `getUser()` call; add rate-limit-aware error messages
- `_shared/cors.ts` — already excellent with `withCors` wrapper; no changes needed
- `_shared/logger.ts` — add `timer()` method for latency tracking convenience
- `_shared/rate-limit.ts` — verify it uses Supabase-backed state (not in-memory, since edge functions are ephemeral)
- `_shared/validate.ts` / `_shared/zod-validate.ts` — consolidate if both exist and overlap; ensure single canonical validation path
- `_shared/error-sink.ts` — verify it emits structured errors; add dead-letter queue tracking if missing
- `_shared/tracing.ts` — verify it generates/propagates correlation IDs; add parent-span support if missing
- Create `_shared/health.ts` — standardized health response builder for edge functions that expose health endpoints

---

## Phase 7 — Add Backend Validators and Governance Scripts

**Goal:** CI-runnable validators that catch backend drift.

**New files:**
- `scripts/validators/check-edge-function-shared-imports.sh` — verify all edge functions import from `_shared/` for cors/auth/logging (no inline reimplementations)
- `scripts/validators/check-deploy-service-completeness.sh` — verify all `deploy/*/package.json` have required scripts
- `scripts/validators/check-docker-compose-references.sh` — verify all referenced config files and Dockerfiles exist
- Update `scripts/root/check-service-manifest-completeness.ts` — already exists, verify it catches the test/smoke gaps

---

## Phase 8 — Strengthen Database Governance Layer

**Goal:** Ensure DB functions, migrations, and RLS posture are governed.

**Changes:**
- All existing DB functions are already `SECURITY DEFINER` with `search_path = 'public'` — verified good
- All use `has_role()` for admin gating — verified good
- Create `scripts/db/check-function-security-posture.sh` — verify all public functions use `SECURITY DEFINER` + `SET search_path`
- Create `scripts/db/check-rls-coverage.sh` — verify no public tables have RLS disabled (complement the existing `get_db_truth_snapshot('drift')` RPC)
- Verify `supabase/functions/_shared/kill-switch-db.ts` vs `_shared/kill-switch.ts` are not duplicative — consolidate if overlapping

---

## Phase 9 — AI / Advisor / Boardroom Orchestration Hardening

**Goal:** Ensure AI invocation paths are safe, explainable, and non-duplicative.

**Changes:**
- `src/lib/services/brain-core/index.ts` (client-side) vs `deploy/brain-core/server.ts` (server-side) — these inline the same logic. Document this as intentional (client-side for demo mode, server-side for production). Add a comment block in both files cross-referencing the other.
- Verify `src/lib/services/council-orchestrator/` and `src/lib/services/boardroom-service/` are not duplicating `deploy/brain-core/server.ts` council logic — document canonical source
- Ensure `src/lib/services/ai-gateway/` forwards to the `ai-gateway` edge function and does not contain inline AI provider calls
- Verify `src/lib/services/inference-gateway/` vs `src/lib/services/ai-gateway/` are complementary, not duplicative — document roles in `_domain-ownership.ts`

---

## Phase 10 — Recovery / Supportability / Proof Depth

**Goal:** Ensure support bundles, runbooks, and recovery paths are real.

**Changes:**
- Verify `supabase/functions/generate-support-bundle/` produces actionable output (not just metadata)
- Verify `supabase/functions/runbook-drill/` executes real checks
- Verify `supabase/functions/workflow-repair/` and `workflow-replay/` have real repair logic
- Verify `supabase/functions/self-healing/` has real remediation paths
- Add `supabase/functions/_shared/function-support-diagnostics.ts` — already exists; verify it produces structured diagnostics for every function call

---

## Phase 11 — Deployment Honesty and Release Evidence

**Goal:** Ensure deployment artifacts and readiness gates are honest.

**Changes:**
- Verify `scripts/root/check-deployment-readiness.ts` checks all required artifacts
- Verify `scripts/root/check-env-contract-completeness.ts` checks all edge function secrets
- Create/verify `.env.example` at project root with all required env vars documented
- Verify `Makefile` targets match real `docker-compose.yml` service names
- Add `make preflight` target — runs all readiness checks before deploy

---

## Phase 12 — Add Smoke Test Coverage

**Goal:** Every deployable service has a minimal smoke test.

**New files:**
- `deploy/api-gateway/smoke.test.ts` — start server, hit `/health`, `/ready`, verify JSON structure
- `deploy/brain-core/smoke.test.ts` — start server, hit `/health`, `/ready`, `/brain/intent` with test payload

---

## Phase 13 — Delete / Consolidate Dead or Duplicate Backend Code

**Goal:** Remove genuine dead code; consolidate duplicates.

**Actions:**
- Audit `src/lib/services/boardroom/` vs `src/lib/services/boardroom-service/` — if one is deprecated, remove it and redirect imports
- Audit `src/lib/services/api-gateway/` vs `deploy/api-gateway/` — the former is a client-side service abstraction, the latter is the real server; document this, ensure no confusion
- Audit `src/lib/services/brain-core/` vs `deploy/brain-core/` — same pattern as above
- Audit `src/lib/services/security/` vs `src/lib/services/security-privacy/` — consolidate if overlapping
- Audit `src/lib/services/observability/` vs `src/lib/services/observability-hub/` — consolidate if overlapping
- Audit `src/lib/services/fleet/` vs `src/lib/services/fleet-health/` vs `src/lib/services/fleet-ota/` — verify they are complementary
- Remove any truly dead service directories (no imports, no exports consumed)

---

## Technical Summary

| Layer | Current State | After Plan |
|---|---|---|
| Deploy manifests | Missing test/smoke scripts | Complete operational scripts |
| Service entrypoints | Good baseline, missing timeouts/request-IDs | Production-grade with observability |
| Service sprawl (200+ dirs) | Ungoverned | Domain-owned registry + validator |
| Edge function shared code | Good (withCors, auth, logger) | Consolidated + health helper |
| Database governance | Strong (SECURITY DEFINER, has_role) | Validator-backed |
| AI orchestration | Dual client/server implementations | Documented canonical sources |
| Recovery/support | Functions exist | Verified real logic |
| Deployment readiness | CI gates exist | Preflight Makefile target |
| Smoke tests | Missing | 2 service smoke tests |
| Dead code | Potential duplicates | Audited and consolidated |

