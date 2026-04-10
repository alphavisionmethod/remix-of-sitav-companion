
# SITA OS — AI Governance Center: Final Audit & Fix Plan

## Audit Summary

All 10 admin pages exist and are routed. All database tables, views, RLS, and DB functions are complete. The SubNav and router are correctly wired. However, two pages have spec gaps:

### Gap 1 — AIG02 Model Registry missing 2 spec columns
The spec requires "quality tier" and "recommended uses" columns. The DB has both (`quality_tier`, `recommended_use_cases`) but the page does not display them. The `model_class` column is shown but labeled "Class" — this should be renamed or supplemented with quality_tier.

### Gap 2 — AIG03 Routing Matrix has no capability family filter
The spec requires: "filtering by capability family" and "highlighting expensive/premium routes". Currently it shows all routes flat with no filter UI. Premium routes are already visually distinguished via Badge variant, but there's no filter dropdown or button group.

### Gap 3 — AIG02 missing "active/inactive" display from `is_active` column
The spec requires showing active/inactive status. Currently it shows deprecated/launch_stage but not the `is_active` boolean.

### Gap 4 — Numbering mismatch: AIG05 file named "Receipts" but spec says AIG06
The file `AIG05ReceiptsExplorer.tsx` is still titled "AIG05" in its header, but per spec it should be AIG06. Similarly AIG06LaunchTruth should be AIG07 per spec numbering. The actual page content and routing are correct — it's only the internal `<h1>` label mismatch.

## Implementation Plan

### Step 1 — Enhance AIG02 Model Registry
Add `quality_tier`, `recommended_use_cases`, and `is_active` columns to the table:
- Add "Quality Tier" column after "Class" showing `m.quality_tier`
- Add "Recommended Uses" column showing `m.recommended_use_cases` (truncated text or tag list)
- Change "Status" column to show `is_active` state combined with deprecated/launch_stage

### Step 2 — Add capability family filter to AIG03 Routing Matrix
- Extract capability families from `capability_key` (prefix before first `.`)
- Add a filter button row at the top: "All", plus each unique family (e.g. "advisor", "boardroom", "daily_pulse", "classification", "memory", "admin")
- Add "Premium Only" toggle that highlights/filters premium_synthesis routes
- No structural change — just a `useState` filter + `useMemo` filtered list

### Step 3 — Fix page header numbering
- `AIG05ReceiptsExplorer.tsx` header: "AIG05" → "AIG06"
- `AIG06LaunchTruth.tsx` header: "AIG06" → "AIG07" (already says AIG06 but spec mapping is: Usage Ledger=AIG05, Receipts=AIG06, Launch Truth=AIG07)
- `AIG07LaunchTruth.tsx` header: keep as "AIG07" (already correct per the spec — this is the Launch Detail page)

Wait — re-checking: The SubNav goes Providers(01), Models(02), Routing(03), Budget(04), Usage Ledger(05), Receipts/Traces(06), Launch Truth(07), Launch Detail(08?), Degraded(08), Verification(09). The file naming is slightly off but the routing works. The key fix is just the `<h1>` labels for consistency.

Correction: Looking at spec numbering — AIG05=Usage Ledger, AIG06=Receipts, AIG07=Launch Truth, AIG08=Degraded. The files and headers should match.

Files to fix headers:
- `AIG05ReceiptsExplorer.tsx`: "AIG05" → "AIG06" in `<h1>`
- `AIG06LaunchTruth.tsx`: already says "AIG06" but should be "AIG07"
- The current SubNav "Launch Detail" page (AIG07LaunchTruth.tsx) is an enhanced version — keep at "AIG07" subtitle

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/AIG02ModelRegistry.tsx` | Add quality_tier, recommended_use_cases, is_active columns |
| `src/pages/admin/AIG03RoutingMatrix.tsx` | Add capability family filter buttons + premium highlight toggle |
| `src/pages/admin/AIG05ReceiptsExplorer.tsx` | Fix header label to "AIG06" |
| `src/pages/admin/AIG06LaunchTruth.tsx` | Fix header label to "AIG07" |

## What This Does NOT Change
- No database changes
- No new files
- No edge function changes
- No service layer changes
- No routing changes
