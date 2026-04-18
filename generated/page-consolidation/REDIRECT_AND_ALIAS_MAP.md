# Redirect & Alias Map
> Generated: 2026-04-18T11:38:28.102Z
> Source: `scripts/architecture/audits/emit-consolidation-docs.ts`
> Status: Phase 2 (Redirect & Alias Layer) — **bookmark-safe forever**.

Every legacy / duplicate URL listed below resolves to its canonical
target via `<Navigate to={canonical} replace />`. CI gate
`check-redirect-coverage` blocks merge if any consolidation-map
entry classified as DUPLICATE_MERGE_REQUIRED, DEPRECATE_WITH_REDIRECT,
or REMOVE_AFTER_SAFE_MIGRATION lacks a redirect target.

## Admin redirects (9 total)

| From | → | To | Reason | Source |
|---|---|---|---|---|
| `/admin/dashboard` | → | `/admin/overview` | duplicate-merge | `AdminDashboard` |
| `/admin/operations-hub` | → | `/admin/overview` | duplicate-merge | `AdminOperationsHub` |
| `/admin/ai-team/approval-queue` | → | `/admin/approvals` | duplicate-merge | `HQApprovalQueue` |
| `/admin/ai-gateway/honesty` | → | `/admin/ai-runtime/launch-truth` | duplicate-merge | `AIG06LaunchTruth` |
| `/admin/operations-hub` | → | `/admin/overview` | duplicate-merge | `AdminOperationsHub` |
| `/admin/mission-control` | → | `/admin/overview` | duplicate-merge | `MissionControlHome` |
| `/admin/system-health` | → | `/admin/health` | duplicate-merge | `SystemHealthDashboard` |
| `/admin/intelligence` | → | `/admin/intelligence/efficiency` | deprecate | `IntelligenceLayerAdmin` |
| `/admin/ai` | → | `/admin/ai-runtime` | deprecate | `AIRuntimeHome` |

## User-domain redirects (14 total)

| From | → | To | Reason |
|---|---|---|---|
| `/investments` | → | `/investment` | domain-rename |
| `/investments/boardroom` | → | `/investment/boardroom` | domain-rename |
| `/investments/markets` | → | `/investment/markets` | domain-rename |
| `/investments/portfolio` | → | `/investment/portfolio` | domain-rename |
| `/investments/strategy` | → | `/investment/strategy` | domain-rename |
| `/investments/execute` | → | `/investment/execute` | domain-rename |
| `/investments/research` | → | `/investment/research` | domain-rename |
| `/investments/risk` | → | `/investment/risk` | domain-rename |
| `/investments/family-office` | → | `/investment/family-office` | domain-rename |
| `/board` | → | `/boardroom` | legacy-path |
| `/file` | → | `/files` | legacy-path |
| `/finance` | → | `/money` | domain-rename |
| `/finance/overview` | → | `/money/overview` | domain-rename |
| `/finance/bills` | → | `/money/bills` | domain-rename |

## How redirects are mounted

Both lists are spread into their respective route families:
- `src/routes/AdminRoutes.tsx` — appends `ADMIN_REDIRECTS.map(...)`
- `src/App.tsx` — appends `USER_REDIRECTS.map(...)`

This keeps the redirect surface auto-derived from the consolidation
map, so future Phase 5 view migrations only need to update the
classification — no second source of truth to keep in sync.
