# Human-Use Operational Scenarios

These are the 6 canonical incident scenarios used to validate that real human operators can detect, respond to, and recover from realistic incidents — not just that the artifacts exist.

## Scenarios

### S-CONNECTOR — Connector failure
- **Trigger:** OAuth refresh fails for ≥1 active provider, or connector webhook returns 5xx for 3 consecutive cycles.
- **Detect:** `IntegrationsHome` + `OAuthRefreshHealthBoard` shows `failing`. Alert raised via `raiseAlert` → appears in `/admin/alerts`.
- **Runbook:** RB-007 (Connector Failure Recovery).
- **Kill-switch:** `KS-CONNECTORS` (cooldown applies).
- **Evidence:** `oauth-refresh-probe-status.json`, connector audit log row.
- **Recovery confirmation:** OAuth refresh succeeds + alert auto-clears.

### S-AI — AI provider incident
- **Trigger:** AI Gateway returns 3+ consecutive errors from same provider.
- **Runbook:** RB-002 (AI Provider Outage).
- **Kill-switch:** `KS-MODEL-PROVIDERS` (dual-approval required).
- **Evidence:** `ai_provider_health` row, fallback events in `ai_fallback_events`.
- **Recovery confirmation:** Fallback chain disengages + provider health returns `ok`.

### S-BOARDROOM — Backlog or execution failure
- **Trigger:** Approved Boardroom items stuck in `executing` or `outcome_pending` beyond SLO.
- **Runbook:** Boardroom-Followthrough Runbook (`generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md`).
- **Kill-switch:** `KS-ADVISORS` (significant impact).
- **Evidence:** `boardroom-layer7-closure-report.json`, `boardroom_followthrough_dispatches`, `boardroom_outcome_records`.
- **Recovery confirmation:** Stuck items move to `executed` / `closed`.

### S-DB — DB / restore incident
- **Trigger:** Health check fails on a critical table, or restore drill detects integrity miss.
- **Runbook:** RB-014 (DB Restore + Integrity Recovery).
- **Kill-switch:** Domain-targeted (varies by affected subsystem).
- **Evidence:** `post-restore-verification-matrix.json`, `db-reality-report.json`.
- **Recovery confirmation:** Post-restore matrix passes ≥95%.

### S-NOTIFY — Notification / queue failure
- **Trigger:** Outbound delivery success rate drops below threshold, or queue depth exceeds budget.
- **Runbook:** RB-008 (Outbound Communications Pause + Drain).
- **Kill-switch:** `KS-OUTBOUND`.
- **Evidence:** `notification_delivery_receipts` deltas.
- **Recovery confirmation:** Queue drains; success rate returns above threshold.

### S-RUNTIME — Edge / runtime degradation
- **Trigger:** Edge function p95 latency or error rate exceeds budget.
- **Runbook:** RB-011 (Runtime Degradation Triage).
- **Kill-switch:** Domain-scoped runtime switch.
- **Evidence:** `edge-function-health-replay-report.json`.
- **Recovery confirmation:** Latency / error rate return to budget.

These scenarios are the binding inputs for `OPERATOR_FLOW_VALIDATION_REPORT.md`.
