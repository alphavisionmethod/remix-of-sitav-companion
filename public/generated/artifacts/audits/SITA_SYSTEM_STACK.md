# SITA OS — System Stack (Canonical 3-Layer Architecture)

> **Authority:** This document is the **single source of truth** for SITA OS's layered architecture. The TypeScript companion is `src/lib/architecture/system-layer-registry.ts`. CI must validate every directory and route against this stack.

## The Three Canonical Layers

| Layer | Name | Purpose | Canonical Roots |
|-------|------|---------|-----------------|
| **L1** | User Experience | Pages, shells, widgets, boardroom/admin/mobile/desktop surfaces | `src/pages/`, `src/components/`, `src/shells/`, `src/features/`, `src/admin/` |
| **L2** | Domain Framework | Bounded contexts: boardroom, business, money, concierge, investment, setup, proof/trust | `src/lib/services/`, `src/lib/engines/`, `src/lib/boardroom/`, `src/lib/advisor-intelligence/`, `src/lib/domain-engines/` |
| **L3** | Platform Services | The 8 organs every surface and domain depends on | `src/lib/platform/`, `src/lib/policy/`, `src/lib/runtime/`, `src/lib/core-services/` |

## Layer 3 — The 8 Platform Services

Every service below has: a TypeScript registry file (canonical truth), a companion document (this folder), and one or more enforcement points.

| Service | Registry | Doc |
|---------|----------|-----|
| Auth | `src/lib/platform/auth/auth-runtime.ts` + `session-registry.ts` | `AUTH_AND_IDENTITY_RUNTIME.md` |
| Policies | `src/lib/policy/unified-policy-matrix.ts` + `policy-enforcement-map.ts` | `UNIFIED_PERMISSION_AND_POLICY_MATRIX.md` |
| Proof | `src/lib/platform/proof/proof-registry.ts` + `proof-requirement-map.ts` | `PROOF_AND_AUDIT_MODEL.md` |
| Execution | `src/lib/platform/execution/execution-registry.ts` + `execution-policy-map.ts` | `EXECUTION_MODEL.md` |
| Eventing | `src/lib/runtime/runtime-message-registry.ts` + `event-classification-map.ts` | `RUNTIME_MESSAGING_ARCHITECTURE.md` |
| Observability | `src/lib/platform/observability/observability-registry.ts` | `OBSERVABILITY_AND_INCIDENT_MODEL.md` |
| Sync | `src/lib/platform/sync/sync-topology-registry.ts` | `SYNC_AND_CONTINUITY_MODEL.md` |
| Notifications | `src/lib/platform/notifications/notification-topology.ts` | `NOTIFICATION_RUNTIME_MODEL.md` |

## Import Direction Rules

```
L1 (UX)        ➜ may import from L2, L3
L2 (Domain)    ➜ may import from L2, L3
L3 (Platform)  ➜ may import from L3 only
```

**Forbidden**: L3 must NEVER import L1 or L2. L2 must NEVER import L1 (pages/components).

## Validation

- `validateSystemStack()` from `system-layer-registry.ts` returns `{ ok: false, missing: [...] }` if any of the 10 entries is absent.
- CI script: `scripts/architecture/check-layer-boundaries.ts` enforces forbidden imports.
- Every L3 service has at least one consumer in L2 or L1.

## Notes

- The **service-facade** (`src/lib/service-facade.ts`) is the only legal place for cross-layer barrels needed by both L2 and L3.
- Platform barrels under `src/platform/*` are convenience re-exports for app code; they all map back to `src/lib/platform/*` truth.
- Adding a new L3 service requires: a registry file, a companion doc, and a corresponding entry in `SYSTEM_LAYER_REGISTRY`.
