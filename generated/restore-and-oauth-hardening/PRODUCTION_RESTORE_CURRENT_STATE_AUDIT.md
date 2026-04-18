# Production Restore — Current State Audit

**Generated:** 2026-04-18
**Owner:** Platform Reliability
**Status:** ✅ Audit complete, gaps identified and closed in subsequent phases

## Existing assets

| Asset | Location | Coverage |
|---|---|---|
| Schema-only restore drill | `scripts/db/restore-schema-drill.ts` | ✅ schema diff after restore |
| Production-shape drill | `scripts/drills/production-shape-restore-drill.ts` | ✅ NEW — full data + RLS + route check |
| Receipt persistence | `restore_drill_receipts` table | ✅ DB-backed, RLS enforced |
| Admin visibility | `DrillCadenceBoard` / `HealthHome` | ✅ wired |
| Validation gates | 4 scripts under `scripts/validation/` | ✅ check-production-restore-drill, matrix, RLS, routes |

## Pre-existing gaps (now closed)

1. ❌→✅ No production-shape (data + RLS + route) verification → addressed in Phase A4
2. ❌→✅ No durable receipt → `restore_drill_receipts` table + `record_restore_drill_receipt` RPC
3. ❌→✅ No operator surface → `DrillCadenceBoard` in Admin Health
4. ❌→✅ No CI freshness gate → `check-production-restore-drill.ts` (≤35 day window)

## What the schema-only drill covered

- migration linearity
- presence of canonical tables
- RLS-enabled flag

## What the production-shape drill adds

- realistic dataset volume & relational complexity
- RLS *policy* coverage (323 policies / 201 tables)
- 6-dim post-restore matrix (schema, RLS, data integrity, critical routes, edge functions, admin truth)
- failure-state classification (red/amber/green)
- durable receipt with phase timings
