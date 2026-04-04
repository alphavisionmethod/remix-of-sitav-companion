

# Electron Desktop Hardening + Docker Security Gaps — Full Implementation

## Overview

Two areas to implement: (1) complete the Electron desktop app with missing infrastructure (auto-updater, offline DB, crash reporter, file system bridge, build scripts, code signing config), and (2) harden the Docker deployment stack with TLS, network segmentation, rate limiting, secrets rotation, and audit logging.

## Current State

| Component | Status |
|-----------|--------|
| `electron/main.cjs` + `preload.cjs` | Exist, functional |
| `package.json` missing `"main"` field | Missing |
| `vite.config.ts` missing `base: './'` | Missing (breaks Electron) |
| Auto-updater | Not implemented |
| File system bridge | Not implemented |
| Offline database (IndexedDB) | Not implemented |
| Native notifications wiring | IPC exists, not connected to app notification system |
| Build scripts (macOS/Win/Linux) | Not implemented |
| Code signing config | Not implemented |
| Crash reporter | Not implemented |
| Docker TLS/SSL | Not implemented |
| Docker network segmentation | Single flat network |
| Rate limiting | Not implemented |
| Secrets rotation | Not implemented |
| `docker-compose.yml` volumes section | Malformed (under services instead of top-level) |

---

## Part 1: Electron Desktop Hardening

### 1.1 `package.json` — Add `"main"` field
- Add `"main": "electron/main.cjs"` after `"version"`

### 1.2 `vite.config.ts` — Conditional `base` for Electron
- Add `base: process.env.ELECTRON_BUILD ? './' : '/'` to vite config
- This ensures Electron file:// loading works while keeping web deployment unchanged

### 1.3 Auto-Updater (`electron/auto-updater.cjs`)
- Create module using `electron-updater` (from `electron-builder` ecosystem)
- Configurable update feed URL via environment variable or `app-update.yml`
- IPC channels: `check-for-updates`, `download-update`, `install-update`
- Wire into `preload.cjs` with `checkForUpdates()`, `downloadUpdate()`, `installUpdate()`
- Wire into `useElectronBridge.ts` hook with new return values

### 1.4 File System Bridge (`electron/fs-bridge.cjs`)
- Secure file system operations exposed via IPC
- Operations: `export-backup` (JSON dump to user-chosen path), `import-backup`, `save-file`, `read-file`
- Uses `dialog.showSaveDialog` / `dialog.showOpenDialog` for safe path selection
- Sandboxed to prevent arbitrary file access
- Wire into `preload.cjs` and add `useFileSystemBridge` hook

### 1.5 Offline Database (`src/lib/offline-db.ts`)
- IndexedDB-based persistence using `idb` (lightweight wrapper)
- Stores: `pending-actions`, `cached-data`, `user-preferences`, `offline-queue`
- Sync manager that replays queued mutations when online
- `useOfflineStore` hook for components
- Integrates with existing Supabase client — wraps queries with cache-first strategy

### 1.6 Native Notifications Integration
- Connect the existing `notifications_queue` table subscription to Electron's native `Notification` API
- In `useRealtimeNotifications` hook, detect Electron and call `sendNotification` from the bridge
- Map notification urgency to Electron notification urgency levels

### 1.7 Build Scripts (`scripts/release/build-electron.sh`)
- Cross-platform build using `@electron/packager`
- Targets: `--platform=linux --arch=x64`, `--platform=darwin --arch=x64`, `--platform=win32 --arch=x64`
- Archives output as `.tar.gz` (Linux), `.zip` (macOS/Windows)
- Makefile targets: `make electron-linux`, `make electron-mac`, `make electron-win`, `make electron-all`

### 1.8 Code Signing Config (`electron/forge.config.cjs`)
- Configuration file for macOS (`identity`), Windows (`certificateFile`, `certificatePassword`), Linux (AppImage)
- Environment variable references for CI/CD — `APPLE_IDENTITY`, `CSC_LINK`, `CSC_KEY_PASSWORD`
- Added to CI pipeline as an optional step gated on secrets presence

### 1.9 Crash Reporter (`electron/crash-reporter.cjs`)
- Uses Electron's built-in `crashReporter.start()`
- Configurable submit URL (defaults to local file dump if no server)
- Captures: main process crashes, renderer crashes, unhandled rejections
- Writes crash dumps to `userData/crashes/`
- IPC channel to surface last crash info to the UI

---

## Part 2: Docker Security Hardening

### 2.1 TLS/SSL with Traefik (`deploy/traefik/`)
- Add Traefik reverse proxy container to `docker-compose.yml`
- `traefik.yml` static config: entrypoints (80→redirect, 443→TLS), Let's Encrypt ACME resolver, self-signed fallback
- Dynamic config via Docker labels on each service
- Replaces direct port exposure — only Traefik exposes 80/443
- Self-signed cert generation script for air-gapped deployments

### 2.2 Network Segmentation
- Split `sita-net` into 3 networks:
  - `sita-frontend` — web, traefik
  - `sita-backend` — api-gateway, brain-core, kong, edge-functions
  - `sita-data` — postgres, storage, nats
- Services connect to only the networks they need (e.g., api-gateway on frontend+backend, kong on backend+data)

### 2.3 Rate Limiting
- Add Kong rate-limiting plugin to `kong.yml` (global + per-route)
- Global: 1000 req/min per IP
- Auth endpoints: 20 req/min per IP
- REST API: 500 req/min per consumer
- API gateway: add `hono-rate-limiter` middleware with in-memory store

### 2.4 Kong Secrets — Remove env var substitution
- Move Kong consumer keys out of `kong.yml`
- Use Kong admin API init script to inject keys at startup from env vars
- Or use `envsubst` in a docker entrypoint wrapper script

### 2.5 Secrets Rotation Script (`scripts/security/rotate-secrets.sh`)
- Generates new JWT_SECRET, POSTGRES_PASSWORD, service keys
- Updates `.env` file
- Restarts affected services
- Logs rotation event to audit

### 2.6 Audit Logging (`deploy/auditd/`)
- `auditd.conf` for VM-level access logging
- Docker container event logging via `--log-driver=json-file` with rotation
- Audit rules for: file access to /opt/sita, Docker socket access, privilege escalation

### 2.7 Postgres Password Enforcement
- Remove default password from `docker-compose.yml`
- Add first-boot check in `sita-first-boot.sh` that generates and sets password
- Fail-fast if `POSTGRES_PASSWORD` is still the default value

### 2.8 Fix docker-compose.yml volumes
- Move `supabase-db-data`, `supabase-storage-data`, `nats-data` to top-level `volumes:` block (currently malformed under services)

---

## Files Created/Modified

| File | Action |
|------|--------|
| `package.json` | Add `"main"` field |
| `vite.config.ts` | Add conditional `base` |
| `electron/auto-updater.cjs` | New — auto-update module |
| `electron/fs-bridge.cjs` | New — file system bridge |
| `electron/crash-reporter.cjs` | New — crash reporting |
| `electron/forge.config.cjs` | New — code signing config |
| `electron/preload.cjs` | Update — expose new IPC channels |
| `electron/main.cjs` | Update — integrate updater, crash reporter, fs-bridge |
| `src/lib/offline-db.ts` | New — IndexedDB persistence layer |
| `src/hooks/useOfflineStore.ts` | New — offline data hook |
| `src/hooks/useFileSystemBridge.ts` | New — file system hook |
| `src/hooks/useElectronBridge.ts` | Update — add updater, crash, fs methods |
| `src/hooks/use-realtime-notifications.ts` | Update — wire to native notifications |
| `scripts/release/build-electron.sh` | New — cross-platform build script |
| `deploy/traefik/traefik.yml` | New — Traefik TLS config |
| `deploy/traefik/dynamic.yml` | New — Traefik routing rules |
| `deploy/kong.yml` | Update — add rate limiting plugins |
| `deploy/api-gateway/server.ts` | Update — add rate limiting middleware |
| `deploy/nginx.conf` | Update — remove direct port exposure |
| `docker-compose.yml` | Update — add Traefik, network segmentation, fix volumes, remove default password |
| `scripts/security/rotate-secrets.sh` | New — secrets rotation |
| `scripts/release/iso/sita-first-boot.sh` | Update — enforce password generation |
| `.env.example` | Update — add Electron/TLS/signing vars |
| `.github/workflows/ci.yml` | Update — add Electron build job |
| `Makefile` | Update — add electron build targets |

## Implementation Order

1. Fix `package.json` + `vite.config.ts` (Electron basics)
2. Create Electron modules (auto-updater, fs-bridge, crash-reporter, forge config)
3. Update `electron/main.cjs` + `preload.cjs` to integrate new modules
4. Create offline DB layer + hooks
5. Wire native notifications
6. Create build scripts + Makefile targets
7. Fix `docker-compose.yml` (volumes, default password, network segmentation)
8. Add Traefik TLS container + config
9. Update Kong with rate limiting
10. Add API gateway rate limiting
11. Create secrets rotation script
12. Update CI pipeline
13. Verify TypeScript compilation

