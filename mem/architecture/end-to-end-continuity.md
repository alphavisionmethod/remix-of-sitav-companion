---
name: End-to-End Continuity Rule
description: Cross-module entity handoffs MUST use canonical continuity primitives and emit a proof receipt at module boundaries.
type: constraint
---

# End-to-End Flow Continuity Rule (Phase 10 — enforcing)

All cross-module entity handoffs MUST use the canonical continuity primitives:

1. **Origin** — call `setLinkedContext({ entityType, entityId, entityLabel })`
   from `@/platform/sita/components/sita/CrossAppAction` (or its
   `<CrossAppAction>` JSX wrapper) BEFORE navigating to the destination
   route.
2. **Destination** — call `useLinkedContext()` from `@/hooks/useLinkedContext`
   (preferred — auto-consumes) or `consumeLinkedContext()` directly, and
   discriminate on `linked.entityType` to auto-select / scroll-to / pre-filter
   the originating row.
3. **Module-crossing state transitions** — must additionally emit a proof
   receipt via `useAction("<domain>", "<verb>", ...)` so the boundary
   crossing is auditable.

## Forbidden

- Programmatic `navigate(...)` to a different module without
  `setLinkedContext` (silent drop).
- `setLinkedContext({ entityType: "X" })` whose target route's consume site
  doesn't accept entity type "X" (orphan handoff).
- Importing `@/data/fixtures/mock-data/*` outside of an `isDemo` /
  `isDemoMode` guard (fixture leak — advisory).

## Enforcement

- `scripts/architecture/check-continuity-handoffs.ts` runs in **enforce**
  mode in CI (`.github/workflows/check-boundaries.yml`). Set
  `CONTINUITY_HANDOFFS_ENFORCE=false` only during a known migration window.
- `scripts/architecture/emit-continuity-baseline.ts` regenerates
  `generated/audits/end-to-end-flow-continuity-baseline.json`.
- Cross-module top-level routes (e.g. `/recovered-value`, `/lead-recovery`)
  are mapped to their owning module family in `CROSS_MODULE_ROUTE_OWNERSHIP`
  inside the validator — extend that map when adding new top-level routes.

## Golden Paths covered

- `GP-OPPORTUNITY-TO-PAID-INVOICE` (P0)
- `GP-LEAD-TO-RECOVERED-VALUE` (P1)
- `GP-SUPPORT-TO-HEALTH-SIGNAL` (P1)
- `GP-CRM-CONCIERGE-LINKAGE` (P1)
- `GP-BACKGROUND-TASK-SOURCE-NAV` (P2)