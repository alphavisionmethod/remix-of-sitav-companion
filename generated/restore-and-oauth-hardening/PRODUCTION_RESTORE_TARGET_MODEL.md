# Production Restore — Target Model

## Canonical model

```
snapshot → preflight → restore → schema-verify → data-verify
        → object-verify → RLS-verify → app-usability-verify
        → runtime-truth-verify → final-summary → durable-receipt
```

## Phases

| # | Phase | Tooling | Pass criteria |
|---|---|---|---|
| 1 | Snapshot selection | scrubbed prod-shape fixtures | snapshot exists, hash matches manifest |
| 2 | Preflight | drill script | target env empty/restorable |
| 3 | Restore execution | pg_restore / migration replay | exit 0, no errors |
| 4 | Schema verify | introspection | tables/views/functions/triggers all present |
| 5 | Data integrity | row-count ranges, FK joins | within tolerance |
| 6 | Object verify | indexes/triggers/policies | all expected objects present |
| 7 | RLS verify | `check-post-restore-rls-integrity.ts` | 100% coverage |
| 8 | App usability | `check-post-restore-critical-routes.ts` | golden-path routes return 200 |
| 9 | Runtime truth | manifests refreshed | no drift |
| 10 | Final summary | report + receipt row | persisted |

## Receipt schema (`restore_drill_receipts`)
- `id`, `started_at`, `finished_at`, `status` (pass/fail/degraded)
- `snapshot_class`, `phase_durations` (jsonb)
- `failed_phases` (jsonb), `match_percent`, `evidence_url`
- `runner_user_id`

## Cadence
Monthly (≤35 days between successful drills) — enforced by `check-production-restore-drill.ts`.
