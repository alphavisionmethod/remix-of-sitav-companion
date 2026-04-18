# Production Restore — Operator Visibility

## Surfaces

| Surface | Path | Component | Shows |
|---|---|---|---|
| Admin Health hub | `/admin/health` | `DrillCadenceBoard` | Latest drill, freshness, pass rate |
| Admin Releases | `/admin/releases` | release aggregator | Restore gate status |
| Drill registry | `drill_cadence_registry` table | DB | All drill runs |
| Receipts | `restore_drill_receipts` table | DB | Phase timings, evidence |
| CI gate | `scripts/validation/check-production-restore-drill.ts` | CI | Freshness ≤35d |

## Operator queries

```sql
-- latest drill
SELECT * FROM restore_drill_receipts ORDER BY finished_at DESC LIMIT 1;

-- freshness
SELECT EXTRACT(EPOCH FROM (now() - max(finished_at)))/86400 AS days_old
FROM restore_drill_receipts WHERE status = 'pass';

-- failure trend
SELECT date_trunc('month', finished_at), status, count(*)
FROM restore_drill_receipts GROUP BY 1, 2 ORDER BY 1 DESC;
```

## Alerts
- AMBER: drill stale > 30d → Slack #ops-platform
- RED: drill failed OR stale > 35d → page on-call
