# `internal_agent_weekly_digests` — Data Model

## Purpose
Persistent operator-visible weekly synthesis from the knowledge coordinator (`kc-knowledge-coordinator`).

## Schema

| Column | Type |
|---|---|
| `id` | uuid PK |
| `period_start` / `period_end` | timestamptz, UNIQUE pair |
| `generated_by` | text (defaults to `kc-knowledge-coordinator`) |
| `summary_markdown` | text — rendered digest |
| `highlights` | jsonb |
| `top_incidents` / `top_suggestions` / `top_cost_anomalies` / `trust_changes` / `escalations` | jsonb |
| `evidence_refs` | jsonb |
| `delivery_state` | text |
| `created_at` | timestamptz |

## Aggregation sources (real DB, last 7d)
- `error_patrol_detections` → top incidents
- `ai_implementation_suggestions` → top open suggestions
- `internal_agent_reflections` → trust changes / patterns
- `ai_budget_alerts` → cost anomalies
- `internal_agent_consensus_sessions` → cross-council conflicts
- `internal_agent_action_intents` (escalated) → escalation count

## Schedule
`sita-weekly-digest` — Monday 07:00 UTC (`0 7 * * 1`).

## Visibility
`/admin/ai-runtime/weekly-digest` (gated `audit.view`) renders markdown + drilldown evidence.
