

# Nova SDK Audit + Enhancement Plan

## Audit: All 15 Spec Items vs Implementation

| # | Spec Requirement | Status | Detail |
|---|-----------------|--------|--------|
| 1 | SDK folder: core/ui/system/graphics/input/runtime | DONE | All 6 directories exist with correct modules |
| 2 | App Manifest with id, name, version, permissions | DONE | `manifest.ts` with typed interface + `validateManifest()` |
| 3 | Lifecycle hooks: onLaunch/onFocus/onBlur/onExit | DONE | `lifecycle.ts` with full state machine + `onSuspend`/`onResume` |
| 4 | Window API: create with size/title, setResizable | DONE | `window-api.ts` with min/max enforcement |
| 5 | UI Component system (Button, Text, etc.) | DONE | 8 components in `components.tsx` |
| 6 | Layout system (VStack, HStack, constraints) | DONE | `layout.tsx` with VStack/HStack/Spacer/SplitView/AppLayout |
| 7 | Component system (Button with onClick, draw) | DONE | NovaButton with variants, icon slot, active:scale |
| 8 | Graphics API (fillRect, drawText, drawGradient) | DONE | `context.ts` wrapping Canvas 2D |
| 9 | Event system (mouse, keyboard, bubbling) | DONE | `events.ts` with on/once/emit + gesture detection |
| 10 | System API (files, notifications, permission-gated) | DONE | NovaFS (IndexedDB) + NovaNotify (sonner) |
| 11 | IPC Bridge (send/on channels, permission check) | DONE | `bridge.ts` with channel-to-permission mapping |
| 12 | App packaging (bundle format) | DONE | `loader.ts` with AppBundle type |
| 13 | Runtime (load manifest, check perms, start) | DONE | AppLoader.load() validates + registers + hooks |
| 14 | Design enforcement (spacing, typography, components) | DONE | `enforcement.ts` with audit functions |
| 15 | Sample app (Notes with full SDK usage) | DONE | NotesWindow using AppLayout, NovaFS, NovaNotify |

## Gaps Found (Making It "Even Better")

### G1: SettingsWindow not refactored to SDK
Settings still uses raw `APP_TYPE`/`APP_COMPONENTS` tokens instead of Nova SDK components. It should use `AppLayout`, `NovaList`, `NovaSidebar`, `NovaText`, `NovaButton`.

### G2: No `NovaToggle` / `NovaSlider` components
The SDK lacks toggle switches and sliders — both needed by Settings and common in apps. The spec says "every app MUST use shared components."

### G3: No `NovaToolbar` component
AppLayout accepts a toolbar slot but there's no dedicated toolbar component with standard patterns (back button, title, actions).

### G4: No `useNovaApp` convenience hook
Apps must manually wire manifest + lifecycle + FS + notify. A single `useNovaApp(manifest)` hook would auto-register, create FS/notify instances, and provide lifecycle bindings.

### G5: Lifecycle not wired into window open/close
When ShellLayout opens a window, it doesn't call `lifecycleManager.transition(appId, "running")`. When a window closes, no `terminated` transition fires. The lifecycle system is dead code.

### G6: No `NovaTextArea` component
Notes uses raw `<textarea>`. SDK should provide a styled, design-enforced textarea.

### G7: Bridge not connected to real OS services
Bridge handlers for `file:open`, `notification:send`, `theme:get` are never registered. The bridge has no actual service backends wired in.

### G8: No SDK developer documentation/playground
No way for developers to see available components or test them.

## Plan: Fix All Gaps + Polish

### 1. Add missing SDK components
Add to `nova-sdk/ui/components.tsx`:
- `NovaToggle` — system-styled toggle switch (like SettingsWindow's Toggle but standardized)
- `NovaSlider` — range input with SPACE-scale steps
- `NovaTextArea` — styled, design-enforced textarea
- `NovaToolbar` — standard toolbar with back/title/actions layout
- `NovaBadge` — small status badge (count, label)
- `NovaAvatar` — icon/emoji/image avatar with gradient background

### 2. Create `useNovaApp` convenience hook
New file `nova-sdk/hooks/useNovaApp.ts`:
- Takes manifest + optional lifecycle hooks
- Auto-registers via AppLoader on mount
- Returns `{ fs, notify, bridge, lifecycle }` pre-configured with manifest permissions
- Calls `onExit` on unmount

### 3. Wire lifecycle into ShellLayout
In `doLaunchApp`: after `wm.openWindow()`, call `lifecycleManager.transition(appId, "running")`.
In window close handler: call `lifecycleManager.transition(appId, "terminated")`.
In window focus: call `lifecycleManager.transition(appId, "focused")`.
In window blur: call `lifecycleManager.transition(appId, "blurred")`.

### 4. Wire bridge service handlers in NovaSDKProvider
Register default handlers for core channels:
- `file:open` / `file:save` / `file:list` → delegate to NovaFS
- `notification:send` → delegate to NovaNotify
- `theme:get` → return current theme
- `app:launch` → call doLaunchApp
- `sound:play` → already done

### 5. Refactor SettingsWindow to full SDK
Replace raw tokens with Nova SDK components: `AppLayout`, `NovaSidebar`, `NovaList`, `NovaText`, `NovaToggle`, `NovaSlider`.

### 6. Add Notes app empty state action button
Currently the `emptyAction` prop was removed. Add a "New Note" button to the empty state.

### 7. Export new components from barrel
Update `nova-sdk/index.ts` with all new exports.

## Files to Create
- `src/lib/nova-sdk/hooks/useNovaApp.ts`

## Files to Modify
- `src/lib/nova-sdk/ui/components.tsx` — add NovaToggle, NovaSlider, NovaTextArea, NovaToolbar, NovaBadge, NovaAvatar
- `src/lib/nova-sdk/index.ts` — export new components + hook
- `src/contexts/NovaSDKContext.tsx` — register bridge service handlers
- `src/components/sita/ShellLayout.tsx` — wire lifecycle transitions on window open/close/focus
- `src/components/sita/shell/windows/SettingsWindow.tsx` — refactor to SDK components
- `src/components/sita/shell/windows/NotesWindow.tsx` — restore empty state action

## Implementation Order
1. New SDK components (NovaToggle, NovaSlider, NovaTextArea, NovaToolbar, NovaBadge, NovaAvatar)
2. useNovaApp hook
3. Wire lifecycle into ShellLayout
4. Wire bridge handlers in provider
5. Refactor SettingsWindow
6. Polish Notes empty state
7. Update barrel exports

