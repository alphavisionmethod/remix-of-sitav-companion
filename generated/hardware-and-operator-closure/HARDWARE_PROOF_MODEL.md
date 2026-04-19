# Hardware Proof Model

> Canonical proof matrix for SITA OS native deployment.

## Capability × Device-Class Matrix

| Capability | workstation-x86_64 | server-x86_64 | vm-aarch64 | edge-x86_64 |
|---|---|---|---|---|
| Secure Boot | required | required | optional | required |
| TPM 2.0 | required | required | optional (vTPM) | required |
| dm-verity | required | required | required | required |
| A/B rollback | required | required | required | required |
| Recovery boot | required | required | required | required |

## Evidence persistence

- **File**: `generated/hardware-and-operator-closure/runs/<run_id>.json` (durable, source of truth for offline review)
- **DB**: `public.hardware_certification_runs` (admin-only RLS, realtime-enabled)

## Run lifecycle

1. Operator boots target device with SITA OS image.
2. Runs `os/scripts/record-hardware-certification-run.sh --device-class <class> --firmware <ver>`.
3. Script probes 5 capabilities, dumps JSON, inserts DB row.
4. `emit-hardware-and-operator-artifacts.ts` aggregates into `hardware-certification-status.json`.
5. `check-hardware-certification-matrix.ts` validates ≥1 fresh row per required device class.
6. Promotion from WARN → BLOCK once policy thresholds met.

## Cadence

Per `DRILL_CADENCE_AND_FRESHNESS_POLICY.md`: hardware validation refresh every 30 days per device class.
