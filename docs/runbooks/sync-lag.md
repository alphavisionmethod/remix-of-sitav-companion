# RB-003 — Sync Lag Recovery

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `integrations` |
| Subsystem | sync |
| Owner | integration |
| Estimated MTTR | 10 min |
| Kill switch | `KS-SYNC` |
| Message code | `SYNC-001` |

## Trigger

Sync lag exceeds 5 minutes for any active connector.

## Steps

1. **Identify lagging connector(s)** via `connector_sync_runs`.
2. **Check OAuth token validity** — refresh if needed.
3. **Trigger manual catch-up sync**.
4. **If persistent** — pause connector, notify user, open follow-up ticket.

## Rollback

Cancel in-flight catch-up if it causes write contention; resume regular cadence.

## Evidence

- Sync run history
- Token refresh outcome
- User notification receipt
