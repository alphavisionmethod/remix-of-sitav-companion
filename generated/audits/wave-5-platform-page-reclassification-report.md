# Wave 5 — Platform-Owned Page Reclassification

**Date:** 2026-04-25
**Status:** ✅ Complete
**Build:** `tsc --noEmit` 0 errors

## Goal

Move root-level page families from `src/pages/<family>/**` to their canonical
platform homes under `src/platform/<system>/pages/**`, per the Repository
Constitution. Replace originals with thin re-export adapters so all routes
remain stable.

## Outcome

- **144 page bodies relocated** to `src/platform/<system>/pages/`
- **144 thin adapters** generated at the original `src/pages/<family>/` paths
- **0 collisions** (all destination folders were empty before the wave)
- **0 TypeScript errors** after migration
- `src/platform/` file count: **328 → 472**
- `src/pages/` file count: **1148 → 1148** (unchanged — bodies became adapters)

## Mapping table

| Source (legacy) | Canonical home (platform) |
|---|---|
| `pages/atlas/*` | `platform/atlas/pages/` |
| `pages/files/*` | `platform/files/pages/` |
| `pages/owner/*` | `platform/owner/pages/` |
| `pages/mission-control/*` | `platform/mission-control/pages/` |
| `pages/mission/*` | `platform/mission-control/mission-pages/` |
| `pages/boardroom/*` | `platform/boardroom/pages/` |
| `pages/intelligence/*` | `platform/intelligence/pages/` |
| `pages/trust/*` | `platform/trust/pages/` |
| `pages/personal-brain/*` | `platform/personal-brain/pages/` |
| `pages/enterprise/*` | `platform/enterprise/pages/` |
| `pages/tenant/*` | `platform/tenant/pages/` |
| `pages/workspace/*` | `platform/workspace/pages/` |
| `pages/integrations/*` | `platform/integration/pages/` |
| `pages/marketing/*` | `platform/marketing/pages/` |
| `pages/settings/*` | `platform/settings/pages/` |
| `pages/store/*` | `platform/app-platform/store-pages/` |
| `pages/app-platform/*` | `platform/app-platform/pages/` |
| `pages/apps/*` | `platform/apps/pages/` |
| `pages/sita/*` | `platform/sita/pages/` |
| `pages/advisors/*` | `platform/advisors/pages/` |
| `pages/auth/*` | `platform/auth/pages/` |

## Adapter pattern

```typescript
// Wave 5 — legacy path re-exports the canonical platform implementation.
// Moved to @/platform/atlas/pages/AtlasHub
export { default } from "@/platform/atlas/pages/AtlasHub";
export * from "@/platform/atlas/pages/AtlasHub";
```

## Untouched root families (intentional)

- `src/pages/__tests__/` — test infrastructure
- `src/pages/admin/` — admin canonical home is `src/admin/`; admin page adapters under `src/pages/admin/` remain pending Wave 6
- `src/pages/business-advisors/` — pillar-adjacent; will fold into `src/modules/business/` in a follow-up
- `src/pages/business/`, `concierge/`, `health/`, `money/`, `investment-office/`, `revenue-office/`, `digital-presence/` — already migrated in Wave 4
- Root-level files like `LandingPage.tsx`, `NotFound.tsx`, `OwnerCenter.tsx`, etc. — Wave 6 target (single-file reclassification)

## Verification

- `tsc --noEmit` → **0 errors**
- All adapters use canonical `@/platform/...` aliases
- No legacy paths remain inside the moved directories (only adapters)

## Next wave

**Wave 6**: reclassify the remaining ~70 root-level single-file pages
(`src/pages/*.tsx`) into their canonical platform or pillar homes, applying the
same thin-adapter pattern.