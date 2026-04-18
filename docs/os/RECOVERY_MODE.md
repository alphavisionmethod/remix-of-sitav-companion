# SITA OS — Recovery Mode

## How to enter

- **Boot menu:** systemd-boot shows "SITA OS — Recovery Console"
  (entry: `os/image-builder/recovery/loader-entry-recovery.conf`).
- **Auto:** triggered by systemd if `graphical.target` fails 2× in a row.

## What recovery offers

`sita-recovery.target` brings up a minimal console with these tools on PATH:

| Command | Canonical script | Purpose |
|---|---|---|
| `sita-ops` | `os/bin/sita-ops` | Single operator entrypoint (status / repair / rollback / support-bundle) |
| `sita-recovery` | `os/recovery/recovery-entry.sh` → `os/image-builder/recovery/sita-recovery.sh menu` | Recovery TUI |
| `sita-recovery-status` | `os/recovery/recovery-status.sh` | Print + JSON snapshot of boot/update/verity/shell state |
| `sita-recovery-collect` | `os/recovery/recovery-collect.sh` | Generate support bundle from recovery |
| `sita-rollback` | `os/scripts/rollback-to-previous.sh` | Flip to the previous A/B slot |
| `sita-support-bundle` | `os/scripts/generate-support-bundle.sh` | Collect diagnostics tarball |
| `sita-shell-health` | `os/runtime/check-shell-health.sh` | One-shot Electron shell health probe |
| `sita-safe-mode` | `os/image-builder/recovery/safe-mode.sh` | Start runtime without Electron extensions |
| `sita-verify` | `veritysetup verify sita_root` | Verify the active slot |
| `cryptsetup` | system | Unlock `/var` and `/home` for read-only inspection |

## Repair toolkit

For common failures, prefer the targeted repair scripts (all idempotent):

| Failure | Command | What it does |
|---|---|---|
| Shell crash loop | `sudo sita-ops repair shell` | Clears safe-mode marker, restarts `sita-runtime` |
| First-boot incomplete | `sudo sita-ops repair first-boot` | Re-runs `deploy/first-boot.sh`, validates marker |
| Stuck/failed update | `sudo sita-ops repair update-state [--mark-bad]` | Cleans staging, optionally prepares rollback |
| Failed daemons | `sudo sita-ops repair runtime-services` | Restarts `sita-*` units in dependency order |

See `docs/os/runbooks/` for end-to-end procedures.

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
