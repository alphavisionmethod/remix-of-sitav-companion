

## Wave 12.7 — Windowing System Closure

### Summary

Formalize the existing windowing foundations into a canonical, OS-grade windowing platform. The project has two parallel window management systems (the `useWindowManager` hook + `WindowManagerContext` used by `FloatingWindow`, and the `OSWindowProvider`/`WindowContext` used by `AppWindow`/`WindowCompositor`) plus a typed static registry (`src/lib/windowing/`). This wave unifies them, adds missing governance layers (contracts, lifecycle state machine, focus history, modal policy, DPI/monitor/communication/performance policies), and generates proof artifacts.

---

### PART 1 — Canonical Systems to Preserve and Extend

| System | Path | Action |
|---|---|---|
| Window Registry (static) | `src/lib/windowing/window-registry.ts` | Extend with lifecycle, placement, modal, runtime fields |
| Window Session Store | `src/lib/windowing/window-session-store.ts` | Extend with z-order, workspace, focus history, monitor |
| Window Recovery | `src/lib/windowing/window-recovery.ts` | Extend with corrupted state quarantine, modal chain repair, selective restore |
| Window Capability Policy | `src/lib/windowing/window-capability-policy.ts` | Extend with host bridge, filesystem, privileged modal, and permission escalation rules |
| App Window Policy | `src/lib/app-platform/app-window-policy.ts` | Keep as-is, reference from contracts |
| Window Physics | `src/lib/services/window-physics.ts` | Keep as-is (magnetic, bounce, shake) |
| Window Snap | `src/hooks/useWindowSnap.ts` | Keep as-is |
| Window Perf Monitor | `src/platform/nova-sdk/kernel/window-perf.ts` | Keep as-is, referenced by performance policy |
| FloatingWindow | `src/components/sita/shell/FloatingWindow.tsx` | Keep as primary window renderer (887 lines, full-featured) |
| AppWindow | `src/components/sita/os/AppWindow.tsx` | Keep as secondary renderer for OSWindowProvider consumers |
| ShellWindowLayer launcher | `src/components/sita/shell/ShellWindowLayer.tsx` | Keep as canonical app-to-window mapping |

### PART 2 — Duplicate/Shadow Systems to Consolidate

| Duplicate | Canonical Target | Action |
|---|---|---|
| `useWindowManager` hook (src/hooks/) | Remains as the primary runtime hook, but internal types aligned to new contract | Align `WindowState` fields to `WindowContract` |
| `OSWindowProvider` (src/components/sita/os/WindowContext.tsx) | Secondary system used by `WindowCompositor` | Keep as-is — it serves a different render path (AppWindow). Add note marking it as the OS-layer compositor context vs. the shell-layer `WindowManagerContext` |
| `APP_REGISTRY` in ShellWindowLayer | `WINDOW_REGISTRY` in windowing/window-registry.ts | Cross-reference; no merge needed since they serve different purposes (runtime components vs. static metadata) |

No deletions required. The two window contexts serve distinct render pipelines and are used in different shell layers.

### PART 3 — Window Contract and Lifecycle

**New file: `src/packages/window-contracts/index.ts`**

Typed contracts including:
- `WindowContract` — full identity: windowId, appId, windowType (primary/secondary/modal/panel/dialog), windowRole, title, runtimeSurface, shellTarget, workspaceId, monitorId, placement, size, zIndex, focusState, visibilityState, lifecycleState, persistencePolicy, recoveryPolicy, permissionScope, communicationPolicy, modalOwnerWindowId, parentWindowId, launchCause, evidence metadata
- `WindowLifecycleState` — 15-state enum: CREATED, INITIALIZING, OPEN, FOCUSED, BLURRED, BACKGROUNDED, MINIMIZED, HIDDEN, SUSPENDED, MODAL_OPEN, CRASHED, RECOVERING, CLOSING, CLOSED, RESTORING
- `WindowLifecycleTransition` — typed transition table with source states, requirements, permission implications, persistence requirements, focus/z-order updates
- `WindowType`, `WindowRole`, `FocusState`, `VisibilityState`, `PersistencePolicy`, `RecoveryPolicy`, `PermissionScope`, `CommunicationPolicy`, `LaunchCause`
- `WindowPlacement` — x, y, width, height, monitorId, workspaceId, dpiScale
- `WindowRecoveryMetadata` — lastStableSnapshot, crashCount, lastCrashAt, quarantined

**New file: `src/lib/windowing/window-lifecycle-manager.ts`**

- Canonical 15-state machine with validated transitions
- `transitionWindow(windowId, targetState)` with guards
- Event emission for each transition
- Fallback behavior for invalid transitions

### PART 4 — Registry / Persistence / Recovery Extensions

**Extend: `src/lib/windowing/window-registry.ts`**

Add runtime fields:
- `windowType`, `windowRole`, `runtimeSurface`, `shellTarget`
- `persistencePolicy`, `recoveryPolicy`, `permissionScope`
- `communicationPolicy`, `modalSupport`, `standaloneSupport`

Add runtime APIs:
- `getActiveWindows()`, `getSuspendedWindows()`, `getCrashedWindows()`
- `getWindowStack()` (z-order sorted)
- `getWindowsForWorkspace(workspaceId)`
- `getModalOwner(windowId)`, `getChildWindows(parentId)`
- `registerModal(windowId, ownerWindowId)`

**Extend: `src/lib/windowing/window-session-store.ts`**

Add fields to `WindowSessionSnapshot`:
- `workspaceId`, `monitorId`, `focusOrder`, `lifecycleState`
- `dpiScale`, `snapZone`

**Extend: `src/lib/windowing/window-recovery.ts`**

Add:
- `quarantineCorruptedState(windowId)` — isolate corrupted session data
- `repairModalChain(snapshot)` — re-link orphaned modals
- `selectiveRestore(windowIds)` — restore subset of windows
- `degradedRestore(snapshot, capabilities)` — fallback when native APIs missing

### PART 5 — New Policy Modules

**New: `src/lib/windowing/window-permission-boundary.ts`**
- `canAccessNativeBridge(windowId)` — checks permission scope
- `canRequestFileSystem(windowId)`
- `canLaunchExternal(windowId)`
- `canCommunicateWith(sourceId, targetId)` — wraps and extends capability-policy
- `canOpenPrivilegedModal(windowId)`
- `canExportSupportData(windowId)`
- `resolveEffectivePermissions(windowId)` — combines app + runtime + shell + window policies

**New: `src/lib/windowing/window-monitor-policy.ts`**
- `resolveMonitorPlacement(windowId, monitors)` — assign to monitor
- `recoverOffScreen(window, viewport)` — bring off-screen windows back
- `handleMonitorDetach(detachedMonitorId, windows)` — redistribute
- `getSafePlacement(size, monitors)` — initial safe placement

**New: `src/lib/windowing/window-dpi-policy.ts`**
- `normalizePlacement(placement, fromDPI, toDPI)` — scale geometry
- `getEffectiveDPI()` — resolve current DPI
- `shouldUseHighDPIRendering(windowId)` — per-window decision
- `getMinMaxBounds(registryEntry, dpi)` — DPI-aware min/max

**New: `src/lib/windowing/window-z-order-manager.ts`**
- `bringToFront(windowId)`, `sendToBack(windowId)`
- `getStack()` — ordered array
- `insertAbove(windowId, referenceId)`, `insertBelow(windowId, referenceId)`
- `getPinnedWindows()` — always-on-top list

**New: `src/lib/windowing/window-focus-history.ts`**
- `recordFocus(windowId)` — append to history
- `getPreviousFocus()` — for Alt-Tab style switching
- `getFocusHistory(limit)` — recent focus order
- `clearHistory()`

**New: `src/lib/windowing/window-modal-policy.ts`**
- `canOpenModal(parentId)` — checks nesting depth
- `getModalStack(parentId)` — chain of modals
- `resolveModalClosure(modalId)` — what happens when modal closes
- `isBlocked(windowId)` — true if a modal is open on top
- Max nesting depth: 3

**New: `src/lib/windowing/window-communication-policy.ts`**
- `canSendMessage(sourceId, targetId, channel)` — extends IPC policy with channel granularity
- `getAvailableChannels(windowId)` — list of permitted channels
- `isIsolated(windowId)` — true for sandboxed/restricted windows
- Channel types: `broadcast`, `direct`, `system`, `domain`

**New: `src/lib/windowing/window-performance-policy.ts`**
- `getDragFrameBudget()` — target 16ms (60fps)
- `shouldUseTransformDrag(windowId)` — always true (GPU compositing)
- `shouldThrottleContent(windowId, isFocused)` — throttle unfocused windows
- `getReducedMotionPolicy()` — respect prefers-reduced-motion
- `shouldDeferRendering(windowCount)` — true when >8 windows open

**New: `src/lib/windowing/window-layout-engine.ts`**
- `cascadePosition(existingWindows, newSize)` — compute cascade offset
- `tileWindows(windows, viewport)` — grid tiling
- `stackWindows(windows, viewport)` — overlap-free stacking
- `computeSafeStartPosition(size, viewport, existingWindows)` — avoid overlap

### PART 6 — Runtime Integration

**New: `src/lib/windowing/window-runtime-compatibility.ts`**
- Maps every window feature to runtime tier (Web, PWA, Desktop, Appliance)
- Features: drag, snap, multi-monitor, DPI scaling, native bridge, IPC, crash recovery, session persistence, performance monitoring
- `isFeatureAvailable(feature, tier)`, `getDegradedBehavior(feature, tier)`

### PART 7 — Generated Proof Artifacts

Create `generated/windowing-proof/` directory containing:

| Artifact | Contents |
|---|---|
| `window-contract-coverage.json` | Every registered window mapped to contract fields |
| `window-lifecycle-matrix.json` | All 15 states, valid transitions, handler existence |
| `window-session-closure.json` | Persistence field coverage per window |
| `window-recovery-closure.json` | Recovery capability coverage |
| `window-permission-audit.json` | Per-window permission scope resolution |
| `window-monitor-compatibility.json` | Multi-monitor and off-screen recovery status |
| `window-dpi-compatibility.json` | DPI scaling coverage per window |
| `window-communication-audit.json` | IPC permission matrix |
| `window-runtime-compatibility.json` | Feature-to-tier support matrix |

### PART 8 — Validators and Gates

Create `scripts/windowing/` with 7 validators:

| Script | Gate ID | Level | Checks |
|---|---|---|---|
| `check-window-contract-closure.ts` | `window-contract-closure` | BLOCK | Every window has canonical contract coverage |
| `check-window-lifecycle-coverage.ts` | `window-lifecycle-coverage` | BLOCK | Lifecycle states and transitions are explicit |
| `check-window-session-persistence.ts` | `window-session-persistence` | ADVISORY | Geometry/focus/z-order persisted where required |
| `check-window-permission-boundaries.ts` | `window-permission-boundaries` | ADVISORY | Permissions explicit for every window |
| `check-window-runtime-compatibility.ts` | `window-runtime-compatibility` | ADVISORY | Runtime tier compatibility declared |
| `check-window-shell-integration.ts` | `window-shell-integration` | ADVISORY | Shell entry points and registry wiring consistent |
| `check-window-recovery-closure.ts` | `window-recovery-closure` | ADVISORY | Recovery logic exists and proof generated |

Register `window-contract-closure` and `window-lifecycle-coverage` as BLOCK gates in `check-os-release-readiness.ts`.

### PART 9 — Shell / Route Integration

- Wire `window-lifecycle-manager` into `useWindowLauncher` in `ShellWindowLayer.tsx` — call `transitionWindow` on open/close/minimize/maximize
- Wire `window-session-store` periodic persistence into `ShellLayout.tsx` via `useEffect` interval (every 5s)
- Wire `markCleanShutdown()` on `beforeunload` event in `ShellLayout.tsx`
- Wire `probeRecoveryState()` on shell boot in `ShellLayout.tsx`

### PART 10 — Deployment Closure Checklist

- [ ] One canonical `WindowContract` type exists in `src/packages/window-contracts/`
- [ ] 15-state lifecycle machine with validated transitions
- [ ] 10 registered windows have full contract coverage
- [ ] Session persistence includes z-order, workspace, focus history, monitor, DPI
- [ ] Crash-safe restore with quarantine, modal repair, selective/degraded restore
- [ ] Permission boundary resolves app + runtime + shell + window policies
- [ ] Multi-monitor placement, off-screen recovery, detach handling
- [ ] DPI normalization and high-DPI rendering policy
- [ ] Z-order manager with pinned window support
- [ ] Focus history for Alt-Tab style switching
- [ ] Modal ownership with max nesting depth 3
- [ ] Communication policy with channel-granular IPC
- [ ] Performance policy with 60fps drag budget and reduced-motion
- [ ] Layout engine with cascade, tile, stack, safe-start
- [ ] Runtime compatibility matrix across 4 tiers
- [ ] 9 generated proof artifacts in `generated/windowing-proof/`
- [ ] 7 validators, 2 BLOCK gates wired into release aggregator
- [ ] Zero duplicates — both window contexts documented as serving distinct render pipelines
- [ ] TypeScript builds with 0 errors

