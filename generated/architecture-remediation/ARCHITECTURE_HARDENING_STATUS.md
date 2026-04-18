# SITA OS — Architecture Hardening Status

> **Generated:** 2026-04-18 · **Phase:** B2 (Guardrails installed)

## Checks added (6, all warn-level)

| Check | Baseline | Current | Budget | Status |
|---|---:|---:|---:|---|
| `check-service-topology.ts` | 178 hidden in `src/lib/` | 178 | 200 | ✅ OK |
| `check-contract-topology.ts` | named-family leaks | 0 | 250 | ✅ OK |
| `check-plane-import-graph.ts` | direct user↔admin | 5 | 5 | ✅ OK (baseline) |
| `check-route-truth.ts` | unresolved route elements | 26 | — | ⚠️ WARN (false-positive heavy; see notes) |
| `check-dead-pages.ts` | unreferenced pages | 53 | 150 | ✅ OK |
| `check-route-wrapper-usage.ts` | undeclared wrappers | 0 / 8 | — | ✅ OK |

## Existing checks — still passing
- `check-lib-ownership-drift.ts` — `src/lib/` allowlist enforced
- `check-5-plane-boundaries.ts` — direct edges policed
- 8-gate page-verification suite (P5/W2 status)

## Notes on the route-truth check
The 26 "unresolved" elements are likely from route files that compose JSX dynamically (`<Route element={routes[key].component} />`) or use HOC wrappers. A future refinement will follow named exports through barrel files. For now, kept warn-level so it surfaces drift but never blocks.

## Remaining risks (for future waves)
1. **Transitive plane analysis** — current check is direct-edge only. A graph-walking variant would catch `user → shared → admin` chains.
2. **178 hidden services in `src/lib/`** — should ratchet down opportunistically.
3. **5 user→admin direct violations** — fix by reclassifying admin-themed user pages to admin plane.
4. **53 detected dead pages** — manual triage required; many are likely false positives (dynamic mounts).

## Decision gates resolved
- ❌ **`src/services/` will NOT be created.** Service classes are correctly distributed.
- ❌ **`src/packages/` will NOT be replaced.** It already exists with 33 healthy families.
- ✅ **`src/contracts/`** stays as a thin barrel layer over `src/packages/`.
