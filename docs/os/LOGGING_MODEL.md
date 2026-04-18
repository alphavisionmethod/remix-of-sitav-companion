# SITA OS — Logging Model

> **journald is the default. File logs are exceptions, each justified.**

## Default: journald

Every `sita-*.service` unit writes to journald via `StandardOutput=journal`
and `StandardError=journal`, with a stable `SyslogIdentifier=`. Operators
read everything via `journalctl`:

```bash
journalctl -u sita-runtime -f             # live tail
journalctl -u sita-updated --since today  # bounded
journalctl -b -1                          # previous boot
```

Journald limits (set in `/etc/systemd/journald.conf.d/sita.conf`):

```ini
[Journal]
SystemMaxUse=1G
SystemKeepFree=2G
MaxRetentionSec=14day
ForwardToSyslog=no
```

## File-log exceptions (each one justified)

| Path | Producer | Why not journal | Rotation |
|---|---|---|---|
| `/var/log/sita-firstboot.log` | `deploy/first-boot.sh` | Runs before journald is fully ready; must survive into post-firstboot diagnosis | logrotate weekly, keep 4 |
| `/var/log/sita-backup.log` | `deploy/backup.sh` | Cron-driven, must be readable without `journalctl` access (e.g. by ops scripts) | logrotate weekly, keep 12 |
| `/var/log/sita/crashes/*.log` | `sita-crashd` | Per-crash structured artefacts (stack, env, dump pointer); not a stream | sita-crashd FIFO at 500 MiB |
| `/var/lib/sita/diagnostics/*.json` | collectors | Snapshots, not streams; consumed by support bundle | overwrite-on-write |

No other file logs are permitted. New components MUST use journald.

## Redaction policy

Anything that may leave the device — support bundles, error reports — is
piped through the redaction pass in `os/scripts/generate-support-bundle.sh`:

| Pattern | Replaced with |
|---|---|
| `eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+` (JWT) | `[REDACTED-JWT]` |
| `sk_(live|test)_[A-Za-z0-9]{16,}` (Stripe) | `[REDACTED-STRIPE]` |
| `SITA-[A-Z0-9]{4,}-[A-Z0-9]{4,}` (license) | `[REDACTED-LICENSE]` |
| `(password|passphrase|secret|token)=...` | `\1=[REDACTED]` |

Redaction runs over `*.log`, `*.txt`, `*.json` recursively. Any new pattern
must be added to that script — there is no second redactor.

## Support bundle inclusion rules

The bundle (`/var/lib/sita/support/sita-support-<host>-<ts>.tar.zst`) includes:

| Source | Size cap | Notes |
|---|---|---|
| `journalctl -b -n 2000` (current boot) | 2000 lines | always |
| `journalctl -b -1 -n 2000` (previous boot) | 2000 lines | always |
| `journalctl -u <unit> -n 500` per critical unit | 500 lines × N units | always |
| `/var/log/sita-firstboot.log` | full | always |
| `/var/log/sita/crashes/` | full | always (post-redaction) |
| `/var/lib/sita/diagnostics/` | full | always |
| `/etc/sita/` | full | excludes private keys |
| `/var/lib/sita/rollbacks/` (metadata only, no images) | full | always |

## Critical units (auto-included by name)

```
sita-firstboot
sita-runtime
sita-updated
sita-recovery
sita-recovery-shell
sita-healthd
sita-crashd
sita-settingsd
sita-timed
sita-accessibilityd
```

## Operator quick reference

```bash
# What's failing right now
systemctl --failed
journalctl -p err -b

# Why did the shell crash
journalctl -u sita-runtime -n 200 --no-pager

# Why did the update fail
sudo /opt/sita/scripts/check-update-state.sh
journalctl -u sita-updated --since "1 hour ago"

# Generate everything for support
sudo sita-ops support-bundle
```

## Related

- `WRITABLE_STATE_MODEL.md` — quotas and where logs live on disk.
- `OBSERVABILITY_AND_DIAGNOSTICS.md` — collectors that produce JSON snapshots.
- `os/scripts/generate-support-bundle.sh` — the canonical exporter.
