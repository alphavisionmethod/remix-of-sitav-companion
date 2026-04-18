# Production Restore — Operator Visibility

## Where operators see this
- **Primary:** `/admin/health` → Drill Cadence module → "Production restore" row
- **Secondary:** `/admin/releases` → Launch Readiness (drift if drill stale)
- **Truth artifact:** `generated/restore-and-oauth-hardening/production-restore-status.json`

## What operators see
- Last successful drill timestamp
- Status (pass / fail / degraded)
- Match percent
- Phase durations
- Failed phases (if any)
- Direct link to receipt row

## Alerts
- Stale (>35d): WARN row in cadence board, BLOCK in release gate
- Failed last run: RED row in cadence board, BLOCK in release gate
