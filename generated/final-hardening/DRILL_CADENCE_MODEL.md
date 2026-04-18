# Drill Cadence — Canonical Model

Each drill row in `drill_cadence_registry` declares:
- `drill_key` (canonical id)
- `display_name`
- `cadence_days` (or `cadence_cron`)
- `owner` / `backup_owner`
- `evidence_table` (where receipts live)
- `success_criteria` (jsonb)
- `failure_action` (alert / block / warn)
- `last_run_at`, `last_status`, `next_due_at`

## Visibility
Drill Cadence Board (`/admin/health` → Drill Cadence) renders the registry live with freshness state.

## Enforcement
`check-drill-cadence-freshness.ts` fails CI if any BLOCK-class drill is overdue.
`check-supportability-review-cadence.ts` ensures supportability reviews are within window.
`check-boardroom-runbook-linkage.ts` ensures the Layer-7 runbook is discoverable.
