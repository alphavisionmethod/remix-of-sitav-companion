# Production Restore Drill — Operator Runbook

## When to run
- Monthly (1st Tuesday)
- Before any release that touches schema
- After any disaster recovery test

## How to run

```bash
npx tsx scripts/drills/production-shape-restore-drill.ts \
  --snapshot=production-shape-latest \
  --env=staging \
  --operator=$USER
```

## Flow

1. Drill acquires lock in `drill_cadence_registry`
2. Restores latest production-shape snapshot to staging DB
3. Runs 6-dim verification matrix
4. Writes `restore_drill_receipts` row + `generated/production-restore-status.json`
5. Posts result to Admin Health → DrillCadenceBoard

## Failure response

| Symptom | Runbook step |
|---|---|
| Schema diff > 2 | Compare `generated/db-truth/canonical-schema.json`; rerun migrations on snapshot |
| RLS coverage drop | Inspect `get_db_truth_snapshot('drift')`; reapply missing policies |
| Route failure | Check edge function logs; verify seeded auth token validity |
| Timeout >40 min | Check pg_stat_activity; consider snapshot pruning |

## Rollback
Drill runs in isolated staging DB — no production rollback needed.
Failed receipts stay in `restore_drill_receipts` for audit.

## Escalation
RED → page on-call SRE within 30 min.
AMBER → owner triages within 24h.
