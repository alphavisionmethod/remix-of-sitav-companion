# `internal_agent_reflections` — Data Model

## Purpose
Durable post-action reflections produced by the Phase 3 reflection processor (`internal-agent-reflect`).
Each reflection ties a real executed action to an outcome score, lesson, and trust-update signal.

## Schema (canonical)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `agent_id` | text NOT NULL | FK to `internal_agent_runtime_state.agent_id` |
| `action_intent_id` | uuid | FK to `internal_agent_action_intents.id` |
| `invocation_id` | uuid | optional FK to `ai_invocations.id` |
| `outcome_observed` | text | grounded in real receipts/results |
| `outcome_quality` | numeric(3,2) | 0.00–1.00 |
| `lesson_learned` | text |  |
| `pattern_tags` | jsonb | array, e.g. `["timeout","retry-success"]` |
| `should_repeat` | boolean |  |
| `confidence_after` | numeric(3,2) |  |
| `evidence_refs` | jsonb | array of receipt/log refs |
| `created_at` / `updated_at` | timestamptz |  |

## RLS
- SELECT: admin (`audit.view`)
- INSERT/UPDATE: service_role only via `record_internal_agent_reflection` RPC
- No direct authenticated writes

## Indexes
- `(agent_id, created_at DESC)`
- `(action_intent_id)`
- `(created_at DESC)` partial WHERE `outcome_quality < 0.5` for failure pattern queries
