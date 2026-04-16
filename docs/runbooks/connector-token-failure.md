# RB-011 — Connector Token Failure

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `integrations` |
| Subsystem | connectors |
| Owner | integration |
| Estimated MTTR | 5 min |
| Kill switch | `KS-CONNECTORS` |
| Message code | `AUTH-002` |

## Trigger

Connector returns 401/403 from provider 3+ times within a sync window.

## Steps

1. **Identify failing connector and provider**.
2. **Attempt automatic token refresh**.
3. **If refresh fails**, mark connector `needs-reauth` and surface to user.
4. **Pause sync** for the connector until reauth completes.

## Rollback

Resume sync once user re-authorizes or admin manually rotates credentials.

## Evidence

- Token refresh outcome
- User notification receipt
- Sync runs paused list
