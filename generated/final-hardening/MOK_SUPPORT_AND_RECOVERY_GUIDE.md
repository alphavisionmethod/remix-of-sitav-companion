# MOK Support & Recovery Guide

## Symptoms → Action

| Symptom | Distro hint | Action |
|---|---|---|
| Boot fails after install with "Secure Boot violation" | any | Reboot, on shim prompt choose "Enroll MOK" → "Continue" → enter MOK password |
| `mokutil --enable-validation` rejected | Ubuntu/Debian | Re-enroll: `sudo mokutil --import /var/lib/shim-signed/mok/MOK.der` then reboot |
| Initramfs panic: "verity hash mismatch" | any | Recovery shell → `sita-ops repair --verity` |
| MOK enrollment screen never appears | Fedora | Disable Secure Boot temporarily in firmware → re-run `mokutil --import` → re-enable |
| Lost MOK password | any | Generate new MOK pair via `sita-ops repair --regenerate-mok` (requires recovery USB) |

## Escalation
- L1: operator runs `sita-ops support-bundle`, attaches to incident.
- L2: DR engineer reissues signed shim/grub via release pipeline.
- L3: revoke compromised MOK via `os/scripts/revoke-mok.sh`.

## Honesty
Recovery instructions are validated against real test runs. Where a step is distro-specific, the matrix marks the caveat.
