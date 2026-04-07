

# Rename 5 Remaining Non-DEMO_ Arrays in 4 Files

## Status

The bulk of the 29-file "Other Modules" list is already fixed — 22 of 26 files have all arrays correctly `DEMO_`-prefixed with `useDataMode` gates. Only **5 arrays in 4 files** remain:

| File | Array | Action |
|------|-------|--------|
| `MyActivity.tsx` | `DAY_LABELS` | → `DEMO_DAY_LABELS`, update references |
| `SpilloverDashboard.tsx` | `DOMAINS` | → `DEMO_DOMAINS`, update references |
| `app-platform/DevToolsCatalogPage.tsx` | `DEV_CATEGORIES` | → `DEMO_DEV_CATEGORIES`, update references |
| `enterprise/EnterpriseControlPlane.tsx` | `CAPABILITIES` | → `DEMO_CAPABILITIES`, update references |
| `enterprise/EnterpriseControlPlane.tsx` | `ROLES` | → `DEMO_ROLES`, update references |

All 4 files already have `useDataMode` imported and `isDemoMode` destructured — only the array rename + reference updates are needed.

## Implementation

For each file:
1. Rename the `const` declaration to add `DEMO_` prefix
2. Find-and-replace all usages of the old name with the new name in the same file
3. Run `npx tsc --noEmit` to verify zero errors

## Files changed: 4

