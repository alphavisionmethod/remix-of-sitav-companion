
# SITA OS — Full Acceptance Audit Report

## 1. Executive Verdict

**The implementation is architecturally ambitious and structurally sound at the engine layer, but the surface layer is bloated, inconsistently wired, and riddled with mock data that violates the "no stubs" mandate.** TypeScript compiles cleanly (0 errors). The engine layer (12 engines in `src/lib/engines/`) is well-designed. The critical failure is at the integration seam: most pages do NOT use `useOSRuntime`, creating a two-tier system where ~10 pages use real engines and ~100+ pages run on hardcoded mock data.

---

## 2. Scores by Category

| Category | Score | Rationale |
|---|---|---|
| Architecture | 72/100 | Clean engine layer, but OwnerCenter (2334 lines) is a god-component hiding 20+ subpages of business logic. Pages are NOT thin surfaces. |
| Integration | 45/100 | Only 10 of ~120 pages use `useOSRuntime`. SystemStatus, ObservabilityPage, WorkflowReplayHub, PolicySimulatorHub, DailyPulse, ProofCenter, RecoveryCenter — none import engines or the runtime hook. |
| Trust | 60/100 | Trust types exist. Proof packet engine exists. But most pages don't generate or consume proof data from the shared engine. Trust badges are present but not wired to live engine state on most surfaces. |
| UX Coherence | 65/100 | Shared component primitives (SitaCard, AdminPageHeader, TrustBadge) used widely. But 30+ pages still use hardcoded `mock`/`MOCK_`/`demo` data arrays inline. |
| Test Coverage | 20/100 | 41 test files exist but `example.test.ts` is `expect(true).toBe(true)`. Tests are scaffolds, not real assertions against engine behavior. |
| Release Readiness | 35/100 | CI scripts exist (8 validators). No test runner in CI. No route-drift or engine-usage validators. No check that pages use `useOSRuntime`. |

---

## 3. Things Done Correctly

- **Engine layer is solid**: 12 engines in `src/lib/engines/` with clean separation (action-state-machine, entity-role-graph, memory-governance, advisor-orchestration, policy-depth-engine, revenue-opportunity, digital-twin, token-governance, connector-concierge, replay-recovery, enterprise-maturity)
- **`useOSRuntime` hook** is well-designed as singleton pattern with all engines accessible
- **No local engine instantiation** in any page (grep confirms zero `new *Engine()` in pages/)
- **Barrel exports** are clean (`src/lib/engines/index.ts`)
- **0 TypeScript errors** — full compilation passes
- **253 routes** are registered with proper lazy loading
- **Shared types** exist (`os-unified.types.ts`, `admin-view-models`, `mission-control.types`)
- **8 CI validators** for boundary checking, import rules, single-brain enforcement
- **Domain isolation** enforced (business-os, finance-os, concierge-os cannot cross-import)
- **Shared admin components** (`SitaCard`, `AdminPageHeader`, `TrustBadge`, `StateBadge`) used broadly

---

## 4. Things Partially Correct

- **OwnerCenter** (2334 lines): Uses `useOSRuntime` BUT also imports `mockAITeam, mockCosts, mockConnectors` from `@/lib/mocks`. It's a massive god-component containing 20+ tab implementations inline instead of split into sub-components.
- **MissionControlPage** (1233 lines): Uses `useOSRuntime` via context BUT also imports from `@/lib/mocks`. Phase 6 panels were wired in but the core tabs still consume mock data through admin hooks that return hardcoded data.
- **Policy Simulator**: Two separate implementations exist — `PolicySimulatorHub.tsx` (132 lines, preset-based) and `mission/PolicySimulatorPage.tsx` (233 lines, scenario-builder). Both use `GovernanceSimulatorService` (correct shared service), but represent duplicated surface logic.
- **Workflow Replay**: Three surfaces — `WorkflowReplayHub.tsx` (107 lines, uses `mockReplayable` array), `mission/MissionWorkflowReplayPage.tsx` (173 lines, hardcoded `workflowData`), `boardroom/BoardroomReplay.tsx` (367 lines). None use the `ReplayRecoveryEngine` from `useOSRuntime`.
- **Boardroom.tsx** (881 lines): Uses `useOSRuntime` and wires twin/scenario/boardroom engines. Good integration but still large.

---

## 5. Things That Are Wrong

1. **`@/lib/mocks` is still imported by 5 page files** — OwnerCenter, MissionControlPage, Boardroom, SystemStatus, AdvisorWorkspace. This directly violates the "no stubs/mocks" mandate.
2. **~110 pages do NOT use `useOSRuntime`** — they are entirely self-contained with local state and inline mock data. This means the engine layer is decorative for most of the app.
3. **OwnerCenter is a 2334-line monolith** — it contains business logic for incidents, policies, fleet, AI costs, trust center, releases, model routing, knowledge, support, change review, rollback center, system map, autopilot, and billing, ALL inline. This violates "pages are thin surfaces."
4. **WorkflowReplayHub uses `mockReplayable` array** — hardcoded data, not wired to `ReplayRecoveryEngine`.
5. **ObservabilityPage does NOT import any engine** — the `ObservabilityEngine` exists in Phase 6 but the page doesn't use it.
6. **SystemStatus does NOT import any engine** — despite engines being available.
7. **41 test files exist but are largely scaffolds** — `example.test.ts` is `expect(true).toBe(true)`.

---

## 6. Duplicated Systems / Route Overlaps

| Duplication | Files |
|---|---|
| Policy Simulator × 2 | `PolicySimulatorHub.tsx` + `mission/PolicySimulatorPage.tsx` |
| Workflow Replay × 3 | `WorkflowReplayHub.tsx` + `mission/MissionWorkflowReplayPage.tsx` + `boardroom/BoardroomReplay.tsx` |
| Owner surfaces × 2 | `OwnerCenter.tsx` (20+ tabs) + `owner-mode/OwnerModePage.tsx` (separate simplified view) |
| Observability × 2 | `ObservabilityPage.tsx` + `EnterpriseMaturityDashboard.tsx` (Observability tab) |
| Trust center × 2 | OwnerCenter trust-center tab + EnterpriseMaturityDashboard trust tab |
| Support × 2 | OwnerCenter support tab + EnterpriseMaturityDashboard support tab |
| Releases × 2 | OwnerCenter releases tab + EnterpriseMaturityDashboard releases tab |

---

## 7. Route Issues

- `/policy-simulator` and `/mission/policies/simulate` are separate pages with separate logic (should be one component)
- `/workflow-replay` has hardcoded mocks; `/mission/workflows/:id/replay` has separate hardcoded mocks
- `/owner` has 28 sub-routes ALL pointing to `OwnerCenter` (monolith)
- `/enterprise-maturity` duplicates content already in `/owner` tabs (trust, releases, support)
- `/observability` page exists but doesn't use `ObservabilityEngine`

---

## 8. Contract/Schema Issues

- No issues — shared types in `os-unified.types.ts`, `admin-view-models`, engine types are properly exported
- Engine type exports are clean through barrel files

---

## 9. Import/Export Issues

- 5 pages import from `@/lib/mocks` — must be eliminated
- `ObservabilityPage`, `SystemStatus`, `WorkflowReplayHub`, `PolicySimulatorHub`, `DailyPulse`, `ProofCenter`, `RecoveryCenter`, `PolicyEditor` — none import `useOSRuntime`

---

## 10. Service Wiring Issues

- Admin hooks (`useAdminIncidents`, `useFleetHealth`, etc.) return hardcoded mock data, not engine data. These are the primary data source for OwnerCenter and MissionControl.
- `useRecoverySummary` used by WorkflowReplayHub does not connect to `ReplayRecoveryEngine`
- `GovernanceSimulatorService` (used by both policy simulators) is a separate service not connected to `PolicyDepthEngine`

---

## 11. UX Coherence Issues

- OwnerCenter and OwnerModePage are two separate owner experiences with different data sources
- EnterpriseMaturityDashboard replicates 4 tabs from OwnerCenter (trust, releases, support, connector governance)
- No consistent empty/loading/error states across pages that don't use shared primitives
- 30+ pages have inline `const mock*` arrays as their data source

---

## 12. Trust/Proof/Replay Issues

- `ComplianceAuditEngine` generates proof packets but no page consumes them in a live flow
- `ReplayRecoveryEngine` exists but zero pages use it for replay
- Workflow replay pages all use hardcoded event sequences
- Trust badges render but aren't updated from live `ObservabilityEngine.getTrustPostureDashboard()`

---

## 13. Test and CI Gaps

- 41 test files, but `example.test.ts` is trivial. Need to verify if others have real assertions.
- No CI validator checks that pages use `useOSRuntime` instead of local mocks
- No route-drift validator (checking for duplicate route destinations)
- No mock-usage validator (detecting `@/lib/mocks` imports)
- Test runner not wired into `validate-all.ts`

---

## 14. Files That Must Be Changed Immediately

1. **`src/pages/OwnerCenter.tsx`** — Extract 20 tab implementations into sub-components, wire all to `useOSRuntime`
2. **`src/pages/WorkflowReplayHub.tsx`** — Replace `mockReplayable` with `useOSRuntime().engines.replay`
3. **`src/pages/mission/MissionWorkflowReplayPage.tsx`** — Replace hardcoded `workflowData` with engine data
4. **`src/pages/ObservabilityPage.tsx`** — Wire to `useOSRuntime().engines.observability`
5. **`src/pages/SystemStatus.tsx`** — Wire to `useOSRuntime().engines.observability`
6. **`src/hooks/use-admin-data.ts`** — Replace hardcoded returns with engine-backed data (accept runtime as parameter)

---

## 15. Files That Should Be Merged

| Merge Target | Source Files |
|---|---|
| Single PolicySimulator component | `PolicySimulatorHub.tsx` + `mission/PolicySimulatorPage.tsx` |
| Single WorkflowReplay flow | `WorkflowReplayHub.tsx` + `mission/MissionWorkflowReplayPage.tsx` |
| EnterpriseMaturityDashboard tabs INTO OwnerCenter | Remove duplicate trust/releases/support/observability tabs from Enterprise page OR remove those tabs from OwnerCenter |

---

## 16. Files That Should Be Redirected

- `/enterprise-maturity` → either merge into `/owner` or make it the canonical location and remove overlapping OwnerCenter tabs
- `/policy-simulator` and `/mission/policies/simulate` → one canonical route
- `/workflow-replay` and `/mission/workflows/:id/replay` → one canonical flow

---

## 17. Files That Should Be Deleted or Deprecated

- `src/test/example.test.ts` — trivial placeholder
- `@/lib/mocks` usage should be deprecated once admin hooks are wired to engines

---

## 18. Fixes Required Before Considering This Correct

1. Wire `useOSRuntime` into ALL admin/control surfaces (ObservabilityPage, SystemStatus, WorkflowReplayHub, PolicySimulatorHub, DailyPulse, ProofCenter, RecoveryCenter)
2. Eliminate all `@/lib/mocks` imports from pages
3. Split OwnerCenter into sub-components (< 400 lines per file)
4. Merge duplicate policy simulator pages
5. Merge duplicate replay surfaces
6. Resolve overlap between EnterpriseMaturityDashboard and OwnerCenter tabs
7. Wire admin hooks (`useAdminIncidents`, etc.) to return data from engines

---

## 19. Fixes Required Before Considering This Launchable

1. All items from section 18
2. Real test assertions in at least 10 core test files (engines, hooks, admin data)
3. Add CI validator: "no page may import from `@/lib/mocks`"
4. Add CI validator: "all admin pages must import `useOSRuntime`"
5. Run `vitest` in `validate-all.ts`
6. Verify all 253 routes render without crash (automated smoke test)

---

## 20. Implementation Order for Remaining Fixes

1. **Wire admin hooks to engines** — single highest-leverage fix, unblocks everything
2. **Wire `useOSRuntime` into 8 unwired admin pages** — ObservabilityPage, SystemStatus, WorkflowReplayHub, etc.
3. **Eliminate `@/lib/mocks` imports** from all 5 pages
4. **Split OwnerCenter** into sub-component files (< 400 lines each)
5. **Merge duplicate policy simulator** pages into one shared component
6. **Merge duplicate replay** surfaces into one shared component
7. **Resolve EnterpriseMaturityDashboard vs OwnerCenter overlap** — pick canonical home
8. **Write real test assertions** for core engines
9. **Add CI validators** for mock-import and engine-usage enforcement
10. **Automated route smoke test** for all 253 routes
