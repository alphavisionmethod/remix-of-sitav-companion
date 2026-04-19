# SITA OS — Electron Runtime

This directory contains the Electron main-process runtime for the SITA OS
desktop shell. All modules use the `.cjs` extension because the project's
root `package.json` declares `"type": "module"` (which would otherwise turn
every `.js` file into an ES module where `__dirname` is undefined and
`require()` is unavailable).

## Why a flat layout?

Electron Forge — and the wider Electron community — convention is a flat
`electron/` (or `main/`) directory. The trade-offs:

| Approach | Pro | Con |
|----------|-----|-----|
| **Flat (current)** | Zero `require('./x')` rewrites; matches Forge templates; no path drift across scripts/CI/docs | Visually flat at the filesystem level |
| Sub-folders (`main/`, `preload/`, `bridges/`, …) | Visually grouped | Breaks ~40 `require()` paths in `main.cjs`, scripts, `forge.config.cjs`, workflows, and docs; high regression risk for cosmetic gain |

To get the *benefit* of grouping (clear ownership, governance, drift
prevention) without the *cost* of moving files, we use an explicit
**domain registry** at [`_layout.cjs`](./_layout.cjs).

Every `.cjs` module in this folder MUST appear in exactly one domain
in `_layout.cjs`. This invariant is enforced by:

- `scripts/architecture/checks/check-electron-domain-layout.ts` — BLOCK gate
- `scripts/architecture/checks/check-electron-shell-session-readiness.ts`

Both run in CI on every PR touching `electron/**`.

## Domain map

| Domain | Responsibility | Modules |
|--------|----------------|---------|
| `main` | Process entry, window/session lifecycle | `main.cjs` |
| `preload` | Renderer-facing `contextBridge` surfaces | `preload.cjs`, `license-preload.cjs` |
| `bridges` | Typed IPC surfaces (FS, apps, capabilities) | `fs-bridge.cjs`, `sita-apps-bridge.cjs` |
| `security` | Runtime hardening, DLP, network policy, integrity | `runtime-shield.cjs`, `dlp-guard.cjs`, `network-sentinel.cjs`, `integrity-check.cjs` |
| `updater` | Auto-update + crash telemetry | `auto-updater.cjs`, `crash-reporter.cjs` |
| `license` | Activation enforcement + activation UI window | `license-guard.cjs`, `license-ui.cjs` |
| `packaging` | Electron Forge / Packager config | `forge.config.cjs` |

## Adding a new module

1. Create the `.cjs` file in `electron/`.
2. Add its **basename** (e.g. `my-feature.cjs`) to the appropriate domain
   array in `_layout.cjs`.
3. Run `npx tsx scripts/architecture/checks/check-electron-domain-layout.ts`
   locally to verify the registry is in sync.
4. The validator runs automatically in CI — orphan files or duplicate
   classifications block the PR.

## Related governance

- `src/lib/runtime/desktop/` — `DesktopHostContract`, `ElectronBridgeContract`,
  `DesktopSecurityBoundaries`, `DesktopUpdateContract` (typed surfaces).
- `os/runtime/shell-watchdog.sh` + `check-shell-health.sh` — native-side
  shell heartbeat & restart policy.
