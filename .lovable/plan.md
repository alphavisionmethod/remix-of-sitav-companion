

# Fix Remaining `db.from()` References (26 files, 84 calls)

## Problem

The old `src/integrations/supabase/db.ts` was deleted, but **26 files** still reference `db.from()` — 84 total calls. These will crash at runtime since `db` is undefined. The `ConstitutionEditor.tsx` is one of them (lines 292, 381, 395).

## Affected Files

| Category | Files | Calls |
|----------|-------|-------|
| **Pages** (12) | `AutomationCenter`, `ConnectorHub`, `InboxCapture`, `OpportunityEngine`, `PeopleWorkspace`, `PermissionsCenter`, `PolicyEditor`, `RecoveryCenter`, `TrustCenter`, `WorkflowsCenter`, `NOT02/04/05`, `AdvisorWorkspace`, `MonthGridCalendar`, `ConstitutionEditor` | ~35 |
| **Hooks** (7) | `use-admin-durable-state`, `use-boardroom-data`, `use-domain-projections`, `use-household`, `use-mission-control-data`, `use-proof-chain`, `use-sita-data` | ~40 |
| **Lib/Components** (3) | `NotificationInbox`, `offline-db`, `connector-health-service`, `offline-sync` | ~9 |

## Fix Strategy

For all 26 files:
1. Replace `db.from("table")` → `fromTable("table")`
2. Add `import { fromTable } from "@/lib/supabase-helpers"` if not already present
3. Remove any leftover `import { db } from ...` or `const db = ...` lines

This is the same mechanical transformation already applied to 100+ other files. Single pattern, no logic changes.

## Steps

1. Run automated sed replacement across all 26 files: `db.from(` → `fromTable(`
2. Fix imports in each file (add `fromTable`, remove `db`)
3. Special: `ConstitutionEditor.tsx` — also verify all 3 mutations (insert/update/delete) persist to DB correctly (they already do via `fromTable` for insert, just need `db` → `fromTable` for update/delete/select)
4. Verify: `npx tsc --noEmit` — 0 errors

## Files Changed
- ~26 files modified (replace `db.from` → `fromTable`, fix imports)

