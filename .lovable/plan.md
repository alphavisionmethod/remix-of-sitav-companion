

# Take Calendar, Owner Center, Apple Ecosystem, Android Ecosystem to 100%

## Current State

| Area | Status | Issue |
|---|---|---|
| **Calendar** | 60% SIMULATED | Uses hardcoded `DEMO_CALENDAR_EVENTS` directly, no mode-aware hook, no Supabase query |
| **Owner Center** | 70% SIMULATED | Imports `buildMockSimResult` from legacy `useDomainMockData`, has `ENGINE_COSTS` hardcoded inline |
| **Apple Ecosystem** | 80% STRUCTURAL | APL01 is DB-connected (good), but AND01 pattern not applied; missing ecosystem data service layer, no Android seed integration |
| **Android Ecosystem** | 80% STRUCTURAL | AND01 uses 100% hardcoded `SURFACES`/`CAPS` arrays — zero DB hooks, no seed button, no real data path |
| **OutcomeEnginePage** | BROKEN | Corrupted from prior edit — orphan array literals after line 23 causing build failure |

## Fix 1: OutcomeEnginePage — Fix Build Error (CRITICAL)

The file has a corrupted edit: lines 19-23 import from demo-data and alias to `MOCK_*`, but lines 24-72 contain orphan array literals from the old inline data that was supposed to be removed.

**Action**: Rewrite `OutcomeEnginePage.tsx` to:
- Import from `@/lib/demo-data/outcome-engine` (already exists)
- Remove orphan inline arrays (lines 24-72)
- Use `DEMO_OUTCOMES`, `DEMO_INTERVENTIONS`, `DEMO_SPILLOVERS` directly

## Fix 2: Calendar — Mode-Aware with Supabase Fallback

Current: page imports `DEMO_CALENDAR_EVENTS` statically and uses it directly. A `calendar-data-service.ts` already exists with `fetchCalendarEvents()` that queries Supabase `events` table with demo fallback.

**Action**:
1. Create `src/hooks/use-calendar-data.ts` — React Query hook wrapping `fetchCalendarEvents`, mode-aware via `useDataMode()`
2. Update `CalendarWorkspace.tsx` to use the hook instead of static import — show real events in real mode, demo in demo mode
3. Add proper loading/empty states

## Fix 3: Owner Center — Remove Legacy Imports

Current: imports `buildMockSimResult` from `useDomainMockData`, has `ENGINE_COSTS` hardcoded.

**Action**:
1. Move `ENGINE_COSTS` to `src/lib/demo-data/owner-center.ts`
2. Change `buildMockSimResult` import to point directly at `@/lib/mock-data/owner-center` (where it already lives)
3. Create `src/lib/data-services/owner-center-data-service.ts` with mode-aware cost fetching
4. Create hook in `src/hooks/use-owner-data.ts`
5. Update `OwnerCenter.tsx` to use new imports

## Fix 4: Android Ecosystem — DB-Connected (Match Apple Pattern)

Current: AND01 uses hardcoded `SURFACES` and `CAPS` arrays with zero DB integration. Apple (APL01) already uses `useEcosystemDevices("apple")`, `useEcosystemLaunchReadiness()`, etc.

**Action**:
1. Update `AND01AndroidEcosystemCenter.tsx` to use existing `useEcosystemDevices("android")`, `useEcosystemLaunchReadiness("android")`, `useEcosystemTrustRecords("android")` hooks (they already support `"android"` as ecosystem param)
2. Add seed button using existing `useSeedEcosystemData()` mutation
3. Keep `SURFACES` metadata as display config but render real device data when available
4. Add loading/empty states matching APL01 pattern
5. Verify the `ecosystem-operations` edge function handles `"android"` seeding

## Fix 5: Apple Ecosystem — Complete Missing Pieces

APL01 is already well-connected. Minor gaps:

**Action**:
1. Add wearable config display using existing `useEcosystemWearableConfigs("apple")` hook
2. Add push route display using existing `useEcosystemPushRoutes("apple")` hook
3. Add continuity events tab using existing `useEcosystemContinuityEvents("apple")` hook
4. These hooks already exist but aren't wired into the UI

## Implementation Order

1. Fix OutcomeEnginePage build error (unblocks everything)
2. Calendar mode-aware hook + page update
3. Owner Center legacy import cleanup
4. Android Ecosystem DB connection
5. Apple Ecosystem remaining hook wiring
6. Run architecture validation scripts to confirm zero violations

## Files Changed

| File | Action |
|---|---|
| `src/pages/OutcomeEnginePage.tsx` | Fix corrupted edit |
| `src/hooks/use-calendar-data.ts` | New hook |
| `src/pages/CalendarWorkspace.tsx` | Use hook |
| `src/lib/demo-data/owner-center.ts` | New demo data |
| `src/hooks/use-owner-data.ts` | New hook |
| `src/lib/data-services/owner-center-data-service.ts` | New service |
| `src/pages/OwnerCenter.tsx` | Remove legacy imports |
| `src/pages/admin/AND01AndroidEcosystemCenter.tsx` | DB-connect |
| `src/pages/admin/APL01AppleEcosystemCenter.tsx` | Wire remaining hooks |

