# Runbook — Using recovery mode

## When to use

- The shell crash-loops and `sita-ops repair shell` doesn't help.
- An update broke the active slot.
- You need to restore from backup.
- You need to inspect verity / TPM / LUKS state without the GUI running.

## How to enter

**From a running system:**
```bash
sudo sita-ops recovery
```

**From boot:** at the systemd-boot menu, select
*"SITA OS — Recovery Console"*. Power-cycle if you missed it.

**Automatic:** systemd enters recovery if `graphical.target` fails to
reach `success` 2× in a row.

## What's available

`sita-recovery.target` brings up a TTY console with these tools on PATH
(every command is the canonical implementation, not a copy):

| Command | Delegates to |
|---|---|
| `sita-recovery` | `os/image-builder/recovery/sita-recovery.sh menu` |
| `sita-recovery-status` | `os/recovery/recovery-status.sh` |
| `sita-recovery-collect` | `os/recovery/recovery-collect.sh` |
| `sita-rollback` | `os/scripts/rollback-to-previous.sh` |
| `sita-support-bundle` | `os/scripts/generate-support-bundle.sh` |
| `sita-shell-health` | `os/runtime/check-shell-health.sh` |
| `sita-safe-mode` | `os/image-builder/recovery/safe-mode.sh` |
| `sita-verify` | `veritysetup verify sita_root` |
| `sita-ops` | `os/bin/sita-ops` (wrapper) |

## Common flows

**Inspect everything:**
```bash
sita-ops status
```

**Generate a support bundle:**
```bash
sudo sita-ops support-bundle
ls -lh /var/lib/sita/support/
```

**Rollback to previous slot:**
```bash
sudo sita-ops repair update-state --mark-bad
sudo sita-ops rollback
sudo reboot
```

**Restore from backup:**
See `docs/os/BACKUP_AND_RESTORE.md`.

**Exit recovery:**
```bash
sudo systemctl isolate graphical.target
# or
sudo reboot
```

## Related

- `docs/os/RECOVERY_MODE.md` — full reference
- `docs/os/DESKTOP_SESSION_MODEL.md` — what failed for you to be here
