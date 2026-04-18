# SITA OS — Desktop Session Model

> **There is no GNOME, no KDE, no display manager. The desktop *is* Electron.**

## Startup chain

```
systemd boot
  └─► graphical.target
       └─► sita-runtime.service          (User=sita, PAMName=login, vt7)
            └─► /usr/bin/xinit /opt/sita/shell/launch.sh -- :0 vt7 -nolisten tcp
                 └─► launch.sh
                      └─► shell-watchdog.sh                  (os/runtime/shell-watchdog.sh)
                           └─► /usr/bin/sita-shell           (Electron main → preload → renderer)
                                └─► writes /run/sita/shell-ready (IPC ready marker)
                                └─► writes /var/lib/sita/state/shell-heartbeat (every 5s)
```

If the chain breaks at any step:

1. `shell-watchdog.sh` retries up to 3× within 60s with backoff.
2. After 3 failures, watchdog launches `os/image-builder/recovery/safe-mode.sh`
   (Electron with all extensions disabled, `--safe-mode` flag).
3. If safe-mode also fails, systemd `OnFailure=sita-recovery-shell.service`
   takes over: a TTY7 xterm + tmux session with live `journalctl -fu sita-runtime`.

## Display & GPU

- **X server only** (Xorg via `xinit`). Wayland is not used in v1 — Electron's
  Wayland support is not yet stable enough for our compositing needs.
- **GPU acceleration is required** for window-drag performance. Window dragging
  uses CSS `transform: translate3d(...)` driven by `requestAnimationFrame`,
  rendered as plain `<div>` elements (NOT `motion.div` — framer-motion would
  clobber the transform).
- Hardware fallback: if no GPU is detected, Electron is launched with
  `--disable-gpu` and a warning banner is shown.

## Session user

- UID/GID `1000` (`sita:sita`), home at `/home/sita` (LUKS2-encrypted).
- `XDG_RUNTIME_DIR=/run/user/1000` (created by ExecStartPre with `0700` perms).
- `DISPLAY=:0`, `NODE_ENV=production`, `SITA_RUNTIME_MODE=desktop`.

## Health probe

`os/runtime/check-shell-health.sh` is the canonical health probe. It checks:

| Signal | Threshold | Exit code |
|---|---|---|
| `pgrep sita-shell` | must exist | 10 |
| Xorg or Xwayland process | must exist | 11 |
| RSS of shell process | < 4 GiB | 12 |
| `/run/sita/shell-ready` mtime | < 24h old | 13 |
| `/var/lib/sita/state/shell-heartbeat` mtime | < 30s old | 14 |

The probe is invoked by:
- `sita-runtime.service` `ExecStartPost` (5s after start)
- `sita-healthd.service` (every 30s)
- `sita-ops status` (manual)

## Renderer crash handling

The Electron preload (`electron/preload.cjs`) writes a heartbeat file every 5s
via `setInterval`. If the renderer hangs or white-screens, the heartbeat goes
stale within 30s and `check-shell-health.sh` exits with code 14. `sita-healthd`
then increments a crash counter and, after 3 stale heartbeats in 5 minutes,
restarts `sita-runtime.service`.

## What is *not* part of the session

- No login screen, no greeter, no display manager (auto-login as `sita`).
- No window manager other than Electron's frameless windows.
- No system tray daemon (notifications go through `electron.Notification` →
  libnotify → `sita-healthd` event log).
- No screensaver (the OS is intended for always-on appliance use; lock screen
  is implemented inside the Electron shell).

## Related docs

- `RECOVERY_MODE.md` — what happens after the watchdog gives up.
- `ELECTRON_PRELOAD_CONTRACT.md` — the IPC surface available to the renderer.
- `SERVICE_MODEL.md` — full unit inventory.
