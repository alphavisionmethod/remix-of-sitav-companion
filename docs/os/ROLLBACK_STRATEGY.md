# SITA OS — Rollback Strategy

## Triggers

1. **Automatic** — systemd-bless-boot marks 2 consecutive failed boots in
   the new slot. The boot-counter unit invokes `rollback-to-previous.sh`.
2. **Manual** — operator runs `sita-rollback` from the recovery shell or
   from the admin "Health" surface (which calls the local control socket).
3. **Update-time** — `sita-updated` runs `verify-update-bundle.sh` first;
   if verification fails, the bundle is discarded and no rollback is needed.

## What rollback actually does

```bash
echo "$other_slot" > /etc/sita/slot
echo "default sita-${other_slot}.conf" > /boot/efi/loader/loader.conf
systemctl reboot
```

Both slots remain present — rollback never destroys the previously failing
slot, it just stops booting it. A second update will overwrite it.

## Safety guarantees

- LUKS2-encrypted `/var` and `/home` remain untouched (they live on
  partition 6, separate from the A/B root slots).
- A rollback receipt is written to `/var/lib/sita/rollbacks/` before the
  reboot for support diagnosis.
- `panic-on-corruption` (verity) means a corrupted slot will crash before
  it can damage user data.

## Limits

- Rollback only spans the previous slot. Multi-version time-travel is
  not supported by the A/B model — that's by design (smaller TCB).
- User data migration is NOT rolled back. A new release that performs a
  schema migration must support read-old-write-new for at least one prior
  release.
