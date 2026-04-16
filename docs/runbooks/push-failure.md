# RB-007 — Push Notification Failure

| Field | Value |
|---|---|
| Severity | **low** |
| Bounded Context | `integrations` |
| Subsystem | push |
| Owner | integration |
| Estimated MTTR | 5 min |
| Kill switch | `KS-MOBILE-PUSH` |
| Message code | `NET-001` |

## Trigger

Push delivery error rate exceeds 10% over 5 minutes.

## Steps

1. **Check VAPID key validity**.
2. **Verify push subscription freshness**.
3. **Purge expired subscriptions**.
4. **Test push delivery** to a verified device.

## Rollback

Restore purged subscriptions from snapshot if purge was overly aggressive.

## Evidence

- VAPID key check result
- Delivery error breakdown by error class
- Final test push receipt
