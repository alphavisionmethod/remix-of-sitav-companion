
## Plan: Production-grade App Platform & App Store

I'll explore the existing codebase first to understand what's already there, then phase the work to avoid duplicates and stubs.

### Live findings (from exploration)

The project already has substantial app-platform scaffolding:
- `src/lib/app-platform/` — types, registry, manifests partially exist
- `src/lib/app-store-launcher.ts` — event-based launcher
- `src/pages/AppStoreCenter.tsx` — redirect shim → desktop event
- `src/components/sita/apps/app-store/*` — store UI shell (17 modules per memory)
- `src/components/sita/shell/AppLauncherPanel.tsx` — already wired to platform context (from prior turn)
- `src/components/sita/DesktopDock.tsx` — pinning + drag/drop (from prior turn)
- `electron/preload.cjs` — has fs/license/security bridges, **no native-app launch bridge yet**
- DB: 222 tables, 100% RLS — but **no `apps`, `installed_apps`, `app_versions`, `app_launch_events`, `app_permissions_overrides`, `app_sources` tables exist yet**
- 84 edge functions exist, **none are `app-store-catalog`, `app-install`, `app-uninstall`, `app-launch-resolve`, `app-update-check`, `app-permissions-sync`, `app-manifest-sync`**
- `AppPlatformContext` exists and reads/writes pin/install state — currently **localStorage-only**, needs DB backing

So this is **mostly net-new backend + service wiring**, with UI mostly already in place that needs to be re-pointed at real services.

### Phased delivery (5 phases, no stubs)

**Phase 1 — Database foundation (1 migration)**
- `apps` (canonical catalog, public read, admin write)
- `installed_apps` (user install state, RLS owner-only, unique `(user_id, app_id)`)
- `app_versions` (version history, public read)
- `app_launch_events` (per-user launch telemetry, owner-only, 90d retention)
- `app_permissions_overrides` (per-user permission grants, owner-only)
- `app_sources` (publisher / trust metadata, public read)
- Indexes: `apps(slug)`, `apps(category, app_type)`, `installed_apps(user_id, pinned, favorite)`, `app_launch_events(user_id, created_at desc)`
- RLS: catalog public read; install state owner-only; admin-only writes to `apps` via `has_role(_, 'admin')`
- Seed: 8 internal apps, 8 web apps, 6 PWA-capable, 6 external desktop apps (28 total) inserted in same migration

**Phase 2 — Manifest + runtime + launch resolver**
Real TS modules (replacing/extending existing stubs):
- `src/lib/app-platform/manifest-schema.ts` — Zod schema for all 4 app types + 7 launch strategies
- `src/lib/app-platform/manifests.ts` — typed `AppManifest`, `LaunchStrategy`, `AppType` exports
- `src/lib/app-platform/launch-resolver.ts` — pure function: `(manifest, ctx) → LaunchInstruction` covering surface availability, Electron presence, auth state, permissions, install state, embedded-vs-external fallback
- `src/lib/app-platform/permissions.ts` — permission keys + check helpers
- `src/lib/app-platform/install-state.ts` — install-state derivation helpers
- `src/lib/app-platform/runtime.ts` — runtime capability probe (electron / pwa / web / mobile)

**Phase 3 — Edge functions (7 new functions)**
- `app-store-catalog` — list / search / filter / featured / detail (public)
- `app-install` — validate manifest, upsert `installed_apps`, return resolved state (auth required)
- `app-uninstall` — soft-delete (preserve launch history), update state
- `app-launch-resolve` — resolves launch instruction, increments `launch_count`, writes `app_launch_events`
- `app-update-check` — compares installed vs latest from `app_versions`
- `app-permissions-sync` — read/write `app_permissions_overrides`
- `app-manifest-sync` — admin-only manifest validate + upsert (future publisher onboarding hook)

All use shared CORS, JWT validation, Zod input validation, structured error responses.

**Phase 4 — Frontend services + hooks (real, typed, DB-backed)**
Service layer:
- `src/lib/services/app-store/catalog.service.ts`
- `src/lib/services/app-store/install.service.ts`
- `src/lib/services/app-store/launch.service.ts`
- `src/lib/services/app-store/update.service.ts`
- `src/lib/services/app-store/permissions.service.ts`
- `src/lib/services/app-store/recents.service.ts`
- `src/lib/services/native-apps/registry.ts`, `detection.ts`, `launch.ts` (Electron-aware)

Hooks (React Query backed):
- `use-app-catalog`, `use-installed-apps`, `use-app-launch`, `use-app-install`, `use-app-updates`, `use-app-permissions`, `use-app-recents`

Refactor `AppPlatformContext` to consume DB-backed `useInstalledApps()` (keep localStorage as offline cache only).

**Phase 5 — UI wiring + Electron bridge + tests**
- Re-point existing `AppStoreShell` modules at real hooks (no UI rewrite — replace data sources)
- Add app cards: install/open/launch-external/update/uninstall/pin/favorite/permissions buttons all wired to services
- App detail page: trust label, permissions list, supported surfaces, screenshots, similar apps
- Launcher (`AppLauncherPanel`) already pulls from platform context — extend to query installed_apps from DB
- Electron `preload.cjs` + `main.cjs`: add `sitaApps` bridge with `launchNativeApp(appId)`, `checkNativeAppAvailability(appId)`, `openExternalUrl(url)`, `getHostCapabilities()` — allowlist-based, validated in main process
- Tests: `manifest-schema.test.ts`, `launch-resolver.test.ts`, `install.service.test.ts`, `catalog.service.test.ts`, `native-apps-degraded.test.ts`

### Files (counts, not exhaustive list)

| Area | New | Edited |
|---|---|---|
| Migration | 1 | — |
| `src/lib/app-platform/*` | 6 | 1 |
| `src/lib/services/app-store/*` | 6 | — |
| `src/lib/services/native-apps/*` | 3 | — |
| `src/hooks/use-app-*` | 7 | — |
| Edge functions | 7 | — |
| UI rewiring | — | ~6 (AppStoreShell modules + AppPlatformContext) |
| Electron | — | 2 (`preload.cjs`, `main.cjs`) |
| Tests | 5 | — |

### Acceptance

- 6 new tables with RLS, 28 seeded apps across all 4 types
- 7 deployed edge functions, all returning real data
- All 4 app types (internal, web, PWA, external desktop) install/launch end-to-end
- Store UI shows real install state; install/open/uninstall/pin/favorite buttons all functional
- Launcher reflects DB-backed installed apps, pinned ordering persists across devices
- External desktop apps degrade honestly in browser (show "Desktop only — open web version" CTA)
- Electron bridge launches allowlisted native apps; rejects unknown app_ids
- Search finds apps by name/publisher/tags/description
- 0 TS errors, tests pass, no stubs, no duplicate logic
- Definition-of-Done from prompt §29 fully satisfied
