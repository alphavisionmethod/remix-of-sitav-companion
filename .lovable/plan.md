
# SITA OS — AI Engineering Team: Final Gaps & Fix Plan

## Audit Result

The AI Engineering Team system is **~97% built**. All 12 DB tables, the edge function with full AI gateway integration, budget policy engine, workforce executor, 8 admin pages, routes, hooks, and seed data exist. Three gaps remain:

## Gap 1 — No SubNav for AIT pages
AIG pages have `AIGSubNav` for cross-navigation between all AIG01–AIG09 pages. AIT pages have NO SubNav — users must navigate via sidebar or URL only. This breaks the "premium, deeply operable" admin experience requirement (Part 5).

**Fix:** Create `src/components/admin/AITSubNav.tsx` (same pattern as AIGSubNav) with links to all 9 AIT pages. Add it to each AIT page.

## Gap 2 — Sidebar link goes to wrong route
`AppSidebar.tsx` line 98 links "AI Team" to `/admin/ai-team-roster` (the old AITeamRoster page) instead of `/admin/ai-team` (the new AIT01 overview).

**Fix:** Update sidebar link from `/admin/ai-team-roster` to `/admin/ai-team`.

## Gap 3 — AIT04to08Boards unused `useAction` import
Line 1 imports `useAction` but it's only used in the approval queue section for a pattern that could be simplified. The import is fine (file exists) but adds an unnecessary dependency. Minor cleanup.

**Fix:** Remove unused import if confirmed not used in any rendering path.

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/AITSubNav.tsx` | **New** — SubNav component for all AIT pages |
| `src/pages/admin/AIT01TeamOverview.tsx` | Add AITSubNav |
| `src/pages/admin/AIT02RoleRegistry.tsx` | Add AITSubNav |
| `src/pages/admin/AIT03TaskInvocation.tsx` | Add AITSubNav |
| `src/pages/admin/AIT04to08Boards.tsx` | Add AITSubNav to each board, remove unused import |
| `src/pages/admin/AIT05CostEfficiency.tsx` | Add AITSubNav |
| `src/pages/admin/AITSetupChecklist.tsx` | Add AITSubNav |
| `src/components/sita/AppSidebar.tsx` | Fix link to `/admin/ai-team` |

## What Already Works (Verified)
- All 12 DB tables exist with correct schemas
- Edge function `admin-ai-workforce-run` deployed with full AI gateway integration, budget policy checks, caching, fallback, approval queue routing, and receipt logging
- `workforce-executor.ts` routes through sovereign AI gateway with pre-flight budget enforcement
- `admin-budget-routing-policy.ts` implements all 5 budget classes, role policies, thresholds, and cost-saving suggestions
- All 10 seed roles, 12 task types, 5 budget classes with permission matrix
- All hooks: `useAIWorkforceRoles`, `useAIWorkforceInvocations`, `useAIWorkforceRecommendations`, `useAIWorkforceApprovalQueue`, `useAIWorkforceCosts`, `useAIWorkforceOverview`
- `AIWorkforceInvocationPanel` component for displaying results with receipts
- All AIT routes wired in App.tsx (10 routes under `/admin/ai-team/*`)

## What This Does NOT Change
- No database changes
- No edge function changes
- No new hooks or services
- No seed data changes
