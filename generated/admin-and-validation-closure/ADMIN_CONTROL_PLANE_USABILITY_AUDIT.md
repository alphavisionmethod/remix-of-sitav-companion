# Admin Control Plane — Usability Audit

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.
> Source of truth: live evidence from `generated/admin-operator-coherence-report.json`,
> `generated/admin-board-polish-report.json`, `generated/admin-ai-runtime-drilldowns-report.json`,
> `generated/admin-integrations-health-visibility-report.json`.

## Scope

Audit of all 12 canonical admin domains against 9 usability criteria, scored from
existing live gate evidence (no speculative scoring).

## 12-domain × 9-criterion matrix

| Domain | Registry-backed | Action-oriented | Cross-linked | Empty-state | Loading-state | Error-state | Drilldown | Trust copy | Discoverable |
|---|---|---|---|---|---|---|---|---|---|
| overview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| alerts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| approvals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| environments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ai-runtime | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| integrations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| trust-security | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| health | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| releases | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| config | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| support | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Result:** 12/12 domains pass all 9 criteria. Coherence is structurally complete.

## Outstanding usability concerns (this closure pass)

1. **AI Engineer hub (19 modules, growing):** module count is now high; consolidation
   is preferred over expansion. NEW truth panels added by this closure do NOT add
   new domains; they extend the existing AI-Runtime hub only.
2. **Top-task discovery:** there is no canonical pathfinding model. This closure
   adds `OPERATOR_TOP_TASK_PATHFINDING_MODEL.md` declaring 10 critical tasks each
   with ≤3-click paths.
3. **Museum-board risk:** as boards multiply, action-orientation must be enforced.
   This closure adds `check-no-museum-boards.ts` and `check-admin-action-orientation.ts`
   to scan `src/pages/admin/ai-runtime/**` for status-only Cards lacking remediation
   links.

## Linked deliverables

- `OPERATOR_TOP_TASK_PATHFINDING_MODEL.md`
- `ADMIN_DOMAIN_CONSOLIDATION_AND_LINKAGE_PLAN.md`
- `MUSEUM_BOARD_AUDIT.md`
- `admin-usability-status.json`
