# Hardware Proof Current State Audit

> Generated: 2026-04-19. Owner: Release Engineering.

## Today's reality (honest baseline)

| Capability | QEMU/OVMF Proof | Real-Hardware Proof | Evidence Path |
|---|---|---|---|
| Secure Boot | ✅ proven (sbsigntool + OVMF tests) | ❌ none recorded | `generated/hardware-and-operator-closure/runs/` |
| TPM 2.0 sealing | ✅ verified via `verify-tpm-seal.sh` | ❌ none recorded | DB: `hardware_certification_runs` |
| dm-verity integrity | ✅ verified via `verify-verity-metadata.sh` | ❌ none recorded | DB: `hardware_certification_runs` |
| A/B rollback | ✅ dry-run via `rollback-to-previous.sh --dry-run` | ❌ none recorded | DB: `hardware_certification_runs` |
| Recovery | ✅ `os/recovery/recovery-status.sh` exits 0 | ❌ none recorded | DB: `hardware_certification_runs` |

## What is missing for true 100/100

1. ≥1 real-device run per device class (workstation-x86_64, server-x86_64, vm-aarch64, edge-x86_64).
2. Attestation quote captured + persisted.
3. Hardware certification matrix populated with non-empty rows.
4. Recovery validation on real hardware (not dry-run).
5. Partner-certified device classes (currently `partner-blocked`).

## Path to GREEN

Operators run, on each target device:
```bash
sudo -E ./os/scripts/record-hardware-certification-run.sh \
  --device-class workstation-x86_64 \
  --firmware "OEM v1.2.3"
```
This populates `runs/<run-id>.json` AND inserts into `hardware_certification_runs`. The `check-real-hardware-proof` validator then promotes from WARN → BLOCK automatically.

## Honest classification today

`hardware-proof-status.json` ≡ `partner-blocked`. No synthetic green is emitted.
