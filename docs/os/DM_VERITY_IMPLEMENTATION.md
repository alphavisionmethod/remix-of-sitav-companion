# SITA OS — dm-verity Implementation

## What is wired

- `os/scripts/build-verity-root.sh` runs `veritysetup format` against the
  squashfs root, producing `out/verity.img` and writing the root hash into
  `out/verity-receipt.json`.
- The root hash is also written into `out/verity.cmdline` and consumed by
  the systemd-boot loader entry generated in `os/installer/scripts/install.sh`.
- The kernel cmdline ships:
  ```
  rd.systemd.verity=1
  systemd.verity_root_data=PARTLABEL=sita_root_a
  systemd.verity_root_hash=<rootHash>
  systemd.verity_root_options=panic-on-corruption
  ```
- `os/scripts/verify-verity-metadata.sh` re-runs `veritysetup verify` and
  exits non-zero if metadata drifted — used by CI.

## Failure behaviour

`panic-on-corruption` is set, so any block that fails verification crashes
the kernel rather than silently returning bad data. The recovery slot
remains bootable from systemd-boot menu (see `RECOVERY_MODE.md`).

## Receipts

Every build emits `out/verity-receipt.json` with `rootHash`, `salt`,
`dataBlocks`, `hashBlockSize`, `createdAt`. This file is included in
the canonical attestation (`generated/os-build-attestation.json`).

## Not implemented (yet)

- Per-file integrity (IMA/EVM) — verity covers the whole rootfs, which
  is sufficient for the immutable A/B model.
- TPM-sealed verity hash — planned once `secureboot+TPM` lab is online.
