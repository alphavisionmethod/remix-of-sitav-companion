# Internal AI Runtime — Phase 1 Target Model

**Generated:** 2026-04-18

## End-state architecture

```
┌──────────────────────────────────────────────────────────────────┐
│ System A (design)            System B (runtime)                  │
│  internal-agent-config/  ──►  ai_workforce_invocations           │
│   • 40 agents                  ai_action_receipts                │
│   • 6 councils                 ai_workforce_approval_queue       │
│   • 7 supervisors              ai_workforce_budget_classes       │
│   • L0–L6 rights               automation_kill_switches          │
│   • spec hash                  Sovereign AI Gateway              │
└──────────┬───────────────────────────────┬──────────────────────┘
           │                               │
           │   ┌───────────────────────────▼──────────────┐
           └──►│       Phase 1 Bridge (this work)         │
               │  internal_agent_definitions  (40 rows)   │
               │  internal_agent_runtime_state (40 rows)  │
               │  internal_agent_actions       (history)  │
               │  council_escalations          (open/res) │
               │  supervisor_decisions         (audit)    │
               │  seed_internal_agents_from_json (RPC)    │
               │  internal-agent-loop (edge fn)           │
               │  pg_cron tick every 5 min                │
               │  /admin/ai-runtime/internal-agents       │
               │  /admin/ai-runtime/councils              │
               └──────────────────────────────────────────┘
```

## Five canonical bridge tables

| Table | Purpose | Key columns |
|---|---|---|
| `internal_agent_definitions` | Durable spec body per agent | `agent_id` UNIQUE, `council`, `max_autonomy_level`, `current_autonomy_level`, `schedule_type`, `schedule_cron`, `tools_allowed`, `tools_forbidden`, `memory_scope`, `confidence_threshold_*`, `cost_budget_daily_cents`, `is_active`, `spec_hash` |
| `internal_agent_runtime_state` | Live mutable state | `agent_id` FK, `current_status`, `last_run_at`, `last_success_at`, `last_failure_at`, `consecutive_failures`, `total_runs`, `trust_score`, `cooldown_until`, `suspension_reason`, `suspended_by` |
| `internal_agent_actions` | Per-action receipt | `agent_id`, `invocation_id` FK → `ai_workforce_invocations`, `action_type`, `autonomy_level_used`, `confidence`, `simulation_result`, `execution_result`, `approval_request_id`, `receipt_id`, `status`, `rollback_data` |
| `council_escalations` | Routed escalation tickets | `source_agent_id`, `source_council`, `target_supervisor`, `escalation_reason`, `severity`, `evidence`, `status`, `resolution_notes`, `resolved_by` |
| `supervisor_decisions` | Auditable supervisor outcomes | `supervisor_key`, `decision_type` (approve/reject/override/suspend/downgrade/escalate), `target_agent_id`, `target_action_id`, `target_escalation_id`, `rationale`, `evidence_refs` |

## Runtime loop contract

`supabase/functions/internal-agent-loop/index.ts`:

1. Runs on `*/5 * * * *` cron (single tick) — internally evaluates which agents are due based on `schedule_type`.
2. For each due agent: load definition + state, validate not suspended/cooling, check budget via `check_ai_budget_policies`, check kill-switch, perform scoped observation, route inference through Sovereign AI Gateway, record `internal_agent_actions` row, create `council_escalations` if confidence too low, update `internal_agent_runtime_state`.
3. Reuses canonical receipt/budget/approval stacks — no shadow runtime.

## Acceptance criteria (mapped to Phase 1 prompt)

- All 40 agents persisted as runtime-backed definitions ✓
- All 40 agents have runtime_state rows ✓
- Action history table exists and is FK-linked to canonical invocations ✓
- Escalation persistence + supervisor decisions ✓
- Scheduled loop running on real cron ✓
- Admin UI (`/admin/ai-runtime/internal-agents`, `/councils`) live ✓
- Seed pipeline deterministic via `spec_hash` ✓
- Reuses canonical AI runtime — no duplicate stack ✓
