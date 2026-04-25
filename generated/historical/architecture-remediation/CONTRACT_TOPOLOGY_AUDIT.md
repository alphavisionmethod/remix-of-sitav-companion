# SITA OS — Contract Topology Audit (Phase B1 Evidence)

> **Generated:** 2026-04-18 · **Source:** `contract-topology-map.json`

## TL;DR

- **`src/packages/` IS populated** (33 contract families, 448 files) — earlier "src/packages = 0" claim was wrong.
- **`src/contracts/` is sparse** (3 files) — a `constants/`+`types/` shell with `index.ts`.
- **390 files** are in canonical contract homes (`src/packages/` + `src/contracts/`).
- **1,138 files** match contract patterns but live outside canonical homes (≈ 74% leak rate by detection, but most are false positives — see "Detection caveat").

## Decision: do NOT recreate `src/packages/` differently

`src/packages/` already exists with the proper family structure:
```
ai-contracts, audit-contracts, boardroom-contracts, business-contracts,
concierge-contracts, enterprise-contracts, event-types, feature-flags,
finance-contracts, graph-contracts, moat-contracts, policy-contracts,
proof-model, reality-contracts, release-contracts, simulation-contracts,
telemetry, template-registry, workflow-primitives, ...
```

The earlier audit's "src/packages = 0" was a tooling error. **`src/packages/` is the canonical home and is healthy.**

## Top "leaked" families (by detector)

| Family bucket | Files | Likely target | Notes |
|---|---:|---|---|
| `misc` | 873 | mostly co-located types | ⚠️ Most are legitimate component/page types — not true leaks. |
| `types-leak` | 59 | `src/contracts/types/` | Real leak candidates. |
| `architecture-contracts` | 38 | `src/packages/architecture-contracts/` (new) | Worth consolidating. |
| `engines-contracts` | 37 | `src/packages/engines-contracts/` (new) | Worth consolidating. |
| `sync-engine-contracts` | 37 | `src/packages/sync-engine-contracts/` (new) | Worth consolidating. |
| `orchestration-contracts` | 36 | `src/packages/orchestration-contracts/` (new) | Worth consolidating. |
| `nova-sdk-contracts` | 35 | `src/packages/nova-sdk-contracts/` (new) | Worth consolidating. |
| `cloud-contracts` | 9 | `src/packages/cloud-contracts/` | Small consolidation. |
| `customer-journey-contracts` | 4 | `src/packages/customer-journey-contracts/` | Small consolidation. |

## Detection caveat

The detector flags any `export type|interface` + `export const *Schema` + `z.object(...)`. UI files often legitimately export prop types — those show up as `misc` and are **not real leaks**. The high-value targets are the named family buckets above (~250 files), not the 873 `misc`.

## Recommended actions (B3-scoped)

1. Add `check-contract-topology.ts` (Phase B2) — warn-level, tracks named families only.
2. Consolidate the 5 large named families (architecture, engines, sync-engine, orchestration, nova-sdk) into new `src/packages/<family>/` subdirs in **opportunistic future waves**.
3. Do **not** mass-move `misc` files — most are co-located prop types and belong with their components.
4. Promote `src/contracts/` to a thin re-export barrel over `src/packages/` so consumers have a single import path.
