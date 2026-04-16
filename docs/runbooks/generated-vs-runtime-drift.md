# RB-006 — Generated vs Runtime Drift

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `cloud-control-plane` |
| Subsystem | manifest-drift |
| Owner | platform |
| Estimated MTTR | 30 min |
| Kill switch | — |
| Message code | `POL-002` |

## Trigger

CI architecture or manifest-drift gate reports violations.

## Steps

1. **Review CI output** for the specific violations.
2. **Classify** the drift as accidental or structural.
3. **Fix imports** via the proxy/shim layer or **regenerate manifests**.
4. **Update the service ownership manifest** so it matches reality.

## Rollback

Revert offending commits; previous manifests remain authoritative until the regeneration is verified clean.

## Evidence

- CI output
- Diff of regenerated manifests
- Boundary check report after the fix
