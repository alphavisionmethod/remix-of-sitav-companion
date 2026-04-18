# Runbook — Failed A/B update

**Symptom:** `sita-ops update-status` exits non-zero, or
`/var/lib/sita/updates/.last-failure` exists, or the new slot won't boot.

## 1. Diagnose

```bash
sudo /opt/sita/scripts/check-update-state.sh
journalctl -u sita-updated --since "2 hours ago" --no-pager
```

The JSON at `/var/lib/sita/diagnostics/update-state.json` shows:
- `interruptedBundles` > 0 → update was interrupted (power loss, crash)
- `lastFailure: true` → update completed staging but activation failed
- `otherSlotBootable: false` → cannot rollback safely

## 2. Clean stuck state (no rollback yet)

```bash
sudo sita-ops repair update-state
```

This:
- removes interrupted staging dirs older than 24h
- archives `.last-failure` marker
- verifies the other slot is still bootable

## 3. If the active slot is degraded

If the active slot boots but is broken (e.g. shell won't start after
update), mark it bad and prepare rollback:

```bash
sudo sita-ops repair update-state --mark-bad
sudo sita-ops rollback
sudo reboot
```

## 4. If the system already won't boot

Boot into recovery (systemd-boot menu → "SITA OS — Recovery Console"),
then:

```bash
sudo sita-ops repair update-state --mark-bad
sudo sita-ops rollback
sudo reboot
```

## 5. If both slots are unbootable

This is a worst-case scenario. The other slot was not validated before
the active slot broke. Restore from backup:

1. Boot the install ISO in rescue mode.
2. Mount the LUKS state partition.
3. Follow `BACKUP_AND_RESTORE.md` step-by-step.

## Prevention

- The update channel `production` only ships builds that have passed all
  🔴 rows in `VALIDATION_MATRIX.md`, including QEMU rollback validation.
- `sita-updated` always validates the new slot via dm-verity *before*
  flipping the loader entry. If the staged bundle fails verity, it is
  discarded and `.last-failure` is written.

## Related

- `docs/os/UPDATE_AND_ROLLBACK_STRATEGY.md`
- `os/scripts/check-update-state.sh`
- `os/recovery/repair-update-state.sh`
