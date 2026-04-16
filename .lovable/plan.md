
The user wants the Edge Function Topology hardening implemented in phases, each deployment-ready. Looking at existing code, much foundation is already in place:

- `src/lib/backend-topology/` exists with edge-function-categories.ts, edge-function-registry, edge-function-auth-map, contract-map, owner-map, runtime-consequence-map, migration-map, topology-validator, and bounded-contexts
- `src/lib/migration/edge-function-authority-map.ts` exists
- `scripts/runtime/edge-functions/` has ownership, auth, topology, category-coverage, auth-map checks

So the work is hardening, not greenfield. I need to: complete the audit metadata for all 74-84 functions, classify into the 6 canonical categories (PUBLIC_BFF, ADMIN_BFF, DOMAIN_FUNCTION, ORCHESTRATION_FUNCTION, CONNECTOR_WEBHOOK_FUNCTION, RUNTIME_SYSTEM_FUNCTION) replacing the current looser taxonomy, identify ambiguous functions (main, api-gateway, admin-gateway, admin-api, intelligence-api, brain-core, agent-intelligence, agent-executor, os-command, ambient-os-operations), wire splits/wrappers, add purity tests, and integrate with admin Backend Topology dashboard already at /admin/backend-topology.

6 phases that won't break the active admin consolidation work and Manifest Truth Framework already in flight:

<lov-plan>

# Edge Function Topology Hardening — Phased Plan

## Goal
Take 84 edge functions from a loose 13-category taxonomy to a strict 6-category backend topology with one role, one bounded context, one owner, one auth model, one contract class per function. Zero broken callers, zero functional loss, CI-enforced.

## Foundation Already In Place
- `src/lib/backend-topology/` — registry, categories, auth-map, contract-map, owner-map, consequence-map, migration-map, validator
- `src/lib/migration/edge-function-authority-map.ts` — auth class registry
- `scripts/runtime/edge-functions/` — 5 governance checks
- `/admin/backend-topology` dashboard — already live
- Manifest Truth Framework — `manifest-edge-function-governance` already authoritative

The work below replaces the loose 13-category model with the strict 6-class topology and proves every function obeys one-role-one-context.

## Final Topology (6 canonical categories)
```
PUBLIC_BFF              — user-facing aggregation only
ADMIN_BFF               — owner/admin aggregation only
DOMAIN_FUNCTION         — single bounded domain concern
ORCHESTRATION_FUNCTION  — multi-step coordination only
CONNECTOR_WEBHOOK       — provider ingestion/adaptation
RUNTIME_SYSTEM          — OS/device/runtime channels
```

## High-Risk Ambiguity Targets (audited Phase 1, resolved Phases 2-4)
`main`, `api-gateway`, `admin-gateway`, `admin-api`, `cloud-admin-api`, `admin-bff-gateway`, `user-bff-gateway`, `intelligence-api`, `brain-core`, `agent-executor`, `agent-intelligence`, `os-command`, `ambient-os-operations`

## Phase Sequencing (each independently deployable)

### Phase 1 — Exhaustive Audit & Strict Classification
- Add `BackendCategory` enum (the 6 canonical classes) to `edge-function-categories.ts` alongside the existing finer-grained categories (kept as `subCategory`).
- Audit every function in `supabase/functions/*` by inspecting its `index.ts` for: aggregation patterns, orchestration patterns, webhook signatures, runtime channel patterns, side effects.
- Produce `generated/edge-function-classification-audit.json` with verdict per function: one of `PUBLIC_BFF | ADMIN_BFF | DOMAIN_FUNCTION | ORCHESTRATION_FUNCTION | CONNECTOR_WEBHOOK_FUNCTION | RUNTIME_SYSTEM_FUNCTION | SPLIT_REQUIRED | DUPLICATE_MERGE_REQUIRED | WRAPPER_ONLY | DEPRECATE_AND_REDIRECT`.
- Write `docs/architecture/BACKEND_TOPOLOGY_MAP.md` with the full classification table, ambiguity findings, and migration plan per high-risk function.
- New check: `check-backend-topology-classification-coverage.ts` — fails if any function lacks a strict category verdict.
- **Deployable**: pure metadata + docs, zero behavior change.

### Phase 2 — Strict Registry & Per-Function Metadata
- Replace `edge-function-registry.ts` entries with the full required schema: `{ id, name, path, category, boundedContext, owner, authModel, requestContract, responseContract, sideEffectClass, allowedCallers, callsInto, runtimeConsequence, migrationStatus }`.
- Backfill every function with real values pulled from the audit + existing auth/contract/owner maps.
- Add `edge-function-topology-validator.ts` enforcement: one-category-only, allowedCallers must be a known caller class, callsInto must reference real functions.
- New check: `check-backend-registry-completeness.ts` — fails on any missing field for any function on disk.
- Update `/admin/backend-topology` dashboard to display strict category, allowed callers, and call graph from the new registry.
- **Deployable**: registry only — no function code touched yet.

### Phase 3 — Resolve Ambiguous Admin Plane
Targets: `admin-api`, `admin-gateway`, `admin-bff-gateway`, `cloud-admin-api`.
- Pick `admin-bff-gateway` as the canonical ADMIN_BFF.
- Convert `admin-api` and `admin-gateway` to thin compatibility wrappers that forward to `admin-bff-gateway` (kept until callers migrated).
- Reclassify `cloud-admin-api` as `DOMAIN_FUNCTION` (cloud control plane bounded context) — it stops claiming admin-aggregator role.
- Update all admin frontend callers (hooks, services) to point at `admin-bff-gateway`.
- New check: `check-admin-bff-canonical.ts` — fails if more than one function declares ADMIN_BFF.

### Phase 4 — Resolve Ambiguous AI Runtime + Generic Gateways
Targets: `main`, `api-gateway`, `intelligence-api`, `brain-core`, `agent-intelligence`, `agent-executor`.
- `main` → audit verdict applied: either deprecate-and-redirect or rename to its real single role; keep wrapper for callers.
- `api-gateway` → constrain to PUBLIC_BFF for non-admin surfaces, OR demote to wrapper if `user-bff-gateway` covers it.
- `intelligence-api` → PUBLIC_BFF (frontend AI query aggregator only). Strip orchestration logic.
- `brain-core` → ORCHESTRATION_FUNCTION (planner/sequencer). Strip frontend-safe response shaping.
- `agent-intelligence` → DOMAIN_FUNCTION (reasoning service) OR merge into `brain-core` per audit.
- `agent-executor` → ORCHESTRATION_FUNCTION (execution chain). Confirm it remains the sole executor choke point per the HARD RULE.
- Update frontend AI clients (`invokeAICapability`, advisor hooks) to target the canonical entry points.
- New check: `check-bff-purity.ts` — fails if any PUBLIC_BFF or ADMIN_BFF function imports orchestration/executor/runtime modules.

### Phase 5 — Resolve Runtime/System Boundary
Targets: `os-command`, `os-status`, `ambient-os-operations`, `runtime-probes`, `device-telemetry`, `system-updates`, `os-agent-channel`, `self-healing`.
- Lock all eight as RUNTIME_SYSTEM with explicit `allowedCallers` (kernel runtime only, never frontend BFF callers).
- Split `ambient-os-operations` if audit shows it mixes ambient UX orchestration with runtime control — UX side moves to `ORCHESTRATION_FUNCTION`, runtime side stays.
- Add caller-class enforcement at `_shared/auth.ts` level: RUNTIME_SYSTEM functions reject calls from PUBLIC_BFF caller class.
- New checks: `check-runtime-isolation.ts`, `check-connector-boundary.ts` — fail on cross-category caller violations.

### Phase 6 — Tests, CI Wiring, Cleanup
- 8 vitest suites mapped to the 8 required tests in the prompt: category classification, one-role-one-function, BFF purity, domain boundedness, runtime isolation, connector boundary, auth model mapping, registry completeness.
- Wire all backend-topology checks into `validate-all.ts` aggregator (already established by Manifest Truth Framework Phase 4).
- Regenerate manifests: `service-manifest`, `integration-map`, `contract-manifest`, `runtime-conformance`, `admin-support-visibility`, `edge-function-governance-report`.
- Retire compatibility wrappers from Phase 3-4 only after frontend caller migration is complete and zero references remain (verified by import-graph scan).
- Final pass: every function has one category, one owner, one auth model, one contract — or it does not deploy.

## Deliverables
- 6-class strict topology with audit verdict for every function
- Complete `edge-function-registry.ts` with all required fields
- Canonical singletons: one ADMIN_BFF, one PUBLIC_BFF, one executor
- Compatibility wrappers for safe caller migration
- 8 governance tests + 4 new architecture checks
- Updated `/admin/backend-topology` dashboard
- `BACKEND_TOPOLOGY_MAP.md` doc + regenerated manifests
- CI enforcement: any topology drift fails the release gate

## Non-Negotiable Rules
- One function, one category — splits or wrappers, never overloading
- BFFs aggregate only; no orchestration, no provider logic, no runtime channels
- Runtime/system functions reject PUBLIC_BFF callers
- No legacy function deleted until import-graph proves zero callers
- Admin consolidation (12-domain IA) and Manifest Truth Framework remain intact
- Each phase ends with: `tsc --noEmit` clean, all checks green, app boots, no regressions

## Starting Point
Phase 1 — Exhaustive Audit & Strict Classification — in the next message.

