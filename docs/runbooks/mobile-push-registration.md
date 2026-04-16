# RB-017 — Mobile Push Registration Failure

| Field | Value |
|---|---|
| Severity | **low** |
| Bounded Context | `mobile` |
| Subsystem | mobile-push |
| Owner | mobile |
| Estimated MTTR | 5 min |
| Kill switch | `KS-MOBILE-PUSH` |
| Message code | `NET-002` |

## Trigger

Push subscription registration returns an error or empty endpoint on the device.

## Steps

1. **Check VAPID public key parity** between client and server.
2. **Re-prompt for notification permission**.
3. **Recreate subscription** and persist to `push_subscriptions`.
4. **Send a test notification** to verify the path.

## Rollback

Delete the subscription if the test notification fails repeatedly.

## Evidence

- VAPID key parity report
- Permission prompt result
- Subscription record
- Test notification receipt
