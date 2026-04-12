

# Extensibility System + Polish Layer + Full OS Stack

## What We're Building

Two major systems that complete the NovaOS architecture: (1) a formal **Extensibility System** enabling plugins, widgets, and integrations to extend the OS, and (2) a comprehensive **Polish Layer** delivering premium micro-interactions, sound design consistency, and animation timing across the entire shell. Plus a **Hardware Abstraction Layer (HAL)** to complete the kernel stack (Apps → SDK → Services → Kernel → Drivers → Hardware).

---

## Part 1: Extensibility System

### 1A. Plugin System (`src/lib/nova-sdk/extensions/plugin-registry.ts`)
- **PluginManifest** type: `id`, `name`, `version`, `targetApp` (or `"system"`), `extensionPoints` (array of hook IDs), `permissions`, `trustLevel`
- **ExtensionPoint** type: defines named hooks that apps/OS expose (e.g., `"menubar.items"`, `"settings.sections"`, `"finder.contextmenu"`, `"statusbar.widgets"`)
- **PluginRegistry** singleton class:
  - `registerPlugin(manifest, handlers)` — validates and stores
  - `registerExtensionPoint(pointId, schema)` — apps declare where plugins can hook in
  - `getExtensions(pointId)` — returns all registered handlers for a hook
  - `enablePlugin(id)` / `disablePlugin(id)` — runtime toggle
  - `getInstalledPlugins()` — list with status
  - Lifecycle: `onInstall`, `onActivate`, `onDeactivate`, `onUninstall` hooks
  - Permission gating via existing `PermissionMonitor`

### 1B. Widget System (`src/lib/nova-sdk/extensions/widget-registry.ts`)
- **WidgetManifest**: `id`, `name`, `size` (`"small" | "medium" | "large"`), `refreshInterval`, `component` (React ComponentType), `permissions`, `category`
- **WidgetRegistry** singleton:
  - `registerWidget(manifest)` — validates size/permissions
  - `getWidgets(category?)` — list available widgets
  - `getActiveWidgets()` — currently placed widgets
  - `placeWidget(id, position)` / `removeWidget(id)` — dashboard management
  - Widgets render inside sandboxed containers with error boundaries

### 1C. Integration System (`src/lib/nova-sdk/extensions/integration-registry.ts`)
- **IntegrationManifest**: `id`, `name`, `provider`, `type` (`"oauth" | "api-key" | "webhook" | "native"`), `capabilities`, `status`, `configSchema`
- **IntegrationRegistry** singleton:
  - `registerIntegration(manifest)` — register a connector
  - `connect(id, config)` / `disconnect(id)` — manage connections
  - `getIntegrations()` — list with status
  - `invoke(id, action, params)` — call integration capabilities
  - Hooks into existing `NovaBridge` for IPC

### 1D. Extension Manager UI (`src/components/sita/shell/windows/ExtensionManagerWindow.tsx`)
- Tabbed window: **Plugins** | **Widgets** | **Integrations**
- Each tab: list of installed items with enable/disable toggles, permission badges, trust indicators
- Install/uninstall buttons with confirmation dialogs
- Search/filter by category

### 1E. Barrel exports
- New `src/lib/nova-sdk/extensions/index.ts` exporting all registries
- Update `src/lib/nova-sdk/index.ts` with extension exports

---

## Part 2: Polish Layer

### 2A. Enhanced Microinteraction Engine (`src/packages/microinteraction-engine/index.ts`)
Expand the existing file with:
- **Window animations**: `windowOpen`, `windowClose`, `windowMinimize`, `windowMaximize` — spring-based with scale + opacity + blur
- **Menu animations**: `menuOpen`, `menuClose`, `menuItemHover` — cascading reveals
- **Dock animations**: `dockBounce`, `dockMagnify`, `dockLaunch` — physics-based
- **Modal animations**: `modalPresent`, `modalDismiss` — depth-aware scale + backdrop
- **Toast animations**: `toastEnter`, `toastExit` — slide + spring
- **State transitions**: `successPulse`, `errorShake`, `loadingBreath`
- **Gesture feedback**: `dragPickup`, `dragDrop`, `snapFeedback`
- **Timing constants**: `TIMING.instant` (50ms), `TIMING.fast` (150ms), `TIMING.normal` (250ms), `TIMING.slow` (400ms), `TIMING.dramatic` (600ms)
- **Easing presets**: `EASING.smooth`, `EASING.snappy`, `EASING.bounce`, `EASING.decelerate`

### 2B. Sound Design Expansion (`src/lib/sound-engine.ts`)
Add to existing SoundEngine:
- `windowOpen(x?)` — ascending two-tone chord
- `windowClose(x?)` — soft descending note
- `windowMinimize(x?)` — quick pitch-down
- `windowMaximize(x?)` — expansive chord
- `menuOpen()` — subtle pop
- `menuClose()` — soft click
- `tabSwitch(x?)` — light tick
- `dragDrop(x?)` — satisfying thud
- `success(x?)` — bright ascending triad
- `warning(x?)` — two-tone alert
- `toggle(x?)` — on/off distinct tones
- `typing()` — very subtle keystroke
- `focusMode()` — breath-like transition
- `volumeChange()` — feedback tone at current frequency

### 2C. Consistency System (`src/lib/nova-sdk/extensions/polish-audit.ts`)
- `auditAnimationConsistency()` — scans registered components for animation timing violations
- `auditSoundCoverage()` — checks all interactive elements have sound mappings
- `auditInteractionFeedback()` — verifies hover/press/focus states exist
- `getPolishScore()` — returns 0-100 score with breakdown

---

## Part 3: Hardware Abstraction Layer (HAL)

### 3A. Device Drivers (`src/lib/nova-sdk/kernel/drivers.ts`)
Simulated driver model to complete the kernel stack:
- **DeviceDriver** interface: `id`, `name`, `type` (`"display" | "input" | "audio" | "storage" | "network" | "battery"`), `status`, `init()`, `shutdown()`, `getDiagnostics()`
- **DriverManager** singleton:
  - `registerDriver(driver)` — add to driver table
  - `initAll()` — boot all drivers in priority order
  - `getDriver(id)` — lookup
  - `getStats()` — aggregate diagnostics
- **Built-in simulated drivers**: `DisplayDriver` (resolution, refresh rate, color depth), `InputDriver` (keyboard, mouse, touch capabilities), `AudioDriver` (sample rate, channels, latency), `StorageDriver` (IndexedDB capacity, quota), `NetworkDriver` (connection type, bandwidth), `BatteryDriver` (level, charging state via Battery API)

### 3B. HAL Integration
- Wire `DriverManager.initAll()` into `NovaKernel.boot()` as Phase 0 (before privilege enforcement)
- Add driver diagnostics to `NovaKernel.getDiagnostics()`
- Export from `src/lib/nova-sdk/index.ts`

---

## Wiring & Integration

1. **Boot sequence update**: `boot.ts` gains Phase 0 (HAL/Drivers) before Phase 1 (Kernel)
2. **Extension registries** initialized during Phase 2 (Services) in `boot.ts`
3. **Polish layer** wired into shell components — window open/close animations updated in `DesktopShell`, dock interactions in `Dock`, notifications in `NotificationDropdown`
4. **Extension Manager** registered as a system app in the window registry
5. **Sound hooks** wired into existing `NovaBridge` event handlers in `NovaSDKContext.tsx`

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/nova-sdk/extensions/plugin-registry.ts` | Create |
| `src/lib/nova-sdk/extensions/widget-registry.ts` | Create |
| `src/lib/nova-sdk/extensions/integration-registry.ts` | Create |
| `src/lib/nova-sdk/extensions/polish-audit.ts` | Create |
| `src/lib/nova-sdk/extensions/index.ts` | Create |
| `src/lib/nova-sdk/kernel/drivers.ts` | Create |
| `src/components/sita/shell/windows/ExtensionManagerWindow.tsx` | Create |
| `src/packages/microinteraction-engine/index.ts` | Expand |
| `src/lib/sound-engine.ts` | Expand |
| `src/lib/nova-sdk/kernel/boot.ts` | Modify (add Phase 0 + extension init) |
| `src/lib/nova-sdk/index.ts` | Modify (add exports) |
| `src/contexts/NovaSDKContext.tsx` | Modify (wire sound hooks) |

