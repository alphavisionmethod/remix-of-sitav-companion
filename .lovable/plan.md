

# SITA OS Part 3 — Remaining Gaps After Audit

## What's Done (confirmed)
- App.tsx: 253 lines (down from 1,899), 9 route families created
- ShellLayout: 224 lines (down from 750), 3 sub-layers extracted
- 4 domain homes (Business, Money, Concierge, Files) on new card system
- 12 module pages have PageTruthBanner
- BoardroomCinematic in BusinessBoardroom + MoneyBoardroom
- ComparisonCard + ProofCard in boardrooms and 9 pages
- Empty state backward-compat shims created
- AppOpenCeremony wired into DomainAppShell

## What's NOT Done (6 concrete gaps)

### Gap 1: FinanceBoardroom + ConciergeBoardroom Still Legacy
Both still import `SitaCard`, `SitaSectionHeader`. Neither has `BoardroomCinematic`, `ComparisonCard`, or `ProofCard`. The plan explicitly required all 4 boardrooms to be upgraded.

**Action:** Rewrite both with BoardroomCinematic entry, ComparisonCard for scenarios, ProofCard for evidence, AdvisorCard for domain advisor, PageTruthBanner.

### Gap 2: DailyPulse — Flagship Surface Not Migrated
DailyPulse uses raw `motion.div` and custom cards. Zero new design system imports. This is one of the 8 required flagship surfaces.

**Action:** Rewrite DailyPulse using HeroCard (morning summary), QueueCard (cross-domain priorities), StatusCard (domain pulse KPIs), AdvisorCard (daily advisor insight), PageTruthBanner, ListReveal for stagger.

### Gap 3: 6 High-Impact Module Pages Still Legacy
These frequently-visited pages still use old `SitaCard`/`SitaPageHeader`:

| Page | Old refs |
|------|----------|
| `TaxEstimator.tsx` | 18 |
| `ReceivablesObligations.tsx` | 24 |
| `ServiceProviders.tsx` | 3 |
| `ErrandsLogistics.tsx` | 12 |
| `HouseholdCommandCenter.tsx` | 15 |
| `ProofCenter.tsx` | 3 |

**Action:** Migrate all 6 to new card family + PageTruthBanner + ListReveal.

### Gap 4: Context Consolidation Not Done
`DataModeContext`, `DemoModeProvider`, and `DisplayModeContext` still exist as separate contexts. The plan called for unifying into one reality/truth provider with shim re-exports.

**Action:** Create unified `RealityModeProvider` exposing `mode`, `isDemo`, `isReal`, `source`, `freshness`. Make `useDataMode()` and `useDemoMode()` become shim re-exports from it.

### Gap 5: Command System Not Consolidated
6+ command components remain: `CommandPalette`, `UniversalCommand`, `UniversalCommandSurface`, `DomainCommandPalette`, `AdminCommandPalette`, `AutopilotCommandCenter`. No canonical ownership established.

**Action:** Keep `CommandPalette` (OS-level), `DomainCommandPalette` (app-scoped), `AdminCommandPalette` (admin). Make `UniversalCommand`, `UniversalCommandSurface`, `AutopilotCommandCenter` into deprecation shims that re-export from `CommandPalette`.

### Gap 6: PremiumEmptyState Not Wired as Canonical
`PremiumEmptyState` exists separately from `EmptyState`. The old `EmptyState` has shims pointing to it, but `PremiumEmptyState` is the intended canonical version per the plan. They're two parallel systems.

**Action:** Make `EmptyState` re-export from `PremiumEmptyState` with prop mapping. Ensure all `connect-to-activate` and `degraded` variants work.

---

## Implementation Order

| Phase | Work | Files |
|-------|------|-------|
| **A** | FinanceBoardroom + ConciergeBoardroom rewrite | 2 files |
| **B** | DailyPulse flagship rewrite | 1 file |
| **C** | Migrate 6 remaining high-impact pages | 6 files |
| **D** | Context consolidation (unified RealityModeProvider + shims) | 3-4 files |
| **E** | Command system deprecation shims | 3 files |
| **F** | PremiumEmptyState as canonical + shim wiring | 2 files |

**Result:** After this phase, 27+ pages use the new design system, all 4 boardrooms have cinematic entries, DailyPulse is flagship-grade, contexts are unified, and command/empty-state sprawl is resolved.

