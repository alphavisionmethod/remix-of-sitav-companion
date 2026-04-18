# Production Restore — Target Model

## Canonical drill phases

1. **preflight** — verify snapshot artifact integrity (sha256), target env empty/seedable
2. **restore_execute** — `pg_restore` with `--clean --if-exists --no-owner`
3. **schema_verify** — diff against canonical manifest (`generated/db-truth/`)
4. **rls_verify** — every public table has ≥1 policy AND `rowsecurity = true`
5. **data_integrity** — row counts within ±5% of snapshot manifest, FK constraints valid
6. **critical_routes** — 12 flagship routes return 200 with seeded auth
7. **edge_functions** — 6 critical edge functions respond to health probe
8. **admin_truth** — `get_db_truth_snapshot('summary')` returns consistent counts
9. **finalize** — write `restore_drill_receipts` row with phase timings, status, evidence

## Pass / fail criteria

| Dimension | Pass | Amber | Red |
|---|---|---|---|
| schema diff | 0 | ≤2 | >2 |
| RLS coverage | 100% | ≥98% | <98% |
| data integrity | within ±5% | ±10% | >±10% |
| route check | 12/12 | 11/12 | <11 |
| edge fn | 6/6 | 5/6 | <5 |
| total duration | <20 min | <40 min | ≥40 min |

## Receipt model

```ts
interface RestoreDrillReceipt {
  id: uuid;
  snapshot_class: 'production-shape' | 'schema-only' | 'synthetic';
  environment: 'staging' | 'preview';
  started_at: timestamptz;
  finished_at: timestamptz;
  status: 'pass' | 'amber' | 'fail';
  phase_durations_ms: Record<phase, number>;
  match_percent: number;
  failed_phases: string[];
  evidence_url: text;
  operator: uuid;
}
```

## Cadence

Monthly (≤35d freshness gate); auto-triggered before any major release.
