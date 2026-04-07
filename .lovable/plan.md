

# Fix Section 9: Duplicate Page Filenames (7 pairs)

## Problem

7 component filenames exist in two different directories. Both versions are **actively routed** in `App.tsx` with aliased lazy names, so both are real pages serving different domains. The filenames cause confusion and risk wrong-file imports.

## Current state in App.tsx

All 7 pairs already have unique lazy variable names — no routing bugs exist. The problem is purely filename ambiguity.

| Duplicate name | Location 1 (keep as-is) | Location 2 (rename) |
|---------------|------------------------|---------------------|
| AdminDurabilityBoard | `atlas/` | `admin/` → rename to `AdminMutationAudit.tsx` |
| DeploymentTruthCenter | `atlas/` | `admin/` → rename to `AdminDeploymentRings.tsx` |
| OperationsCommandCenter | `atlas/` | `admin/` → rename to `AdminOperationsHub.tsx` |
| PlatformTruthRegistry | `atlas/` | `admin/` → rename to `AdminTruthClaims.tsx` |
| ProjectionControlCenter | `atlas/` | `admin/` → rename to `AdminProjectionModels.tsx` |
| AppDetailPage | `app-platform/` | `store/` → rename to `StoreAppDetailPage.tsx` |
| DecisionTheater | `investment-office/` | `revenue-office/` → rename to `RevenueDecisionTheater.tsx` |

## Approach

For each of the 7 admin/store/revenue duplicates:

1. Create the new file with the renamed export (copy content, update the `export default function` name)
2. Delete the old file
3. Update the `lazy()` import path in `App.tsx`
4. Update any test file imports in `__tests__/`

## What stays the same

- All routes remain identical (paths unchanged)
- Atlas, app-platform, and investment-office versions are untouched
- No functional changes — only filenames and import paths

## Files changed: 14
- 7 new files (renamed duplicates)
- 7 old files deleted
- `src/App.tsx` — update 7 lazy import paths
- `src/pages/__tests__/admin-pages-batch2.test.tsx` — update 5 test imports
- `src/pages/__tests__/store-apps-pages.test.tsx` — update 1 test import
- `src/pages/__tests__/revenue-office-pages.test.tsx` — update 1 test import

