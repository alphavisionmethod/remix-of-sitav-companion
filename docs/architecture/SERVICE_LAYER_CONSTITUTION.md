# SITA OS — Service Layer Constitution

> **Authority:** This document defines the **5-layer service hierarchy** that
> governs every service-bearing file under `src/lib/`. Drift from this
> constitution is blocked at CI by `scripts/architecture/run-service-governance.ts`.

## The Five Canonical Layers

| Layer | Name | Root | Authority |
|-------|------|------|-----------|
| **L1** | Platform Canonical | `src/lib/core-services/` | Infrastructure organs (auth, event bus, executor, receipts, policy, AI runtime). |
| **L2** | Domain Canonical | `src/lib/services/`, `src/lib/engines/`, `src/lib/boardroom/`, `src/lib/advisor-intelligence/`, `src/lib/domain-engines/` | Business / domain logic (boardroom, business-os, money, concierge, lead scoring, planning). |
| **L3** | Integration Adapters | `src/lib/core-services/connector-*`, `src/lib/services/connector-*`, `src/lib/services/cloud-control-plane-infra/` | External provider adapters (Google, banking, CRM, calendar). |
| **L4** | Projection / Read-Model | `src/lib/core-services/projection-service/`, `src/lib/services/projection-service/`, `src/lib/services/audit-trail-timeline/`, `src/lib/services/truth-indices/` | UI-facing aggregations + read models. **Read-only**. |
| **L5** | UI Clients | `src/lib/data-services/` | Mode-aware Supabase CRUD clients consumed by hooks/pages. |

## Authority Rules

1. **One canonical owner per family.** Every service family (e.g. `model-router`, `approval-engine`) has exactly one canonical entry in `src/lib/migration/service-authority-map.ts`. All other entries are wrappers, splits, or projections.
2. **No upward imports.** L1 may not import L2/L3/L4/L5. L2 may import L1 only via canonical barrels. L4 may not mutate. L5 may not contain domain logic.
3. **No cycles.** `core-services/index.ts` may NOT re-export `@/lib/services` — that creates an authority inversion. Use `src/lib/service-facade.ts` for any consumer that needs both.
4. **Wrappers must be pure.** A wrapper (`WRAPPER_COMPAT_ONLY`) contains only `export *` / `export {}` / `export type {}` re-exports plus comments. No independent logic.
5. **Projections are read-only.** A projection service must not call `executor`, write to Supabase, emit receipts, or invoke approval flows.
6. **UI clients stay thin.** `src/lib/data-services/` files may shape Supabase rows for display but must not implement domain rules, scoring, or approval logic.

## Forbidden Cross-Layer Imports

| From ↓ \ To → | L1 Platform | L2 Domain | L3 Integration | L4 Projection | L5 Client |
|---------------|-------------|-----------|----------------|---------------|-----------|
| **L1 Platform** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **L2 Domain** | ✅ (via barrel) | ✅ | ✅ (via barrel) | ❌ | ❌ |
| **L3 Integration** | ✅ (via barrel) | ❌ | ✅ | ❌ | ❌ |
| **L4 Projection** | ✅ (read-only) | ✅ (read-only) | ❌ | ✅ | ❌ |
| **L5 Client** | ❌ | ❌ | ❌ | ❌ | ✅ |

## Wrapper Lifecycle

Wrappers exist only to preserve legacy imports during migration. Lifecycle:

`ACTIVE` → `MIGRATING` → `READY_TO_REMOVE` → `REMOVED`

A wrapper may NOT progress to `READY_TO_REMOVE` while any source file still imports from its legacy path.

## Enforcement

| Script | Rule |
|--------|------|
| `check-service-layer-boundaries.ts` | Forbidden cross-layer imports |
| `check-service-authority-unique.ts` | Each family has exactly one canonical owner |
| `check-wrapper-purity.ts` | Wrappers contain only re-exports |
| `check-projection-purity.ts` | Projections never mutate state |
| `run-service-governance.ts` | Aggregator — runs all 4 above |

## Migration Registry Files

| File | Purpose |
|------|---------|
| `src/lib/migration/service-authority-map.ts` | Canonical layer for every service directory |
| `src/lib/migration/duplicate-service-map.ts` | Strategy for every duplicated family |
| `src/lib/migration/deprecation-map.ts` | Wrapper lifecycle tracker |

## What This Constitution Does NOT Mandate

- **No physical file moves.** Classification-in-place is safer than mass restructuring.
- **No new top-level `platform/` `domains/` `integrations/` folders.** The existing `core-services/` + `services/` + `data-services/` + `engines/` already maps cleanly to the 5 layers.
- **No behavioral changes.** Only governance, classification, import hygiene, and enforcement.

## Wave 1.3 — Vocabulary Bridge: services / adapters / clients

The user-facing vocabulary `service / adapter / client / read-model` maps onto the
5 layers above as follows:

| Vocabulary | Canonical layer(s)                          |
| ---------- | ------------------------------------------- |
| Service    | `PLATFORM_CANONICAL` ∪ `DOMAIN_CANONICAL`   |
| Adapter    | `INTEGRATION_ADAPTER`                       |
| Client     | `UI_CLIENT`                                 |
| Read-model | `PROJECTION_CANONICAL`                      |

Authority: `docs/architecture/SERVICE_ADAPTER_CLIENT_OWNERSHIP_MODEL.md`.
Machine bridge: `src/lib/migration/service-vocabulary-bridge.ts`.
Validator: `scripts/architecture/checks/check-service-vocabulary-coherence.ts` (BLOCKING).

### Rule 7 — Vocabulary class promotions are constitutional events

No file may be promoted between vocabulary classes (Service ↔ Adapter ↔ Client
↔ Read-model) without:

1. an updated entry in `src/lib/migration/service-authority-map.ts`,
2. a passing `check-service-vocabulary-coherence` run,
3. attestation reseal **only** via `scripts/architecture/wave-10-emit-attestation.ts`.

No physical file move, no logic change, no UI change, and no public API change
is permitted in a vocabulary-class promotion PR.
