

# SITA OS — Multi-User Cloud Storage Platform: Database + Backend Integration

## Current State
The frontend and service architecture is fully built (38 sync engine files, 5 cloud backbone services, 20 admin pages, user settings). However, the **database only has 8 tables** (devices, storage_usage, sync_jobs, plans, user_plans, audit_events, feature_flags, policies). The master prompt requires ~11 additional tables for files, blobs, folders, versions, trash, sync objects, conflicts, shares, and device sessions. All cloud backbone services currently return **demo/mock data** — none read from the real database.

## What This Plan Adds

### Batch 1: Database Migration (~11 new tables)
Create a single migration adding all missing cloud storage tables:

| Table | Purpose |
|-------|---------|
| `cloud_folders` | Folder hierarchy per user (parent_id, path_cache) |
| `cloud_files` | File metadata (folder_id, blob_id, size, mime, checksum, version) |
| `cloud_blobs` | Object storage references (storage_key, size, checksum, compression, encryption_class) |
| `cloud_file_versions` | Version history per file (version, blob_id, origin_device_id, restore_point) |
| `cloud_trash` | Soft-deleted items with purge_after lifecycle |
| `cloud_sync_objects` | Versioned sync entities (namespace, type, metadata, content_hash) |
| `cloud_sync_changes` | Change log for push/pull (change_type, from/to version, origin device) |
| `cloud_sync_checkpoints` | Per-device checkpoint for efficient delta sync |
| `cloud_conflicts` | Conflict records (base_version, device_a/b, strategy, resolution) |
| `cloud_shares` | Sharing/ACL records (owner, target, permission, expiry) |
| `cloud_device_sessions` | Device session tokens (refresh_token_hash, push_token, last_ip) |

All tables get RLS policies (user owns own data, admins see all), indexes, and updated_at triggers.

### Batch 2: Edge Functions (4 functions)
Backend API for real storage operations:

1. **`cloud-storage-api`** — Single edge function handling:
   - `POST /upload-init` — allocate blob, check quota, return signed upload URL
   - `POST /upload-finalize` — verify checksum, commit file metadata, update quota
   - `POST /download-url` — generate signed download URL with ownership check
   - `POST /delete` — soft delete to trash, update quota
   - `POST /restore` — undelete from trash
   - `GET /files` — list user's files/folders
   - `POST /folder` — create folder

2. **`cloud-sync-api`** — Sync push/pull:
   - `POST /push` — accept sync changes, update sync objects, create change records
   - `POST /pull` — return changes since checkpoint
   - `POST /checkpoint` — update device checkpoint

3. **`cloud-device-api`** — Device management:
   - `POST /register` — register new device session
   - `POST /revoke` — revoke device
   - `POST /trust` — update trust state

4. **`cloud-admin-api`** — Admin operations:
   - `POST /repair` — trigger reindex/reconciliation jobs
   - `GET /health` — platform health stats from real DB
   - `POST /quota-override` — admin quota adjustments

### Batch 3: Cloud Backbone Services — Wire to Real DB (~5 files updated)
Update all 5 cloud backbone services to query real database tables instead of returning mock data:

- **`cloud-storage-service.ts`** — Query `cloud_storage_usage`, `cloud_blobs`, `cloud_files`
- **`cloud-device-service.ts`** — Query `cloud_devices`, `cloud_device_sessions`
- **`cloud-quota-service.ts`** — Query `cloud_plans`, `cloud_user_plans`, `cloud_storage_usage`
- **`cloud-sync-service.ts`** — Query `cloud_sync_jobs`, `cloud_sync_changes`, `cloud_conflicts`
- **`cloud-audit-service.ts`** — Query `cloud_audit_events`

Each service keeps its demo data as fallback when no DB rows exist (graceful degradation).

### Batch 4: User-Facing File Manager + Upload UI (~3 new components)
1. **`CloudFileBrowser.tsx`** — File browser with folder navigation, upload button, drag-and-drop, grid/list view, file actions (download, rename, delete, share, version history)
2. **`CloudTrashManager.tsx`** — Trash view with restore/purge, purge countdown, bulk actions
3. **`CloudVersionHistory.tsx`** — Per-file version timeline with restore, compare, origin device display

### Batch 5: Wiring + Integration (~4 files updated)
- Add "Files" and "Trash" tabs to `UserCloudSettings.tsx` or create a new `/cloud` user page
- Wire file browser to `cloud-storage-api` edge function
- Connect admin pages to real DB via updated backbone services
- Add conflict resolution UI to user settings
- Update `CloudDashboard.tsx` to show real metrics from DB

## File Summary

| Batch | Type | Count | Description |
|-------|------|-------|-------------|
| 1 | Migration | 1 | 11 new tables + RLS + indexes + triggers |
| 2 | Edge Functions | 4 | Storage API, Sync API, Device API, Admin API |
| 3 | Service Updates | 5 | Wire backbone services to real DB |
| 4 | UI Components | 3 | File browser, trash manager, version history |
| 5 | Integration | ~4 | Wire everything together, real metrics |

## Technical Notes
- All edge functions use JWT validation in-code, CORS headers, and Zod input validation
- Signed URLs use Supabase Storage `user-files` bucket with user_id folder isolation
- Quota enforcement is server-side in edge functions (not client-side)
- Sync checkpoint model enables efficient delta pull without full re-scan
- Demo data fallback ensures the UI works even before real data exists
- No new npm dependencies required

