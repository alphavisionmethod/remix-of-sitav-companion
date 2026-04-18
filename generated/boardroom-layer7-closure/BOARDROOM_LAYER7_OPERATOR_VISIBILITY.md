# Boardroom Layer 7 — Operator Visibility

## Surface

`Layer7FollowthroughBoard` is mounted as a tab inside the canonical Approvals Hub:

- Route: `/admin/approvals`
- Tab id: `layer7-followthrough`
- Label: "Layer 7 Follow-through"

It is not a parallel page — it lives inside the existing `AdminControlPlaneShell` + `DomainHubLayout`.

## Queues exposed

| Queue | Filter | Operator action |
|---|---|---|
| Stale dispatches | `state IN ('dispatch_pending','dispatched','executing')` AND `last_event > 24h` | Retry / force-fail |
| Failed executions | `state = 'failed'` | Inspect `failure_reason`; retry; force-close |
| Missing receipts | `state = 'executed'` AND `receipt_id IS NULL` | Wait / contact engineering |
| Missing outcomes | `state IN ('receipt_recorded','outcome_pending')` AND age > 6h | Manual outcome recording |
| Missing reflections | `state = 'outcome_tracked'` AND age > 72h | Send reflection prompt to advisor |
| Healthy / closed | `state IN ('reflected','closed')` | Audit / no action |

## Drilldown

Selecting a row opens a chain modal showing every linked entity:

```
Item → Recommendation → Approval → Dispatch (id, correlation_id, payload)
   → Command Step (status, started_at, completed_at)
   → Receipt (id, summary, signature?)
   → Outcome Record (status, actual, confidence, affected entities)
   → Reflection (usefulness, recommendation quality, lesson)
```

Each link is clickable — receipts open `proofs` drilldown, command steps open execution detail, etc.

## Manual operator actions (audited)

| Action | Calls | Audited via |
|---|---|---|
| Retry dispatch | `boardroom-followthrough-dispatch` with `retry_of` | timeline event + dispatch row |
| Mark outcome | `boardroom-outcome-record` (manual mode) | new `boardroom_outcome_records` row + timeline |
| Force-close | `closeFollowthrough()` | timeline event with operator id |
| Force-fail | `markFailed()` | `failure_reason` populated, timeline event |

All operator-initiated transitions write `actor_type: 'operator'` to `timeline_events`.

## Health metrics surfaced

- Total open chains
- Stuck count by state
- p50/p95 time-to-closure
- Reflection coverage % (reflected / outcome_tracked)
- Receipt coverage % (receipt_recorded+ / executed+)

These reuse the validation script outputs under `generated/boardroom-layer7-closure/`.
