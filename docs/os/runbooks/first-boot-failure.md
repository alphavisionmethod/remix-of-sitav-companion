# Runbook — First boot failed or incomplete

**Symptom:** `/var/lib/sita/.first-boot-complete` is missing, or the
device repeatedly tries to provision and fails.

## 1. Diagnose

```bash
sudo systemctl status sita-firstboot.service
sudo tail -n 100 /var/log/sita-firstboot.log
sudo journalctl -u sita-firstboot --no-pager
```

Common causes:

| Cause | Signal in log |
|---|---|
| LUKS unlock failed | `cryptsetup: failed to open` |
| TPM seal failed | `tpm2_create` or `tpm2_evictcontrol` errors |
| Network required but down | `curl` or `wget` errors during provisioning |
| Disk too small | `mkfs` errors on `/var/lib/sita` |
| Partial run (power loss) | log ends mid-step, no `complete` marker |

## 2. Repair (idempotent)

```bash
sudo sita-ops repair first-boot
```

This:
- removes `.first-boot-complete` so the script re-runs
- executes `/opt/sita/deploy/first-boot.sh` and tees output to
  `/var/log/sita-firstboot.log`
- verifies the marker was written
- restarts `sita-runtime.service` if successful

## 3. If hardware-related

- **TPM not present:** `sita-firstboot` will fall back to a passphrase
  prompt. Ensure the operator is at the console.
- **Disk encryption unsupported:** check `lsmod | grep dm_crypt`. If
  missing, the kernel build is wrong — re-image.
- **Network required:** if the channel is `internal` or `beta`, first-
  boot may try to fetch a license. Bring the network up first.

## 4. If repair completes but shell still doesn't start

After first-boot succeeds, run the shell runbook:

```bash
sudo sita-ops repair runtime-services
```

See `runbooks/shell-crash-loop.md`.

## 5. Capture for support

```bash
sudo sita-ops support-bundle
```

The bundle includes `/var/log/sita-firstboot.log` and a snapshot of
`/etc/sita/`.

## Related

- `docs/os/FIRST_BOOT_AND_PROVISIONING.md`
- `deploy/first-boot.sh`
- `os/recovery/repair-first-boot.sh`
