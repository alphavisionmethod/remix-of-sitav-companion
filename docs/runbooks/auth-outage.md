# RB-001 — Auth Outage Recovery

| Field | Value |
|---|---|
| Severity | **critical** |
| Bounded Context | `setup-identity` |
| Subsystem | auth |
| Owner | platform |
| Estimated MTTR | 15 min |
| Kill switch | — |
| Message code | `CRASH-001` |

## Trigger

Auth service health check fails 3+ consecutive times, or sign-ins return 5xx for >60s.

## Steps

1. **Verify upstream auth provider status** — confirm external outage vs local.
2. **Enable offline auth cache mode** — users with cached sessions continue.
3. **Notify active users via in-app banner** — set explicit, calm copy.
4. **Monitor for restoration** — wait until provider returns healthy.
5. **Flush expired sessions and re-validate** — force re-auth where needed.

## Rollback

Disable offline auth cache once provider returns healthy and cached sessions are reconciled.

## Evidence to capture

- Provider status snapshot
- Sign-in error rate over the incident window
- Number of cached sessions served
- Final reconciliation report

## Escalation

If unresolved in 15 minutes → page `admin` on-call.
