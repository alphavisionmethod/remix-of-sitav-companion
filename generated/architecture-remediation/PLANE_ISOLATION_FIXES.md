# SITA OS — Plane Isolation Fixes (Phase B3 scope)

## 5 direct violations identified — all `user → admin`

| Page | Action | Wave |
|---|---|---|
| `src/pages/ObservabilityPage.tsx` | Move to `src/pages/admin/observability/` + add user-redirect | future |
| `src/pages/PolicySimulatorHub.tsx` | Move to `src/pages/admin/policy/` + redirect | future |
| `src/pages/UsersAdminPage.tsx` | Move to `src/pages/admin/users/` + redirect | future |
| `src/pages/WorkflowReplayHub.tsx` | Move to `src/pages/admin/workflows/` + redirect | future |
| `src/pages/owner-mode/OwnerModePage.tsx` | Reclassify as admin shell | future |

All 5 import the same admin barrel `@/components/sita/admin`. Moving the pages corrects the plane assignment without breaking imports.

## Why deferred
These pages are user-facing routes — moving them affects nav, command palette, and deep links. They require their own dedicated wave with redirect-map updates. The plane-graph check is now in place at warn-level (baseline=5) so the count cannot grow.

## Guardrail (active now)
`scripts/architecture/checks/check-plane-import-graph.ts` — warn if `> 5` direct violations.
