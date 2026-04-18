# Drill Cadence — Current State Audit

| Drill | Cadence | Owner | Evidence | Status |
|---|---|---|---|---|
| Production restore | 35d | DR lead | `restore_drill_receipts` | ✅ wired |
| OAuth refresh probe | hourly | Integrations | `oauth_refresh_probe_results` | ✅ wired (pg_cron) |
| Release artifact verification | per release | Release captain | `os-release-readiness-report.json` | ✅ wired |
| Sealed baseline review | 30d | Security | `baseline.sealed.json` | ✅ wired |
| Notification calmness review | 14d | UX-Ops | notification audit | ✅ wired |
| Operator golden path drill | 30d | Operator on-call | golden-path receipts | ✅ wired |
| Kill-switch TTL expiry | nightly | Platform | `kill_switch_audit_log` | ✅ wired (pg_cron) |
| Connector health review | 7d | Integrations | connector dashboard | ✅ wired |
| Edge function governance | weekly | Platform | governance gate | ✅ wired |

Registry: `drill_cadence_registry` (9 canonical entries).
Freshness gate: `check-drill-cadence-freshness.ts`.
