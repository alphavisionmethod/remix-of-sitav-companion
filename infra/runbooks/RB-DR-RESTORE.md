# RB-DR-RESTORE — Disaster Recovery / Database Restore

> **Owner:** platform-sre · **Tier:** R5 (catastrophic) · **Drill cadence:** monthly

## Recovery objectives

- **RPO (Recovery Point Objective):** ≤ 5 minutes (continuous WAL archival)
- **RTO (Recovery Time Objective):** ≤ 30 minutes (full restore + verify)

## Triggers

| Trigger | Action |
|---|---|
| Postgres unavailable > 3 min | Activate `KS-OUTBOUND`, page on-call, begin restore prep |
| Detected data corruption | Activate `KS-PAYMENTS`, `KS-PAYMENTS-AUTH`, `KS-OUTBOUND`; freeze writes |
| Region outage | Failover to standby region (see ARQ_PLAN_FINAL.md §regional) |
| Accidental destructive migration | Restore from PITR snapshot before migration timestamp |

## Standard restore procedure

### 1. Freeze the system
```sh
# Activate write-blocking switches
curl -X POST $SUPABASE_URL/functions/v1/kill-switch-toggle \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"switchId":"KS-OUTBOUND","action":"activate","reason":"DR restore in progress"}'
```

### 2. Identify recovery point
- For corruption: identify last-good timestamp via `audit-log-export`.
- For outage: latest WAL applied (Lovable Cloud auto-restore).

### 3. Perform restore
- **Lovable Cloud-managed Postgres:** open project → **Database** → **Backups** → choose point-in-time.
- **Self-hosted:** apply the most recent dump from `generated/dr/dump-*.sql` then replay WAL.

### 4. Verify
Run the drill script against the restored DB:
```sh
PGSCRATCH_URL="postgres://..." npx tsx scripts/db/backup-restore-drill.ts
```
Expected: all critical tables within ±1% row count of pre-restore snapshot.

Spot-check key tables:
```sql
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.advisor_board_recommendations WHERE created_at > NOW() - INTERVAL '24 hours';
SELECT MAX(created_at) FROM public.kill_switch_audit_log;  -- should be ≤ RPO old
```

### 5. Re-open writes
```sh
curl -X POST $SUPABASE_URL/functions/v1/kill-switch-toggle \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"switchId":"KS-OUTBOUND","action":"deactivate","reason":"restore verified"}'
```

### 6. Receipt + post-mortem
- Drill receipt is at `generated/backup-restore-drill-receipt.json`.
- File post-mortem within 48h via `/admin/health/incidents`.

## Monthly drill

Runs automatically on the 1st of each month via `.github/workflows/dr-drill.yml`
(or manually with `npm run dr:drill`). Receipt is committed to
`generated/backup-restore-drill-receipt.json` and cross-checked by the
"It's Real" gate.

## Cross-region failover

For regional outage scenarios see `infra/docs/ARQ_PLAN_FINAL.md` §"Regional Strategy".
The `cloud-tenant-api` edge function exposes `?action=region-failover` that flips
the active read endpoint; writes follow once the standby promotes.

## What this runbook does NOT cover

- Storage bucket restore (separate runbook, RB-STORAGE-RESTORE)
- Edge function rollback (handled by Lovable Cloud deploy history)
- Auth user restoration (auth.* schema is managed by Lovable Cloud — open support ticket)
