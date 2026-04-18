# SITA OS — Native Diagnostics Collectors

Canonical structured collectors for the native operating environment.
Each script writes a JSON file under `/var/lib/sita/diagnostics/` and
echoes a one-line human summary. The support-bundle generator
(`os/scripts/generate-support-bundle.sh`) reads from that directory, so
running these scripts is **the** way to populate diagnostics — there is
no second collection path.

| Script | Output | Read by |
|---|---|---|
| `collect-boot-health.sh` | `boot-health.json` | support bundle, recovery-status |
| `collect-runtime-health.sh` | `runtime-health.json` | support bundle, observability page |
| `collect-update-health.sh` | `update-health.json` | support bundle, updater |
| `collect-service-failures.sh` | `service-failures.json` | support bundle, recovery |
| `emit-runtime-status.sh` | `runtime-status.json` (heartbeat) | metrics-agent |

All collectors are idempotent and safe to run on a read-only root
(they fall back to `/tmp/sita-diagnostics/`).
