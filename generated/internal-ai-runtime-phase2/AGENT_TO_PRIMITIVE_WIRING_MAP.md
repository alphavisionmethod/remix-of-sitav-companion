# Agent → Primitive Wiring Map (Phase 2)

| Agent | Signal source(s) | Allowed action classes | Mode |
|---|---|---|---|
| `aw-incident-response` | `incidents` (open + unassigned), stuck `workflow_runs` | restart_workflow, replay_workflow, clear_stale_lock, trigger_safe_repair_path | **execute** (constrained_action_ready) |
| `aw-ai-spend-control` | `ai_budget_alerts` (warning/critical), `ai_fallback_events` last 1h, `ai_usage_ledger` | disable_unhealthy_connector (low-priority capabilities), trigger_safe_repair_path (approval-bound) | **execute + approval** |
| `aw-security-monitor` | `kill_switch_audit_log` (rapid toggles), `admin_action_audit` (off-hours bursts) | — | **escalate-only** (Phase 2 scope) — writes `council_escalations` to `security-trust-supervisor` |

## Single safety brain
All three agents call `evaluate_action_safety_gates(agent_id, action_class, target_id, confidence, precondition_evidence)` — there is no per-agent gating logic.

## Failure → escalation
Any handler error increments `internal_agent_runtime_state.consecutive_failures`; ≥3 failures suspend the agent and write a `council_escalations` row to its supervisor.
