# SITA OS — Recovery Mode

## How to enter

- **Boot menu:** systemd-boot shows "SITA OS — Recovery Console"
  (entry: `os/image-builder/recovery/loader-entry-recovery.conf`).
- **Auto:** triggered by systemd if `graphical.target` fails 2× in a row.

## What recovery offers

`sita-recovery.target` brings up a minimal console with these tools on PATH:

| Tool | Purpose |
|---|---|
| `sita-rollback` | flip to the previous slot (`os/scripts/rollback-to-previous.sh`) |
| `sita-support-bundle` | collect diagnostics (`os/scripts/generate-support-bundle.sh`) |
| `sita-safe-mode` | start runtime without Electron (`os/image-builder/recovery/safe-mode.sh`) |
| `sita-verify` | run `veritysetup verify` against the active slot |
| `cryptsetup` | unlock `/var` and `/home` for read-only inspection |

## Fallback shell (Electron crash)

If `sita-runtime.service` fails 3× in 60 s:

1. systemd starts `sita-recovery-shell.service` (Xterm + tmux + `journalctl -fu sita-runtime`).
2. A clear in-screen banner explains: "Desktop shell unavailable — recovery shell active".
3. User can run `sita-runtime --safe-mode` or open the support bundle.

This guarantees no dead-end, even if the Electron renderer panics.

## Restore from backup

If the user has enabled the optional `sita-backup` snapshotter, recovery
exposes `sita-restore --list` and `sita-restore <id>` for `/home`.
The backup model uses `restic` against the user's chosen S3 endpoint —
keys are stored in TPM-sealed form on the device.
