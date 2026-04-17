

## Re-Audit: Desktop Host / Electron Checklist (11/11)

I checked every item against disk truth. Phase 14 closure holds — **10 ready, 1 honest partial (signing certificates), 0 missing, 0 errors**. Only one cosmetic warning remains.

### What's actually green ✅

| # | Item | Disk evidence |
|---|---|---|
| 1 | Electron runtime contract | `desktop-host-contract.ts` — 12 privileges, deployment assumptions ✅ |
| 2 | Preload bridge typed/minimal | `preload.cjs` 22 methods ↔ `BRIDGE_METHOD_REGISTRY` 22 entries (1:1 verified) ✅ |
| 3 | Native privileges via bridge | `main.cjs` lines 36-40: `contextIsolation:true`, `sandbox:true`, `nodeIntegration:false`, `webSecurity:true` ✅ |
| 4 | FS bridge permissioned | `fs-bridge.cjs` — dialog-gated, extension allowlist, 50MB cap, sandboxed `userData/backups` ✅ |
| 5 | Auto-updater | `auto-updater.cjs` — graceful fallback, manual feed via `SITA_UPDATE_URL`, full lifecycle ✅ |
| 6 | Crash reporting | `crash-reporter.cjs` — `crashReporter.start`, captures all 3 crash types, persists JSON ✅ |
| 7 | Native notifications | `Notification.isSupported()` gate + `send-notification` IPC ✅ |
| 8 | OS shell truthfully scoped | `DESKTOP_EXCLUSIVE_FEATURES` (10) vs `DESKTOP_WEB_SHARED_FEATURES` (2), Tier 2 not honest OS ✅ |
| 9 | Release/build pipeline | `build-electron.sh` + `forge.config.cjs` (linux/darwin/win32, x64/arm64) ✅ |
| 10 | Web/native fallbacks | `desktop-fallbacks.ts` — every desktop-exclusive capability has fallback strategy ✅ |
| 11 | Signing/notarization | `forge.config.cjs` osxSign + osxNotarize + windowsSign blocks (env-driven) — `partial` only because real certificates required at release time (honest defer) ✅ |

### Disk-truth report (`generated/desktop-deployability-report.json`)

```text
ok: true
errorCount: 0
warningCount: 1
totals: { items: 11, ready: 10, partial: 1, deferred: 0, missing: 0 }
checks:
  sandboxEnforced: true ✅
  contextIsolationEnforced: true ✅
  nodeIntegrationDisabled: true ✅
  bridgeMethodCount: 22/22 ✅
  bridgeMissing: [] ✅
  osxSignBlock + osxNotarizeBlock + windowsSignBlock: true ✅
  hasElectronDep + hasPackagerDep + hasUpdaterDep: true ✅
  mainPointsToElectron: true ✅
  fallbacksComplete: true ✅
  registryClean: true ✅
  buildScriptExecutable: false ⚠️  ← only residual issue
```

### The single residual gap ⚠️

**`scripts/release/desktop/build-electron.sh` lacks the executable bit (mode `0644`).**

The CI gate emits this as a `warning` (not an error), so the umbrella stays green. But running the documented release flow (`./scripts/release/desktop/build-electron.sh linux x64`) will fail with `Permission denied`. Users currently must invoke it via `bash scripts/release/desktop/build-electron.sh ...`. For "100% ready for deployment" this should be fixed.

### Phase 14.1 — Trivial Closure (1 file, 1 line)

**14.1.1 — Make `build-electron.sh` executable.**
`chmod +x scripts/release/desktop/build-electron.sh`. The check-desktop-deployability gate will then report 0 warnings. Direct `./scripts/release/desktop/build-electron.sh` invocation works.

**14.1.2 — Regenerate report.**
Re-run `check-desktop-deployability` to produce a clean `generated/desktop-deployability-report.json` with `warningCount: 0`.

### Acceptance

- `build-electron.sh` is executable; direct invocation works without `bash` prefix.
- `desktop-deployability-report.json` shows `errorCount: 0, warningCount: 0`.
- CI Umbrella stays at **25/25 green** with desktop checklist now `11 ready (1 honest partial), 0 warnings`.
- The honest `partial` on signing remains — it requires real Apple/Windows certificates which can only be provisioned outside the codebase.

### Files

| File | Change |
|---|---|
| `scripts/release/desktop/build-electron.sh` | `chmod +x` (mode 0755) |
| `generated/desktop-deployability-report.json` | Regenerate (warningCount: 0) |

After this 30-second fix, the Desktop Host / Electron Checklist is **truthfully 11/11 honest, 0 errors, 0 warnings**, with the only outstanding work being the one item that physically cannot live in code (real signing certificates).

