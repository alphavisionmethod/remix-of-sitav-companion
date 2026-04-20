# SITA OS — Backend Topology Map

**Status**: Phase 1 — Exhaustive Audit & Strict Classification (complete)
**Authority**: `src/lib/backend-topology/edge-function-categories.ts` → `EDGE_FUNCTION_BACKEND_CATEGORY`
**Audit**: `generated/edge-function-classification-audit.json`
**Coverage gate**: `scripts/runtime/edge-functions/check-backend-topology-classification-coverage.ts`

## The 6-Class Strict Topology

Every edge function belongs to **exactly one** of these classes. No overlap, no catch-all.

| Class | Role | Allowed | Forbidden |
|-------|------|---------|-----------|
| **PUBLIC_BFF** | User-facing aggregation | Aggregate, compose, shape user-safe payloads | Own domain logic, run admin ops, runtime control |
| **ADMIN_BFF** | Owner/admin aggregation | Compose admin dashboards, triage payloads | Replace domain APIs, execute privileged logic |
| **DOMAIN_FUNCTION** | Single bounded domain concern | One mutation/query per bounded context | Cross-domain orchestration, generic gateway behavior |
| **ORCHESTRATION_FUNCTION** | Multi-step coordination | Sequence, plan, dispatch, retry chains | Public-facing API, admin dashboards |
| **CONNECTOR_WEBHOOK_FUNCTION** | Provider ingestion | OAuth, callbacks, sync, transform | Generic domain APIs, frontend aggregation |
| **RUNTIME_SYSTEM_FUNCTION** | OS/device/runtime channels | Device commands, telemetry, system probes | Public business APIs, admin dashboards |

## Canonical Singletons

| Role | Canonical Function | Notes |
|------|-------------------|-------|
| **ADMIN_BFF** | `admin-bff-gateway` | Sole admin aggregation entry — enforced by check-admin-bff-canonical |
| **PUBLIC_BFF** (user) | `user-bff-gateway` | Sole user aggregation entry |
| **PUBLIC_BFF** (intelligence) | `intelligence-api` | Frontend AI query aggregator only — no orchestration |
| **PUBLIC_BFF** (support) | `support-gateway` | User support aggregation |
| **PUBLIC_BFF** (license) | `license-gateway` | License/entitlement aggregation |
| **Sole executor** | `agent-executor` | HARD RULE — sole orchestration choke point |

## High-Risk Ambiguity Targets — Resolution Plan

| Function | Verdict | Resolution Phase | Action |
|----------|---------|------------------|--------|
| `main` | **DEPRECATE_AND_REDIRECT** | Phase 4 | Audit; deprecate or rename to specific role; keep wrapper |
| `api-gateway` | **WRAPPER_ONLY** | Phase 4 | Demote to wrapper forwarding to `user-bff-gateway` |
| `admin-api` | **WRAPPER_ONLY** | Phase 3 | Wrapper → `admin-bff-gateway` |
| `admin-gateway` | **WRAPPER_ONLY** | Phase 3 | Wrapper → `admin-bff-gateway` |
| `cloud-admin-api` | **DOMAIN_FUNCTION** | Phase 3 | Reclassified to cloud control plane domain |
| `intelligence-api` | **PUBLIC_BFF** | Phase 4 | Strip orchestration, keep aggregation only |
| `brain-core` | **ORCHESTRATION_FUNCTION** | Phase 4 | Strip frontend response shaping |
| `agent-intelligence` | **DOMAIN_FUNCTION** | Phase 4 | Reasoning service OR merge into brain-core |
| `agent-executor` | **ORCHESTRATION_FUNCTION** | Phase 4 | Sole executor — confirm choke point |
| `ambient-os-operations` | **SPLIT_REQUIRED** | Phase 5 | Split UX-orch from runtime control |
| `os-command` | **RUNTIME_SYSTEM_FUNCTION** | Phase 5 | Lock with explicit allowedCallers (kernel only) |

## Classification Counts (86 functions)

See `generated/edge-function-classification-audit.json` for full per-function detail.

| Class | Count |
|-------|-------|
| ADMIN_BFF | 1 |
| PUBLIC_BFF | 4 |
| DOMAIN_FUNCTION | 38 |
| ORCHESTRATION_FUNCTION | 18 |
| CONNECTOR_WEBHOOK_FUNCTION | 12 |
| RUNTIME_SYSTEM_FUNCTION | 7 |
| _Migration: WRAPPER_ONLY_ | 3 |
| _Migration: SPLIT_REQUIRED_ | 1 |
| _Migration: DEPRECATE_AND_REDIRECT_ | 1 |

## Non-Negotiable Rules

1. **One function, one BackendCategory** — no overloading, no ambiguity.
2. **BFFs aggregate only** — no orchestration, no provider logic, no runtime channels.
3. **Runtime/system functions reject PUBLIC_BFF callers** — caller-class enforcement (Phase 5).
4. **Connector functions stay connector-scoped** — never become domain APIs.
5. **No legacy function deleted until import-graph proves zero callers** (Phase 6).
6. **Generic catch-all names** (`main`, `api-gateway`, `admin-api`) become wrappers, not canonical entry points.

## Phase Sequencing

- ✅ **Phase 1** — Exhaustive Audit & Strict Classification (this doc)
- **Phase 2** — Strict Registry & Per-Function Metadata
- **Phase 3** — Resolve Ambiguous Admin Plane
- **Phase 4** — Resolve Ambiguous AI Runtime + Generic Gateways
- **Phase 5** — Resolve Runtime/System Boundary
- **Phase 6** — Tests, CI Wiring, Cleanup

## CI Enforcement

```bash
npx tsx scripts/runtime/edge-functions/check-backend-topology-classification-coverage.ts
```

Fails on:
- Any function on disk without a `BackendCategory` verdict
- More than one `ADMIN_BFF`
- Phantom classifications (no on-disk function)
- Migration verdicts (`WRAPPER_ONLY`, `SPLIT_REQUIRED`, etc.) emit warnings until resolved
