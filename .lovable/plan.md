

# Edge Function Topology Hardening — Implementation Audit

## Verdict: **~25% complete. Phase 1 only. Phases 2-6 NOT executed.**

The user's claim of full implementation does not match disk reality. Below is the exact gap analysis against the 6-phase plan that was approved.

## What IS Done (Phase 1 only)

| Item | Status |
|---|---|
| `BackendCategory` enum (6 strict classes) | ✅ in `edge-function-categories.ts` |
| `EDGE_FUNCTION_BACKEND_CATEGORY` map | ✅ all 84 functions classified |
| `docs/architecture/BACKEND_TOPOLOGY_MAP.md` | ✅ exists |
| `generated/edge-function-classification-audit.json` | ✅ exists |
| `check-backend-topology-classification-coverage.ts` | ✅ exists |
| Audit verdicts assigned (incl. SPLIT_REQUIRED, WRAPPER_ONLY, DEPRECATE_AND_REDIRECT) | ✅ |

## What is NOT Done (critical gaps)

### Phase 2 — Strict Registry & Per-Function Metadata ❌
- `edge-function-registry.ts` still uses the **old 4-field schema** (`name, path, runtime, status, description`). The required schema (`category, boundedContext, owner, authModel, requestContract, responseContract, sideEffectClass, allowedCallers, callsInto, runtimeConsequence, migrationStatus`) is NOT applied.
- Registry has **74 entries on disk has 84** — **10 functions missing from registry**: `app-store-api`, `communications-api`, `connector-sync`, `digital-twin-engine`, `health-check`, `investment-portfolio-api`, `license-gateway`, `payment-kill-switch`, `simulation-engine-api`, `tasks-workflow-api`.
- `check-backend-registry-completeness.ts` does NOT exist.

### Phase 3 — Resolve Ambiguous Admin Plane ❌
- `admin-api` is still **868 lines of full admin business logic** — NOT converted to a wrapper despite `WRAPPER_ONLY` verdict.
- `admin-gateway` is still **101 lines of independent gateway logic** — NOT a wrapper.
- `cloud-admin-api` reclassification not propagated to admin frontend callers.
- `check-admin-bff-canonical.ts` does NOT exist.

### Phase 4 — Resolve AI Runtime + Generic Gateways ❌
- `main` is still **59 lines of catch-all routing** — NOT deprecated/redirected.
- `api-gateway` is still **1,064 lines** — NOT demoted to a wrapper.
- `intelligence-api` (981 lines) and `brain-core` (799 lines) still contain mixed responsibilities — orchestration not stripped from BFF.
- Frontend AI clients (`invokeAICapability`, advisor hooks) NOT migrated to canonical entries.
- `check-bff-purity.ts` does NOT exist.

### Phase 5 — Runtime/System Boundary ❌
- `ambient-os-operations` still flagged `SPLIT_REQUIRED` with no split performed.
- `_shared/auth.ts` does NOT enforce caller-class restrictions (RUNTIME_SYSTEM rejecting PUBLIC_BFF callers).
- `check-runtime-isolation.ts` and `check-connector-boundary.ts` do NOT exist.

### Phase 6 — Tests, CI Wiring, Cleanup ❌
- **Zero vitest suites** for the 8 required tests (category classification, BFF purity, domain boundedness, runtime isolation, connector boundary, auth model mapping, registry completeness, one-role-one-function). Search `src/__tests__` returned no matches.
- Generated manifests (`service-manifest`, `integration-map`, `contract-manifest`, `runtime-conformance`, `admin-support-visibility`) NOT regenerated against new topology.
- No legacy wrapper retirement (none were created).

## Required Plan to Reach 100% Deployment-Ready

### Step A — Close Phase 2 (deployable on its own)
- Rewrite `edge-function-registry.ts` to the full 11-field schema for all **84** functions.
- Add the 10 missing functions to the registry.
- Backfill `category, boundedContext, owner, authModel, requestContract, responseContract, sideEffectClass, allowedCallers, callsInto, runtimeConsequence, migrationStatus` from the existing maps + audit JSON.
- Create `check-backend-registry-completeness.ts` and wire to validate-all.
- Update `useBackendTopologyHealth` + `/admin/backend-topology` to display new fields.

### Step B — Execute Phase 3 (Admin plane consolidation)
- Convert `supabase/functions/admin-api/index.ts` → 30-line forwarder to `admin-bff-gateway`.
- Convert `supabase/functions/admin-gateway/index.ts` → 30-line forwarder to `admin-bff-gateway`.
- Audit & move any unique logic from `admin-api`/`admin-gateway` into `admin-bff-gateway` first.
- Reclassify `cloud-admin-api` callers (no code change in callers — still `cloud-admin-api`, just bounded-context label).
- Add `check-admin-bff-canonical.ts`.

### Step C — Execute Phase 4 (AI runtime + generic gateways)
- Convert `main/index.ts` → deprecation 410 response with redirect headers.
- Convert `api-gateway/index.ts` → forwarder to `user-bff-gateway` (preserve any non-overlapping routes by extracting to bounded domain functions first).
- Audit `intelligence-api` and `brain-core`: extract orchestration code into `brain-core`, keep `intelligence-api` as pure aggregator.
- Reconfirm `agent-executor` is sole executor (HARD RULE).
- Update frontend callers in `src/lib/services/ai-gateway/` and advisor hooks.
- Add `check-bff-purity.ts` (static AST scan: BFFs cannot import orchestration/runtime modules).

### Step D — Execute Phase 5 (Runtime boundary)
- Split `ambient-os-operations` into `ambient-orchestration` (ORCHESTRATION) + `ambient-os-operations` (RUNTIME_SYSTEM only).
- Add caller-class header check to `_shared/auth.ts`: `requireCallerClass(req, allowed: BackendCategory[])`.
- Add `check-runtime-isolation.ts`, `check-connector-boundary.ts`.

### Step E — Execute Phase 6 (Tests + CI + manifests)
- 8 vitest suites in `src/__tests__/backend-topology/` covering all required assertions.
- Regenerate `service-manifest.json`, `integration-map.json`, `contract-manifest.json`, `runtime-conformance-manifest.json`, `admin-support-visibility-manifest.json`, `edge-function-governance-report.json`.
- Wire all 4 new checks into `scripts/manifests/validate-all.ts` aggregator.
- Final `tsc --noEmit` + full check suite green.

## Order of Execution
Steps A → B → C → D → E. Each step is independently deployable. Total work is the remaining ~75% of the original plan.

## Non-Negotiable Rules (still in force)
- No legacy function deleted until import-graph proves zero callers.
- Wrappers must preserve request/response shape for migration safety.
- Admin consolidation (12-domain IA) and Manifest Truth Framework remain intact at every step.
- Each step ends with: tsc clean, all governance checks green, app boots.

## Starting Point
Step A (Phase 2 completion) — full 11-field registry rewrite with all 84 functions — in the next message.

