# INTERNAL AI PHASE 2 — CURRENT STATE AUDIT

## Pre-Phase-2 baseline
- 5 internal-agent tables (defs, runtime_state, actions, escalations, supervisor_decisions) — verified with 40 agents seeded.
- `internal-agent-loop` edge function — observe / diagnose / recommend only; no constrained-action path.
- Canonical primitives in place: `ai_action_receipts`, `ai_workforce_approval_queue`, `ai_workforce_invocations`, `automation_kill_switches`, `kill_switch_audit_log`, `incidents`, `workflow_runs`, `connector_accounts`.

## Gaps closed by Phase 2
| Gap | Closure |
|-----|---------|
| No constrained-action edge function | `internal-agent-execute-action` deployed |
| No 7-gate safety brain | `evaluate_action_safety_gates` SECURITY DEFINER RPC |
| No whitelist | `internal_agent_action_whitelist` (6 classes) |
| No rollback ledger | `internal_agent_action_intents` with `rollback_plan` populated pre-execution |
| No operator triage UI | `/admin/health/error-patrol` (ErrorPatrolBoard) |
| 3 priority agents observation-only | Loop wires `aw-incident-response`, `aw-ai-spend-control`, `aw-security-monitor` |
| Master halt | `KS-INTERNAL-AGENTS-EXECUTE` kill-switch seeded per admin |

## Reused, not rebuilt
- All AI cost/latency: `ai_workforce_invocations`
- All receipts: `ai_action_receipts`
- All approvals: `ai_workforce_approval_queue`
- All halts: `automation_kill_switches`
- All operator audit: `timeline_events`
