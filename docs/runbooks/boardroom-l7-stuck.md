# RB-020 — Boardroom Layer 7 Stuck Follow-Through Recovery

**Severity:** high
**Owner:** boardroom
**Subsystem:** boardroom-followthrough
**Kill switch:** `KS-WORKFLOW`
**Trigger:** `boardroom-followthrough-sla` edge function pages a warning/critical bucket via `alert-router`.

## Context

A Boardroom approved decision flows through the canonical Layer 7 lifecycle:

```
approved → dispatch_pending → dispatched → executing → executed
        → receipt_recorded → outcome_pending → outcome_tracked
        → reflected → closed
```

A dispatch is considered **stuck** when it remains in any of the following states past its SLA window:

| State | Warning | Critical |
|---|---|---|
| `dispatch_pending` | 6h | 24h |
| `dispatched` | 12h | 48h |
| `executing` | 24h | 72h |
| `outcome_pending` | **72h** | **168h** |

The cron job `boardroom-l7-sla-scan` runs every 30 min and pages operators via `alert-router` when a row enters either bucket. Each (dispatch × bucket) is paged at most once per 12h cooldown.

## Steps

1. **Open the Layer 7 admin board** — Navigate to `/admin/boardroom-layer7`. Filter by `state = outcome_pending` (or `executing`) and sort by oldest `updated_at`. The breaching dispatch should be at the top.
2. **Inspect dispatch evidence** — Open the row to view `correlation_id`, `retry_count`, `execution_result`, and the linked receipt. Cross-check against the parent `boardroom_items` row to confirm the approved decision.
3. **Choose remediation path:**
   - **(A) Record outcome** — If execution actually completed but the outcome write was missed, manually call `boardroom-outcome-record` with the observed outcome.
   - **(B) Mark failed + roll back** — If execution stalled or produced a bad result, mark the dispatch `failed` and trigger any reversibility action declared on the receipt.
   - **(C) Toggle `KS-WORKFLOW`** — Only if **many** dispatches are stuck (systemic). Single stuck rows should NOT trigger a global kill switch.
4. **Confirm closure** — Verify the dispatch advances to `outcome_tracked → reflected → closed` and that the parent `boardroom_items.followthrough_state` matches. Both the user "Follow-through" tab and the admin Layer 7 board should reflect the terminal state.
5. **Acknowledge the alert** — Set `acknowledged_at` and `acknowledged_by` on the matching `boardroom_followthrough_sla_alerts` row so the cooldown applies and no re-page fires.

## Verification

After remediation, the next cron tick (≤30 min) should report `breaches=0` for the dispatch in the `boardroom-followthrough-sla` response body. The `closure_ratio` reported by `check-boardroom-layer7-e2e.ts` should remain at 1.0.
