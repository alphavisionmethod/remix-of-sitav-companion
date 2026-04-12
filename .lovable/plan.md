

# Add Update Center, Cloud Sync & Dev Tools to App Platform Catalog

## Problem
These three apps have full window implementations and launch logic in `ShellLayout.tsx`, but are missing from `APP_CATALOG` in `src/lib/app-platform/catalog.ts`. This means they don't appear in the dock or app listings.

## Change

**Single file**: `src/lib/app-platform/catalog.ts`

Add 3 new `AppDefinition` entries to the `APP_CATALOG` array, after the existing SITA internal apps block (around line 821, after "sita-app-store"):

| App | ID | Icon | Category | Pinned to Dock |
|-----|----|------|----------|----------------|
| Update Center | `update-center` | 🔄 | `utilities` | Yes |
| Cloud Sync | `cloud-sync` | ☁️ | `utilities` | Yes |
| Dev Tools | `dev-tools` | 🛠️ | `developer-tools` | Yes |

Each entry follows the exact same pattern as existing internal apps (e.g. "sita-app-store"):
- `appClass: "internal"`, `trustLevel: "sita-verified"`, `installStatus: "installed"`, `pinnedToDock: true`
- IDs match what `ShellLayout.tsx` already checks in its launch logic (`"update-center"`, `"cloud-sync"`, `"dev-tools"`)
- Appropriate `iconBg` gradients, descriptions, and tags

No other files need changes — the dock already reads from `getInstalledApps()` + `pinnedToDock`, and `ShellLayout` already has the launch handlers for these IDs.

