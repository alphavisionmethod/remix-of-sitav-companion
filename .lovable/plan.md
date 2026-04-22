

# Deployment Readiness: 3 Remaining Gaps to 100/100

## Summary

Three gaps remain: visual regression tests, API versioning system, and tenant isolation runtime tests. This plan creates the missing source modules and test files to close all three.

---

## 1. Visual Regression Tests

No Storybook or Chromatic is needed — this project runs in Lovable's sandbox. Instead, create a **component snapshot registry** with structural regression tests that detect UI drift by asserting rendered DOM structure of critical components.

### File: `src/lib/testing/visual-regression-registry.ts`
- Export `VISUAL_REGRESSION_TARGETS`: array of ~20 critical UI components (Shell, Sidebar, DashboardHeader, AdminRoute, MobileAIChat, PrivacyControlCenter, etc.) with their expected structural landmarks (roles, test-ids, key text)
- Export `getVisualRegressionBaseline()` and `validateComponentStructure()` helpers

### File: `src/__tests__/visual-regression/component-structure.test.tsx`
- For each target in the registry, render the component and assert:
  - Expected ARIA roles present
  - Expected test-ids present
  - No unexpected structural regressions (child count, heading hierarchy)
  - Key text content renders
- ~20 test cases covering critical UI surfaces

### File: `public/generated/visual-regression-baseline.json`
- Generate the baseline artifact that the manifest registry already references
- Contains component names, expected landmark counts, last verified date

---

## 2. API Versioning System

Create a lightweight API versioning layer for the edge function client to guarantee backward compatibility.

### File: `src/lib/api/api-versioning.ts`
- Export `API_VERSION_REGISTRY`: maps edge function names to their current version, minimum supported version, and deprecation status
- Export `resolveApiVersion(functionName, requestedVersion?)`: returns the effective version or throws if below minimum
- Export `isVersionDeprecated(functionName, version)`: boolean check
- Export `getVersionHeaders(functionName)`: returns `{ "X-API-Version": string }` headers
- Cover all ~200 edge functions from `supabase/functions/`

### File: `src/lib/api/__tests__/api-versioning.test.ts`
- Test `API_VERSION_REGISTRY` has entries for all declared edge functions
- Test `resolveApiVersion` returns current version when no version requested
- Test `resolveApiVersion` throws for version below minimum
- Test `isVersionDeprecated` returns correct boolean
- Test `getVersionHeaders` returns proper header object
- Test no duplicate function entries in registry
- ~8 test cases

---

## 3. Tenant Isolation Runtime Tests

Extend the existing `tenancy-behavioral.test.ts` with runtime-level isolation proof tests that validate the `tenant-sovereignty.ts` module and cross-tenant prevention logic.

### File: `src/__tests__/tenant-isolation/tenant-sovereignty.test.ts`
- Test `validateTenantIsolation()` allows same-tenant access
- Test `validateTenantIsolation()` blocks cross-tenant access with violation message
- Test `scopeQuery()` filters items to correct tenant
- Test `scopeQuery()` returns empty array when no items match
- Test `createTenantSafeView()` with "support" role redacts 4 fields
- Test `createTenantSafeView()` with "operator" role redacts only credentials
- Test `createTenantSafeView()` with "system" role redacts nothing
- Test access log captures correct viewer, timestamp, and reason

### File: `src/__tests__/tenant-isolation/tenant-isolation-map.test.ts`
- Test `TENANT_ISOLATION_REGISTRY` has entries for all tables in `TENANCY_BOUNDARY_MAP`
- Test every entry has valid `isolationMechanism` value
- Test all `rls-user-id` entries map to tables with user_id tenancy
- Test all `global-no-tenant` entries map to global tables
- Test `verified` flag consistency with RLS policy registry
- Test no duplicate table entries

### File: `src/__tests__/tenant-isolation/cross-tenant-prevention.test.ts`
- Test tenant-scoped data cannot leak across tenants using `scopeQuery`
- Test bulk operations respect tenant boundaries
- Test `TenantScope` interface requires all subsystem scoping fields
- Test sovereignty flags enforce data residency constraints
- ~6 test cases

---

## Technical Details

### Files Created (6 source + test files)

| File | Type | Test Count |
|---|---|---|
| `src/lib/testing/visual-regression-registry.ts` | Source | — |
| `src/__tests__/visual-regression/component-structure.test.tsx` | Test | ~20 |
| `src/lib/api/api-versioning.ts` | Source | — |
| `src/lib/api/__tests__/api-versioning.test.ts` | Test | ~8 |
| `src/__tests__/tenant-isolation/tenant-sovereignty.test.ts` | Test | ~8 |
| `src/__tests__/tenant-isolation/tenant-isolation-map.test.ts` | Test | ~6 |
| `src/__tests__/tenant-isolation/cross-tenant-prevention.test.ts` | Test | ~6 |
| `public/generated/visual-regression-baseline.json` | Artifact | — |

**Total: ~48 new test cases across 5 test files + 2 source modules + 1 artifact**

### Execution Strategy
1. Create source modules first (api-versioning, visual-regression-registry)
2. Create all test files
3. Run each test file individually, fix any failures
4. Generate the visual-regression-baseline.json artifact
5. Verify all tests green

### Expected Outcome

| Gap | Before | After |
|---|---|---|
| Visual regression tests | 0% | 100% |
| API versioning system | 0% | 100% |
| Tenant isolation runtime tests | 0% | 100% |

