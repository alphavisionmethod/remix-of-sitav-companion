# SITA OS — Architecture Hardening Status (Phase B3 EXECUTED)

> **Generated:** 2026-04-18 · **Wave:** Phase A + B1 + B2 + B3 + B4

## Checks installed (7, all warn-level)

| Check | Baseline | Current | Budget | Status | Δ |
|---|---:|---:|---:|---|---|
| `check-service-topology.ts` | 178 | 178 | 200 | ✅ OK | — |
| `check-contract-topology.ts` | 0 | 0 | 250 | ✅ OK | — |
| `check-plane-import-graph.ts` | 5 | **0** | 5 baseline | ✅ OK | **−5** ✨ |
| `check-plane-transitive.ts` | n/a | 12 | 50 | ✅ OK | new |
| `check-route-truth.ts` | 26 | 26 | — | ⚠️ WARN | — |
| `check-dead-pages.ts` | 53 | 53 | 150 | ✅ OK | — |
| `check-route-wrapper-usage.ts` | 0 / 8 | 0 / 8 | — | ✅ OK | — |

## Existing checks — still passing
- `check-lib-ownership-drift.ts` — `src/lib/` allowlist enforced
- `check-5-plane-boundaries.ts` — direct edges policed
- 8-gate page-verification suite — GREEN
- All Phase A hotfix shims working

## Structural changes shipped in B3
1. **`src/components/sita/admin/`** added to `SHARED_PRESENTATIONAL` allowlist — eliminates 5 false-positive plane violations.
2. **`scripts/architecture/checks/check-plane-transitive.ts`** — new graph-aware proof (1-hop transitive) with 50-violation budget.
3. **`src/contracts/packages.ts`** — new public barrel re-exporting all 33 named contract families from `src/packages/`, giving consumers a single canonical `@/contracts/*` entry point.

## Decision gates resolved
- ❌ **`src/services/` will NOT be created.** Service classes are correctly distributed across 6 canonical roots. The 178 hidden services in `src/lib/` are a release-health signal, not a structural defect.
- ❌ **`src/packages/` will NOT be replaced.** It already exists with 33 healthy families (448 files). The earlier "src/packages = 0" claim was a tooling error.
- ✅ **`src/contracts/`** is now a thin canonical barrel layer over `src/packages/`.

## Remaining risks (tracked, non-blocking)
1. 178 hidden services in `src/lib/` — opportunistic ratchet target: < 100.
2. 12 transitive plane paths — surface in next refactor wave.
3. 53 detected dead pages — manual triage in dedicated cleanup wave.
4. 26 unresolved route elements — false-positive heavy; detector refinement needed.
5. 5 named contract families to consolidate (≈ 183 files) — opportunistic.

## CI integration
All new checks run `process.exit(0)` regardless of WARN/OK so they never block CI. Promote individual checks to error-level only after their metric stabilizes for 2+ release cycles.
