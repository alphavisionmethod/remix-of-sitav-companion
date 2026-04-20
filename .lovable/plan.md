

## Plan — Route remaining inline runtime probes through the canonical registry

### Goal
Eliminate every inline `window.electron` / `navigator.userAgent` runtime/platform check outside `src/runtimes/` so all tier + platform truth flows through the canonical detectors (`detectActiveRuntimeTier`, `detectDesktopRuntime`, `getElectronBridge`, `isElectronRuntime`) — exactly the pattern that already governs `useElectronBridge`.

### Scope decision per match

| Pattern | Files | Action |
|---|---|---|
| `VITE_APPLIANCE_RUNTIME` | `src/runtimes/runtime-detection.ts` only | ✅ Already canonical — no change |
| Observability sinks (raw UA string for telemetry only) | `src/lib/observability/runtime-error-context.ts`, `src/lib/observability/uptime.ts` | ✅ Keep — tier-agnostic crash/heartbeat metadata, not a runtime decision |
| Documentation contracts describing fallbacks | `src/runtimes/desktop/desktop-host-capabilities.ts`, `src/runtimes/desktop/desktop-fallbacks.ts`, `src/lib/surfaces/host-window-vs-simulated-map.ts`, `src/lib/web-platform/release/web-runtime-min-contract.ts` | ✅ Keep — these are spec strings, not live probes |
| Live runtime/platform probes outside `src/runtimes/` | 9 files (listed below) | 🔧 Migrate |

### New canonical helper (single file, no second abstraction)

**Add `src/runtimes/runtime-platform.ts`** — pure helper layered on the existing detectors. No new abstraction layer; it just re-exports the registry's truth in the shapes the call sites need:

```ts
// ── exports ──────────────────────────────────────────────
export type DevicePlatform = "ios" | "android" | "macos" | "windows" | "linux" | "web";
export type DeviceFormFactor = "desktop" | "mobile" | "tablet";

export function getDevicePlatform(): DevicePlatform        // uses detectDesktopRuntime + UA fallback
export function getDeviceFormFactor(): DeviceFormFactor    // mobile/desktop classification
export function getDeviceLabel(): string                   // "iPhone" / "Mac Browser" / "SITA Desktop"
export function getDeviceFingerprint(): string             // stable short id for state-sync / continuity
export function getOSVersionString(): string               // for diagnostics rows
export function isMobileSurface(): boolean
```

All UA parsing lives in this one file. Internally it calls `detectActiveRuntimeTier()` first (so `DESKTOP_HOST` short-circuits to `"SITA Desktop"`), then falls back to a single UA regex table.

### Migrations (9 files)

| File | Inline check today | Replaced with |
|---|---|---|
| `src/lib/services/surface-detection/index.ts` | `('electron' in window) \|\| ua.includes("Electron")`; mobile UA regex; `getDeviceName()` UA chain | `isElectronRuntime()` + `isMobileSurface()` + `getDeviceLabel()` |
| `src/lib/app-platform/runtime.ts` | `window.electron`, `window.electron.platform`, mobile UA | `detectDesktopRuntime()` + `getDevicePlatform()` |
| `src/lib/app-platform/sdk.ts` | `window.electron?.platform`, `!!window.electron`, UA regex | `getDevicePlatform()` + `isElectronRuntime()` |
| `src/hooks/use-realtime-notifications.ts` | direct `window.electron?.sendNotification` call + local `isElectron()` | Use `useElectronBridge().sendNotification` (already the canonical bridge) |
| `src/contexts/SitaOSContext.tsx` | `/iPhone\|iPad\|Android/i.test(ua)` + `ua.slice(0,32)` for deviceId | `isMobileSurface()` + `getDeviceFingerprint()` |
| `src/lib/services/biometric-auth/index.ts` | UA-based device label | `getDeviceLabel()` |
| `src/lib/services/system-updates/index.ts` | raw `navigator.userAgent`/`platform`/`language` for device profile | `getDeviceLabel()` + `getDevicePlatform()`; keep `language` (locale, not runtime) |
| `src/lib/services/push-notification/push-registration-service.ts` | UA chain for device name | `getDeviceLabel()` |
| `src/lib/services/universal-state-sync/index.ts` | `web_${ua.slice(0,20)}` device id | `getDeviceFingerprint()` |
| `src/components/sita/OSSetupExperience.tsx` | `navigator.userAgent.slice(0,60)` x2 (osVersion + os) | `getOSVersionString()` |

### Validator extension (enforces the new boundary going forward)

Update **`scripts/validation/check-shell-runtime-portability.ts`** to add a second pass: any `*.ts/*.tsx` file outside `src/runtimes/`, `src/lib/observability/`, the doc-contract files listed above, and the canonical `useElectronBridge.ts` must NOT contain the literal tokens `window.electron`, `navigator.userAgent`, or `import.meta.env.VITE_APPLIANCE_RUNTIME`. Emit `error` issues into the existing gate report (no new gate ID needed — extends the same shell/runtime portability gate already wired into the master aggregator).

Add an explicit allowlist constant `RUNTIME_PROBE_ALLOWLIST` at the top of the validator with the 6 doc/observability files, so future additions are an obvious code review signal.

### Out of scope

- No changes to `src/runtimes/**` detectors (already canonical).
- No changes to observability files (`runtime-error-context.ts`, `uptime.ts`) — UA there is opaque telemetry, not a runtime decision.
- No changes to `useElectronBridge.ts` (it IS the canonical bridge consumer).
- No DB / edge function / migration / README changes.
- No deletion of the doc-contract strings that mention `navigator.userAgent` as a *described* web fallback.

### Validation (after implementation)

1. `npx tsx scripts/validation/check-shell-runtime-portability.ts` → 0 violations.
2. `npx tsx scripts/validation/check-runtime-host-boundaries.ts` → still PASS (unchanged surface).
3. Spot-check `src/lib/services/surface-detection` — `detectSurfaceType()` should now return identical values for Electron/PWA/mobile/web without referencing `navigator` or `window.electron` directly.
4. Master aggregator (`os-release-readiness-report.json`) — no regression in the 28 BLOCK gates.

### Files touched

**Created (1)**
- `src/runtimes/runtime-platform.ts`

**Edited (10)**
- `src/lib/services/surface-detection/index.ts`
- `src/lib/app-platform/runtime.ts`
- `src/lib/app-platform/sdk.ts`
- `src/hooks/use-realtime-notifications.ts`
- `src/contexts/SitaOSContext.tsx`
- `src/lib/services/biometric-auth/index.ts`
- `src/lib/services/system-updates/index.ts`
- `src/lib/services/push-notification/push-registration-service.ts`
- `src/lib/services/universal-state-sync/index.ts`
- `src/components/sita/OSSetupExperience.tsx`

**Validator extended (1)**
- `scripts/validation/check-shell-runtime-portability.ts`

