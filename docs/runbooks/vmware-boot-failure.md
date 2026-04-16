# RB-008 — VMware / Desktop Boot Failure

| Field | Value |
|---|---|
| Severity | **medium** |
| Bounded Context | `runtime-kernel` |
| Subsystem | desktop-host |
| Owner | platform |
| Estimated MTTR | 15 min |
| Kill switch | `KS-APPLIANCE-UPDATE` |
| Message code | `BOOT-003` |

## Trigger

Desktop or appliance app fails to initialize within 30 seconds of launch.

## Steps

1. **Inspect Electron main-process logs** (or `journalctl` on appliance).
2. **Verify local storage and config integrity**.
3. **Clear app cache and restart**.
4. **If persistent**, reinstall from latest known-good release.

## Rollback

If reinstall introduces a regression, roll back the release via `RB-009`.

## Evidence

- Boot logs
- Config snapshot pre/post repair
- Release version installed
