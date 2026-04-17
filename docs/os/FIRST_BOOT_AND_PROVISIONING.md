# SITA OS — First Boot & Provisioning

## Files

- `os/image-builder/sita-firstboot.service` — runs once, ordered before `sita-runtime.service`
- `os/image-builder/first-boot.sh` — idempotent: exits 0 if already complete
- `/var/lib/sita/.first-boot-complete` — sentinel file

## Sequence

1. `sita-firstboot.service` runs `first-boot.sh` as root.
2. Script:
   - generates host SSH key pair
   - generates VAPID key (web push)
   - resizes the data partition to fill the disk
   - imports the MOK if `mokutil --list-enrolled` doesn't already include it
   - calls `os/scripts/emit-attestation.sh` and stores `/etc/sita/attestation.json`
   - touches `/var/lib/sita/.first-boot-complete`
3. systemd then proceeds to `sita-runtime.service` which launches Electron.

## Failure handling

If `first-boot.sh` exits non-zero, `sita-runtime.service` will not start
(`Requires=sita-firstboot.service`). The system drops into the recovery
shell so the user can collect a support bundle and try again.

## Receipts

- `/etc/sita/attestation.json` — copy of build attestation, post-deploy
- `/var/log/sita-firstboot.log` — full script log
