
# Plan: Managed App Runtime, System App Ecosystem Audit, and Design System Lock-Down

## What Already Exists

**Runtime (partial)**:
- `lifecycle.ts` — State machine with hooks (launch/focus/blur/suspend/exit)
- `loader.ts` — Manifest validation + code signing + sandbox + permission registration
- `useNovaApp.ts` — Convenience hook for auto-registration
- `registry.ts` — Central app registry with state tracking
- NO managed event loop, NO memory safety helpers, NO app-scoped resource tracking, NO automatic cleanup/GC

**System Apps (mostly complete)**:
- File Manager (Finder) ✓, Settings ✓, Terminal ✓, System Monitor ✓, Notes ✓, Calendar ✓, Calculator ✓, Weather ✓, Music ✓, Code Editor ✓, Mail ✓, Maps ✓, Photo Viewer ✓, Security Center ✓
- App Library page exists at `/app-store/library` but is NOT a native desktop window — only a web route
- Missing: App Library as a launchable OS window

**Design System (partial)**:
- `app-window-system.ts` — spacing, typography, materials, shadows, chrome, components ✓
- `nova-os.ts` — materials, depth layers, shapes, motion, shadows ✓
- `enforcement.ts` — spacing/font/radius audit ✓
- Missing: color token enforcement, motion rule enforcement, comprehensive design contract that apps MUST accept, dev-time violation reporting wired into the runtime

## Implementation (3 work items)

### 1. Managed App Runtime Layer

Create `src/lib/nova-sdk/runtime/managed-runtime.ts` — a per-app runtime environment (like Cocoa's NSApplication / .NET's AppDomain):

**AppRuntime class** — instantiated per-app by AppLoader:
- **Memory Safety**: `AppMemoryGuard` — per-app allocation tracking with soft/hard limits (configurable via manifest), automatic cleanup on terminate, leak detection (tracks allocated objects, intervals, listeners, subscriptions)
- **Event Loop**: `AppEventLoop` — per-app message queue with `postMessage()`, `defer()`, `schedule()`, priority-based dispatch (immediate / normal / idle), tick-based processing wired to `requestAnimationFrame`, pause/resume for suspend state
- **Resource Tracker**: `AppResourceTracker` — registers intervals, timeouts, event listeners, subscriptions created by an app; auto-cleans all on `terminate()`; prevents resource leaks
- **Error Boundary**: `AppErrorBoundary` interface — uncaught error handler, crash count tracking, restart policy integration from ServiceManager pattern

**Changes to existing files**:
- `loader.ts` — Create `AppRuntime` instance during `load()`, attach to `RegisteredApp`, destroy on `unload()`
- `registry.ts` — Add `runtime?: AppRuntime` field to `RegisteredApp`
- `lifecycle.ts` — Wire event loop pause/resume to suspend/resume transitions; trigger resource cleanup on terminate
- `useNovaApp.ts` — Return `runtime` handle so apps can access their event loop and resource tracker

**New hook**: `useAppRuntime()` — provides memory guard, event loop, and resource tracker for the current app context

### 2. App Library Window (System App gap)

Create `src/components/sita/shell/windows/AppLibraryWindow.tsx` — a native OS window showing all registered apps from the AppRegistry:

- Grid of app cards with icon, name, publisher, version, state badge (running/registered/terminated)
- Category filter sidebar using manifest `category` field
- Search bar filtering by name
- Launch button that triggers `openAppWindow` from ShellLayout
- Shows app permissions, sandbox isolation level, and code signing status per-app
- Wire into ShellLayout + DesktopDock as `app-library`

### 3. Design System Full Lock-Down

**Extend `enforcement.ts`** with comprehensive rules:
- **Color enforcement**: `auditColor()` — validates against allowed HSL token set (brand colors, semantic colors); flags hardcoded hex/rgb
- **Motion enforcement**: `auditMotion()` — validates duration and spring configs against `NOVA_MOTION` tokens
- **Component enforcement**: `auditComponent()` — checks that custom buttons/inputs/cards use `APP_COMPONENTS` base classes
- **Shadow enforcement**: `auditShadow()` — validates against `NOVA_SHADOWS` and `APP_SHADOWS` presets

**New: `DesignContract` interface** in `src/lib/nova-sdk/core/design-contract.ts`:
- Apps must declare `designVersion: string` in manifest (e.g. "nova-1.0")
- `validateDesignCompliance(manifest, component)` — runs all auditors at load-time
- Non-compliant apps get a design violation warning in console + optional block in strict mode

**Wire into AppLoader**:
- After code signing, run `validateDesignCompliance()` 
- Log violations to console with `[NovaSDK Design Audit]` prefix
- In `strict` mode, block apps with error-severity violations

**New: `NovaThemeProvider`** component wrapping all app windows:
- Injects CSS custom properties from design tokens
- Prevents apps from overriding root CSS variables
- Provides `useNovaTheme()` hook for apps to read (not write) theme values

## Files Created/Changed

| File | Action |
|------|--------|
| `src/lib/nova-sdk/runtime/managed-runtime.ts` | New — AppRuntime, AppMemoryGuard, AppEventLoop, AppResourceTracker |
| `src/lib/nova-sdk/runtime/loader.ts` | Wire AppRuntime creation/destruction |
| `src/lib/nova-sdk/core/registry.ts` | Add runtime field to RegisteredApp |
| `src/lib/nova-sdk/runtime/lifecycle.ts` | Wire event loop pause/resume to state transitions |
| `src/lib/nova-sdk/hooks/useNovaApp.ts` | Return runtime handle |
| `src/lib/nova-sdk/hooks/useAppRuntime.ts` | New — convenience hook for runtime access |
| `src/components/sita/shell/windows/AppLibraryWindow.tsx` | New — native App Library window |
| `src/components/sita/ShellLayout.tsx` | Register app-library launch |
| `src/components/sita/DesktopDock.tsx` | Add app-library to OS_WINDOW_APPS |
| `src/lib/nova-sdk/core/design-contract.ts` | New — DesignContract + full compliance validator |
| `src/lib/nova-sdk/core/enforcement.ts` | Add color, motion, shadow, component auditors |
| `src/lib/nova-sdk/ui/NovaThemeProvider.tsx` | New — theme injection + useNovaTheme hook |
| `src/lib/nova-sdk/index.ts` | Export new modules |
| `src/lib/nova-sdk/core/manifest.ts` | Add `designVersion` field |
