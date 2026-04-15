

# SITA OS — Part 2: Deep Platform Operations, Tenant Separation, and Governance

## Current State
The platform has 120+ DB tables, 60+ edge functions, 20 cloud admin pages, 5 backbone services, and 3 user-facing cloud components. Part 1 (storage, sync, devices, quotas, version history, conflicts, admin console) is complete. Part 2 adds the deeper operational and governance layers.

## What This Plan Adds (30 sections condensed into 6 implementation batches)

---

### Batch 1: Database Migration — Tenant, Lifecycle, Workers, Admin RBAC, Abuse (1 large migration)

New tables:

| Table | Covers Prompt Sections |
|-------|----------------------|
| `cloud_tenants` | #1 — Tenant/org accounts with type, region, residency |
| `cloud_tenant_memberships` | #1 — User membership in tenants with roles |
| `cloud_tenant_plans` | #1 — Org-level plan assignment |
| `cloud_tenant_quotas` | #1 — Org storage pools |
| `cloud_tenant_policies` | #1 — Org-wide policy rules |
| `cloud_shared_workspaces` | #1, #16 — Team-shared spaces |
| `cloud_storage_providers` | #2 — Backend abstraction registry (S3/R2/GCS/Azure/MinIO) |
| `cloud_storage_tiers` | #3 — Hot/warm/cold/archive tier definitions |
| `cloud_lifecycle_rules` | #3, #27 — Retention and migration policies |
| `cloud_archive_jobs` | #3 — Archive/restore workflow tracking |
| `cloud_preview_jobs` | #4 — Thumbnail/media processing queue |
| `cloud_search_index` | #5 — Metadata search index entries |
| `cloud_activity_journal` | #6 — First-class activity/timeline events |
| `cloud_worker_jobs` | #7 — Unified worker queue with dead-letter |
| `cloud_admin_roles` | #8 — Internal admin RBAC (super/support/storage/security/billing/auditor/tenant) |
| `cloud_admin_role_assignments` | #8 — User-to-admin-role mapping |
| `cloud_support_sessions` | #9 — Support troubleshooting sessions with audit |
| `cloud_abuse_events` | #10 — Mass-change, ransomware, API abuse detection |
| `cloud_reconciliation_runs` | #11 — Integrity job results |
| `cloud_import_export_jobs` | #12 — Import/export/migration pipeline tracking |
| `cloud_backup_snapshots` | #13 — DR backup metadata |
| `cloud_account_closure_requests` | #15 — Formal account deletion workflow |
| `cloud_namespace_registry` | #21 — Sync namespace governance |
| `cloud_maintenance_modes` | #22 — Platform-wide operational controls |
| `cloud_compliance_hooks` | #28 — Legal hold, consent, deletion attestations |

All tables get RLS (user owns own data, admins via `has_role`), indexes, and `updated_at` triggers.

---

### Batch 2: Edge Functions (3 new functions)

1. **`cloud-worker-api`** — Unified worker orchestration:
   - `POST /enqueue` — Submit background jobs (preview gen, reconciliation, archive migration, cleanup)
   - `POST /process` — Dequeue and execute next job
   - `GET /status` — Worker queue health
   - `POST /dead-letter/retry` — Retry dead-letter jobs

2. **`cloud-tenant-api`** — Tenant/org management:
   - `POST /create` — Create tenant
   - `POST /invite` — Add member
   - `POST /policy` — Set tenant policies
   - `GET /usage` — Tenant-wide storage usage
   - `POST /workspace` — Create shared workspace

3. **`cloud-lifecycle-api`** — Lifecycle, compliance, account closure:
   - `POST /archive` — Tier migration request
   - `POST /restore-archive` — Restore from cold storage
   - `POST /account-closure` — Initiate account deletion workflow
   - `POST /export` — Generate user data export
   - `POST /compliance/hold` — Legal hold toggle
   - `GET /reconciliation` — Run/view integrity checks

---

### Batch 3: New Backbone Services (5 new service files)

| Service | Sections Covered |
|---------|-----------------|
| `cloud-tenant-service.ts` | #1 — Tenant CRUD, membership, quotas, policies |
| `cloud-worker-service.ts` | #7 — Worker queue management, dead-letter, stats |
| `cloud-lifecycle-service.ts` | #3, #15, #27 — Tiering, retention, account closure |
| `cloud-abuse-service.ts` | #10 — Abuse detection, mass-change patterns, quarantine |
| `cloud-support-service.ts` | #9 — Support sessions, diagnostic bundles, safe views |

Update `index.ts` barrel to export all new services.

---

### Batch 4: Admin UI — 8 New Admin Pages

| Page | Sections Covered |
|------|-----------------|
| `CloudTenantAdmin.tsx` | #1 — Tenant/org management, memberships, policies |
| `CloudStorageHealthAdmin.tsx` | #2, #25A — Backend status, provider registry, latency |
| `CloudWorkerOpsAdmin.tsx` | #7, #25B — Queue depth, failed jobs, dead-letter, throughput |
| `CloudCostCapacityAdmin.tsx` | #20, #25C — Cost attribution, growth trends, per-plan load |
| `CloudSupportConsole.tsx` | #9, #25D — User/device search, sync trace, repair workflows |
| `CloudIntegrityAdmin.tsx` | #11, #25E — Reconciliation runs, quota drift, repair status |
| `CloudLifecycleAdmin.tsx` | #3, #27 — Tiering rules, retention policies, archive jobs |
| `CloudComplianceAdmin.tsx` | #14, #28 — Residency, legal hold, compliance hooks, audit retention |

All pages follow existing glassmorphic dark-first SITA OS design with metric cards, data tables, action buttons, and status badges.

---

### Batch 5: User-Facing Enhancements — 4 New Components + Settings Expansion

| Component | Sections Covered |
|-----------|-----------------|
| `CloudActivityTimeline.tsx` | #6, #26 — Rich activity journal with event types and device origins |
| `CloudDeviceSafety.tsx` | #19 — Device revoke, session revoke, emergency sync pause, suspicious alerts |
| `CloudImportExport.tsx` | #12, #26 — Import from other clouds, export my data, migration status |
| `CloudNamespaceToggles.tsx` | #21, #26 — Sync namespace governance with encryption class and retention |

Update `UserCloudSettings.tsx` to add new tabs: Activity, Safety, Import/Export.

---

### Batch 6: Wiring, Feature Flags, Observability, First-Device Bootstrap

1. **Feature flag expansion** — Add flag entries for: delta-sync, e2ee-classes, previews, archive-tiering, sharing, app-cloud-apis, nearby-sync, new-conflict-engines. Support percentage rollout and tenant-specific targeting. (#23)

2. **Notification types** — Add cloud notification templates to existing `notifications` table for: upload-complete, sync-paused, quota-near-full, device-revoked, conflict-detected, suspicious-activity, restore-complete, share-invite. (#18)

3. **First-device bootstrap** — Add `cloud_bootstrap_markers` table and logic in `cloud-device-api` for root folder init, default quota, first-device trust, initial namespace setup. (#29)

4. **Maintenance mode controls** — Wire `cloud_maintenance_modes` to admin UI with pause uploads, read-only mode, rebuild indexes, throttle preview gen. (#22)

5. **Observability metrics** — Add `cloud_metrics_snapshots` table for upload success rate, finalize latency, websocket clients, conflict rate, orphan count, preview queue depth. (#24)

6. **Product polish** — Sync blocker plain-language reasons, one-click safe repairs, trust badges, "last synced" confidence cues, over-quota guidance. (#30)

---

## File Summary

| Batch | Type | Count | Description |
|-------|------|-------|-------------|
| 1 | Migration | 1 | ~25 new tables + RLS + indexes + triggers |
| 2 | Edge Functions | 3 | Worker, Tenant, Lifecycle APIs |
| 3 | Backbone Services | 5 | Tenant, Worker, Lifecycle, Abuse, Support |
| 4 | Admin Pages | 8 | Deep operational admin surfaces |
| 5 | User Components | 4 + update | Activity, Safety, Import/Export, Namespaces |
| 6 | Wiring | ~6 updates | Feature flags, notifications, bootstrap, observability |

**Total: ~1 migration, 3 edge functions, 5 services, 12 UI components, ~6 wiring updates**

## Technical Notes
- All new tables use `user_id` scoped RLS with `has_role` for admin access
- Tenant isolation validated via `cloud_tenant_memberships` + security definer function
- Worker jobs use exponential backoff and dead-letter after max attempts
- Abuse detection uses pattern matching on audit events (mass-delete spikes, rapid rewrites)
- Support sessions are fully audited with redacted field lists per viewer role
- Feature flags support: internal, beta, tenant-specific, percentage rollout, device-class targeting
- No new npm dependencies required
- All UI follows existing glassmorphic SITA OS design system

