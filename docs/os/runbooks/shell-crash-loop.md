# Runbook — Electron shell in a crash loop

**Symptom:** screen flickers between black and the loading splash; or
`sita-recovery-shell.service` is running.

## 1. Confirm the symptom

```bash
journalctl -u sita-runtime -n 50 --no-pager
systemctl status sita-runtime
sudo /opt/sita/runtime/check-shell-health.sh
```

If `check-shell-health` returns:
- **10** (`shell-not-running`) → shell can't start, go to step 2.
- **11** (`no-display-server`) → Xorg failing, check `journalctl -t Xorg`.
- **12** (`shell-rss-exceeded`) → memory leak, file an issue, restart.
- **13** (`ready-file-stale`) → IPC wedged, see step 2.
- **14** (`shell-heartbeat-stale`) → renderer hung, see step 2.

## 2. Repair (most cases)

```bash
sudo sita-ops repair shell
```

This clears the safe-mode marker, resets the crash counter, kills
orphans, removes stale X locks, and restarts `sita-runtime.service`.
Waits up to 30s for `/run/sita/shell-ready`.

## 3. If repair fails

```bash
sudo sita-ops repair runtime-services
```

Cascades through the dependency chain (`sita-settingsd` → `timed` →
`crashd` → `healthd` → `accessibilityd` → `runtime`). Stops at the first
failure for diagnosis.

## 4. If services repair also fails

The shell binary may be corrupt. Check verity:

```bash
veritysetup status sita_root
sudo /opt/sita/scripts/check-update-state.sh
```

If verity is bad → image is corrupt → rollback:

```bash
sudo sita-ops rollback
sudo reboot
```

## 5. Last resort

```bash
sudo sita-ops support-bundle
# bundle written to /var/lib/sita/support/sita-support-<host>-<ts>.tar.zst
```

Boot into recovery (systemd-boot menu → "SITA OS — Recovery Console")
and ship the bundle to support.

## Related

- `docs/os/DESKTOP_SESSION_MODEL.md` — startup chain
- `docs/os/RECOVERY_MODE.md` — recovery shell details
- `os/recovery/repair-shell.sh` — what step 2 does
