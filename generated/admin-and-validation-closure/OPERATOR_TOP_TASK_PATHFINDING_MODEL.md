# Operator — Top-Task Pathfinding Model

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.

## Goal

Every critical operator task must be reachable in **≤3 clicks** from the Admin
Control Plane root, with a discoverability target of **<30 seconds** for a
trained operator under stress.

## 10 critical operator tasks

| # | Task | Canonical path | Clicks | Find target |
|---|---|---|---|---|
| 1 | AI runtime nightly failure triage | /admin/ai-runtime → Nightly Truth | 2 | <15s |
| 2 | Connector reauth (Google/MS/Slack degraded) | /admin/integrations → Connector card → Reauth | 3 | <20s |
| 3 | Boardroom stuck approval/execution | /admin/approvals → filter "stuck" → drill | 3 | <20s |
| 4 | Kill-switch decision (activate/deactivate) | /admin/trust-security → Kill switches → row action | 3 | <20s |
| 5 | Restore / recovery path (DR drill) | /admin/health → DR drills → run | 3 | <20s |
| 6 | Incident drilldown (alert → cause → action) | /admin/alerts → row → linked runbook | 3 | <20s |
| 7 | Release verification (gates/aggregator state) | /admin/releases → Verification | 2 | <15s |
| 8 | Receipts lookup (action / decision / execution) | /admin/verification → Receipts search | 3 | <30s |
| 9 | Environment / config remediation | /admin/environments → service → action | 3 | <25s |
| 10 | Secret rotation / security anomaly review | /admin/trust-security → Anomalies → drill | 3 | <25s |

## Validation

`scripts/validation/check-admin-top-task-discoverability.ts` enforces:
- ≥10 tasks declared in `admin-usability-status.json`
- every task has `clicks ≤ 3`
- every task has a non-empty `path` and `find_target_seconds`

## Cross-references

- `ADMIN_CONTROL_PLANE_USABILITY_AUDIT.md`
- `OPERATOR_STRESS_TEST_REPORT.md`
- `admin-usability-status.json`
