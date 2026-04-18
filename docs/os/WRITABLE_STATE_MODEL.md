# SITA OS — Writable State Model

> **The root filesystem is read-only. Every byte that mutates lives in one
> of the locations on this page. If it's not on this list, it's a bug.**

## Partition layout

| Mount | Backing | Access | Survives update? | Survives rollback? | Encrypted |
|---|---|---|---|---|---|
| `/` (active slot) | dm-verity over `sita_root_a` or `sita_root_b` | read-only | replaced atomically | reverts to other slot | no (verity) |
| `/boot/efi` | vfat on EFI System Partition | read-write (root only) | yes | yes | no |
| `/var/lib/sita` | ext4 on `sita_state` | read-write | **yes** | **yes** | LUKS2 |
| `/var/log` | ext4 on `sita_state` (subvol) | read-write | yes (rotated) | yes | LUKS2 |
| `/home` | ext4 on `sita_home` | read-write | **yes** | **yes** | LUKS2 (TPM-sealed) |
| `/etc/sita` | overlay over `sita_state/etc-overlay` | read-write | yes | yes | LUKS2 |
| `/run`, `/tmp` | tmpfs | read-write | no (volatile) | no | n/a |

## Canonical writable paths

| Path | Owner | Purpose | Cleaned by |
|---|---|---|---|
| `/var/lib/sita/.first-boot-complete` | root | First-boot marker | never |
| `/var/lib/sita/state/healthd.json` | sita | Live health snapshot | sita-healthd (overwrites) |
| `/var/lib/sita/state/shell-heartbeat` | sita | Electron preload liveness | preload (overwrites every 5s) |
| `/var/lib/sita/state/safe-mode-marker` | root | Set when watchdog escalates | `repair-shell.sh` |
| `/var/lib/sita/diagnostics/*.json` | root | Collector outputs | size-capped (10 MiB total) |
| `/var/lib/sita/rollbacks/` | root | Snapshots before update | last 3 retained |
| `/var/lib/sita/updates/` | root | Staged update bundles | sita-updated (after activate) |
| `/var/lib/sita/backups/` | root | `deploy/backup.sh` output | retain-days policy |
| `/var/lib/sita/support/` | root | Support bundles | manual (admin) |
| `/var/log/sita-firstboot.log` | root | First-boot trace | never |
| `/var/log/sita/crashes/` | root | Core dumps from sita-crashd | size-capped (500 MiB) |
| `/etc/sita/{version,channel,slot}` | root | Image identity | replaced on update |
| `/etc/sita/attestation.json` | root | TPM attestation receipt | replaced on update |
| `/home/sita/` | sita | User data | never (backup only) |
| `/run/sita/shell-ready` | sita | Electron IPC-ready marker | volatile (tmpfs) |
| `/run/user/1000/` | sita | XDG runtime dir | volatile (tmpfs) |

## Update vs rollback survival rules

- **Updated atomically:** `/` (slot flip), `/etc/sita/{version,channel,slot,attestation.json}`.
- **Migrated forward:** `/var/lib/sita/state/`, `/etc/sita/` overlay (schema-validated by `sita-settingsd`).
- **Preserved verbatim:** `/home`, `/var/log`, `/var/lib/sita/{backups,support,rollbacks}`.
- **Rebuilt on first boot of new slot:** `/run/sita/`, `/tmp`, `/run/user/1000`.
- **Rollback:** flips `/` to previous slot; `/var/lib/sita/state/` is *not*
  rolled back unless the operator runs `sita-ops rollback --reset-state`.

## Atomic-write rule

Every file under `/var/lib/sita/state/` and `/etc/sita/` MUST be written via:

```bash
tmp="$(mktemp "${target}.XXXXXX")"
echo "${content}" > "${tmp}"
chmod 0644 "${tmp}"
mv -f "${tmp}" "${target}"   # atomic on same filesystem
sync
```

This rule is enforced by `sita-settingsd`, `sita-healthd`, all collectors, and
all repair scripts. Direct `>` redirection to canonical paths is a bug.

## Quotas

| Path | Soft cap | Hard cap | Enforced by |
|---|---|---|---|
| `/var/log` | 1 GiB | 2 GiB | journald `SystemMaxUse=` + logrotate |
| `/var/log/sita/crashes/` | 250 MiB | 500 MiB | `sita-crashd` (FIFO eviction) |
| `/var/lib/sita/diagnostics/` | 10 MiB | 20 MiB | collectors (truncate-on-write) |
| `/var/lib/sita/rollbacks/` | last 3 | last 3 | `sita-updated` (FIFO) |
| `/var/lib/sita/backups/` | retain-days | retain-days | `deploy/backup.sh` |

## Related

- `BACKUP_AND_RESTORE.md` — what we back up from this layout.
- `LOGGING_MODEL.md` — journal vs file log split.
- `os/scripts/check-update-state.sh` — detects partial writes after crashes.
