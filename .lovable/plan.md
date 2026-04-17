

## Honest deployment-readiness audit — what's done vs. what's NOT

### ✅ Already shipped (verified live)
- **DB**: 6 tables (`apps`, `installed_apps`, `app_versions`, `app_launch_events`, `app_permissions_overrides`, `app_sources`) with RLS enabled and 15 policies total. **28 apps seeded** (8 internal, 8 web, 6 PWA, 6 external_desktop, 11 featured), 28 versions, 28 sources.
- **Edge functions**: All 7 deployed (`app-store-catalog`, `app-install`, `app-uninstall`, `app-launch-resolve`, `app-update-check`, `app-permissions-sync`, `app-manifest-sync`).
- **Manifest layer**: `manifest-schema.ts`, `manifests.ts`, `runtime.ts`, `permissions.ts`, `install-state.ts`, `launch-resolver.ts` — all present.
- **Services**: 6 app-store services + 3 native-apps services.
- **Hooks**: `use-app-platform.ts` exports all 13 required hooks.
- **Runtime**: `WebAppWindow`, `DesktopOnlyFallback`, `AppLaunchBridge` exist; bridge mounted in `ShellLayout`.
- **Electron**: `sita-apps-bridge.cjs` registered in `main.cjs`, exposed via `preload.cjs`.
- **Tests**: `manifest-schema.test.ts`, `launch-resolver.test.ts`.

### 🔴 NOT done — the store UI is disconnected from the real backend

**Audit result**: `grep` for `useAppCatalog | useInstalledApps | useAppLaunch | useAppInstall | useFeaturedApps` across `src/` returns **ZERO matches** outside the hook file itself. **All 17 store pages still read from the in-memory `APP_CATALOG` constant** and the legacy `AppPlatformContext` (which only persists pin/favorite to DB but reads catalog locally).

This means:
- Store Home, Library, Updates, Permissions Center, Detail, Compare, Manage, Receipts, Bundle Detail, Enterprise, Dev Tools, Open With, First Launch, Web Install, External Installer, Associations — all rendering against **hardcoded catalog**, not the 28 DB-seeded apps.
- Install / Uninstall / Pin / Favorite / Launch buttons in store pages don't call edge functions.
- Update Center can't show real `app_versions` diffs.
- Permissions Center can't read/write `app_permissions_overrides`.
- Recents can't read `app_launch_events`.

### 🔴 Other gaps
- Missing tests required by §24: `install.service.test.ts`, `catalog.service.test.ts`, `native-apps-degraded.test.ts`.
- `recents.service.test.ts` / installed-apps hook test absent.
- `handle_new_user` trigger does NOT auto-install `pinned_default=true` apps for new users → fresh signups see empty launcher despite seeded catalog.
- No command-palette / global search hook into apps catalog (§22 partial).
- `app-store-catalog` edge function exists but is bypassed by direct Supabase reads — fine, but means search/filter logic is duplicated. Acceptable.

### Phased fix to reach 100%

**Phase 1 — Wire the 17 store pages to real data (the big one)**
Re-point each page to use `useAppCatalog`, `useFeaturedApps`, `useInstalledApps`, `useAppDetail`, `useAppUpdates`, `useAppPermissions`, `useAppRecents`. Replace `APP_CATALOG` reads with hook results. Wire all action buttons (Install/Open/Uninstall/Pin/Favorite/Launch/Permissions) to `useAppInstall`, `useAppUninstall`, `useAppPin`, `useAppFavorite`, `useAppLaunch`, `useSetAppPermissions`. Keep `AppStoreComponents` (cards, badges) — they're presentational and reusable; just feed them DB rows mapped to `AppDefinition` shape.

**Phase 2 — AppPlatformContext consolidation**
Refactor `AppPlatformContext` to be a thin wrapper over the React Query hooks (single source of truth). Keep its public API stable so the launcher/dock keep working. Drop the duplicate `APP_CATALOG` import for catalog reads; keep it only as a fallback when offline.

**Phase 3 — Auto-install default apps on signup**
New migration: extend `handle_new_user` (or add a sibling trigger) to insert `installed_apps` rows for every `apps` row where `pinned_default=true` (the 8 internal apps). RLS-safe via SECURITY DEFINER. Backfill existing users in same migration.

**Phase 4 — Command palette + search wiring**
Add `useAppSearch(query)` to `use-app-platform.ts` that hits `app-store-catalog` with search param. Wire into existing command palette / launcher search input so apps are discoverable globally (§22 requirement).

**Phase 5 — Missing tests**
Add `install.service.test.ts`, `catalog.service.test.ts`, `native-apps-degraded.test.ts`, `installed-apps.hook.test.ts`. Cover install/uninstall round-trip, catalog filter, browser-mode degradation for external_desktop apps, and pinned-state derivation.

**Phase 6 — Verification pass**
- `useAppCatalog()` returns 28 rows in store
- Install on a fresh user persists to `installed_apps` and reflects in launcher within one tick
- External-desktop app in browser mode shows `DesktopOnlyFallback`
- Web app launches into `WebAppWindow` iframe with x-frame fallback
- Internal app launches via `internal_route` strategy into windowed shell
- New signup auto-receives 8 pinned_default apps in launcher
- All tests green; `tsc` 0 errors

### Files

| Phase | New | Edited |
|---|---|---|
| 1 | — | 17 (all `src/pages/app-platform/*.tsx`) |
| 2 | — | 1 (`AppPlatformContext.tsx`) |
| 3 | 1 migration | — |
| 4 | — | 2 (`use-app-platform.ts`, command palette host) |
| 5 | 4 tests | — |
| 6 | — | — (verification only) |

### Acceptance — Definition of Done satisfied

All 14 DoD items from §29 verifiable end-to-end against the live DB; store UI feels OS-native (not mock cards); fresh signup shows 8 pinned apps; search finds all 28 apps; install/launch buttons all functional; 0 TS errors; tests pass.

