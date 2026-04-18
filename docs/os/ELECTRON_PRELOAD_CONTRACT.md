# SITA OS — Electron Preload Contract

> **The preload is the *only* bridge between the renderer and the host OS.**
> No `nodeIntegration`. No `remote`. No `enableRemoteModule`. Sandboxed renderer.

## Trust boundary

```
┌──────────────────────────────────────────────┐
│  Renderer (Chromium, sandboxed)              │
│   ↓  window.electron.<method>                │
├──────────────────────────────────────────────┤
│  preload.cjs  (contextBridge, isolated)      │
│   ↓  ipcRenderer.invoke('<channel>', args)   │
├──────────────────────────────────────────────┤
│  main.cjs  (ipcMain handlers, validates)     │
│   ↓  fs / child_process / native modules     │
└──────────────────────────────────────────────┘
```

## Exposed surface (`window.electron`)

| Group | Methods | Notes |
|---|---|---|
| **System** | `platform`, `getSystemInfo()`, `getAppVersion()` | Read-only |
| **Window** | `windowControl(action)` | `minimize`/`maximize`/`close`/`fullscreen` only |
| **Notifications** | `sendNotification(title, body)` | Validated by main, length-capped |
| **Deep links** | `onDeepLink(cb)` | Subscriber returns unsubscribe fn |
| **Menu** | `onMenuAction(cb)`, `onNavigate(cb)` | Subscriber returns unsubscribe fn |
| **Updates** | `checkForUpdates`, `downloadUpdate`, `installUpdate`, `getUpdateStatus`, `onUpdateStatus` | All async; main enforces signature/verity |
| **Files** | `exportBackup(data)`, `importBackup()` | Always opens native dialog — never silent |
| **Heartbeat** | *(internal)* writes `/var/lib/sita/state/shell-heartbeat` every 5s | Consumed by `check-shell-health.sh` |

## Forbidden in preload

- `require('child_process')` exposed to renderer
- `require('fs')` exposed to renderer
- Any function that takes a renderer-supplied path and writes outside
  `XDG_RUNTIME_DIR` or `~/.local/share/sita/`
- `eval`, `Function(...)`, dynamic `require` of renderer-supplied strings
- Direct env var exposure (use `getSystemInfo()` whitelist)

## Validation in main

Every `ipcMain.handle()` MUST:

1. Validate argument types (`typeof`, `Array.isArray`, length caps).
2. Reject paths that escape allowlisted roots (`path.resolve` + prefix check).
3. Rate-limit destructive actions (max 1 update install per 60s).
4. Log to `journalctl` via `console.log` (captured by `sita-runtime` unit).

## Heartbeat protocol

```js
// preload.cjs
const HEARTBEAT_PATH = '/var/lib/sita/state/shell-heartbeat';
setInterval(() => {
  try { require('fs').writeFileSync(HEARTBEAT_PATH, String(Date.now())); }
  catch { /* read-only fs in dev — ignore */ }
}, 5000);
```

The file's mtime is the canonical liveness signal. `check-shell-health.sh`
treats > 30s as stale → exit code 14.

## Sandbox & CSP

- `BrowserWindow` is created with `contextIsolation: true`, `sandbox: true`,
  `nodeIntegration: false`, `webSecurity: true`.
- CSP is set in `index.html` (no `unsafe-eval`, no remote `<script>`).
- `network-sentinel.cjs` enforces the domain allowlist; preload cannot
  bypass it.

## Versioning

The contract is versioned via `window.electron.bridgeVersion` (string).
Renderer must check `bridgeVersion` on boot and refuse to start if the
declared version is older than `SITA_REQUIRED_BRIDGE_VERSION` baked into
the build.
