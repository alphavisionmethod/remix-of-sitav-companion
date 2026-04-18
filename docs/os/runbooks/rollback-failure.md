# Runbook — Rollback failed

**Symptom:** `sita-ops rollback` exits non-zero, or after reboot the
device still boots the same (broken) slot.

## 1. Verify the other slot is bootable

```bash
sudo /opt/sita/scripts/check-update-state.sh
ls /boot/efi/loader/entries/
```

`update-state.json` should show `otherSlotBootable: true`. If it shows
`false`, the rollback target is unbootable — you cannot rollback. Skip
to step 4.

## 2. Force loader to prefer the other slot

```bash
sudo sita-ops repair update-state --mark-bad
cat /boot/efi/loader/loader.conf       # confirm `default sita-<other>`
sudo reboot
```

## 3. If the device boots back to the same slot after step 2

The EFI variables may be overriding loader.conf. Boot into recovery,
then:

```bash
efibootmgr -v                          # inspect boot order
efibootmgr -o <preferred>,<rest>       # reorder
sudo reboot
```

## 4. If the other slot is unbootable (worst case)

Both slots are dead. Recovery options:

1. **Restore from backup** (see `BACKUP_AND_RESTORE.md`) — preserves
   user data but requires re-installation of the OS layer.
2. **Re-image** the device using the latest installer ISO. User data on
   `/home` (LUKS2) survives if the LUKS header and TPM seal are intact.

## 5. Capture diagnostics before re-imaging

```bash
sudo sita-ops support-bundle
# copy /var/lib/sita/support/*.tar.zst to external media before wiping
```

## Prevention

- `sita-updated` runs a verity self-check on the staged slot before
  flipping. If the new slot's hash does not match the signed manifest,
  the update is rejected and the loader default is left pointing at the
  current (known-good) slot.
- The release pipeline (`os/scripts/release.sh`) includes a QEMU
  rollback test as a 🔴 block in `VALIDATION_MATRIX.md`.

## Related

- `docs/os/ROLLBACK_STRATEGY.md`
- `docs/os/RECOVERY_MODE.md`
- `os/scripts/rollback-to-previous.sh`
