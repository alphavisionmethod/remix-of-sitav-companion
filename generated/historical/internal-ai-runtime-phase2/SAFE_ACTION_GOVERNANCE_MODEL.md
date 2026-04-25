# Safe Action Governance Model

## 7 Safety Gates (RPC: `evaluate_action_safety_gates`)
1. **Whitelist** — `action_class` must be in `internal_agent_action_whitelist` AND `is_active=true`
2. **Agent exists** — `internal_agent_definitions` row required
3. **Precondition** — caller must supply non-empty `precondition_evidence`
4. **Rollback plan** — for reversible classes, `rollback_plan` is built from `reverse_action_class`
5. **Receipt slot** — guarantees `ai_action_receipts` row will be written on execution
6. **Rate limit** — `internal_agent_action_intents` count in last hour `< rate_limit_per_hour`
7. **Kill-switch** — `KS-INTERNAL-AGENTS-EXECUTE` OR `internal-agents.<council>` OR `internal-agents.action.<class>` must NOT be enabled
8. **Autonomy + suspension** — agent's `current_autonomy_level` rank ≥ class requirement; not `suspended`
9. **Approval threshold** — confidence ≥ `requires_approval_above_confidence` else routed to approval queue

## Hard caps
- No new approval queue — reuses `ai_workforce_approval_queue`
- No new receipt store — reuses `ai_action_receipts`
- No new kill-switch system — reuses `automation_kill_switches`
- All gates short-circuit on first failure; full `gate_results` array returned for observability
