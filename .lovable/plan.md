

# Crash Resilience System & Transactional File System — Implementation Plan

## Current State

The codebase already has strong foundations:
- **AppIsolationManager** — sandbox crash counting with restart/suspend/terminate escalation
- **AppErrorBoundary** — per-app restart policy with max crash limits
- **InitSystem** — service watchdog timers, restart policies, dependency-ordered boot
- **SitaFilesystem** — CoW B-tree, journaling, snapshots, checksums
- **FileSystemService** — file versioning (10 versions), trash, quotas, watchers
- **Self-healing pipeline** — fleet health, incident bridge, auto-remediation

## Gaps (What's Missing)

| # | Spec Requirement | Status |
|---|---|---|
| 1 | Unified Crash Resilience Engine (process restart + state restore + watchdog + degradation) | Missing — pieces exist but no orchestrator |
| 2 | Heartbeat-based freeze detection (100ms UI, 500ms services, 2s background) | Watchdog exists but only logs "ok", no actual freeze detection |
| 3 | Structured crash reports (PID, stack, memory, syscall history) | Only basic crash log in AppIsolationManager |
| 4 | Graceful degradation (reduce animations → pause background → limit processes) | Not implemented |
| 5 | Transactional atomic writes (temp block → validate → swap) | SitaFS writes directly, journal marks committed immediately |
| 6 | Journal replay on boot (crash recovery) | Not implemented |
| 7 | Integrity scan (periodic consistency check) | Not implemented |
| 8 | Write batching & lazy flush | Not implemented |
| 9 | Integration with boot sequence | Not wired |

## Implementation Plan

### File 1: `src/lib/nova-sdk/kernel/crash-resilience.ts` (NEW)

The unified Crash Resilience Engine combining all Part 1 requirements:

- **CrashReport** interface: pid, appName, faultType, address, stackTrace, syscallHistory, memoryState, timestamp
- **ProcessRestartManager**: restart policies (immediate → delayed → critical-always), AppState snapshots (window layout, open files, memory), state restoration on relaunch
- **ServiceWatchdog**: heartbeat registry with per-component thresholds (UI: 100ms, services: 500ms, background: 2s), freeze detection (not just crash), auto-restart with client reconnection
- **GracefulDegradation**: resource pressure levels (normal → warning → critical → emergency), progressive actions: reduce animations → pause background → limit new processes, never hard-freeze
- **CrashLogger**: persistent structured crash reports, queryable by PID/app/time
- **CrashResilienceEngine**: orchestrator class that wires ProcessRestartManager + ServiceWatchdog + GracefulDegradation + CrashLogger, exposes `reportCrash()`, `heartbeat()`, `checkHealth()`, `getDegradationLevel()`

### File 2: `src/lib/core-services/kernel/sita-filesystem.ts` (MODIFY)

Enhance SitaFilesystem with full transactional guarantees:

- **Atomic writes**: `writeFile()` → write to temp blocks → validate checksum → commit (swap block pointers) → mark journal committed. On failure, temp blocks discarded — old data untouched
- **Journal replay**: `replayJournal()` method — scans uncommitted entries, replays or rolls back
- **Boot recovery**: `recoverFromCrash()` — load journal → detect incomplete ops → replay/rollback → validate FS, target < 1 second
- **Integrity scan**: `runIntegrityCheck()` — validate all block checksums, directory structure consistency, orphan block detection, metadata correctness
- **Write batching**: `WriteBatchQueue` — collect multiple writes, flush as single journal transaction
- **Lazy flush**: configurable flush delay with `scheduleFlush()` / `forceFlush()`
- **File versioning at kernel level**: delta-based version tracking per inode (max 10), restore capability

### File 3: `src/lib/nova-sdk/kernel/boot.ts` (MODIFY)

- Initialize `CrashResilienceEngine` during boot
- Run `SitaFilesystem.recoverFromCrash()` early in boot sequence
- Register all kernel services with the watchdog
- Start heartbeat monitoring
- Log crash recovery results to boot log

### File 4: `src/lib/nova-sdk/kernel/__tests__/crash-resilience.test.ts` (NEW)

Comprehensive test suite:
- Process crash → automatic restart → state restoration
- Service freeze detection via heartbeat timeout
- Graceful degradation under memory pressure
- Crash report generation with full context
- Max crash limit → termination
- Critical app always-restart policy

### File 5: `src/lib/nova-sdk/kernel/__tests__/transactional-fs.test.ts` (NEW)

- Atomic write: simulated crash mid-write → old data intact
- Journal replay: uncommitted entries → replayed correctly
- Integrity scan: corrupted block detected and flagged
- Write batching: multiple writes → single flush
- Version history: write 5 times → 5 versions stored
- Snapshot + restore: create snapshot → modify → restore → original data

## Technical Approach

All implementations are simulation-grade (TypeScript in-browser), consistent with the existing kernel subsystems. The transactional FS uses the existing `SitaFilesystem` CoW B-tree as its foundation, adding the missing atomicity layer on top. The crash resilience engine integrates with existing `AppIsolationManager` and `AppErrorBoundary` rather than replacing them.

