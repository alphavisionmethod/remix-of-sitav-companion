
## Audit: Desktop Host / Electron Checklist (11 items)

I audited each item against disk truth. **9 are real, 2 have gaps, and there's no enforceable readiness registry / CI gate** parallel to iOS / Android / Web.

### What's actually green ✅

| # | Item | Disk evidence |
|---|---|---|
| 1 | Electron runtime contract | `src/lib/runtime/desktop/desktop-host-contract.ts` — 12 privileges, deployment assumptions, exclusive vs shared features ✅ |
| 2 | Preload bridge typed & minimal | `electron/preload.cjs` (22 methods) ↔ `electron-bridge-contract.ts` (`BRIDGE_METHOD_REGISTRY`, 22 entries) ✅ |
| 3 | Native privileges via approved bridge | `desktop-bridge-isolation` check forbids direct `electron/*` imports from `src/pages/**` and `src/components/**` ✅ |
| 4 | FS bridge explicit + permissioned | `electron/fs-bridge.cjs` — dialog-gated, allowlist of extensions, 50MB read cap, sandboxed `userData/backups` ✅ |
| 5 | Auto-updater works or clearly disabled | `electron/auto-updater.cjs` — graceful fallback when `electron-updater` missing, manual feed via `SITA_UPDATE_URL`, full lifecycle in `desktop-update-contract.ts` ✅ |
| 6 | Crash reporting works | `electron/crash-reporter.cjs` — `crashReporter.start`, captures `unhandledRejection` / `uncaughtException` / renderer crashes, persists JSON dumps ✅ |
| 7 | Native notifications | `Notification.isSupported()` gate + `send-notification` IPC ✅ |
| 9 | Desktop release/build pipeline | `scripts/release/desktop/build-electron.sh` + `electron/forge.config.cjs` ✅ |
| 11 | Signing/notarization plan | `forge.config.cjs` — `osxSign`, `osxNotarize`, `windowsSign`, env-driven (`APPLE_*`, `CSC_LINK`) ✅ |

### Real gaps ❌

**Gap A — Item 8 "OS shell features truthfully scoped" has no enforced anti-overclaim check.**
`desktop-host-contract.ts` honestly lists 12 privileges, and `DESKTOP_EXCLUSIVE_FEATURES` separates from shared ones, but **nothing fails CI if a renderer page claims a desktop-exclusive feature without the bridge present**. Need an assertion that `runtime-capability-matrix` desktop entries match the contract.

**Gap B — Item 10 "web-only/native-only mismatches handled" — `desktop-fallbacks.ts` exists but is not asserted against the bridge surface.**
Need a check that every `desktop-only` capability has a matching `web-fallback` declaration (or honest "no-op-on-web" entry).

**Gap C — Sandbox NOT enforced in `BrowserWindow` config.**
`desktop-host-contract.ts` declares `sandbox: true` as a deployment assumption, and `desktop-security-boundaries.ts` claims it's "verified". But `electron/main.cjs` line 35-39 does **NOT** pass `sandbox: true` in `webPreferences`. This is a **truthfulness violation** — the contract lies. Fix: add `sandbox: true` to `webPreferences`.

**Gap D — No readiness registry + CI gate parallel to iOS/Android/Web.**
iOS has 18 items, Android 18, Web 13, all with typed registries + CI gates. Desktop has the contract files but **no `desktop-deployability-readiness.ts` and no `check-desktop-deployability` gate**. The CI Umbrella does not enforce the 11-item checklist as a single artifact.

**Gap E — Existing `check-desktop-runtime-contract.ts` lives under `scripts/runtime/checks/` but is NOT registered in the CI Umbrella `ci-gate-registry.ts`.** It runs in isolation, not under the umbrella manifest, and it's only `warning` severity.

**Gap F — `package.json` has no Electron dependency** (`electron`, `@electron/packager`, `electron-updater`). `build-electron.sh` does install on demand but there's no lockfile entry. Same pattern we just fixed for Capacitor in Phase 12.1.

---

## Phase 14 — Desktop Host / Electron Deployability Closure

### Plan (~6 files, ~350 LOC)

**14.1 — Fix sandbox truthfulness gap (`electron/main.cjs`)**
Add `sandbox: true` to `webPreferences` (line 35-39). Verify license-ui.cjs/license-preload.cjs windows likewise enable sandbox. This makes the contract honest.

**14.2 — Install Electron dependencies in `package.json`**
Add `electron`, `@electron/packager` (dev), `electron-updater`. After `npm install` post-export, `build-electron.sh` runs without on-demand install and `auto-updater.cjs`'s try-block resolves `electron-updater` cleanly.

**14.3 — Create Desktop Deployability Readiness Registry**
`src/lib/runtime/desktop/release/desktop-deployability-readiness.ts` — typed 11-item registry, one entry per checklist item, `{ id, title, status: ready|partial|deferred|missing, evidence, blocker?, remediation? }`. Mirrors iOS/Android/Web pattern.

Plus `src/lib/runtime/desktop/release/index.ts` barrel.

**14.4 — CI gate `check-desktop-deployability.ts`**
Asserts:
- `electron/main.cjs` contains `sandbox: true` (regex check)
- `electron/preload.cjs` exposes exactly `BRIDGE_METHOD_COUNT` (22) methods
- All 22 methods registered in `BRIDGE_METHOD_REGISTRY` exist in preload (cross-validation)
- `electron/forge.config.cjs` exists with osxSign/osxNotarize/windowsSign blocks
- `scripts/release/desktop/build-electron.sh` exists and is executable
- `package.json` declares `electron` + `@electron/packager` deps
- `package.json` `main` points to `electron/main.cjs`
- `desktop-fallbacks.ts` declares fallback for every `DESKTOP_EXCLUSIVE_FEATURES` entry

Registers as **CI gate 25** under new phase `phase-14-desktop-deployability` in `ci-gate-registry.ts` and `ci-gate-types.ts`. Generates `generated/desktop-deployability-report.json`.

**14.5 — Wire admin dashboard `DSK01DeployabilityCenter.tsx`**
Route `/admin/desktop/deployability`. Renders all 11 items green/amber/red with evidence links, mirroring `MOB01StoreReadinessCenter.tsx` and `WEB01DeployabilityCenter.tsx`.

**14.6 — Update aggregators**
- `generated/ci-umbrella-manifest.json` → gateCount: 25, +`phase-14-desktop-deployability`
- `generated/production-truth-final.json` → +phase-14
- `META04ProductReality` tile → 25-gate verdict

### Acceptance

- `electron/main.cjs` has `sandbox: true` enforced — contract no longer lies.
- `package.json` resolves `electron`, `@electron/packager`, `electron-updater` after `npm install`.
- `desktop-deployability-report.json` shows **11 ready, 0 missing**, with honest defers only on items requiring physical signing certificates.
- New `check-desktop-deployability` gate passes.
- CI Umbrella reads **25/25 green**.
- `/admin/desktop/deployability` renders all 11 items.

### Files

| File | Change |
|---|---|
| `electron/main.cjs` | Add `sandbox: true` to webPreferences |
| `package.json` | +electron, +@electron/packager, +electron-updater |
| `src/lib/runtime/desktop/release/desktop-deployability-readiness.ts` | 11-item registry |
| `src/lib/runtime/desktop/release/index.ts` | Barrel |
| `scripts/architecture/checks/check-desktop-deployability.ts` | CI gate 25 |
| `src/pages/admin/DSK01DeployabilityCenter.tsx` | Admin surface |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | +phase-14 |
| `src/routes/AdminRoutes.tsx` | Route wiring |
| `generated/desktop-deployability-report.json` | Disk report |
| `generated/ci-umbrella-manifest.json` | gateCount: 25 |
| `generated/production-truth-final.json` | +phase-14 |

After this phase, the Desktop Host / Electron Checklist is enforceable in CI — sandbox is actually enforced (not just claimed), every preload method is contract-verified, every native-exclusive feature has a documented web fallback, and the umbrella reports a single truthful verdict.
