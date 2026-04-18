# Internal AI Runtime — Phase 1 Current State Audit

**Generated:** 2026-04-18  
**Scope:** Pre-bridge gap inventory between System A (design) and System B (runtime)

## System A — Internal AI Workforce (design layer)

Located in `src/packages/internal-agent-config/`:

- **40 agent definitions** across 6 councils (`product-build`, `reliability-ops`, `security-trust`, `runtime-cost`, `architecture-governance`, `knowledge-coordination`).
- **7 supervisors** (1 meta + 6 council supervisors) defined in `supervisors.ts`.
- **Rights model L0–L6** defined in `rights.ts` (observe → constrained_action_ready).
- Rich per-agent metadata: mission, scope, allowed/forbidden tools, memory scope, escalation targets, confidence rules, simulation requirements, KPIs, cost guidance, maturity.

### Pre-bridge gap
- **Spec only.** Definitions lived as TypeScript objects.
- No DB persistence → not queryable by a runtime loop.
- No runtime state per agent (last run, trust score, suspension).
- No action receipts linked to agents.
- No escalation persistence; escalation_targets pointed to supervisor keys with no runtime body.
- Admin UI showed advisor-runtime data only — internal agents were invisible to operators.

## System B — AI Workforce Runtime (operational layer)

Already production-grade:

- `ai_workforce_invocations`, `ai_workforce_outputs`, `ai_action_receipts`, `ai_inference_receipts`, `ai_usage_ledger`.
- `ai_workforce_approval_queue` + dual-write trigger to `approval_requests`.
- `ai_workforce_budget_classes` per user; `check_ai_budget_policies` RPC enforces caps.
- `automation_kill_switches` + `kill_switch_audit_log`.
- Sovereign AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`).
- Admin pages at `/admin/ai-runtime/*` with role-gated access.

### Pre-bridge gap
- The 40 internal agents had no path into this stack.
- No scheduled invocation source — humans triggered everything reactively.
- No supervisor decision recording.

## The missing bridge

| Need | Pre-state | Required |
|---|---|---|
| Persistent agent definitions | TS objects only | `internal_agent_definitions` table |
| Live agent runtime state | None | `internal_agent_runtime_state` table |
| Action history | None | `internal_agent_actions` table linked to invocations + receipts |
| Escalation persistence | None | `council_escalations` table |
| Supervisor decisions | None | `supervisor_decisions` table |
| Scheduled execution | None | `internal-agent-loop` edge function + `pg_cron` |
| Operator visibility | None | `/admin/ai-runtime/internal-agents` + `/councils` boards |

This audit captures the state **before** Phase 1 closure. See `INTERNAL_AI_RUNTIME_PHASE1_FINAL_VERIFICATION.md` for the post-closure evidence.
