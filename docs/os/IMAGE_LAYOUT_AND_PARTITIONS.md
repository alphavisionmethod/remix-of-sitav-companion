# SITA OS — Image Layout & Partitions

## A/B partition strategy

SITA OS ships with two root slots (A/B) for atomic, safe updates with instant rollback.

| Partition | Purpose | Size | FS |
|---|---|---|---|
| `p1` ESP (EFI) | Bootloader, kernel, initramfs, shim, signed GRUB | 512 MiB | FAT32 |
| `p2` rootfs-A | Active root, dm-verity protected | 6 GiB | ext4 (read-only at runtime) |
| `p3` rootfs-B | Inactive root, swapped on update | 6 GiB | ext4 (read-only at runtime) |
| `p4` verity-hash-A | dm-verity hash tree for rootfs-A | 64 MiB | raw |
| `p5` verity-hash-B | dm-verity hash tree for rootfs-B | 64 MiB | raw |
| `p6` recovery | Minimal recovery initramfs + tools | 512 MiB | ext4 |
| `p7` data | LUKS2-encrypted user/state | remainder | ext4 over LUKS2 |

## Boot flow

```
UEFI Firmware
  └─> shim (Microsoft + Canonical signed)
       └─> signed GRUB (MOK-trusted)
            └─> signed kernel + initramfs
                 └─> sita-verify-rootfs initramfs hook
                      ├─ TPM 2.0 PCR (0,2,4,7) seal check
                      ├─ dm-verity root hash verification
                      └─ panic-on-corruption policy
                           └─> systemd → graphical.target
                                └─> sita-runtime.service (Electron on TTY7)
```

## Update strategy (A/B)

1. `os/scripts/build-update-bundle.sh` produces a signed bundle for the inactive slot.
2. `os/scripts/verify-update-bundle.sh` validates signature + verity hash.
3. The inactive slot is flashed; bootloader entry is updated to point at it.
4. On next boot, the new slot becomes active. If health checks fail, `os/scripts/rollback-to-previous.sh` flips back.

## Recovery slot

`p6 recovery` boots a minimal initramfs that:
- Mounts the `data` partition read-only,
- Generates a support bundle via `os/scripts/generate-support-bundle.sh`,
- Optionally re-flashes a known-good slot.

## References

- `docs/os/BOOT_CHAIN_IMPLEMENTATION.md`
- `docs/os/DM_VERITY_IMPLEMENTATION.md`
- `docs/os/UPDATE_AND_ROLLBACK_STRATEGY.md`
- `docs/os/RECOVERY_MODE.md`
- `os/scripts/build-raw-img.sh`
