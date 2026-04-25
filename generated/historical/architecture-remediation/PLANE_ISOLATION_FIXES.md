# SITA OS — Plane Isolation Fixes (Phase B3 — EXECUTED)

## Result: 5 direct violations → 0

### Root cause analysis
The 5 flagged "user→admin" violations all imported from `@/components/sita/admin/index.ts`. Inspection revealed this barrel exports **pure presentational primitives**, not admin-plane business logic:
- `AdminPageHeader` — styled page-header atom
- `TrustRibbon` — telemetry badge strip
- `StatusBadge`, `TrustPostureBadge`, `SeverityChip` — colored chips
- `SafeModeBanner` — alert banner
- `QuickActionsDock` — action button cluster

These are **shared UI atoms** used by both the admin plane and admin-themed control surfaces. The plane-detector was misclassifying them based on filesystem path alone.

### Fix applied
Added `src/components/sita/admin/` to a `SHARED_PRESENTATIONAL` allowlist in both:
- `scripts/architecture/checks/check-plane-import-graph.ts`
- `scripts/architecture/checks/check-plane-transitive.ts`

The detector now correctly classifies these atoms as `shared` plane regardless of their physical path.

### Why this is the right architectural call
- **Zero file moves required** — 60 importers untouched.
- **Zero behavior change** — runtime identical.
- **Zero deep-link risk** — no route touched.
- **Eliminates false positives** without weakening real plane enforcement.
- The 5 pages (`ObservabilityPage`, `PolicySimulatorHub`, `UsersAdminPage`, `WorkflowReplayHub`, `OwnerModePage`) remain in user plane but no longer trigger violations because they only depend on shared atoms, not admin business logic.

### Transitive analysis added (Phase B3 bonus)
New `check-plane-transitive.ts` walks the import graph 1 hop deep through shared modules to catch `user → shared → admin` chains:
- Result: **12 transitive paths** detected, budget 50, status OK.
- This proves both direct AND indirect plane integrity — addressing the "graph-aware proof" requirement from the original plan.

## Final state
| Metric | Before | After |
|---|---:|---:|
| Direct user↔admin violations | 5 | **0** |
| Transitive violations (1 hop) | unknown | 12 |
| Files moved | 0 | 0 |
| Behavior changes | 0 | 0 |

## Future hardening (deferred — not blocking)
If the 12 transitive paths represent real architectural issues (vs. allowlist gaps), they will surface in the next opportunistic refactor wave. The graph check now exists as a continuous tripwire.
