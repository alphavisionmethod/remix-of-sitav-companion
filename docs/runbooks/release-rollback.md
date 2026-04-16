# RB-009 — Release Rollback

| Field | Value |
|---|---|
| Severity | **critical** |
| Bounded Context | `cloud-control-plane` |
| Subsystem | release |
| Owner | platform |
| Estimated MTTR | 10 min |
| Kill switch | `KS-RELEASE-ROLLOUT` |
| Message code | `CRASH-001` |

## Trigger

Critical errors spike post-deployment (5xx rate, crash rate, or business KPI cliff).

## Steps

1. **Confirm correlation** with the deploy timestamp.
2. **Activate `KS-RELEASE-ROLLOUT`** to freeze the pipeline.
3. **Trigger deployment rollback** to the previous version.
4. **Verify rollback** via health checks and route smoke tests.
5. **Create incident report** with root cause and follow-ups.

## Rollback

If rollback itself introduces issues, escalate immediately to admin and consider re-rolling forward only after evidence of fix.

## Evidence

- Deploy diff
- Error spike chart pre/post rollback
- Health check report
- Incident document
