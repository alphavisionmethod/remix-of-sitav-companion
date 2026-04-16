# RB-015 — RLS Misconfiguration Response

| Field | Value |
|---|---|
| Severity | **critical** |
| Bounded Context | `proof-trust` |
| Subsystem | rls |
| Owner | platform |
| Estimated MTTR | 60 min |
| Kill switch | — |
| Message code | `SEC-001` |

## Trigger

RLS audit reports a policy gap or privilege escalation path.

## Steps

1. **Snapshot affected tables** and quantify exposed rows.
2. **Apply emergency restrictive policy** or revoke role.
3. **Rotate any leaked credentials/tokens**.
4. **Notify affected tenants** per policy.
5. **Open security incident** and preserve forensic logs.

## Rollback

Restoring the previous (less restrictive) policy is forbidden until root cause is fixed and re-tested.

## Evidence

- Exposure scope report
- Policy diff applied
- Rotation receipts
- Tenant notification log
- Forensic log archive
