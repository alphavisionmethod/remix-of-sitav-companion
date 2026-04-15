

# SITA OS — Distributed Sync Ecosystem Implementation Plan

## What Already Exists
- **Cloud Backbone services** (5 files): storage, sync, device, quota, audit — all singleton mock services
- **Cloud Admin Console** (12 tabs): Dashboard, Users, Devices, Storage, Sync Ops, Audit, Jobs, Recovery, Monitoring, Activity, Collaboration, Policy
- **CloudSyncManager**: Version vectors, conflict resolution, patch queuing (simulated)
- **offline-db.ts**: IndexedDB persistence with cache, action queue, sync manager
- **useOfflineStore hook**: Cache-first data access with offline queue
- **OS daemons**: authd, sessiond, secretsd, policyd, notifyd, wifid, controlcenterd, settingsd
- **PlatformInit**: Wires electron bridge, offline store, realtime bridge
- **UserCloudSettings page**: Basic storage/device/sync settings for end users

## What's Missing (the prompt's 34 sections)
No `syncd` daemon exists. No sync object model, namespace model, delta engine, encryption classes, device identity binding, session/continuity sync, settings sync adapters, file watcher, app SDK sync API, nearby/peer sync, predictive sync, or sync UX state machine. The existing services are admin dashboards with demo data — not a real sync engine.

## Implementation Plan — 6 Batches (~30 files, ~5,500 lines)

### Batch 1: Sync Object Model + Sync Daemon Core (~5 files, ~1,100 lines)
`src/lib/sync-engine/`

1. **`sync-object-model.ts`** — Full versioned sync object schema with all required classes (file, folder, setting, app_setting, app_state, session, window_layout, notification_state, device_preference, sync_policy_override, presence_state, clipboard_item, shared_item). Includes tombstone handling, encryption classes (standard, encrypted-at-rest, e2ee, device-bound, non-syncable), content hashing, and blob references.

2. **`sync-namespaces.ts`** — Namespace registry (files.documents, files.photos, settings.ui.theme, settings.network, app.*, session.*, device.*, system.*). Supports selective sync, policy control, encryption class per namespace, conflict strategy selection, and app-specific access control.

3. **`syncd.ts`** — The core sync daemon. Implements: start/stop lifecycle, push/pull queues, inbound/outbound processing, version vector management, checkpoint tracking, offline queue integration, websocket connection state, sync scheduling (realtime/background/low-power/metered/recovery modes), battery/network-aware throttling, namespace priority, and backpressure handling. Wires to existing EventBus and IPC bus.

4. **`conflict-resolver.ts`** — Full conflict resolution engine with 5 strategies: last-write-wins, merge-by-key (JSON merge patch), text merge (line-based diff), manual conflict (binary/divergent), app-defined merge. Tracks base version, both edits, strategy attempted, resolution outcome, and user-visible explanation.

5. **`delta-engine.ts`** — Delta sync engine: text patches (line diff), JSON patch/merge patch, block-level chunk diffs for large files, metadata-only changes. Checksum validation, version base reference, fallback to full upload on patch failure.

### Batch 2: Sync Adapters + Local Cache DB (~5 files, ~900 lines)
`src/lib/sync-engine/adapters/`

6. **`file-watch-adapter.ts`** — File watcher integration: watches selected sync roots, detects create/update/delete/rename/move, debounces event storms, maps paths to object IDs, computes content hashes, decides full vs delta upload, supports sparse/on-demand files. Integrates with SitaFS.

7. **`settings-sync-adapter.ts`** — Settings sync: per-setting syncability flags, policy lock, merge strategy per setting, local override rules, export/import fallback. Integrates with settingsd. Covers theme, wallpaper refs, language, shortcuts, Calm schedule, notification prefs, accessibility, app prefs.

8. **`session-sync-adapter.ts`** — Session/continuity sync: open apps, window layouts, tab groups, workspace restore metadata, handoff candidates, recent docs, resume tokens. The "wow feature" — continue work across devices.

9. **`app-state-adapter.ts`** — App state sync bridge: recent files, in-app view state, editor cursor/history, app-specific lightweight sync via SDK manifest declarations.

10. **`sync-cache-db.ts`** — Enhanced local sync database (extends existing IndexedDB): local_objects, pending_changes, sync_checkpoints, download_jobs, upload_jobs, conflicts, hydration_state, device_sync_prefs. WAL-safe semantics, crash-safe queue, migration support.

### Batch 3: Encryption + Device Identity + Auth Integration (~4 files, ~800 lines)
`src/lib/sync-engine/security/`

11. **`sync-encryption.ts`** — Multi-class encryption engine: server-visible standard, encrypted-at-rest, E2EE sync, device-bound encrypted, non-syncable. Key derivation hierarchy, portable user-controlled keys, integration with secretsd. Never syncs raw TPM-bound material.

12. **`device-identity.ts`** — Device identity binding: registration flow, device-specific credentials/tokens, trust levels (trusted/semi-trusted/revoked/pending), capabilities JSON, per-device sync authorization, revocation support, integration with authd.

13. **`sync-auth.ts`** — Auth integration: OAuth2/OIDC style flows, JWT access tokens, refresh token rotation, device binding, session revocation hooks, token storage via secretsd.

14. **`sync-policy.ts`** — Policy integration: disable sync on managed devices, namespace-level allow/deny, block sync on untrusted networks (integrates wifid/shieldd), disable session sync for guests, force E2EE for sensitive namespaces, restrict web client data classes.

### Batch 4: Realtime Layer + Upload/Download Scheduler (~4 files, ~700 lines)
`src/lib/sync-engine/transport/`

15. **`realtime-client.ts`** — WebSocket sync client: auth with token, subscribe to device/user channels, receive object change events, fetch missing payloads, reconnect with checkpoint replay, heartbeat/keepalive, push notification wake signals.

16. **`upload-scheduler.ts`** — Upload/download scheduler: large file chunking, resumable uploads, checksum verification, signed URL flow, priority queue (high: session handoff; medium: documents; low: media), bandwidth awareness, retry with exponential backoff.

17. **`nearby-sync.ts`** — Peer-to-peer sync: local discovery, mutual authentication, encrypted transfer, fallback to cloud, bandwidth awareness, trust gating. For fast device bootstrap, large local transfers, handoff without cloud round-trip.

18. **`predictive-sync.ts`** — Recommendation engine: preload recently used docs across active devices, pin likely-needed files, suggest VPN on public Wi-Fi, pre-restore last workspace on device switch. Local-first, explainable, disableable, privacy-preserving.

### Batch 5: App SDK + UX State Machine + Notifications (~4 files, ~800 lines)

19. **`src/lib/sync-engine/app-sdk.ts`** — App developer sync SDK: object registration, namespace declaration, conflict strategy declaration, custom merge handlers, local cache helper, secure sync class declaration, offline queue integration, change notifications, sync status hooks. Apps declare sync in manifest.

20. **`src/lib/sync-engine/sync-state-machine.ts`** — UX state machine with all required states: syncing, up-to-date, offline, paused, waiting-for-wifi, waiting-for-charge, conflict, attention-needed, secure-sync-active, downloading, uploading, pending, error. Transitions, observers, and UI binding hooks.

21. **`src/lib/sync-engine/sync-notifications.ts`** — Notification integration with notifyd: sync status changes, conflict alerts, device activity, paused/offline state, restore progress, "resume on another device" suggestions, public Wi-Fi warnings, storage full alerts.

22. **`src/lib/sync-engine/index.ts`** — Barrel export wiring all modules together.

### Batch 6: Admin UI Enhancements + User Sync UX (~8 files, ~1,200 lines)

23. **`src/pages/admin/cloud/CloudSyncObjectsAdmin.tsx`** — Admin view of sync objects: browse by namespace, view version history, inspect object metadata, view conflict resolution history, tombstone management.

24. **`src/pages/admin/cloud/CloudDeviceIdentityAdmin.tsx`** — Enhanced device admin: trust state management with audit trail, device capabilities inspection, per-device sync policy overrides, force re-auth, device timeline, sync authorization matrix.

25. **`src/pages/admin/cloud/CloudEncryptionAdmin.tsx`** — Encryption oversight: E2EE status per namespace, key rotation status, encryption class distribution, device encryption capability audit, recovery key management visibility.

26. **`src/pages/admin/cloud/CloudNamespacesAdmin.tsx`** — Namespace management: per-namespace sync policy, conflict strategy selection, encryption class assignment, selective sync defaults, app namespace registration.

27. **Enhanced `UserCloudSettings.tsx`** — Add: selective sync folder picker, on-demand file hydration controls, session/continuity sync toggle, device presence display, sync state machine indicator, conflict resolution UI, nearby sync discovery, offline pinned files, version history browser, encryption/privacy state per namespace.

28. **`src/components/sita/SyncStatusIndicator.tsx`** — System tray/control center sync widget: real-time sync state, progress bars, conflict count, device count, network quality indicator, click-to-expand detail view.

29. **`src/components/sita/ConflictResolutionDialog.tsx`** — User-facing conflict resolution: side-by-side diff view, keep local/keep remote/merge options, version timeline, "why did this conflict?" explanation.

30. **Wire into `CloudAdminLayout`** — Add 4 new tabs (Sync Objects, Device Identity, Encryption, Namespaces) to the existing 12-tab layout. Wire syncd into PlatformInit. Connect sync state machine to control center.

### PlatformInit Wiring
- Mount `syncd` in `PlatformInit.tsx` alongside existing hooks
- Connect to authd for identity, secretsd for tokens, policyd for rules, wifid for network state
- Start/stop based on auth state (like existing useRealtimeBridge pattern)

## File Summary

| Batch | Files | ~Lines | Coverage |
|-------|-------|--------|----------|
| 1 | 5 | ~1,100 | Sync object model, namespaces, syncd daemon, conflicts, deltas |
| 2 | 5 | ~900 | File/settings/session/app adapters, local cache DB |
| 3 | 4 | ~800 | Encryption, device identity, auth, policy integration |
| 4 | 4 | ~700 | Realtime WS, upload scheduler, nearby sync, predictive sync |
| 5 | 4 | ~800 | App SDK, state machine, notifications, barrel export |
| 6 | 8 | ~1,200 | 4 new admin tabs, enhanced user settings, sync widgets, conflict UI |
| **Total** | **~30 files** | **~5,500** | All 34 sections of the prompt |

## Technical Notes
- All new services follow existing daemon singleton pattern
- All integrate with existing EventBus + IPC bus for cross-system communication
- syncd is the single sync choke point — no app bypasses it (per architecture rules)
- Encryption classes respect secretsd key hierarchy — no raw secret sync
- Admin pages use existing glassmorphic dark design
- State machine drives all UX — no ambiguous sync states
- Zero external dependencies added

