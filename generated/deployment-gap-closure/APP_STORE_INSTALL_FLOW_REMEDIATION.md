# App Store Install Flow — Remediation Status

_Generated: 2026-04-18T13:11:51.571Z_

## Audit verdict: REAL (no rebuild required)

### Edge functions (11)
- `supabase/functions/app-ingest-pwa`
- `supabase/functions/app-ingest-web`
- `supabase/functions/app-install`
- `supabase/functions/app-launch-resolve`
- `supabase/functions/app-manifest-sync`
- `supabase/functions/app-permissions-sync`
- `supabase/functions/app-screenshot-capture`
- `supabase/functions/app-store-api`
- `supabase/functions/app-store-catalog`
- `supabase/functions/app-uninstall`
- `supabase/functions/app-update-check`

### Canonical service
- ✅ `src/lib/services/app-store/install.service.ts`

### Consumers (8)
- `src/contexts/AppPlatformContext.tsx`
- `src/hooks/use-app-platform.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/app-platform/db-app-adapter.ts`
- `src/lib/db/migration-registry.ts`
- `src/lib/services/app-store/install.service.ts`
- `src/lib/services/app-store/launch.service.ts`
- `src/lib/services/app-store/recents.service.ts`

### Launcher integrations
- `src/components/sita/shell/AppLauncherPanel.tsx`
- `src/components/sita/shell/ShellLiveLayer.tsx`
- `src/lib/surfaces/shell-surface-map.ts`
- `src/runtimes/shell/index.ts`

### Why not rebuild
The flow is backed by real edge functions writing to real DB tables (`installed_apps`, `app_install_receipts`). It is NOT a mock. Phase M optionally adds receipt confirmations and history if the install service is missing audit trails.

