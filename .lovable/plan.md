

# AI Engineering Board — Final Wiring Enhancement Plan

## Current State: 95% Complete

All 17 pages are built, all routes wired, sidebar has AI Engineering group, 9 backend intelligence layers exist, 8 CRUD data services exist, zero TypeScript errors.

## Remaining Gaps

**5 pages still use raw `useDataMode()` instead of `useAIEngDomain` hook:**
1. `AIApprovalDesk.tsx` — uses `DEMO_APPROVALS` directly, no live data path
2. `AIReleasesCenter.tsx` — uses `DEMO_ENVIRONMENTS`/`DEMO_RELEASE_GATES` directly
3. `AIRootCauseGraph.tsx` — uses `DEMO_GRAPH_NODES`/`DEMO_GRAPH_EDGES` directly
4. `AITimeMachine.tsx` — uses `DEMO_TIMELINE` directly
5. `AIHumanBoundaryControls.tsx` — uses `DEMO_AGENT_BOUNDARIES` directly
6. `AIEvidenceBundleComposer.tsx` — uses `DEMO_BUNDLE_ITEMS` directly

**These 6 pages cannot switch to live Supabase data because:**
- No corresponding CRUD services exist for approvals, releases, root-cause, timeline, boundary-controls, or evidence-bundles in `ai-ops-data-service.ts`
- The existing 8 `ai_*` tables don't directly map to these domains

## Plan

### Step 1: Extend `useAIEngineeringData` hook with fallback domains
Add new domain mappings to the hook that use existing tables where possible:
- `approvals` → query `pending_approvals` table
- `violations` → already mapped (use for boundary-related data)
- For domains without direct tables (releases, root-cause, timeline, boundary-controls, evidence-bundles), create "virtual" fetchers that derive data from existing tables (e.g., `audit_logs` for timeline, `ai_change_plans` for approvals)

### Step 2: Wire remaining 6 pages to use `useAIEngDomain`
Update each page to import and use the hook with demo fallback, same pattern as the other 11 pages:
- `AIApprovalDesk.tsx` → `useAIEngDomain("changePlans", DEMO_APPROVALS)` + filter for pending
- `AIReleasesCenter.tsx` → `useAIEngDomain("efficiencyScores", DEMO_RELEASE_GATES)` for gate data
- `AIRootCauseGraph.tsx` → `useAIEngDomain("violations", DEMO_GRAPH_NODES)` for root-cause
- `AITimeMachine.tsx` → `useAIEngDomain("changePlans", DEMO_TIMELINE)` for timeline
- `AIHumanBoundaryControls.tsx` → `useAIEngDomain("efficiencyScores", DEMO_AGENT_BOUNDARIES)`
- `AIEvidenceBundleComposer.tsx` → `useAIEngDomain("missions", DEMO_BUNDLE_ITEMS)`

### Step 3: Add CRUD services for 3 new domain mappings
Extend `ai-ops-data-service.ts` with:
- `aiApprovals` → CRUD on `pending_approvals` table
- `aiAuditTimeline` → read-only on `audit_logs` table
- `aiSelfHealingRules` → CRUD on `ai_self_healing_rules` table

### Step 4: Extend `useAIEngineeringData` hook
Add 3 new domain types to the hook: `"approvals" | "auditTimeline" | "selfHealingRules"` mapping to the new CRUD services.

### Step 5: Re-wire remaining pages to proper data sources
- `AIApprovalDesk.tsx` → `useAIEngDomain("approvals", DEMO_APPROVALS)`
- `AITimeMachine.tsx` → `useAIEngDomain("auditTimeline", DEMO_TIMELINE)`
- `AISelfHealing.tsx` → also query `useAIEngDomain("selfHealingRules", DEMO_RULES)` for rules tab

### Step 6: Verify zero TypeScript errors
Run `tsc --noEmit` to confirm everything compiles.

## Technical Details

**Modified files:**
- `src/lib/data-services/ai-ops-data-service.ts` — add 3 new CRUD services
- `src/hooks/use-ai-engineering-data.ts` — add 3 new domain types + fetchers
- `src/pages/admin/AIApprovalDesk.tsx` — wire to hook
- `src/pages/admin/AIReleasesCenter.tsx` — wire to hook
- `src/pages/admin/AIRootCauseGraph.tsx` — wire to hook
- `src/pages/admin/AITimeMachine.tsx` — wire to hook
- `src/pages/admin/AIHumanBoundaryControls.tsx` — wire to hook
- `src/pages/admin/AIEvidenceBundleComposer.tsx` — wire to hook

**No new tables or migrations needed** — all referenced tables already exist.

