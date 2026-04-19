# Security Council Runtime Model

## Topology

```
              ┌──────────────────────────────────────┐
              │  pg_cron: sita-security-council-tick  │
              │            hourly (0 * * * *)         │
              └──────────────────┬───────────────────┘
                                 │ HTTP POST
                                 ▼
                  ┌────────────────────────────────┐
                  │   security-council-tick (fn)   │
                  │   for each of 7 agents:        │
                  │     observe → produce findings │
                  └──────────────┬─────────────────┘
                                 │
        ┌────────────────────────┼─────────────────────────────┐
        ▼                        ▼                             ▼
  record_security        propose_implementation     (returned in tick response)
    _finding RPC          _suggestion RPC               for Phase 3 surface
        │                        │
        ▼                        ▼
security_council        ai_implementation
   _findings (table)       _suggestions (Phase 3)
```

## Agent observation scopes

### st-security-monitor
- **Source:** `admin_action_audit` rows in last 60 min, severity ∈ {high, critical}
- **Output:** finding per row, severity inherited
- **Idempotency:** `admin_audit:{id}`

### st-permission-drift
- **Source:** `user_roles` rows where `role='admin'` and `created_at` within 24h
- **Output:** medium-severity finding per new admin grant
- **Idempotency:** `user_role:{id}`

### st-policy-review
- **Source:** `get_db_truth_snapshot` → `rls_enabled_no_policies` array
- **Output:** high-severity finding per orphaned RLS table; **routes to suggestion**
- **Idempotency:** `rls_drift:{table}`

### st-trust-threshold
- **Source:** `internal_agent_runtime_state` where `trust_score < 0.30`
- **Output:** medium/high finding per low-trust agent
- **Idempotency:** `trust_breach:{agent_id}`

### st-fraud-abuse
- **Source:** `admin_action_audit` last 60 min, grouped by (actor, action)
- **Output:** high/critical finding when count ≥ 25 (critical at ≥ 100)
- **Idempotency:** `burst:{actor}:{action}:{hour}`

### st-audit-completeness
- **Source:** `ai_invocations` count vs `ai_inference_receipts` count over 24h
- **Output:** finding when coverage < 95% (high when < 50%); **routes to suggestion at < 50%**
- **Idempotency:** `receipt_coverage:{date}`

### st-privacy-boundary
- **Source:** `admin_action_audit` rows in last 60 min where action ILIKE `%cross_tenant%`
- **Output:** high-severity finding per cross-tenant action
- **Idempotency:** `cross_tenant:{id}`

## State machine

| Status | Set by | Meaning |
|---|---|---|
| `open` | `record_security_finding` (default) | Awaiting triage |
| `routed` | tick (when suggestion created) | Suggestion linked via `routed_suggestion_id` |
| `acknowledged` | operator (manual ack TBD) | Human reviewed |
| `superseded` | future supersedes path | Newer finding replaces this |

## Trust constraint

The Phase 4 layer **never** writes to `internal_agent_runtime_state.trust_score` directly.
Trust changes still flow exclusively through `record_internal_agent_reflection` RPC
(EWMA enforcement, Phase 3 gate `trust-score-update-logic`).

## Failure handling

- Per-agent errors collected into response `errors[]` — tick continues for remaining agents.
- RPC errors logged into `errors[]`, finding skipped.
- Idempotency on `source_signal_ref` ensures replays don't duplicate findings.
