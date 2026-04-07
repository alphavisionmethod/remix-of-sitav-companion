

# SITA OS — 100% Test Coverage Implementation Plan

## Current State

| Layer | Source Files | Test Files | Coverage |
|-------|------------|-----------|----------|
| **Pages** | 629 | 9 | ~1.4% |
| **Components** | 332 | 8 | ~2.4% |
| **Hooks** | 64 | 7 | ~11% |
| **Lib/Services** | 797 | 51 | ~6.4% |
| **E2E (Playwright)** | — | 37 specs | Partial |
| **Edge Functions** | 51 functions | 16 tests | ~31% |
| **Unit tests (src/test/)** | — | 50 files | Misc coverage |

**Total: ~184 test files covering ~1,822 source files. Estimated line coverage: <15%.**

Missing dependency: `@vitest/coverage-v8` is not installed, so coverage reporting doesn't work.

---

## Strategy: Tiered Test Pyramid

```text
         ╱  E2E (Playwright)  ╲     ← 37 specs (good)
        ╱  Integration Tests    ╲    ← ~50 unit/integration (ok)
       ╱  Component Tests (RTL)  ╲   ← 8 tests (CRITICAL GAP)
      ╱  Hook Tests               ╲  ← 7 tests (GAP)
     ╱  Service/Lib Unit Tests     ╲ ← 51 tests (GAP)
    ╱  Contract/Type Tests          ╲← some exist (ok)
   ╱  Edge Function Tests (Deno)    ╲← 16/51 (GAP)
```

---

## Implementation Plan

### Phase 1: Infrastructure (Must Do First)

| # | Task | Details |
|---|------|---------|
| 1 | Install `@vitest/coverage-v8` | Add to devDependencies so `npm run test -- --coverage` works |
| 2 | Add coverage scripts to `package.json` | `"test:coverage": "vitest run --coverage"` |
| 3 | Create test utilities file | `src/test/test-utils.tsx` — custom render with providers (QueryClient, Auth, Theme, DataMode, Router) so every component test gets proper context |
| 4 | Create mock factories | `src/test/factories/` — reusable builders for User, Document, Note, Receipt, etc. |

### Phase 2: Critical Path — Page Smoke Tests (629 pages → ~50 test files)

**Approach:** Group pages by domain and create batch smoke-test files that verify each page renders without crashing. This is the fastest path to high coverage.

| # | Test File | Pages Covered | Tests |
|---|-----------|---------------|-------|
| 1 | `src/pages/__tests__/auth-pages.test.tsx` | Login, Signup, ForgotPassword, ResetPassword, AuthCallback | 5 |
| 2 | `src/pages/__tests__/money-pages.test.tsx` | MoneyCenter, BillsWorkspace, TaxCenter, InvoiceGenerator, etc. | ~15 |
| 3 | `src/pages/__tests__/business-pages.test.tsx` | BusinessCenter, RevenueAutopilot, CRM, Pipeline, etc. | ~20 |
| 4 | `src/pages/__tests__/concierge-pages.test.tsx` | ConciergeCenter, CalendarWorkspace, Communications, etc. | ~15 |
| 5 | `src/pages/__tests__/workspace-pages.test.tsx` | DocsWorkspace, SheetsWorkspace, SlidesWorkspace, Notes, Media | ~10 |
| 6 | `src/pages/__tests__/admin-pages.test.tsx` | All admin/system pages | ~30 |
| 7 | `src/pages/__tests__/intelligence-pages.test.tsx` | PersonalBrain, Boardroom, AdvisorCouncil, etc. | ~15 |
| 8 | `src/pages/__tests__/investment-pages.test.tsx` | InvestmentOffice, CapitalAllocation, etc. | ~10 |

**Pattern per page:**
```typescript
import { render, screen } from "@/test/test-utils";
import MoneyCenter from "@/pages/MoneyCenter";

describe("MoneyCenter", () => {
  it("renders without crashing", () => {
    render(<MoneyCenter />);
    expect(document.querySelector("[data-testid], h1, h2, main")).toBeTruthy();
  });
});
```

### Phase 3: Component Tests (332 components → ~30 test files)

Group by component directory. Test rendering + key interactions.

| # | Test File | Components |
|---|-----------|-----------|
| 1 | `src/components/sita/__tests__/primitives.test.tsx` | All 6 SITA primitives |
| 2 | `src/components/auth/__tests__/auth-forms.test.tsx` | LoginForm, SignupForm, PasswordReset |
| 3 | `src/components/layout/__tests__/layout.test.tsx` | Sidebar, AppLayout, MobileNav |
| 4 | `src/components/advisor/__tests__/advisor.test.tsx` | AdvisorChat, AdvisorCard |
| 5 | `src/components/money/__tests__/money-widgets.test.tsx` | BillCard, InvoicePreview, etc. |
| 6-30 | Domain-grouped test files | Remaining components |

### Phase 4: Hook Tests (64 hooks → ~15 test files)

Test each hook with `renderHook` from RTL. Mock Supabase client.

| # | Test File | Hooks |
|---|-----------|-------|
| 1 | `src/hooks/__tests__/use-live-data.test.ts` | All 7 live-data hooks |
| 2 | `src/hooks/__tests__/use-auth-hooks.test.ts` | useAuth, useSession |
| 3 | `src/hooks/__tests__/use-navigation.test.ts` | useNavigation, useBreadcrumbs |
| 4-15 | Domain hooks | Remaining hooks |

### Phase 5: Lib/Service Unit Tests (797 files → ~40 test files)

Focus on business logic, engines, and services.

| # | Test File | Coverage |
|---|-----------|----------|
| 1 | `src/lib/__tests__/kernel-contracts.test.ts` | All kernel contracts (envelope, receipt, evidence, replay, reasoning) |
| 2 | `src/lib/__tests__/domain-engines.test.ts` | Business-OS, Finance-OS, Concierge-OS engines |
| 3 | `src/lib/__tests__/security-services.test.ts` | Security posture, fraud sentinel, kill switch |
| 4 | `src/lib/__tests__/capability-registry.test.ts` | Full capability CRUD + routing |
| 5-40 | Remaining services | Workflow, event bus, approval, memory, etc. |

### Phase 6: Edge Function Tests (35 missing → 35 test files)

Create Deno test files for all untested edge functions.

| # | Functions | Pattern |
|---|-----------|---------|
| 1-35 | All 35 untested functions | `Deno.test()` with fetch to function URL, assert status + response shape |

### Phase 7: Coverage Thresholds

Update `vitest.config.ts` thresholds progressively:

| Milestone | Lines | Branches | Functions | Statements |
|-----------|-------|----------|-----------|------------|
| Current | 40% | 30% | 35% | 40% |
| After Phase 2 | 60% | 45% | 50% | 60% |
| After Phase 3-4 | 75% | 60% | 70% | 75% |
| After Phase 5 | 85% | 75% | 80% | 85% |
| Final | 90% | 80% | 85% | 90% |

> Note: 100% line coverage is impractical (error boundaries, platform-specific code, etc.). Industry standard for production apps is 80-90%. We target 90%.

---

## Files Created/Modified

| Action | File |
|--------|------|
| Install | `@vitest/coverage-v8` devDependency |
| Create | `src/test/test-utils.tsx` (custom render) |
| Create | `src/test/factories/index.ts` (mock builders) |
| Create | ~50 page test files in `src/pages/__tests__/` |
| Create | ~30 component test files |
| Create | ~15 hook test files |
| Create | ~40 lib/service test files |
| Create | ~35 edge function test files |
| Update | `vitest.config.ts` (thresholds) |
| Update | `package.json` (scripts + coverage dep) |

**Total: ~170 new test files. Due to the volume, implementation will proceed in phases, starting with infrastructure + page smoke tests (highest coverage gain per file).**

