

# Nova OS App SDK — Full Implementation Plan

## Summary
Build a complete in-browser App SDK framework that formalizes how apps are created, registered, launched, and governed within SITA OS. This translates the C++-style SDK spec into a TypeScript runtime that works within the existing React shell — giving every app a manifest, lifecycle hooks, window API, layout system, event bus, IPC bridge, and design enforcement layer.

## What Already Exists
- `AppDefinition` type with permissions, trust levels, lifecycle receipts
- `AppPermissionGate` wired into launch flow via `ShellLayout`
- `FloatingWindow` with morph animation, accent strips, traffic lights
- `AppStateWrapper` (loading/empty/error states)
- `useWindowManager` with position memory, z-ordering, minimize/restore
- `SoundEngine` for spatial audio feedback
- `APP_COMPONENTS` design tokens (buttons, inputs, cards, lists)
- App catalog with 45+ apps

## What's New (13 SDK Modules)

### 1. App Manifest System (`nova-sdk/core/manifest.ts`)
Typed `AppManifest` interface mirroring `app.json`: id (`com.nova.notes`), name, version, entry component, permissions array, lifecycle hooks declaration, window defaults (size, resizable, transparent), required capabilities. Validation function `validateManifest()` that rejects malformed manifests.

### 2. App Registry (`nova-sdk/core/registry.ts`)
Central singleton registry where apps self-register via `NovaSDK.registerApp(manifest, AppComponent)`. Stores manifest + component + runtime state (running/suspended/terminated). Provides `getApp(id)`, `listApps()`, `isRunning(id)`. The registry replaces the ad-hoc if/else chain in `ShellLayout.doLaunchApp`.

### 3. App Lifecycle Manager (`nova-sdk/runtime/lifecycle.ts`)
Formal state machine: `registered → launching → permission-check → running → focused → blurred → suspending → terminated`. Emits lifecycle events: `onLaunch`, `onFocus`, `onBlur`, `onSuspend`, `onResume`, `onExit`. Apps implement a `NovaAppLifecycle` interface. The lifecycle manager calls these hooks at the right transitions.

### 4. Window API (`nova-sdk/system/window-api.ts`)
Apps request windows through `NovaWindow.create({ width, height, title, resizable, transparent })`. The API wraps `useWindowManager.openWindow` but enforces: min size, max size, title bar presence, system chrome. Apps cannot bypass the window system. Provides `setRootView()`, `setToolbar()`, `setTitle()`, `close()`, `minimize()`, `maximize()`.

### 5. UI Component Library (`nova-sdk/ui/components.tsx`)
Pre-built SDK components that enforce the design system: `<NovaButton>`, `<NovaInput>`, `<NovaList>`, `<NovaCard>`, `<NovaModal>`, `<NovaText>`, `<NovaSidebar>`. All consume `APP_COMPONENTS` tokens. Apps importing these get consistent styling automatically. Variants: primary/secondary/ghost for buttons, body/label/title/heading for text.

### 6. Layout System (`nova-sdk/ui/layout.tsx`)
Constraint-based layout primitives: `<VStack>`, `<HStack>`, `<Spacer>`, `<Divider>`, `<ScrollArea>`, `<SplitView>` (sidebar + content). All enforce the SPACE scale (4/8/16/24/32px). `<AppLayout>` enforces the mandatory Title Bar + optional Sidebar + Content structure. Apps that use `<AppLayout>` automatically get the correct window chrome.

### 7. Graphics Context (`nova-sdk/graphics/context.ts`)
A lightweight 2D drawing API wrapping Canvas: `NovaContext.fillRect()`, `drawText()`, `drawGradient()`, `drawRoundedRect()`, `drawCircle()`, `drawImage()`. Enforces system colors, radii, and typography. Provided to apps that need custom drawing (charts, visualizations) without breaking design rules.

### 8. Event System (`nova-sdk/input/events.ts`)
Typed event bus: `NovaEvents.on('mouse:down', handler)`, `NovaEvents.on('key:press', handler)`, `NovaEvents.on('focus:change', handler)`. Event flow: Input → Window → View Tree → Target → Bubble. Includes gesture recognition: tap, long-press, drag, pinch. Sound integration: auto-plays `SoundEngine.click()` on button interactions.

### 9. System Bridge / IPC (`nova-sdk/system/bridge.ts`)
Apps communicate with OS services through `NovaBridge.send(channel, payload)` and `NovaBridge.on(channel, handler)`. Channels: `file:open`, `file:save`, `notification:send`, `clipboard:read`, `clipboard:write`, `permission:request`, `theme:get`, `app:launch`. All calls are permission-gated — bridge checks manifest permissions before executing.

### 10. File System API (`nova-sdk/system/filesystem.ts`)
Permission-controlled file operations: `NovaFS.readFile(path)`, `NovaFS.writeFile(path, data)`, `NovaFS.listDir(path)`, `NovaFS.exists(path)`. Uses IndexedDB/localStorage as backend. Every call checks `files.read` / `files.write` permissions from the manifest. Unauthorized calls throw `PermissionDeniedError`.

### 11. Notification API (`nova-sdk/system/notifications.ts`)
`NovaNotify.send({ title, body, icon, sound, urgency })`. Integrates with the existing toast system and notification center. Requires `system.notifications` permission. Supports actions (buttons in notifications), grouping, and auto-dismiss.

### 12. App Packaging & Loader (`nova-sdk/runtime/loader.ts`)
`AppLoader.load(manifestPath)` → reads manifest → validates → checks permissions → registers → launches. Simulates the bundle format: manifest.json + component + assets. The loader enforces that apps cannot run without a valid manifest.

### 13. Design Enforcement Layer (`nova-sdk/core/enforcement.ts`)
Runtime checks that apps comply with design rules: spacing must use SPACE constants, typography must use TYPE scale, colors must come from system palette, corners must be 12-16px. `NovaEnforcement.audit(component)` returns violations. In dev mode, renders red outlines around non-compliant elements.

## Context Provider & Hook
Create `NovaSDKProvider` context that wraps the shell and provides SDK access to all apps via `useNovaSDK()`. Returns: `manifest`, `window`, `bridge`, `fs`, `notify`, `events`, `lifecycle`, `theme`.

## Sample Apps Refactored
Refactor `FinderWindow` and `SettingsWindow` to use the SDK: register via `NovaSDK.registerApp()`, use `<AppLayout>` + `<NovaSidebar>` + Nova components, implement lifecycle hooks.

## New Sample App: Notes
Build a `Notes` app using the full SDK to demonstrate: manifest registration, lifecycle hooks, `<AppLayout>`, `<NovaList>` + `<NovaInput>`, `NovaFS.readFile/writeFile`, `NovaNotify.send()` on save.

## Files to Create
```text
src/lib/nova-sdk/
  core/
    manifest.ts          — AppManifest type + validation
    registry.ts          — App registry singleton
    enforcement.ts       — Design compliance checker
  ui/
    components.tsx       — NovaButton, NovaInput, NovaList, NovaCard, NovaModal, NovaText
    layout.tsx           — VStack, HStack, Spacer, SplitView, AppLayout
  system/
    window-api.ts        — Window creation/management API
    bridge.ts            — IPC message bus
    filesystem.ts        — Permission-gated file ops
    notifications.ts     — Notification API
  input/
    events.ts            — Typed event system with gestures
  graphics/
    context.ts           — 2D drawing API
  runtime/
    lifecycle.ts         — State machine + hooks
    loader.ts            — Manifest loader + validator
  index.ts               — Barrel export + NovaSDKProvider

src/contexts/NovaSDKContext.tsx    — React context for SDK access
src/components/sita/shell/windows/NotesWindow.tsx  — Sample SDK app
```

## Files to Modify
- `ShellLayout.tsx` — Replace if/else app launch with registry lookup, wrap in `NovaSDKProvider`
- `useWindowManager.ts` — Add `updateWindow()` for SDK window API mutations
- `FloatingWindow.tsx` — Accept toolbar/sidebar from SDK `AppLayout`
- `FinderWindow.tsx` — Refactor to use Nova SDK components
- `SettingsWindow.tsx` — Refactor to use Nova SDK components
- `DesktopDock.tsx` — Add Notes app to dock items
- `app-platform/catalog.ts` — Add Notes app definition

## Implementation Order
1. Core: manifest + registry + enforcement
2. UI: components + layout
3. System: window API + bridge + filesystem + notifications
4. Input: event system
5. Graphics: drawing context
6. Runtime: lifecycle + loader
7. Context: NovaSDKProvider + useNovaSDK hook
8. Integration: wire into ShellLayout, refactor Finder/Settings
9. Sample: build Notes app
10. Polish: sound integration, design audit warnings

