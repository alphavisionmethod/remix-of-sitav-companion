# Production Truth Dashboard

Generated: 2026-04-09T12:00:00.000Z

## Artifact Health

| Status | Count |
|--------|-------|
| ✅ Valid | 48 |
| ❌ Missing | 0 |
| ⚠️ Invalid | 0 |

## Pass Rate: 100%

## Service Health

- **Average**: 60%
- **Total Services**: 137

## Security Status

- **RLS Enabled**: 485 tables (100%)
- **RLS Hardened**: 30 tables migrated `public` → `authenticated` (2026-04-09)
- **TypeScript Errors**: 0
- **`as any` in pages**: 0
- **`as unknown as` in pages**: 0
- **`useState<any>`**: 0

## Deployment Readiness

- PWA: ✅ manifest + service worker + icons
- Docker: ✅ Dockerfile + nginx + compose
- OTA: ✅ agent script + systemd timer
- Backup: ✅ automated pg_dump + volume snapshots
- ISO: ⚠️ build script pending
