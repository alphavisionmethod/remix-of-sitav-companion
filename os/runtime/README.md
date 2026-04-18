# SITA OS — Runtime Health & Shell Watchdog

The Electron desktop shell is the canonical SITA OS user surface
(`/usr/bin/sita-shell`, started by `sita-runtime.service`). This
directory contains the **runtime-side** scripts that detect and respond
to shell failures.

There is one canonical chain — no parallel watchdog implementations:

```
sita-runtime.service       (systemd unit, Restart=on-failure)
   └─ /usr/bin/sita-shell   (Electron main process)
        └─ shell-watchdog.sh   (counts crashes, arms safe-mode / recovery)
              └─ check-shell-health.sh (probes Electron readiness)
                    └─ on N failures → sita-recovery-shell.service (TTY7)
```

| Script | Role |
|---|---|
| `shell-watchdog.sh` | Wraps `sita-shell`; counts crashes; escalates to safe-mode or recovery |
| `check-shell-health.sh` | One-shot health probe (used by ExecStartPost / metrics) |

State files (canonical):
- `/var/lib/sita/state/shell-crash-count` — integer, reset on clean exit
- `/var/lib/sita/state/last-shell-crash` — ISO timestamp + reason
- `/var/lib/sita/state/safe-mode.activated` — set when escalated

Crash logs are written to `/var/log/sita/crashes/` and picked up by the
canonical support bundle generator (no second crash pipeline).
