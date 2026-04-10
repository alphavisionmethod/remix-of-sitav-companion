

# SITA OS — Runtime Truth Activation: Final Gaps Audit & Fix Plan

## What's Already Implemented and Working

| Workstream | Status |
|-----------|--------|
| **A: AI Gateway ping** | Done — `body.ping` handler in `ai-gateway/index.ts` |
| **A: AIDegradedState component** | Done — `src/components/ai/AIDegradedState.tsx` (108 lines) |
| **A: AI degraded in AdvisorChat** | Partially done — shows `streamError` banner, but does NOT use `AIDegradedState` component |
| **B: Core substrate durability** | Done — EventBus, Memory, Receipt all persist to Supabase tables |
| **C: Boardroom mock gating** | Partially done — `ConfidenceLadder` gated (line 733), but `mockAdvisors` still imported unconditionally and used in `ExecutionTracker` fallback (line 771-775) |
| **C: AdvisorWorkspace mock gating** | Done — all mock usage gated behind `isDemoMode` with `return null` guards |
| **D: RevenueGate mock fix** | Done — live mode returns empty arrays |
| **D: RevenueCallingPage contacts/logs** | Done — gated behind `isDemoMode` |
| **D: DataModeContext live connectors** | Done — queries `connector_configs` from Supabase |
| **E: RuntimeTruthProbe** | Done — mounted in sidebar |
| **F: Degraded state taxonomy** | Done — `src/lib/degraded-state-classes.ts` |
| **F: DegradedStateBanner** | Done — `src/components/sita/truth/DegradedStateBanner.tsx` |
| **F: EmptyStateCTA mode-aware** | Done — accepts `mode` prop |
| **F: DemoGovernanceBanner** | Done — mounted in ShellLayout |

## Remaining Gaps (5 actionable items)

### Gap 1 — `use-business-data.ts` silently falls back to mock in live mode
Lines 16-18, 24-26, 33-34, 41-42: When real queries return empty or error, functions return `MOCK_*` data even in real mode. This is the exact "silent fallback-to-mock" pattern the prompt demands eliminating.

**Fix:** When mode is "real" and query returns empty/error, return empty array `[]` instead of mock data.

### Gap 2 — `RevenueCallingPage.tsx` uses `MOCK_SCRIPTS` unconditionally
Line 116: `const script = MOCK_SCRIPTS.find(...)` in `ActiveDialer` — no mode check. Line 486: scripts tab renders `MOCK_SCRIPTS.map(...)` unconditionally.

**Fix:** Gate `MOCK_SCRIPTS` usage behind `isDemoMode`. In live mode, show empty or "no scripts configured" state.

### Gap 3 — `Boardroom.tsx` ExecutionTracker has hardcoded mock fallback
Lines 771-775: When `overdueTasks.length === 0`, falls back to 3 hardcoded mock tasks regardless of mode. This creates "live intelligence" theater.

**Fix:** When not in demo mode and no real tasks exist, pass empty array. Only show hardcoded fallback in demo mode.

### Gap 4 — `AdvisorChat.tsx` doesn't use `AIDegradedState` component
Lines 321-329: Shows a basic inline error banner for `streamError` instead of using the canonical `AIDegradedState` component with retry, proper state mapping, and premium UX.

**Fix:** Replace inline error banner with `<AIDegradedState>` component import and usage.

### Gap 5 — `AdvisorWorkspace.tsx` AdvisorDetailView uses mocks unconditionally
Line 549: `const advisor = mockAdvisors.find(a => a.id === advisorId) || mockAdvisors[0]` — no mode guard. Lines 550-552 similarly use mock data for recs, proofs, memories.

**Fix:** Gate behind `isDemoMode`. In live mode, show empty/placeholder state for individual advisor detail.

## Implementation Plan

### File 1: `src/hooks/use-business-data.ts`
- Change all 4 fetch functions: when mode is "real" and query returns empty/error, return `[]` instead of mock data
- Keep mock returns only for non-"real" mode

### File 2: `src/pages/RevenueCallingPage.tsx`
- Gate `MOCK_SCRIPTS` usage in `ActiveDialer` behind `isDemoMode` (pass mode prop)
- Gate scripts tab rendering behind `isDemoMode`

### File 3: `src/pages/Boardroom.tsx`
- Gate ExecutionTracker hardcoded fallback behind `isDemoMode`
- In live mode with no tasks, pass empty array

### File 4: `src/components/sita/AdvisorChat.tsx`
- Import `AIDegradedState` from `@/components/ai/AIDegradedState`
- Replace inline error div (lines 321-329) with `<AIDegradedState state="error" reason={streamError} onRetry={() => streamClear()} />`

### File 5: `src/pages/advisors/AdvisorWorkspace.tsx`
- Gate `AdvisorDetailView` mock usage behind `isDemoMode`
- In live mode, show honest empty state for advisor detail

### Files Modified: 5
No new files created. Pure wiring and mock elimination.

