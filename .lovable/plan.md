

# Plan: Update System, Cloud Sync, Intent Engine & Dev Tools — Fully Wired

## Current State Assessment

| Feature | Status | What Exists |
|---------|--------|------------|
| **System Updates** | Partial | `SystemUpdateService` (check/register/log), `UpdateBanner`, `AppUpdatesPage`, OTA agent shell script — but NO rollback support, NO update-center OS window, NO version snapshot/restore |
| **Cloud Sync** | Partial | `CloudSyncManager` with version vectors + conflict resolution — but NOT wired to Settings/FS, NO sync status UI in settings, NO session cloud backup |
| **Intent Engine** | Partial | `PredictiveIntentEngine` (time patterns, confidence scoring) + `RoutineDetector` — but NO suggestions surfaced in shell, NO ambient suggestion widget wired to it |
| **Dev Tools** | Minimal | `SystemMonitorWindow` (processes, CPU, memory, network, GPU, services) — but NO log viewer, NO crash handler UI, NO memory inspector, NO dedicated dev tools window |

---

## Implementation (4 work items)

### 1. System Update Center Window + Rollback Support

**New file:** `src/components/sita/shell/windows/UpdateCenterWindow.tsx`

A native OS window with 3 tabs:

- **System Updates** — Current version display, channel selector (stable/beta/canary), check-for-updates button, release notes, download+install flow with progress bar, auto-update toggle. Reads from `SystemUpdateService`.
- **App Updates** — List of updatable apps from `useAppPlatform()`, individual + batch update buttons (reuses existing `updateApp`), version badges.
- **Rollback** — Update history log from `SystemUpdateService.getUpdateHistory()`, each entry shows from→to version, status badge, timestamp. Add a `rollbackUpdate(logId)` method to `SystemUpdateService` that records a rollback entry and emits a toast. Snapshot list showing restorable points.

**Changes to `SystemUpdateService`:**
- Add `rollbackUpdate(logId: string)` — logs a rollback entry with `status: "rolled-back"`
- Add `getSystemInfo()` — returns OS version, build number, channel, device count

**Integration:** Register in ShellLayout + DesktopDock as `update-center` / `com.sita.update-center`

### 2. Cloud Sync Wired to Settings + Session Backup

**New file:** `src/components/sita/shell/windows/CloudSyncWindow.tsx`

A native OS window with 3 sections:

- **Sync Status** — Connection indicator (green/amber/red), last sync timestamp, pending patches count, sync lag, node ID. Real-time from `CloudSyncManager.getStatus()`.
- **Sync Targets** — Cards for Files, Settings, Sessions with individual enable/disable toggles. When enabled, wires into `SettingsService` change events and `persistSession` to push to CloudSyncManager outbound queue.
- **Conflict Resolution** — List of unresolved conflicts from `CloudSyncManager`, with local-wins / remote-wins / merge buttons.

**Wire CloudSyncManager:**
- Add `syncSettings()` method that serializes current SettingsService state as a `SyncPatch` (type: "preference")
- Add `syncSession()` method that serializes current session-persistence state as a `SyncPatch` (type: "manifest")
- Add `restoreFromCloud()` that applies the latest remote patches for settings + session
- Start CloudSyncManager in `PlatformInit.tsx` after auth

**Add to Settings window:** New "Cloud & Sync" section in SettingsWindow with sync toggle, last sync time, and "Sync Now" button.

**Integration:** Register in ShellLayout + DesktopDock as `cloud-sync`

### 3. Intent Engine Wired to Shell with Ambient Suggestions

**New file:** `src/components/sita/shell/IntentSuggestionsWidget.tsx`

A floating ambient widget (bottom-right, above dock) that:
- Polls `predictiveIntentEngine.predictNext(userId)` every 5 minutes
- Shows top 3 predicted actions as pill cards with confidence bar, action label, domain badge
- Click → executes the action (navigate to route or open app window)
- Dismiss → calls `dismissPrediction(id)` and logs dismissal for future learning
- Appears with spring animation, auto-hides after 30s of no interaction

**Wire into ShellLayout:**
- Import and render `IntentSuggestionsWidget` in the desktop layer
- Wire `predictiveIntentEngine.learnFromAction()` into `doLaunchApp` — every app launch teaches the engine
- Wire into sidebar navigation clicks — each route visit teaches the engine
- Wire `routineDetector.recordLaunch()` into `doLaunchApp` for co-launch detection

**Enhance PredictiveIntentEngine:**
- Add `getTopSuggestions(userId, limit)` convenience method
- Add action→route mapping: `check_calendar → /calendar`, `check_finances → /money`, etc.
- Add `recordDismissal(action)` to reduce future confidence for dismissed actions

### 4. Developer Tools Window

**New file:** `src/components/sita/shell/windows/DevToolsWindow.tsx`

A native OS window with 5 tabs:

- **Console / Logs** — Real-time log viewer. Captures `console.log/warn/error` via monkey-patching (only when DevTools window is open). Filter by level (info/warn/error), search, auto-scroll. Shows timestamp + source + message. Color-coded severity.
- **Process Viewer** — Live process table from `ProcessTable.listAll()` showing PID, name, state, priority, CPU context (RIP/RSP), memory pages. Kill button per process. Refresh on interval.
- **Memory Inspector** — Page table visualization from `MemoryManager`. Shows allocated vs free pages, per-process breakdown, address space map. Highlight guard pages. Shows total/used/free stats.
- **Crash Reports** — Error boundary catch log + `AppErrorBoundary` crash counts from managed runtime. Shows app ID, crash count, last crash timestamp, stack trace preview. Clear button.
- **Performance** — JS heap size from `performance.memory` (Chrome), DOM node count, layout/recalc counts from `PerformanceObserver`. Simple sparkline charts.

**New service:** `src/lib/nova-sdk/services/console-capture.ts`
- `startCapture()` — monkey-patches console.log/warn/error, stores entries in ring buffer (max 1000)
- `stopCapture()` — restores original console methods
- `getEntries(filter?)` — returns captured entries
- `clear()` — empties buffer
- `on("entry", cb)` — event emitter for real-time streaming to UI

**Integration:** Register in ShellLayout + DesktopDock as `dev-tools` / `com.sita.dev-tools`

---

## Files Created/Changed

| File | Action |
|------|--------|
| `src/components/sita/shell/windows/UpdateCenterWindow.tsx` | New — System/App updates + Rollback |
| `src/components/sita/shell/windows/CloudSyncWindow.tsx` | New — Sync status/targets/conflicts |
| `src/components/sita/shell/IntentSuggestionsWidget.tsx` | New — Ambient intent predictions |
| `src/components/sita/shell/windows/DevToolsWindow.tsx` | New — Logs/Process/Memory/Crash/Perf |
| `src/lib/nova-sdk/services/console-capture.ts` | New — Console monkey-patch capture |
| `src/lib/services/system-updates/index.ts` | Add rollback + getSystemInfo |
| `src/lib/core-services/cloud-sync-manager.ts` | Add syncSettings/syncSession/restoreFromCloud |
| `src/lib/services/predictive-intent/index.ts` | Add getTopSuggestions, route mapping, recordDismissal |
| `src/components/sita/shell/windows/SettingsWindow.tsx` | Add "Cloud & Sync" section |
| `src/components/sita/sita/PlatformInit.tsx` | Start CloudSyncManager |
| `src/components/sita/ShellLayout.tsx` | Register 3 new windows + IntentWidget + wire learnFromAction |
| `src/components/sita/DesktopDock.tsx` | Add 3 new apps to OS_WINDOW_APPS |

