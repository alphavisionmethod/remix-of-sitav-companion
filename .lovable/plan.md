

# SITA OS — Complete Test Coverage & Build Fix Plan

## Build Status
- TypeScript: 0 errors (clean)
- Vitest: **1 failing test** — `src/test/scripts-validation.test.ts` expects 42 scripts but finds 43

## What Exists Now

| Category | Files | Tests |
|----------|-------|-------|
| Unit tests (co-located `__tests__/`) | 25 | ~214 |
| Unit tests (legacy `src/test/`) | 52 | ~1267 |
| E2E (Playwright) | 7 | ~35 |
| **Total** | **77 files** | **1482 tests (1 failing)** |

## What's Missing

### 1. Fix the Failing Test (BLOCKER)
`src/test/scripts-validation.test.ts` line 67-69: hardcoded `expect(total).toBe(42)` but there are now 43 scripts. Change to `toBe(43)`.

### 2. Hook Tests (0 of 42 hooks tested)
No hook has a dedicated `__tests__/` file. The plan called for 6 hook test files — none were created:

| File to Create | What it Tests |
|----------------|---------------|
| `src/hooks/__tests__/use-global-search.test.ts` | Query state, filtering, empty results |
| `src/hooks/__tests__/use-brain-core.test.ts` | Message sending, advisor routing, mode handling |
| `src/hooks/__tests__/use-domain-data.test.ts` | Data resolution by mode, fallback behavior |
| `src/hooks/__tests__/use-proof-chain.test.ts` | Chain building, verification, integrity |
| `src/hooks/__tests__/use-admin-data.test.ts` | Admin data fetching, CAI hook wiring |
| `src/hooks/__tests__/use-reality-provider.test.ts` | `resolveByMode` with real/demo/empty data |

### 3. Context Provider Tests (1 of 9 contexts tested)
Only `DemoModeProvider` has tests. Missing:

| File to Create | What it Tests |
|----------------|---------------|
| `src/contexts/__tests__/DataModeContext.test.tsx` | isDemoMode toggle, default state |
| `src/contexts/__tests__/AuthContext.test.tsx` | Auth state, loading, session handling |
| `src/contexts/__tests__/ThemeContext.test.tsx` | Theme toggle, dark mode default |
| `src/contexts/__tests__/ConnectivityContext.test.tsx` | Online/offline detection |

### 4. Component Tests (3 of ~50 components tested)
Only DemoModeBadge, SitaCard, EmptyStateCard tested. Missing from plan:

| File to Create | What it Tests |
|----------------|---------------|
| `src/components/sita/__tests__/SitaPageHeader.test.tsx` | Title, subtitle, actions rendering |
| `src/components/sita/__tests__/PageSkeleton.test.tsx` | Loading skeleton renders |
| `src/components/sita/__tests__/StateBadge.test.tsx` | Badge variant rendering |
| `src/components/sita/__tests__/TrustBadge.test.tsx` | Trust level display |
| `src/components/sita/__tests__/ShellLayout.test.tsx` | Layout with sidebar + content |

### 5. Page Integration Tests (1 of 7 planned)
Only NotFound tested. Missing:

| File to Create | What it Tests |
|----------------|---------------|
| `src/pages/__tests__/DailyPulse.test.tsx` | KPI cards render in demo mode |
| `src/pages/__tests__/BusinessCenter.test.tsx` | CRM section renders |
| `src/pages/__tests__/MoneyCenter.test.tsx` | Financial overview renders |
| `src/pages/__tests__/Boardroom.test.tsx` | Boardroom + DemoModeBadge |
| `src/pages/__tests__/SettingsPage.test.tsx` | Settings form renders |
| `src/pages/__tests__/PersonalBrain.test.tsx` | Chat interface renders |

### 6. Service Tests (Missing from plan)
Key services with no dedicated `__tests__/`:

| File to Create | What it Tests |
|----------------|---------------|
| `src/lib/services/model-router/__tests__/model-router.test.ts` | Model selection by advisor/intent |
| `src/lib/services/auth/__tests__/auth-service.test.ts` | Auth state management |
| `src/lib/services/billing/__tests__/billing-service.test.ts` | Billing calculation, tier enforcement |
| `src/lib/services/sovereign-calculation/__tests__/sovereign-calc.test.ts` | Sovereignty score calculation |
| `src/lib/services/self-healing/__tests__/self-healing.test.ts` | Detection + auto-remediation |
| `src/lib/services/payment-execution-service/__tests__/payment-execution.test.ts` | Payment validation flow |

### 7. E2E Tests (Missing from plan)
7 E2E specs exist. Plan called for 8 more — none created:

| File to Create | What it Tests |
|----------------|---------------|
| `e2e/daily-pulse.spec.ts` | Daily Pulse loads, KPI tiles visible |
| `e2e/money-center.spec.ts` | Money Center loads, tabs work |
| `e2e/boardroom.spec.ts` | Boardroom slides + DemoModeBadge |
| `e2e/command-palette.spec.ts` | Open palette, type, select result |
| `e2e/admin-routes.spec.ts` | Admin pages all load without crash |
| `e2e/owner-mode.spec.ts` | Owner center, approvals, policy editor |
| `e2e/responsive.spec.ts` | Key pages at 375px and 1280px |
| `e2e/advisor-chat.spec.ts` | Chat input, send message, response |

### 8. Persistence Tests (1 of 4 planned)
Only `persistable.test.ts` exists. Missing:

| File to Create | What it Tests |
|----------------|---------------|
| `src/lib/persistence/__tests__/event-bus-persistence.test.ts` | Event serialization, persist call |
| `src/lib/persistence/__tests__/policy-engine-persistence.test.ts` | Policy evaluation persistence |
| `src/lib/persistence/__tests__/supabase-adapters.test.ts` | Adapter creation, table mapping |

### 9. Cross-Domain & Kernel Tests
| File to Create | What it Tests |
|----------------|---------------|
| `src/lib/__tests__/cross-domain.test.ts` | Cross-domain data point building |
| `src/lib/__tests__/sita-kernel.test.ts` | Kernel init, event dispatch |
| `src/lib/__tests__/continuity-engine.test.ts` | Continuity state management |

---

## Implementation Order

1. Fix the 1 failing test (scripts count 42→43)
2. Create 6 hook tests
3. Create 4 context provider tests
4. Create 5 component tests
5. Create 6 page integration tests
6. Create 6 service tests
7. Create 3 persistence tests
8. Create 3 utility/kernel tests
9. Create 8 E2E specs
10. Run full suite, fix any failures

## Summary

| Action | Count |
|--------|-------|
| Fix failing test | 1 |
| New test files to create | **41** |
| Estimated new test cases | **~350** |
| Target: all green | 1823+ tests, 0 failures |

