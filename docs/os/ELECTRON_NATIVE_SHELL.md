# SITA OS — Electron as the Canonical Native Shell

> Status: **shipped**. This document describes the actual integration between
> the Electron desktop shell and the Ubuntu-native runtime.
> Cross-references: [`SITA_OS_INSTALL.md`](./SITA_OS_INSTALL.md),
> [`RECOVERY_MODE.md`](./RECOVERY_MODE.md),
> [`OBSERVABILITY_AND_DIAGNOSTICS.md`](./OBSERVABILITY_AND_DIAGNOSTICS.md).

The Electron app at `electron/main.cjs` is **not** a desktop convenience
wrapper — it is the canonical SITA session shell. There is no GNOME, no
KDE, no XFCE. When the user is logged in, they are looking at Electron.

## 1. Boot sequence (cold start to shell)

```
                ┌──────────────────────────────┐
                │  GRUB → signed kernel        │  (sbsign-verified by shim)
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  initramfs (signed)          │
                │  └─ sita-verify-rootfs hook  │  (dm-verity check, panic on fail)
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  systemd default target =     │
                │  graphical.target             │
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  sita-firstboot.service       │  (one-shot; idempotent)
                │  ConditionPathExists=!.first  │
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  sita-runtime.service         │  ← canonical shell launcher
                │  Requires=sita-firstboot      │
                │  ExecStart=/usr/bin/xinit     │
                │     /opt/sita/shell/launch.sh │
                │     -- :0 vt7 -nolisten tcp   │
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  Xorg :0 on tty7              │
                │  → /opt/sita/shell/electron   │
                │  → loads file:///opt/sita/    │
                │    shell/dist/index.html      │
                └──────────────────────────────┘
```

The unit file is [`os/image-builder/sita-runtime.service`](../../os/image-builder/sita-runtime.service).

Key invariants enforced by the unit:

| Invariant | Mechanism |
|---|---|
| Single shell instance | systemd unit (no auto-respawn race) |
| Runs as unprivileged `sita` user | `User=sita` `Group=sita` |
| Cannot read other users' homes | `ProtectSystem=strict` + `ReadWritePaths` |
| Cannot insert kernel modules | `ProtectKernelModules=true` |
| Cannot escalate privilege | `NoNewPrivileges=true` |
| Tmpfs isolated from system `/tmp` | `PrivateTmp=true` |

## 2. Restart & failover policy

`sita-runtime.service` declares `Restart=on-failure` with `RestartSec=3`.
systemd's default rate-limit applies: **5 restarts within 10 seconds → unit
enters `failed` state**. When that happens:

1. systemd writes the failure to the journal (`SyslogIdentifier=sita-runtime`).
2. `sita-runtime-watchdog.path` (in `os/image-builder/recovery/`) detects the
   failed state and activates `sita-recovery-shell.service` on **TTY7**.
3. The recovery shell offers: re-run shell, view logs, generate support
   bundle, reboot to standby slot, factory reset.

The user is **never** stranded at a black screen. If Electron cannot start,
TTY7 always shows a deterministic recovery menu.

## 3. Crash → support bundle pipeline

```
electron/main.cjs (crashReporter.start)
        │
        ▼
/var/log/sita/crashes/<timestamp>.dmp + meta.json
        │
        ├──► /opt/sita/bin/sita-crash-relay (systemd path unit)
        │            │
        │            ▼
        │    POST {SUPABASE_URL}/functions/v1/crash-report-ingest
        │            │
        │            ▼
        │    public.crash_reports table + alert-router edge fn
        │
        └──► included in `os:support:bundle` output
                (os/scripts/generate-support-bundle.sh)
```

The crash relay batches uploads, redacts user paths, respects offline state
(queues to `/var/lib/sita/crashes-pending/`), and is rate-limited to 10
crashes per hour per device.

## 4. Bridge contract (renderer ↔ main ↔ OS)

The renderer never touches the OS directly. All system calls flow through
the typed IPC surface defined in `electron/preload.cjs` and governed by:

- [`src/lib/runtime/desktop/desktop-host-contract.ts`](../../src/lib/runtime/desktop/desktop-host-contract.ts) — privilege catalog
- [`src/lib/runtime/desktop/electron-bridge-contract.ts`](../../src/lib/runtime/desktop/electron-bridge-contract.ts) — 22 method groups
- [`src/lib/runtime/desktop/desktop-security-boundaries.ts`](../../src/lib/runtime/desktop/desktop-security-boundaries.ts) — sandbox config

Renderer flags enforced in `electron/main.cjs`:

```js
contextIsolation: true,
nodeIntegration: false,
sandbox: true,
webSecurity: true,
```

## 5. Update & rollback interaction

- The Electron shell **never** updates itself directly. It is an artifact
  inside the verity-protected root slot.
- A new shell version ships as part of an A/B OS bundle (see
  [`UPDATE_AND_ROLLBACK_STRATEGY.md`](./UPDATE_AND_ROLLBACK_STRATEGY.md)).
- After OTA apply + reboot, the shell exposes its version to the renderer
  via `window.electron.getRuntimeInfo()`. If the Sentinel detects shell
  version drift vs. expected manifest, it shows a non-blocking banner.

## 6. Why Electron and not a window manager?

| Concern | Decision |
|---|---|
| Brand & UX consistency | One React/Electron codebase, identical pixel-for-pixel across hardware |
| Security audit surface | One shell to audit, vs. N WM + DE compositors |
| Update model | Shell ships inside the verity slot, atomic with the OS |
| Crash recovery | Same `sita-recovery-shell.service` regardless of which app crashed |
| Native app launch | Apps are routed through `sitaApps` bridge (see [`NATIVE_APP_ECOSYSTEM.md`](./NATIVE_APP_ECOSYSTEM.md)), not WM windows |

## 7. Observability surfaces

| Signal | Source | Sink |
|---|---|---|
| Shell start/stop | `journalctl -u sita-runtime` | support bundle, ops dashboard |
| Renderer crashes | Electron `crashReporter` | `crash-report-ingest` edge fn |
| IPC errors | `electron/main.cjs` error handler | journal + crash relay |
| Bridge denied calls | `DesktopSecurityBoundaries` | `admin_action_audit` table |
| Update apply failures | `sita-updated.service` | journal + auto-rollback |

All five sinks are queryable from the in-product Observability page.
