

# Wire 40 Pages with isDemoMode Gates

## Scope

40 files currently lack `useDataMode`/`isDemoMode`. They break into two groups:

### Group A: 15 Investment Office pages (data-heavy, need full wiring)
These pages import mock data constants (INSTRUMENTS, PORTFOLIO, etc.) directly and have Supabase hooks imported but unused for gating. Each needs:
1. Add `import { useDataMode } from "@/contexts/DataModeContext"`
2. Add `const { isDemoMode } = useDataMode()` inside the component
3. Gate data: use mock constants when `isDemoMode`, use live hook data when not

**Files:**
- AdvancedMode, AdvisorBoard, EventMarketsWorkspace, ExecutionDesk, InstrumentDetail
- IntelligenceDossier, InvestmentBoardroom, InvestmentGate, MarketExplorer, PortfolioOffice
- ResearchLibrary, RiskOffice, StrategyStudio, ThesisJournal, WatchlistsSignals

**Pattern per file:**
```tsx
import { useDataMode } from "@/contexts/DataModeContext";

export default function PortfolioOffice() {
  const { isDemoMode } = useDataMode();
  const { data: livePositions, isLoading } = usePortfolioPositions();
  
  // Gate: demo uses mock constants, live uses Supabase data
  const positions = isDemoMode ? PORTFOLIO.holdings : (livePositions ?? []);
  // ... rest of component
}
```

### Group B: 24 Revenue Office onboarding screens + LearnLaterPage (no data)
These are pure UI/form screens with zero external data fetches. They collect user input during onboarding — no mock data to gate.

**Action:** Add a minimal `useDataMode` import and `isDemoMode` const for consistency (future-proofing), but no data gating needed since there's no data to gate. Alternatively, skip these since they are purely presentational.

### Group C: 1 utility page
- **LearnLaterPage** — wrapper component, no data. Add minimal isDemoMode for consistency.

## Implementation approach

A Python automation script will:
1. For each of the 15 investment pages: inject `useDataMode` import + `isDemoMode` const after the component function declaration
2. For the 24 onboarding screens + LearnLaterPage: inject minimal `useDataMode` import + gate for consistency
3. Verify with `npx tsc --noEmit` — 0 errors

## Files changed
- 15 Investment Office pages (full data gating)
- 24 onboarding screens + 1 primitives file + FormationShell (minimal gate)
- 1 LearnLaterPage (minimal gate)
- **Total: 41 files**

