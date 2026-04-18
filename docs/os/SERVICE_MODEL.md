# SITA OS — Canonical Service Model

> **One service per concern. No duplicates. No hidden boot magic.**

This document is the authoritative inventory of every systemd unit shipped
with SITA OS. If a unit is not listed here, it should not exist.

## Boot order (high-level)

```
basic.target
  └─► multi-user.target
       ├─► sita-firstboot.service       (one-shot, only on first boot)
       ├─► sita-settingsd.service       (config namespace daemon)
       ├─► sita-timed.service           (NTP / timezone)
       ├─► sita-healthd.service         (heartbeat + resource probe)
       ├─► sita-crashd.service          (crash dump collector)
       ├─► sita-accessibilityd.service  (a11y broker)
       └─► graphical.target
            └─► sita-runtime.service    (xinit on TTY7 → Electron shell)
                 └─► [OnFailure] sita-recovery-shell.service
       ├─► sita-updated.timer           (every 6h, A/B atomic updates)
       └─► sita-recovery.target         (manual entry only)
```

## Canonical unit inventory

| Unit | Type | File | Purpose | Restart | Logs | OnFailure |
|---|---|---|---|---|---|---|
| `sita-firstboot.service` | oneshot | `os/image-builder/sita-firstboot.service` | Provision LUKS, generate machine-id, mark `/var/lib/sita/.first-boot-complete` | no | journal `sita-firstboot` + `/var/log/sita-firstboot.log` | recovery-shell |
| `sita-runtime.service` | simple | `os/image-builder/sita-runtime.service` | xinit → `launch.sh` → `sita-shell` (Electron) | on-failure (5/120s) | journal `sita-runtime` | sita-recovery-shell |
| `sita-recovery-shell.service` | simple | `os/image-builder/services/sita-recovery-shell.service` | Xterm + tmux + `journalctl -fu sita-runtime` fallback | on-failure (3/300s) | journal `sita-recovery-shell` | — |
| `sita-updated.service` | oneshot | `os/image-builder/services/sita-updated.service` | `sita-updated --check-and-stage` (A/B) | no (timer-driven) | journal `sita-updated` | — |
| `sita-updated.timer` | timer | `os/image-builder/services/sita-updated.timer` | Trigger sita-updated every 6h | — | — | — |
| `sita-recovery.target` | target | `os/image-builder/recovery/sita-recovery.target` | Recovery TUI (manual) | — | journal | — |
| `sita-healthd.service` | simple | `os/image-builder/services/sita-healthd.service` | Heartbeat + service watchdog → `/var/lib/sita/state/healthd.json` | always (30s) | journal `sita-healthd` | — |
| `sita-crashd.service` | simple | `os/image-builder/services/sita-crashd.service` | Collects core dumps, copies to `/var/log/sita/crashes/` | always (10s) | journal `sita-crashd` | — |
| `sita-settingsd.service` | simple | `os/image-builder/services/sita-settingsd.service` | Persistent config broker (sqlite at `/var/lib/sita/settings.db`) | always (10s) | journal `sita-settingsd` | — |
| `sita-timed.service` | simple | `os/image-builder/services/sita-timed.service` | NTP sync (chrony wrapper) + tz mgmt | always (60s) | journal `sita-timed` | — |
| `sita-accessibilityd.service` | simple | `os/image-builder/services/sita-accessibilityd.service` | AT-SPI broker | on-failure | journal `sita-accessibilityd` | — |

## Restart & failure policy (canonical)

| Tier | Policy | Used by |
|---|---|---|
| **Critical UI** | `Restart=on-failure RestartSec=3 StartLimitBurst=5 StartLimitIntervalSec=120` + `OnFailure=sita-recovery-shell.service` | `sita-runtime` |
| **Background daemons** | `Restart=always RestartSec=10` | `sita-healthd`, `sita-settingsd`, `sita-crashd`, `sita-timed` |
| **One-shots** | `Restart=no` (timer-driven if recurring) | `sita-firstboot`, `sita-updated` |
| **Recovery fallback** | `Restart=on-failure RestartSec=5 StartLimitBurst=3 StartLimitIntervalSec=300` | `sita-recovery-shell` |

## Hardening defaults

All `sita-*.service` units must include:

```ini
NoNewPrivileges=true
ProtectSystem=strict
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
PrivateTmp=true
```

`ReadWritePaths=` is the *only* approved escape hatch and must be enumerated
explicitly (see `WRITABLE_STATE_MODEL.md`).

## Validation

- `os/diagnostics/check-boot-target.sh` — asserts `graphical.target` reached and required units active.
- `os/diagnostics/collect-service-health.sh` — emits per-service health JSON for support bundle.
- `scripts/architecture/checks/check-electron-shell-session-readiness.ts` — CI gate.

## Deprecated / removed

None. If you find a `sita-*` unit not on this list, file an audit issue —
it must either be added here or removed from the image.
