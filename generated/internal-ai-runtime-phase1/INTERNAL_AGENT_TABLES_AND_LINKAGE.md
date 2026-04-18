# Internal Agent Tables & Linkage

**Generated:** 2026-04-18  
**Schema:** `public`  
**Migration source:** `supabase/migrations/` (governed; do not edit)

## 1. `internal_agent_definitions`

Canonical persistent spec per agent. One row per `agent_id`.

**Key columns:**
- `id uuid PK`
- `agent_id text UNIQUE NOT NULL` — stable key (e.g. `pb-feature-quality-agent`)
- `name text NOT NULL`
- `council text NOT NULL` — one of 6 council keys
- `mission text`, `special_ability text`
- `max_autonomy_level text`, `current_autonomy_level text` — L0–L6 rights
- `schedule_type text` (`continuous` | `hourly` | `daily` | `on-event`)
- `schedule_cron text` (optional override)
- `scope jsonb`, `out_of_scope jsonb`
- `tools_allowed jsonb`, `tools_forbidden jsonb`
- `memory_scope text`
- `trigger_conditions jsonb`, `trigger_events jsonb`
- `escalation_targets jsonb`, `receives_escalations_from jsonb`
- `primary_escalation_target text`
- `confidence_threshold_act numeric`, `confidence_threshold_recommend numeric`
- `simulation_requirements jsonb`, `human_approval_requirements jsonb`
- `rollback_authority text`
- `cost_budget_daily_cents int`, `max_invocations_per_day int`
- `failure_handling_rules jsonb`, `related_services jsonb`, `related_docs jsonb`, `tags jsonb`
- `maturity text`, `is_active boolean DEFAULT true`
- `spec_hash text` — idempotency guard for re-seed
- `created_at`, `updated_at`

**RLS:** admin-only read/write via `has_role(auth.uid(), 'admin')`.  
**Row count:** 40.

## 2. `internal_agent_runtime_state`

Live mutable state — one row per agent.

**Key columns:**
- `id uuid PK`
- `agent_id text UNIQUE FK → internal_agent_definitions.agent_id`
- `current_status text` (`idle` | `running` | `paused` | `suspended` | `cooling_down`)
- `last_run_at timestamptz`, `last_success_at`, `last_failure_at`
- `consecutive_failures int DEFAULT 0`
- `total_runs int`, `total_successes int`, `total_failures int`
- `trust_score numeric DEFAULT 0.5`
- `cooldown_until timestamptz`
- `suspension_reason text`, `suspended_by uuid`

**RLS:** admin-only.  
**Row count:** 40.

## 3. `internal_agent_actions`

Per-action receipt; canonical bridge into the AI runtime stack.

**Key columns:**
- `id uuid PK`
- `agent_id text FK → internal_agent_definitions.agent_id`
- `invocation_id uuid FK → ai_workforce_invocations.id` (nullable for observe-only actions)
- `action_type text` (`observe` | `diagnose` | `recommend` | `draft` | `simulate` | `approval_ready` | `constrained_action`)
- `autonomy_level_used text`
- `confidence numeric`
- `simulation_result jsonb`, `execution_result jsonb`
- `approval_request_id uuid FK → ai_workforce_approval_queue.id` (nullable)
- `receipt_id uuid FK → ai_action_receipts.id` (nullable)
- `status text` (`pending` | `succeeded` | `failed` | `escalated` | `rolled_back`)
- `rollback_data jsonb`
- `created_at`, `updated_at`

**RLS:** admin-only read; service role write (via edge function).

## 4. `council_escalations`

Persistent escalation tickets — visible in `/admin/ai-runtime/councils`.

**Key columns:**
- `id uuid PK`
- `source_agent_id text FK`
- `source_council text`
- `target_supervisor text` — supervisor key (see `SUPERVISOR_RUNTIME_MODEL.md`)
- `escalation_reason text`
- `severity text` (`low` | `medium` | `high` | `critical`)
- `evidence jsonb`
- `status text` (`open` | `in_review` | `resolved` | `escalated_to_meta`)
- `resolution_notes text`, `resolved_by uuid`, `resolved_at timestamptz`

**RLS:** admin-only.

## 5. `supervisor_decisions`

Audit trail for every supervisor action.

**Key columns:**
- `id uuid PK`
- `supervisor_key text` — one of 7 (`meta-supervisor` + 6 council supervisors)
- `decision_type text` (`approve` | `reject` | `override` | `suspend` | `downgrade` | `escalate_to_meta`)
- `target_agent_id text` (nullable)
- `target_action_id uuid` (nullable, FK to `internal_agent_actions`)
- `target_escalation_id uuid` (nullable, FK to `council_escalations`)
- `rationale text NOT NULL`
- `evidence_refs jsonb`
- `executed_at timestamptz`

**RLS:** admin-only.

## FK lineage diagram

```
internal_agent_definitions ──┐
        ▲                    │
        │ agent_id           │ agent_id
        │                    ▼
internal_agent_runtime_state    internal_agent_actions
                                       │
                                       │ invocation_id ──► ai_workforce_invocations
                                       │ approval_request_id ──► ai_workforce_approval_queue
                                       │ receipt_id ──► ai_action_receipts
                                       │
council_escalations ◄──────────────────┘
        ▲
        │ target_escalation_id
        │
supervisor_decisions
```

This linkage is what makes the bridge real: no parallel receipt or budget stack — every meaningful agent action surfaces through the existing canonical tables.
