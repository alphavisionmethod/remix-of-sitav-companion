# SITA OS — Backup & Restore

> **Canonical script: `deploy/backup.sh`. There is no second backup system.**

## Scope

`deploy/backup.sh` produces a single timestamped tarball under
`/var/lib/sita/backups/sita-backup-<UTC>.tar.gz` containing:

| Component | Source | How |
|---|---|---|
| **Database** | `sita-supabase-db` container | `pg_dumpall -U postgres --clean | gzip` |
| **Volumes** | `supabase-db-data`, `supabase-storage-data`, `nats-data` | `tar czf` from a one-shot alpine container with `:ro` mount |
| **Config** | `deploy/{docker-compose.yml,.env,.env.example}`, `/opt/sita/build-info.json` | direct copy |
| **Manifest** | generated `manifest.json` | declares which components were included |

## Excluded (by design)

- `/home/sita/` — handled separately by the optional `restic` snapshotter
  documented in `RECOVERY_MODE.md` (TPM-sealed S3 keys).
- `/var/log/*` — captured by `generate-support-bundle.sh`, not by backup.
- Docker container *runtime* state — backup operates on volumes only.
- LUKS keys, TPM blobs, signing keys — backup output is sensitive but does
  not contain unsealed key material.
- Update bundles in `/var/lib/sita/updates/` — re-fetchable.

## Schedule

Recommended cron entry (installed by `os/image-builder/sita-firstboot.service`):

```
0 2 * * * /opt/sita/deploy/backup.sh >> /var/log/sita-backup.log 2>&1
```

Default retention: **30 days** (override with `--retain-days N`).

## Restore flow

> Restore is **operator-driven, not automatic**. There is no UI button.

1. Boot into recovery: select "SITA OS — Recovery Console" in systemd-boot
   (or run `sita-ops recovery`).
2. List available backups: `ls -lh /var/lib/sita/backups/`.
3. Extract the chosen tarball: `tar xzf sita-backup-<ts>.tar.gz -C /tmp/restore`.
4. Stop application services: `cd /opt/sita/deploy && docker compose down`.
5. Restore each volume:
   ```bash
   for f in /tmp/restore/sita-backup-*/vol-*.tar.gz; do
     vol="$(basename "$f" .tar.gz | sed 's/^vol-//')"
     docker run --rm -v "${vol}:/dest" -v "/tmp/restore/sita-backup-*:/src:ro" \
       alpine sh -c "cd /dest && tar xzf /src/$(basename "$f")"
   done
   ```
6. Restore database:
   ```bash
   docker compose up -d db
   gunzip -c /tmp/restore/sita-backup-*/database.sql.gz \
     | docker exec -i sita-supabase-db psql -U postgres
   ```
7. Restore config (review diff first): `diff -u deploy/.env /tmp/restore/.../config/.env`.
8. `docker compose up -d` and verify with `sita-ops status`.

## Validation

- After every backup, `deploy/backup.sh` writes `manifest.json` and prints
  the SHA256 of the final tarball to `/var/log/sita-backup.log`.
- The latest backup status (timestamp, size, sha256, components) is included
  in every support bundle under `state/backup-status.json` (added by
  `generate-support-bundle.sh`).
- A monthly restore-rehearsal is documented in `runbooks/` (operator action).

## Failure modes

| Failure | Symptom in log | Action |
|---|---|---|
| DB container down | `Database container not running — skipping` | start container, re-run |
| Volume missing | `Volume X not found — skipping` | check `docker volume ls`, may be benign |
| Disk full | `tar: write error: No space left on device` | run `find /var/lib/sita/backups -mtime +7 -delete`, expand `/var` |
| Cron not firing | no recent files in `/var/lib/sita/backups/` | check `systemctl status cron`, validate crontab |

## Related

- `WRITABLE_STATE_MODEL.md` — what lives where (and what's worth backing up).
- `runbooks/failed-update.md` — when to restore vs rollback.
- `deploy/backup.sh` — the script itself.
