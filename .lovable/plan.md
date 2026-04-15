

# SITA OS — Part 2: Ecosystem-Grade Sync Extensions

## Current State
The Part 1 sync engine is complete across 30 files (~5,500 lines): core daemon, adapters, security, transport, SDK, state machine, notifications, and admin UI. The sync-object-model already includes `SyncObjectPermissions` (owner/readers/writers/ACLs) and tombstone handling. What's missing are the 32 Part 2 sections: sharing/collaboration, version history, search, presence, push wake, device enrollment, recovery, multi-account, governance, quotas, trust scoring, compliance, abuse prevention, activity journal, media handling, and more.

## Implementation Plan — 5 Batches (~20 new files, ~4,500 lines)

### Batch 1: Sharing + Version History + Activity Journal (~4 files, ~900 lines)
`src/lib/sync-engine/collaboration/`

1. **`sharing-engine.ts`** — Full sharing/collaboration layer: object/folder sharing, link sharing (expiring, password-protected), invite flows, ACL management (read/comment/edit/admin/owner), presence indicators, collaborative conflict modes, shared workspace handoff. Extends the existing `SyncObjectPermissions` model.

2. **`version-history.ts`** — Version history engine: per-object version timeline, restore to any version, compare versions, settings restore points, session restore points, rollback. Retention window management, tombstone lifecycle (configurable TTL), soft/hard delete propagation, undelete, legal deletion workflows.

3. **`activity-journal.ts`** — Global activity journal: recent sync actions across all devices, device activity log, major changes, restore points, share events, trust changes, recovery actions. Powers "what changed, on which device, when, can I undo it?" UX.

4. **`content-classifier.ts`** — Data classification engine: public metadata, private standard, sensitive encrypted, device-local only, non-syncable, regulated/compliance-sensitive. Maps classes to encryption requirements and sync policy. Includes rich file semantics (MIME classification, preview/thumbnail metadata, duplicate detection).

### Batch 2: Search + Presence + Push/Wake + Enrollment (~4 files, ~900 lines)
`src/lib/sync-engine/ecosystem/`

5. **`sync-search.ts`** — Sync search/index layer: metadata index, local content index, remote object search, settings/app-state discoverability, full-text search for supported documents, cross-device recent activity search, E2EE-aware search boundaries.

6. **`presence-engine.ts`** — Live ecosystem presence: active device presence, "recently active on phone/tablet/desktop", current device capabilities, continuity handoff candidates, recent app/device activity graph, "Continue Notes from Phone" style suggestions.

7. **`push-wake.ts`** — Push notification and wake strategy: APNs/FCM integration hooks, wake-for-sync, silent push throttling, fallback polling windows, power-aware wake limits, mobile background sync reliability.

8. **`device-enrollment.ts`** — Device bootstrap/enrollment flow: registration, account sign-in, device naming, trust confirmation, key sync/bootstrap, selective sync setup, restore-from-cloud, first-sync prioritization, intelligent hydration. Also handles account recovery, lost device revocation, E2EE recovery keys, trusted device recovery approval.

### Batch 3: Governance + Quotas + Trust + Compliance (~4 files, ~900 lines)
`src/lib/sync-engine/governance/`

9. **`sync-quotas.ts`** — Quotas/billing/storage management: per-user quotas, per-namespace quotas, large file handling, cache size management, pinned/offline budgets, quota warnings, cleanup recommendations, percentage display.

10. **`app-governance.ts`** — App-level sync governance: per-app sync quotas, namespace limits, sync policy declarations, background sync budget, app allowlists/blocklists, E2EE class declarations, merge strategy mandates.

11. **`trust-scoring.ts`** — Device trust scoring: 7 trust states (trusted, limited, pending, revoked, high-risk, managed, guest). Trust score influences namespace access, E2EE key release, session restore, nearby sync, destructive actions. Extends existing `DeviceTrustLevel`.

12. **`compliance-engine.ts`** — Compliance/legal/regional hooks: data export (full account), account deletion workflow, regional storage policy, child account restrictions, consent records, audit trails, privacy controls. Also multi-account/profile support (personal, work, guest, child with namespace isolation).

### Batch 4: Optimization + Jobs + Health + Abuse Prevention (~4 files, ~900 lines)
`src/lib/sync-engine/operations/`

13. **`transfer-optimizer.ts`** — Compression, dedup, transfer optimization: gzip/brotli/lz4 compression, content-defined chunking, resumable uploads, dedup across versions, transfer class prioritization, prefetch policy. Enhances existing upload-scheduler.

14. **`job-engine.ts`** — Background job engine: job queue framework, retry backoff (exponential), dead-letter handling, network/battery-aware retry, stuck job detection, cancellation, dependency ordering. Handles uploads, downloads, hydration, conflict processing, reindexing, key rotation, re-auth.

15. **`sync-health.ts`** — Full sync health model: 9 health states (healthy, delayed, paused, offline, conflict-heavy, attention-needed, degraded-security, re-auth-required, quota-blocked). User-facing diagnostics, last successful sync, items pending, device connection status, current blocker, repair actions. Extends existing state machine.

16. **`abuse-prevention.ts`** — Abuse prevention: rate limits, upload throttling, suspicious device detection, bot detection, token misuse detection, anomaly detection, large deletion guardrails, ransomware-like mass-change detection (pause propagation, create checkpoint, notify, require confirmation).

### Batch 5: Admin UI + User UX Extensions (~4 files, ~900 lines)

17. **`src/pages/admin/cloud/CloudSharingAdmin.tsx`** — Sharing & collaboration admin: active shares, link management, ACL overview, presence monitoring, shared workspace activity.

18. **`src/pages/admin/cloud/CloudGovernanceAdmin.tsx`** — Governance admin: quotas overview, per-app sync budgets, trust scoring dashboard, compliance status, abuse alerts, API versioning status, selective sync policy matrix.

19. **`src/components/sita/SyncActivityJournal.tsx`** — User-facing activity journal: timeline of sync events, device activity, share events, restore points, "what changed" answers. Embedded in UserCloudSettings.

20. **Enhanced `UserCloudSettings.tsx`** — Add: sharing management, version history browser, search across synced content, device enrollment status, quota usage with cleanup, trust state visibility, multi-account switcher, data export/import, activity journal embed, repair/resync tools panel.

### Wiring
- Update `src/lib/sync-engine/index.ts` barrel export with all new modules
- Add 2 new admin tabs ("Sharing" and "Governance") to `CloudAdminLayout`
- Wire activity journal and enhanced controls into UserCloudSettings
- Connect trust scoring into existing device-identity and sync-policy modules
- Connect job engine into syncd for background processing
- Connect abuse prevention into realtime-client and upload-scheduler

## File Summary

| Batch | Files | ~Lines | Coverage |
|-------|-------|--------|----------|
| 1 | 4 | ~900 | Sharing, version history, activity journal, content classification |
| 2 | 4 | ~900 | Search, presence, push/wake, device enrollment/recovery |
| 3 | 4 | ~900 | Quotas, app governance, trust scoring, compliance/multi-account |
| 4 | 4 | ~900 | Transfer optimization, job engine, health model, abuse prevention |
| 5 | 4 | ~900 | Sharing admin, governance admin, activity journal UX, enhanced settings |
| **Total** | **~20** | **~4,500** | All 32 Part 2 sections |

## Part 2 Section Coverage Map

| # | Section | File |
|---|---------|------|
| 1 | Sharing & Collaboration | `sharing-engine.ts` |
| 2 | Data Retention / Tombstone Policy | `version-history.ts` |
| 3 | Version History & Restore | `version-history.ts` |
| 4 | Sync Search & Index | `sync-search.ts` |
| 5 | Presence, Activity, Continuity | `presence-engine.ts` |
| 6 | Push Notification & Wake | `push-wake.ts` |
| 7 | Device Bootstrap / Enrollment | `device-enrollment.ts` |
| 8 | Account & Trust Recovery | `device-enrollment.ts` |
| 9 | Multi-Account / Profile Support | `compliance-engine.ts` |
| 10 | App-Level Sync Governance | `app-governance.ts` |
| 11 | Quotas, Billing, Storage | `sync-quotas.ts` |
| 12 | Selective Sync Policy Matrix | `app-governance.ts` + existing `sync-policy.ts` |
| 13 | Content Classification | `content-classifier.ts` |
| 14 | Compliance / Legal / Regional | `compliance-engine.ts` |
| 15 | Device Trust Scoring | `trust-scoring.ts` |
| 16 | Sync Policy by Network/Security | Enhanced existing `sync-policy.ts` |
| 17 | Compression, Dedup, Optimization | `transfer-optimizer.ts` |
| 18 | Background Job Engine | `job-engine.ts` |
| 19 | Full Sync Health Model | `sync-health.ts` |
| 20 | Repair & Resync Tools | `sync-health.ts` |
| 21 | Admin / Enterprise Control | `CloudGovernanceAdmin.tsx` |
| 22 | Web Client Capability Model | `compliance-engine.ts` (client caps) |
| 23 | API Versioning & Evolution | Existing `abi-versioning.ts` + `app-governance.ts` |
| 24 | Sync Telemetry & Observability | `sync-health.ts` |
| 25 | Abuse Prevention | `abuse-prevention.ts` |
| 26 | Global Activity Journal | `activity-journal.ts` |
| 27 | Rich File Semantics | `content-classifier.ts` |
| 28 | Media Handling / Photo Strategy | `content-classifier.ts` + `transfer-optimizer.ts` |
| 29 | Shared Settings / Ecosystem Defaults | `app-governance.ts` |
| 30 | Migration, Import, Exit | `compliance-engine.ts` |
| 31 | "Wow" Layer | `presence-engine.ts` + `push-wake.ts` + `trust-scoring.ts` |
| 32 | Summary | All of the above |

## Technical Notes
- All new modules follow existing singleton pattern with EventBus/IPC integration
- No external dependencies added
- Admin pages use the established glassmorphic dark design system
- Trust scoring extends existing `DeviceTrustLevel` with scoring algorithm
- Job engine replaces ad-hoc retry logic in syncd with unified framework
- Abuse prevention wires into realtime-client and upload-scheduler as middleware
- Zero duplication with Part 1 code — new modules extend, not rewrite

