# Boardroom Layer 7 — DB & Linkage Map

## Existing canonical tables (used, not replaced)

| Table | Role in Layer 7 |
|---|---|
| `boardroom_items` | Source of truth for follow-through state (new column `followthrough_state`) |
| `advisor_board_recommendations` | Recommendation entity, linked from dispatch |
| `approval_decisions` / `ai_workforce_approval_queue` | Captures the approval that authorizes dispatch |
| `command_steps` | Canonical execution result rows |
| `agent_action_receipts` | Canonical action receipts (from `agent-executor`) |
| `proofs` | Proof bundles for high-risk actions |
| `timeline_events` | Emitted on every state transition |
| `advisor_board_reflections` | Reflection capture (now with `dispatch_id`, `outcome_record_id`, `boardroom_item_id` FKs) |

## New tables

### `boardroom_followthrough_dispatches`

| Column | Purpose |
|---|---|
| `id` (uuid pk) | Dispatch identity |
| `user_id` | RLS scope |
| `boardroom_item_id` (fk) | Item this dispatch serves |
| `recommendation_id` (fk, nullable) | Source recommendation |
| `approval_queue_id` (fk, nullable) | Approval row that authorized this dispatch |
| `state` | Mirrors lifecycle (`pending`, `executing`, `executed`, `receipt_recorded`, `outcome_pending`, `outcome_tracked`, `reflected`, `closed`, `failed`) |
| `risk_tier` | Inherited from recommendation |
| `action_type` | Tool/action key |
| `payload` (jsonb) | Execution payload sent to `agent-executor` |
| `correlation_id` | Stable ID across timeline events |
| `command_step_id` (fk) | Set when executor returns |
| `receipt_id` (fk) | Set when receipt is recorded |
| `outcome_record_id` (fk) | Set when outcome is tracked |
| `failure_reason` | Set on failure |
| `created_at`, `updated_at` | Standard timestamps |

### `boardroom_outcome_records`

| Column | Purpose |
|---|---|
| `id` (uuid pk) | Outcome identity |
| `user_id` | RLS scope |
| `dispatch_id` (fk) | Dispatch that produced this outcome |
| `boardroom_item_id` (fk) | Convenience back-link |
| `expected_outcome` (text) | Captured at dispatch time |
| `actual_outcome` (text) | Captured at outcome time |
| `outcome_status` (`success`/`partial`/`failed`/`pending`) | Categorical |
| `affected_entities` (jsonb) | Records changed |
| `confidence` (numeric) | Verification confidence |
| `requires_retry` (bool) | Operator flag |
| `recorded_at`, `created_at` | Timestamps |

## New columns on `boardroom_items`

- `followthrough_state` — primary state field
- `dispatch_id` — convenience pointer to current/last dispatch
- `execution_command_step_id` — pointer to current/last command_step
- `outcome_status` — convenience denormalization
- `outcome_recorded_at` — timestamp
- `reflection_id` — pointer to current/last reflection
- `last_followthrough_event_at` — last transition time (used for SLA)
- `followthrough_failure_reason` — populated on `failed`

## New columns on `advisor_board_reflections`

- `boardroom_item_id` (fk)
- `dispatch_id` (fk)
- `outcome_record_id` (fk)

All FKs `ON DELETE SET NULL` to preserve historical reflection data even if upstream rows are pruned.

## RLS policies

- All new tables: `is_org_member(auth.uid(), org_id)` for SELECT; restricted INSERT/UPDATE to dispatch & outcome service contexts.
- Admin override via `has_role(auth.uid(), 'admin')` for the operator panel.
- All canonical security-definer functions used: `has_role`, `is_org_member`, `has_admin_permission`.

## Indexes

- `boardroom_followthrough_dispatches (boardroom_item_id, state)`
- `boardroom_followthrough_dispatches (state, created_at)` for stale-detection scans
- `boardroom_outcome_records (dispatch_id)`
- `boardroom_items (followthrough_state, last_followthrough_event_at)`
