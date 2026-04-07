

# Fix Section 3: Rename 21 Non-DEMO Uppercase Arrays in 16 Page Files

## Investigation Summary

- **151 total files** have `const UPPERCASE = [...]` arrays in `src/pages/`
- **140 files** (93%) already use the `DEMO_` prefix correctly
- **21 array declarations** across **16 files** lack the `DEMO_` prefix

## Key Distinction

These 21 arrays are NOT mock entity data (fake users, fake invoices). They are **UI configuration constants** — colors, toolbar items, category lists, calendar names, navigation links. They would exist identically in production.

However, for consistency with the SITA OS convention and to pass the inline-mock detector cleanly, the fix is to either:
1. **Prefix with `DEMO_`** if the array contains data that would come from a DB/API in production
2. **Move to a shared constants file** if truly static UI config

## Classification & Action

### Group A — True UI constants (no rename needed, move to shared file)
These never change between demo/live mode. Move to `src/lib/constants/ui-config.ts`:

| Array | File | Reason |
|-------|------|--------|
| `MONTH_NAMES`, `DAY_NAMES` | MonthGridCalendar.tsx | Calendar constants |
| `ASSET_COLORS` | CapitalAllocationPage.tsx | Chart colors |
| `PIE_COLORS` | RevenueImpactDashboard.tsx | Chart colors |
| `SEVERITY_COLORS` | LifeSimulator.tsx | Status colors |
| `TOOLBAR_GROUPS` | DocumentEditor.tsx | Editor UI |
| `TOOLBAR_ACTIONS` | DocsWorkspace.tsx | Editor UI |
| `OPERATORS` | PlaybookBuilder.tsx | Comparison operators |
| `DELAY_OPTIONS` | PlaybookBuilder.tsx | Time options |
| `DATE_RANGES` | SearchPage.tsx | Filter options |

### Group B — Config arrays that represent system data (prefix with `DEMO_`)
These represent data that in production would come from the database or a registry:

| Array | File | Action |
|-------|------|--------|
| `CATEGORIES` | NotificationPreferences.tsx | → `DEMO_CATEGORIES` |
| `CATEGORIES` | IntegrationConcierge.tsx | → `DEMO_CATEGORIES` |
| `CATEGORIES` | PolicyEditor.tsx | → `DEMO_CATEGORIES` |
| `QUICK_ACTIONS` | RevenueGate.tsx | → `DEMO_QUICK_ACTIONS` |
| `DEFAULT_APP_SLOTS` | AppAssociationsPage.tsx | → `DEMO_APP_SLOTS` |
| `FILE_TYPES` | AppAssociationsPage.tsx | → `DEMO_FILE_TYPES` |
| `PERMISSION_DOMAINS` | AppPermissionsCenterPage.tsx | → `DEMO_PERMISSION_DOMAINS` |
| `AUTONOMY_LEVELS` | AdvisorRegistry.tsx | → `DEMO_AUTONOMY_LEVELS` |
| `TRIGGER_EVENTS` | PlaybookBuilder.tsx | → `DEMO_TRIGGER_EVENTS` |
| `CONDITION_FIELDS` | PlaybookBuilder.tsx | → `DEMO_CONDITION_FIELDS` |
| `FIELD_TYPES` | FormsBuilder.tsx | → `DEMO_FIELD_TYPES` |

## Implementation Steps

1. **Create `src/lib/constants/ui-config.ts`** — move 9 pure UI constant arrays here (colors, toolbar items, month names, operators, delays, date ranges)
2. **Rename 12 arrays** across 8 files to add `DEMO_` prefix, update all references within those files
3. **Update imports** in the 5 files that moved constants to use the new shared file
4. **Verify**: `npx tsc --noEmit` — 0 errors
5. **Verify**: re-run grep — 0 non-DEMO uppercase arrays remain in pages

## Files Changed
- 1 new file: `src/lib/constants/ui-config.ts`
- 13 page files modified (rename arrays + update imports)
- Total: ~14 files

