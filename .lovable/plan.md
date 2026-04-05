

# SITA OS — Performance, Cloud Updates, Management & ISO Deployment Plan

## What You're Asking (4 Areas)

1. **Make the OS lighter and faster with zero errors**
2. **Cloud-based OTA updates for each user (drivers + general), fully automatic**
3. **Manage every aspect of the app and OS from the admin UI (including approvals)**
4. **Deploy as a bootable Linux ISO**

## Current State

- **ISO pipeline**: Fully built — `build-iso.sh` downloads Ubuntu 24.04, injects autoinstall, bundles Docker stack, repacks with xorriso. First-boot script generates secrets, configures TLS/firewall/fail2ban, starts the stack.
- **OTA updates**: `sita-update.sh` exists for A/B root partition swap with rollback. Electron `auto-updater.cjs` checks a feed URL. But there is NO cloud update service, no per-user update channel, no driver management, and no frontend UI for updates.
- **Admin**: `AdminDashboard.tsx` and `TeamManagement.tsx` exist but are mock-heavy. `ApprovalsCenter.tsx` pulls real data via `useApprovals()`. No unified OS management panel (updates, drivers, storage, network, security) in the admin UI.
- **Performance**: App has 594 lines in `App.tsx` with 100+ lazy routes. No code splitting beyond lazy imports. No service worker, no asset preloading, no bundle analysis done.

## Plan

### Part 1: Performance & Error Prevention (3 files)

**1a. Route Optimization — `src/App.tsx`** (edit)
- Group routes into feature chunks using dynamic `import()` with webpack magic comments for better code splitting
- Add error boundaries around each route group to prevent cascading failures
- Add a global `Suspense` fallback with a branded skeleton loader instead of empty div

**1b. Service Worker for Caching — `public/sw.js`** (new)
- Cache static assets (JS, CSS, fonts) with cache-first strategy
- Cache API responses with stale-while-revalidate for dashboard data
- Register in `src/main.tsx`

**1c. Performance Monitor — `src/lib/services/performance-monitor/index.ts`** (new)
- Track Web Vitals (LCP, FID, CLS) and report to console/analytics
- Auto-detect slow renders (>100ms) and log warnings
- Memory leak detection via periodic heap sampling

### Part 2: Cloud OTA Update System (4 files)

**2a. Edge Function — `supabase/functions/system-updates/index.ts`** (new)
- `GET /system-updates?channel=stable&current_version=1.0.0` — returns latest available update metadata
- `POST /system-updates/register` — registers a device with its hardware profile, current version, and update channel (stable/beta/canary)
- `POST /system-updates/report` — device reports update success/failure for telemetry
- Channels: `stable` (default), `beta` (opt-in), `canary` (internal)
- Per-user update preferences stored in `system_update_devices` table

**2b. Database Migration** (new)
- `system_update_releases` — id, version, channel, release_notes, download_url, checksum_sha256, size_bytes, is_critical, created_at
- `system_update_devices` — id, user_id, device_id, hostname, current_version, channel, hardware_profile (jsonb), last_check_at, last_update_at, auto_update_enabled
- `system_update_log` — id, device_id, user_id, from_version, to_version, status (pending/downloading/installing/success/failed/rolled_back), started_at, completed_at, error
- All with RLS: users see only their own devices

**2c. Client Update Service — `src/lib/services/system-updates/index.ts`** (new)
- `checkForUpdates()` — calls edge function, returns update info
- `getUpdateHistory(deviceId)` — returns past updates for a device
- `registerDevice(profile)` — registers current device
- `setUpdateChannel(channel)` — switches between stable/beta/canary
- `setAutoUpdate(enabled)` — toggles automatic updates
- Works for both web app (checks for new frontend builds) and OS/Electron (checks for ISO/image updates)

**2d. OS-Level Update Agent — `scripts/release/sita-ota-agent.sh`** (new)
- Systemd timer runs every 6 hours
- Calls the edge function to check for updates
- Downloads update bundle, verifies SHA256 checksum
- Calls `sita-update.sh` for A/B partition swap
- Reports result back to cloud
- Handles driver updates: checks hardware profile, downloads matching driver packages
- Fully automatic when `auto_update_enabled=true`; prompts via notification when manual

### Part 3: Unified OS Management Panel (3 files)

**3a. System Management Page — `src/pages/admin/SystemManagement.tsx`** (new)
Tabs:
- **Updates**: Current version, available updates, update channel selector, update history timeline, one-click "Update Now" button, auto-update toggle
- **Devices**: Registered devices list with version, last-seen, health status
- **Drivers**: Hardware profile, installed drivers, available driver updates
- **Storage**: Disk usage breakdown (DB, Docker images, logs, backups), cleanup actions
- **Network**: Current IP, DNS, firewall status, open ports
- **Security**: TLS cert status/expiry, fail2ban stats, audit log summary, last security scan
- **Backups**: Last backup timestamp, restore options, backup schedule config
- **Approvals**: Embedded view of pending approvals with approve/reject inline (reuses `useApprovals` hook)

**3b. Update Notification Banner — `src/components/sita/UpdateBanner.tsx`** (new)
- Persistent banner at top of shell when update is available
- Shows version, release notes preview, "Update Now" / "Remind Later" buttons
- Critical updates show red banner with countdown
- Integrates with system-updates service

**3c. Route & Sidebar Integration** (edits to `App.tsx` + `AppSidebar.tsx`)
- Add `/admin/system` route
- Add "System" entry under Admin group in sidebar

### Part 4: ISO Deployment Readiness (2 files)

**4a. OTA Agent Systemd Timer — `scripts/release/iso/sita-ota.timer` + `sita-ota.service`** (new)
- Timer unit: runs `sita-ota-agent.sh` every 6 hours
- Service unit: executes the OTA check with proper permissions
- Installed during first-boot

**4b. First-Boot Enhancement — `scripts/release/iso/sita-first-boot.sh`** (edit)
- Add step to install and enable the OTA timer
- Register device with cloud update service on first boot
- Report initial hardware profile (CPU, RAM, disk, GPU, TPM status)

## File Summary

| # | File | Action |
|---|------|--------|
| 1 | `src/App.tsx` | Edit — error boundaries, better suspense |
| 2 | `public/sw.js` | New — service worker for asset caching |
| 3 | `src/lib/services/performance-monitor/index.ts` | New — Web Vitals + slow render detection |
| 4 | `supabase/functions/system-updates/index.ts` | New — cloud update API |
| 5 | Migration: `system_update_*` tables | New — 3 tables with RLS |
| 6 | `src/lib/services/system-updates/index.ts` | New — client update service |
| 7 | `scripts/release/sita-ota-agent.sh` | New — OS-level auto-updater |
| 8 | `src/pages/admin/SystemManagement.tsx` | New — unified OS management panel |
| 9 | `src/components/sita/UpdateBanner.tsx` | New — update notification banner |
| 10 | `src/components/sita/AppSidebar.tsx` | Edit — add System link |
| 11 | `scripts/release/iso/sita-ota.timer` | New — systemd timer for OTA |
| 12 | `scripts/release/iso/sita-ota.service` | New — systemd service for OTA |
| 13 | `scripts/release/iso/sita-first-boot.sh` | Edit — register device + install OTA timer |

**Total: 9 new files, 4 edits, 1 migration. Covers performance, cloud updates, full admin management, and ISO deployment readiness.**

