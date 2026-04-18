# internal-agent-execute-action — Spec

## Role
Sole canonical constrained-action execution path for internal agents. **No bypass.**

## Endpoint
`POST {SUPABASE_URL}/functions/v1/internal-agent-execute-action`

## Auth
- **Service role** (called by `internal-agent-loop`): JWT header `Authorization: Bearer <SERVICE_ROLE>` + `x-internal-agent-loop: 1`
- **Admin user** (rollback button on `/admin/health/error-patrol`): user JWT, `has_role(uid, 'admin')` checked

## Body
```json
{
  "agent_id": "aw-incident-response",
  "action_class": "restart_workflow",
  "target_id": "<workflow_run.id>",
  "confidence": 0.92,
  "precondition_evidence": { "stuck_for_minutes": 47, "last_progress_at": "..." },
  "rationale": "Workflow stuck >45min with no progress",
  "triggered_by": "agent",
  "correlation_id": "...optional...",
  "rollback_intent_id": "...optional, set on rollback button..."
}
```

## Allowed action classes (whitelist-enforced)
| class | reversible | reverse class | rate/h | approval≥conf |
|---|---|---|---|---|
| restart_workflow | yes | cancel_workflow_run | 10 | 0.95 |
| replay_workflow | yes | cancel_workflow_run | 10 | 0.95 |
| clear_stale_lock | no | — | 20 | 0.99 |
| rotate_expired_token | no | — | 30 | 0.99 |
| disable_unhealthy_connector | yes | enable_connector | 5 | 0.85 |
| trigger_safe_repair_path | no | — | 10 | 0.90 |

## Pipeline
1. Auth (service-role OR admin)
2. Body validation (action_class ∈ whitelist set)
3. `evaluate_action_safety_gates` RPC → 7 gates
4. **Denied** → write `internal_agent_action_intents{status='denied'}` + return
5. **Requires approval** → enqueue `ai_workforce_approval_queue` + intent `status='approval_pending'`
6. **Allowed** → intent `status='executing'` with `rollback_plan` pre-populated
7. Dispatch to canonical primitive (workflow_runs / connector_accounts / incidents)
8. Write `internal_agent_actions` + `ai_action_receipts`
9. Update intent → `executed`/`failed`, link receipt + action ids
10. Emit `timeline_events` row + mark linked `error_patrol_detections.status='agent_acted'`
