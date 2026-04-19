# Thin Empty-State Remediation Report

> Tracker for thin / inline empty-state strings on admin surfaces. The
> closure prompt explicitly requires only **proven-safe** removals; this
> report captures tracked debt for a separate scoped pass.

## Validator

`scripts/validation/check-thin-admin-empty-states.ts` — WARN-tier adoption
tracker. Flags raw `<p>No data</p>`, `<div>No results</div>`, `<span>Empty</span>`
patterns inside `src/pages/admin` and `src/components/admin`.

## Current run

| Metric | Value |
|---|---|
| Files scanned | 679 |
| Offenders | 0 |
| Errors | 0 |
| Warnings | 0 |

Result: **clean**. The canonical empty-state primitives (`EmptyState`,
`PremiumEmptyState`, `BoardSection`, the three `Needs*Explainer` components)
have already been adopted broadly across admin surfaces — no thin one-off
fragments matched the regression patterns at the time of this closure.

## Removal policy this pass

**Zero removals.** This closure ships canonical primitives + drilldowns
additively. Any future thin-empty-state remediation must:

1. Reference-check the file for non-thin uses of the same component.
2. Confirm the empty-state is currently reachable in real product flow
   (not dead code).
3. Replace with the canonical primitive matching the actual data context
   (data missing vs. time-window pending vs. historical-releases pending).

## Tracked remediation patterns (for future passes)

| Anti-pattern | Canonical replacement |
|---|---|
| `<p>No data</p>` (data simply absent) | `<EmptyState />` |
| `<p>No data yet</p>` (window still accumulating) | `<NeedsTimeWindowExplainer />` |
| `<p>No releases recorded</p>` | `<NeedsHistoricalReleasesExplainer />` |
| `<p>No connection</p>` | `<NeedsDataExplainer />` + `<ConnectorStateBadge />` |
| Decorative skeleton with no semantic | `<Skeleton />` from primitives barrel |
