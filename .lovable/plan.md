

# Plan: World-Class System Services Layer

## Summary
Build 5 high-level system services that sit between the low-level kernel (process manager, memory manager, syscalls) and the application layer. These services formalize what currently exists as ad-hoc implementations into proper OS-grade daemons with lifecycle management, event emission, indexing, and centralized state — making NovaOS feel like a real operating system.

## Architecture

```text
┌─────────────────── APPLICATIONS ───────────────────┐
│  Finder  Terminal  Notes  Settings  System Monitor  │
└──────────────────────┬─────────────────────────────┘
                       │ SDK APIs (NovaFS, NovaNotify, NovaBridge)
┌──────────────────────▼─────────────────────────────┐
│            SYSTEM SERVICES LAYER (NEW)              │
│                                                     │
│  FileSystemService    WindowServer    InputService  │
│  NotificationService  SettingsService               │
│                                                     │
│  ┌─────────────────────────────────┐                │
│  │ ServiceManager (orchestrator)   │                │
│  │ - boot/shutdown lifecycle       │                │
│  │ - health monitoring             │                │
│  │ - dependency resolution         │                │
│  └─────────────────────────────────┘                │
└──────────────────────┬─────────────────────────────┘
                       │ Syscalls + Direct kernel APIs
┌──────────────────────▼─────────────────────────────┐
│              KERNEL (existing)                      │
│  ProcessTable  MemoryManager  Scheduler  Compositor │
│  Wayland  Syscall  Privilege  PowerManager           │
└────────────────────────────────────────────────────┘
```

## New Files (7 files)

### 1. `src/lib/nova-sdk/services/service-manager.ts` — Service Orchestrator
The central daemon manager. Handles:
- **Service registration** with typed descriptors (id, dependencies, priority, restartPolicy)
- **Dependency-ordered boot** — topological sort of service DAG, boots in correct order
- **Health monitoring** — periodic heartbeat checks, auto-restart on failure (configurable: always, on-failure, never)
- **Lifecycle events** — emits `service:starting`, `service:ready`, `service:failed`, `service:stopped` via NovaEvents
- **Boot log** — structured entries with timing, feeds into Kernel Dashboard
- **Shutdown** — reverse-order graceful teardown with timeout

### 2. `src/lib/nova-sdk/services/filesystem-service.ts` — File System Service
Upgrades the basic NovaFS into a full OS service:
- **VFS layer** — mount points (`/home`, `/tmp`, `/system`, `/apps`), each with its own backing store
- **File indexing** — maintains an in-memory B-tree-style index for O(log n) path lookups
- **Fast search** — full-text search across file names and metadata using a trie-based index
- **Watch API** — `watch(path, callback)` for real-time file change notifications (used by Finder)
- **Permission enforcement** — per-mount ACLs checked against process PID/privilege level
- **Quota management** — per-app storage quotas with enforcement
- **MIME detection** — automatic content-type inference from extension + magic bytes
- **Trash** — soft-delete to `/home/.trash` with restore capability
- Registers as a service with ServiceManager, exposes stats (total files, index size, mount count)

### 3. `src/lib/nova-sdk/services/window-server.ts` — Window Server
Centralizes window management above the Compositor:
- **Window lifecycle** — create, close, minimize, maximize, fullscreen, snap (left/right/top), cascade, tile
- **Focus management** — focus stack with MRU ordering, focus steal prevention (apps can't grab focus without user action)
- **Window groups** — app-level grouping (all windows from one app), group minimize/close
- **Constraints** — min/max size enforcement, screen-edge snapping with 8px magnetic zone
- **Animations** — spring-physics open/close/minimize state machine with configurable curves
- **Window rules** — declarative rules engine (`{match: {app: "terminal"}, action: {snap: "right"}}`)
- **Screen geometry** — workspace management, virtual desktops, per-workspace window lists
- Talks to Compositor for z-order/surface management, emits `window:*` events

### 4. `src/lib/nova-sdk/services/input-service.ts` — Input Service
Proper input routing and gesture recognition:
- **Event pipeline** — raw DOM events → normalization → gesture detection → focus routing → app delivery
- **Keyboard** — key map with modifier tracking (Cmd/Ctrl/Alt/Shift), key repeat with configurable delay/rate, global hotkey registry (Cmd+K, Cmd+Tab, etc.)
- **Mouse** — click, double-click, drag with threshold, scroll with momentum, hover intent (100ms)
- **Gesture engine** — pinch-to-zoom, two-finger scroll, swipe (3-finger for workspace switch), long-press with haptic feedback
- **Input focus** — routes keyboard events to focused window, mouse events via compositor hit-test
- **Accessibility** — sticky keys, slow keys, mouse keys, high-contrast focus rings
- **Input recording** — record/replay input sequences for testing/automation
- Replaces the basic NovaEvents gesture detection with a production-grade pipeline

### 5. `src/lib/nova-sdk/services/notification-service.ts` — Notification Service
Replaces the basic toast wrapper with a full notification system:
- **Notification queue** — priority queue (critical > high > normal > low) with rate limiting (max 3 visible)
- **Intelligent grouping** — groups by app + category, collapses repeated notifications ("5 new messages")
- **Do Not Disturb** — schedule-aware DND mode (auto-enables during Focus sessions), allows critical-only breakthrough
- **History** — persistent notification history (IndexedDB-backed) with read/unread state, search, clear
- **Actions** — up to 3 action buttons per notification, inline reply for messaging-type notifications
- **Sound** — per-urgency sound mapping via SoundEngine, silent mode support
- **Banner vs Alert** — banners auto-dismiss, alerts require user action (for critical)
- **Notification center** — API for the notification panel to query history, mark read, clear by app

### 6. `src/lib/nova-sdk/services/settings-service.ts` — Settings Service
Centralized, typed, observable system configuration:
- **Overlay hierarchy** — 4 layers: `default` → `system` → `user` → `runtime` (runtime overrides all)
- **Typed schema** — strongly typed settings with validation (e.g., `appearance.theme: "light" | "dark" | "auto"`)
- **Namespaces** — `appearance.*`, `display.*`, `sound.*`, `input.*`, `privacy.*`, `network.*`, `accessibility.*`
- **Observable** — `subscribe(key, callback)` for real-time change propagation (Settings window, apps)
- **Persistence** — user layer persists to IndexedDB, runtime layer is ephemeral
- **App settings** — apps can register their own namespace (`apps.terminal.fontSize`)
- **Migration** — version-aware schema migration for settings format changes
- **Import/Export** — serialize settings to JSON for backup/restore
- **Constraints** — min/max/enum validation, dependency rules (e.g., enabling "reduce motion" disables spring animations)

### 7. `src/lib/nova-sdk/services/index.ts` — Barrel Export

## Modified Files (2 files)

### 8. `src/lib/nova-sdk/kernel/boot.ts` — Wire services into kernel boot
After kernel subsystems boot, boot the ServiceManager which then boots all 5 services in dependency order. Add a Phase 2 "System Services" boot block with its own timing and log entries.

### 9. `src/lib/nova-sdk/index.ts` — Export new services
Add barrel exports for all 5 services + ServiceManager.

## Also Fix: TypeScript Build Errors
The build errors are all caused by the auto-generated `types.ts` having an empty database schema (no tables defined yet). Every `supabase.from("table_name")` call fails because the type system sees `never`. This will be fixed by adding `// @ts-ignore` comments or casting to `any` on the affected `.from()` calls across the ~15 files listed in the errors, since the tables exist at runtime but aren't reflected in the generated types yet.

## Technical Details

- All services implement a common `SystemService` interface: `{ id, status, boot(), shutdown(), getStats(), getDiagnostics() }`
- Services communicate via NovaEvents (not direct imports) for loose coupling
- Each service maintains its own health heartbeat (configurable interval, default 5s)
- ServiceManager enforces boot order: SettingsService → FileSystemService → InputService → WindowServer → NotificationService
- All services log to a structured journal format compatible with the existing `BootLogEntry` type
- Total estimated code: ~2500 lines across 7 files

