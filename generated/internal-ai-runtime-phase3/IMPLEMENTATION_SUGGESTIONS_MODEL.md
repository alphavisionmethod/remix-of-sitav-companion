# `ai_implementation_suggestions` — Data Model

## Purpose
Canonical suggestion pipeline for the internal AI workforce. Every suggestion is evidence-backed,
source-attributed, and workflowed.

## Schema

| Column | Type |
|---|---|
| `id` | uuid PK |
| `source_agent_id` | text |
| `source_council` | text |
| `source_signal_type` | text — `error_pattern` \| `repeated_failure` \| `cost_anomaly` \| `consensus_conflict` \| `policy_drift` \| `dependency_upgrade` |
| `source_signal_ref` | text — UNIQUE-keyed for idempotency |
| `title` / `summary` / `rationale` | text |
| `evidence_refs` | jsonb |
| `proposed_change_type` | text — `new_feature` \| `refactor` \| `security` \| `cost` \| `ux` \| `ops` \| `dependency_upgrade` \| `governance` \| `reliability` |
| `estimated_effort` | text |
| `expected_value` | text |
| `priority` | text — `low` \| `medium` \| `high` \| `critical` |
| `status` | text — `proposed` \| `under_review` \| `accepted` \| `rejected` \| `in_progress` \| `done` \| `superseded` |
| `review_comments` / `reviewer_user_id` / `reviewed_at` |  |
| `superseded_by` | uuid self-FK |
| `created_at` / `updated_at` | timestamptz |

## RPCs
- `propose_implementation_suggestion(...)` — idempotent on `source_signal_ref`, service-role only
- `record_implementation_suggestion_decision(_id, _action, _comments)` — admin gated, transitions status
- `summarize_implementation_suggestions()` — counts by status/priority/type for dashboard

## RLS
- SELECT: admin
- INSERT/UPDATE: via RPC only

## Idempotency
`UNIQUE (source_signal_type, source_signal_ref)` prevents duplicate suggestions for the same signal.
