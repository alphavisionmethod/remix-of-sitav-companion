# Operational Friction and Gap Register

This register lists residual friction or gaps surfaced by the human-use operator validation walk.

## Findings

**No P0/P1 operator friction was identified in this pass.**

The alert → runbook → kill-switch → evidence → recovery loop is wired end-to-end for all 6 canonical scenarios.

## Tracked Forward

- **GH-006** (from Section A): cross-link each `## Active Caveats` entry in claim-bearing docs to its specific evidence file. This will further reduce time-to-evidence during incidents.
- **GH-005** (from Section A): operator-profile E2E smoke. Reduces risk of an operator workspace regression slipping past structural gates.

Both are tracked in `GATE_HARDENING_PLAN.md`. Neither is a release blocker.

## Empty Buckets (good)

- Hard-to-find runbooks: 0
- Confusing kill-switch UX: 0
- Weak evidence visibility: 0
- Missing alert ↔ runbook linkage: 0 (all 17 kill-switches with runbookRef where applicable; all 20 runbooks with detection + recovery steps)

If a future pass surfaces friction, register it with the format used in `ADMIN_REMEDIATION_PRIORITY_PLAN.md`.
