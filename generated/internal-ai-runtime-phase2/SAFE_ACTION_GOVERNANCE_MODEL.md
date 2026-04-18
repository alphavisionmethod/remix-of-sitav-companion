# Safe Action Governance Model — Phase 2

## Single Safety Brain
`evaluate_action_safety_gates(agent_id, action_class, target_id, confidence, precondition_evidence)` is the **only** function that decides whether an autonomous action is allowed. It is called by:
- The `internal-agent-execute-action` edge function (every action)
- The Error Patrol UI rollback button (for reverse actions)

No other code path may execute internal-agent actions. This is enforced by `check-internal-agent-execute-action.ts` and `check-agent-primitive-wiring.ts`.

## 7 Gates (in order)
| # | Gate | Source of truth |
|---|------|-----------------|
| 1 | Whitelist | `internal_agent_action_whitelist.is_active` |
| 2 | Precondition evidence | non-empty `precondition_evidence` payload |
| 3 | Rollback plan | populated from whitelist `reverse_action_class` |
| 4 | Rate limit | `internal_agent_action_intents` last 1h count vs `rate_limit_per_hour` |
| 5 | Kill-switch | `automation_kill_switches` (master + scoped) |
| 6 | Autonomy + suspension | `internal_agent_definitions.current_autonomy_level` + runtime state |
| 7 | Approval threshold | `confidence >= requires_approval_above_confidence` |

## 4-State Lifecycle
`pending → executing → executed | rolled_back | failed | denied | approval_pending`

Every state transition is timestamped on the intent row. The intent + action + receipt triple is the proof bundle.

## Rollback Authority
- Reversible classes (`disable_unhealthy_connector`, `clear_stale_lock`) carry a populated `rollback_plan` BEFORE execution.
- Operators trigger rollback from the Error Patrol board, which re-enters the executor with the reverse class.
- Non-reversible classes never get a rollback plan; gate 3 forces them through approval if they would normally need one.

## Audit Trail
Every action produces 4 rows:
- `internal_agent_action_intents` — pre-flight gate evaluation snapshot
- `internal_agent_actions` — post-execution result
- `ai_action_receipts` — canonical AI workforce receipt
- `error_patrol_detections` (when triggered by a detection) — operator triage row

## Operator Visibility
All four rows are joined by `error_patrol_triage_view` and rendered in `/admin/health/error-patrol` with ≤2-click drilldown to the receipt and gate result JSON.
