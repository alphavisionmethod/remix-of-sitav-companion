# Internal Agent Execute Action — Canonical Spec

## Function
`supabase/functions/internal-agent-execute-action/index.ts`

## Purpose
Sole canonical entry point for constrained autonomous action execution by
internal agents. Every autonomous action across the SITA OS internal AI
workforce passes through this function.

## Contract
**Input** (POST JSON):
```json
{
  "agent_id": "aw-incident-response",
  "action_class": "restart_workflow",
  "target_id": "<workflow_run_id>",
  "confidence": 0.85,
  "precondition_evidence": { "incident_id": "...", "severity": "high" },
  "correlation_id": "incident-<id>"
}
```

**Output**:
```json
{
  "ok": true,
  "status": "executed | approval_pending | denied | error",
  "intent_id": "<uuid>",
  "action_id": "<uuid>",
  "receipt_id": "<uuid>",
  "denial_reason": "<text or null>",
  "gate_results": [ { "gate": "...", "passed": true } ]
}
```

## Pipeline
1. Validate JWT or service-role caller
2. Load agent definition + whitelist row
3. Call `evaluate_action_safety_gates` RPC (7 gates)
4. If `requires_approval` → insert into `ai_workforce_approval_queue`, return `approval_pending`
5. If allowed → write `internal_agent_action_intents` (rollback_plan populated)
6. Execute handler (one of 6 canonical primitives)
7. Write `internal_agent_actions` + `ai_action_receipts`
8. Update intent → `executed | failed`

## Action Handlers (8 total)
| action_class | Reverses | Real primitive |
|---|---|---|
| restart_workflow | — | workflow-runner repair endpoint |
| replay_workflow | — | workflow replay service |
| clear_stale_lock | cancel_workflow_run | `workflow_runs.status` update + audit |
| rotate_expired_token | — | connector token refresh |
| disable_unhealthy_connector | enable_connector | `connector_accounts.status='paused'` + timeline |
| trigger_safe_repair_path | — | self-healing `runRepairPath()` |
| enable_connector | — | rollback handler |
| cancel_workflow_run | — | rollback handler |

## Hard Caps
- Rate: 10 actions/hour/agent
- Master kill-switch: `KS-INTERNAL-AGENTS-EXECUTE` (checked first)
- Autonomy: ≥ `constrained_action_ready` required
- No bypass possible — all 7 gates evaluated server-side in `SECURITY DEFINER` RPC

## Auth
- `verify_jwt = false` for human-triggered admin calls (in-code admin check)
- Service-role bypass for runtime-loop calls (signed with service-role JWT)
