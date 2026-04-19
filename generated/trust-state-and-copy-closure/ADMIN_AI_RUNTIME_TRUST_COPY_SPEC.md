# Admin AI Runtime — Trust Copy Spec

**Surface**: `/admin/ai-runtime/*` (14-tab AI Engineer hub)
**Owner**: Admin AI Engineering domain

## Distinction: 4 proof tiers

| Tier | Definition | Allowed copy | Badge |
|---|---|---|---|
| Structurally wired | Code path exists; no behavioral proof | "Structurally wired · runtime proof pending" | `StatusBadge tone="pending"` |
| Behaviorally proven | At least one real provider invocation succeeded | "Behaviorally proven · last verified {ts}" | `StatusBadge tone="info"` |
| Nightly verified | Covered by `ai-runtime-nightly-verify` with active streak | "Nightly verified · {N}-day streak" | `StatusBadge tone="success"` |
| Degraded | Fallback / budget / provider failure active | "Degraded · {reason}" | `AIStateBadge state="success_partial"` or `error` |

## Forbidden collapses

- Never display structurally-wired tier as "live" or "healthy"
- Never collapse all four into a single "operational" indicator
- Never imply nightly-verified status without a real streak from `ai_runtime_nightly_runs`

## Required state coverage

- Each tab uses `BoardSection` envelope (loading / error / empty / content) — already canonical
- Validator results panels render exit code + offender count from `generated/<gate>-report.json`
- Receipts surface: link to ledger drill-down
- Fallback events: `AIDegradedState` on detection

## Approved hero phrases

- "Four proof tiers — never collapsed into a single green light"
- "Streak comes from real nightly runs, not from optimism"
- "Every degraded state names the reason and the next operator step"

## Validation

`check-flagship-surface-trust-copy.ts` (existing, scopes `src/pages/admin/ai-runtime` + `src/components/admin/ai-runtime`) protects this surface.
