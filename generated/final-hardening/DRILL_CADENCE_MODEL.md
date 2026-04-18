# Drill Cadence — Canonical Model

## Registered drills

| Drill | Category | Cadence | Owner | Backup | Evidence |
|---|---|---|---|---|---|
| restore-drill-production-shape | restore | monthly | platform-reliability | sre-oncall | `restore_drill_receipts` |
| oauth-refresh-probe-google | connector-refresh | hourly | integrations | platform | `oauth_refresh_probe_results` |
| oauth-refresh-probe-microsoft | connector-refresh | hourly | integrations | platform | `oauth_refresh_probe_results` |
| oauth-refresh-probe-slack | connector-refresh | hourly | integrations | platform | `oauth_refresh_probe_results` |
| release-artifact-verification | release-artifact | per-release | release-eng | platform | `release_artifact_verifications` |
| baseline-seal-verification | baseline-seal | quarterly | governance | platform | `baseline_seal_audits` |
| notification-calmness-review | notification-calmness | quarterly | product-ops | design | `notification_review_logs` |
| admin-golden-path-drill | admin-golden-path | monthly | platform-ops | sre-oncall | `golden_path_drill_runs` |
| boardroom-followthrough-runbook-drill | admin-golden-path | quarterly | product-ops | platform-ops | `runbook_drill_runs` |

## Categories (covered)
restore · connector-refresh · release-artifact · baseline-seal · notification-calmness · admin-golden-path

## Storage
`drill_cadence_registry` table with: `drill_key, cadence_class, owner, backup_owner, last_run_at, next_due_at, last_status, evidence_table`.

## Validation
- `check-drill-cadence-freshness.ts` — all 9 registered, db-backed
- `check-supportability-review-cadence.ts` — all 6 categories covered

## Visibility
`DrillCadenceBoard` in `/admin/health`.
