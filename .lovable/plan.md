

# SITA OS — App Store + Install System Enhancement Plan

## Current State (Already Implemented)

The app platform is **extensively built** with 16 pages, 851 lines of reusable components, 35+ app catalog entries, 5 bundles, and 17 routes. All UI surfaces from the spec exist:

| Surface | Page | Status |
|---------|------|--------|
| App Store | `AppStorePage` | Done |
| App Library | `AppLibraryPage` | Done |
| App Detail | `AppDetailPage` | Done |
| Install Sheet | `InstallSheet` component | Done |
| Default Apps | `AppAssociationsPage` | Done |
| Permissions Center | `AppPermissionsCenterPage` | Done |
| Updates Center | `AppUpdatesPage` | Done |
| Install from Web | `WebAppInstallPage` | Done |
| External Installer | `ExternalInstallerPage` | Done |
| Bundles | `BundleDetailPage` | Done |
| Enterprise Catalog | `EnterpriseCatalogPage` | Done |
| Dev Tools | `DevToolsCatalogPage` | Done |
| Receipts | `AppReceiptsPage` | Done |
| Open With | `OpenWithPage` | Done |
| Compare | `AppComparePage` | Done |
| First Launch | `FirstLaunchPage` | Done |
| App Management | `AppManagePage` | Done |

Component library covers: `VerificationBadge`, `AppSourceLabel`, `WorksWithSitaBadge`, `AppIcon`, `AppCard`, `FeaturedAppCard`, `AppLane`, `BundleCard`, `CategoryStrip`, `InstallSheet`, `PermissionDomainCard`, `StoreHero`, `AppReceiptCard`, `SourceOriginLabel`, `PackageTypeLabel`, `TrustInstallBehavior`, `InstallScopeSelector`, `SandboxRecommendationCard`, `SandboxLevelBadge`, `DockPinPrompt`, `DefaultAppPrompt`, `WorkspaceAttachPrompt`, `RuntimeClassCard`, `SourceVerificationCard`, `UpdateSourceInfo`, `EnterpriseAppBadge`, `CapabilityPackCard`, `FileAssociationPrompt`.

Types cover: `AppClass` (6 types), `AppTrustLevel` (6 levels), `AppInstallStatus` (8 states), `AppCategory` (14), `AppSourceOrigin` (8), `AppInstallScope` (4), `AppSandboxLevel` (5), `AppPackageType` (6), `AppUpdateMode` (5), plus `AppPermission`, `FileAssociation`, `ProtocolAssociation`, `AppLifecycleReceipt`, `AppDefinition`, `AppBundle`.

## What Needs Enhancement (5 Gaps)

### Gap 1: No Sidebar Entry for App Store
The App Store has no sidebar link. `bottomNav` has "Pack Store" at `/store`, but nothing at `/app-store`. Users can only reach it via direct URL.

**Fix:** Add "App Store" to the `appsNav` group in `AppSidebar.tsx` with `Package` icon pointing to `/app-store`.

### Gap 2: No Reactive Install State (All Actions Are No-Ops)
Every install, uninstall, permission toggle, and dock pin is visual-only. `APP_CATALOG` is a frozen const array. The `InstallSheet.onInstall` callback does nothing in `AppStorePage`. Bundle install is disabled.

**Fix:** Create a React context `AppPlatformContext` with a Zustand-like state manager that wraps the static catalog and tracks user-specific install state. This context will:
- Track installed apps, permissions granted, dock pins, defaults
- Provide `installApp()`, `uninstallApp()`, `togglePermission()`, `pinToDock()`, `setDefaultApp()` actions
- Generate receipts on every lifecycle action
- Persist to Supabase `installed_apps` table when user is authenticated
- Fall back to localStorage for demo mode

### Gap 3: No Database Tables for App Platform
No `installed_apps` or `app_permissions` tables exist. `AppReceiptsPage` queries `proof_records` but there's no structured app lifecycle persistence.

**Fix:** Create migration with:
- `installed_apps` — user's installed apps with status, scope, sandbox level, install source, permissions granted, dock pinned, installed_at
- `app_default_associations` — user's default app choices per role (browser, email, etc.)
- RLS policies for both tables

### Gap 4: Bundle Install Flow Not Wired
`BundleDetailPage` has selection UI but the "Install Selected" button doesn't trigger any install flow. Also has a stale `selectedApps` initialization bug (comment says "Can't set state during render").

**Fix:** Wire the button to call `installApp()` for each selected app sequentially with a progress overlay. Fix the initialization with `useEffect`.

### Gap 5: Profile-Aware Recommendations Missing
`getRecommendedApps()` exists but isn't used on the store home page. The store doesn't pull the user's onboarding profile to personalize "Recommended for you."

**Fix:** Use `user_memory` data (from onboarding) to drive a "Recommended for Your Environment" lane on the store home page.

## Implementation Plan

### 1. Database Migration
Create `installed_apps` and `app_default_associations` tables with RLS.

### 2. `AppPlatformProvider` Context (`src/contexts/AppPlatformContext.tsx`)
- Wraps `APP_CATALOG` with reactive user state
- Methods: `installApp`, `uninstallApp`, `togglePermission`, `pinToDock`, `unpinFromDock`, `setDefaultApp`, `getInstallState`
- Generates `AppLifecycleReceipt` on every action
- Persists to Supabase when authenticated, localStorage for demo
- Queries `installed_apps` on mount

### 3. Wire All Pages to Context
- `AppStorePage`: Use context for install state display
- `InstallSheet`: Call `context.installApp()` on install
- `AppLibraryPage`: Filter by actual installed state
- `AppManagePage`: Wire all toggles (pin, notifications, startup, permissions, uninstall)
- `AppPermissionsCenterPage`: Wire permission toggles
- `AppAssociationsPage`: Wire default app changes
- `BundleDetailPage`: Fix selection init, wire batch install
- `AppUpdatesPage`: Use context for update state

### 4. Add Sidebar Entry
Add `/app-store` to `appsNav` in `AppSidebar.tsx`.

### 5. Profile-Aware Store Recommendations
Add "Recommended for Your Environment" lane using `user_memory` data.

## Files Modified
- `src/components/sita/AppSidebar.tsx` — add App Store nav entry
- `src/contexts/AppPlatformContext.tsx` — new file, reactive state manager
- `src/components/sita/app-platform/AppStoreComponents.tsx` — wire InstallSheet to context
- `src/pages/app-platform/AppStorePage.tsx` — use context, add recommendations lane
- `src/pages/app-platform/AppLibraryPage.tsx` — use context for real install state
- `src/pages/app-platform/AppManagePage.tsx` — wire all management actions
- `src/pages/app-platform/AppPermissionsCenterPage.tsx` — wire permission toggles
- `src/pages/app-platform/AppAssociationsPage.tsx` — wire default app changes
- `src/pages/app-platform/BundleDetailPage.tsx` — fix init bug, wire batch install
- `src/pages/app-platform/AppUpdatesPage.tsx` — use context
- `src/App.tsx` — wrap with AppPlatformProvider
- New migration: `installed_apps` + `app_default_associations` tables

## No New Pages Needed
All 15+ surfaces already exist. This plan only enhances the existing implementation with real state management and backend persistence.

