
# Integration Tests + E2E Tests — Full Implementation Plan

## Current State
- **E2E (`e2e/`)**: 21 spec files exist but are skeleton-level (most just check `body` is visible)
- **E2E (`tests/e2e/`)**: 3 Playwright specs (auth, route-smoke, interactions) — more substantial but require test credentials
- **Integration (`src/test/`)**: 50+ vitest files exist but many are shallow (check exports exist, not actual behavior)
- **Playwright config**: Configured, pointing to `tests/e2e/`
- **Vitest config**: Configured, working

## What's Missing
1. **Real integration tests** that verify service layer wiring: calling a service → verifying the result chain (policy engine → executor → receipt → state)
2. **Real E2E tests** that don't require pre-configured test users — tests that work against the live preview with actual interactions
3. **Coverage of all major domains**: auth, files, boardroom, advisors, approvals, connectors, money, business, admin, settings, verification boards, customer journey boards

## Plan

### Phase 1 — Integration Test Suite (Vitest, `src/test/integration/`)

Create **real integration tests** that verify cross-service wiring and data flow:

| File | What it tests |
|---|---|
| `auth-flow.integration.test.ts` | Auth context → session validation → route guard → redirect chain |
| `capability-registry.integration.test.ts` | Register capability → invoke → validate result contract → error path |
| `policy-engine-chain.integration.test.ts` | Policy context → evaluation → executor handoff → receipt generation |
| `event-bus-wiring.integration.test.ts` | Publish event → subscriber fires → state updates → audit trail |
| `approval-engine-flow.integration.test.ts` | Submit approval → policy check → state transition → notification |
| `connector-lifecycle.integration.test.ts` | Register connector → health check → mode resolution → status update |
| `demo-mode-resolution.integration.test.ts` | Switch mode → provider resolution → data source change → UI state |
| `verification-pipeline.integration.test.ts` | Surface registry → seed DB hook → record run → blocker auto-creation |
| `customer-journey-pipeline.integration.test.ts` | Journey registry → seed → record run → blocker creation → stats |
| `file-ingestion-chain.integration.test.ts` | File upload trigger → ingestion service → receipt → state |
| `ai-gateway-chain.integration.test.ts` | AI request → model router → provider resolution → fallback path |
| `workflow-engine-chain.integration.test.ts` | Create workflow → execute steps → state transitions → completion |

Each test will: instantiate real services (no mocks of the service layer), call through the chain, and assert on the final state/receipts.

### Phase 2 — E2E Test Suite (Playwright, `tests/e2e/`)

Consolidate and replace the skeleton `e2e/` files. Create **comprehensive Playwright specs** that work without pre-configured credentials (unauthenticated tests) plus authenticated test suites:

| File | Coverage |
|---|---|
| `auth-journeys.spec.ts` | Login form render, validation, error states, forgot password, signup, redirect guards |
| `route-health.spec.ts` | All P0/P1/P2 routes load without crash (200+ routes) — generated from App.tsx route map |
| `navigation.spec.ts` | Sidebar links, breadcrumbs, back navigation, 404 handling |
| `admin-boards.spec.ts` | All admin routes (DRS, AR, SAG, LT, V01-V07, CJ01-CJ07, CN01) load correctly |
| `verification-boards.spec.ts` | V01-V07 boards render, seed button works, data tables show |
| `customer-journey-boards.spec.ts` | CJ01-CJ07 boards render, seed button works, matrix populates |
| `files-journey.spec.ts` | Files page load, upload zone visible, file list renders |
| `boardroom-journey.spec.ts` | Boardroom load, summary cards render, refresh button exists |
| `advisor-journey.spec.ts` | Advisor workspace loads, chat input visible, advisor list renders |
| `approvals-journey.spec.ts` | Approvals page loads, tabs work, action buttons visible |
| `connectors-journey.spec.ts` | Connector hub loads, cards render, connect buttons visible |
| `settings-journey.spec.ts` | Settings page loads, tabs navigate, forms render |
| `money-journey.spec.ts` | Money center loads, financial data section renders |
| `business-journey.spec.ts` | Business center loads, CRM data section renders |
| `demo-mode.spec.ts` | Demo mode toggle, demo labels visible, scenario continuity |
| `responsive.spec.ts` | Key pages at mobile/tablet/desktop viewports render correctly |

### Phase 3 — Wiring & Config

1. **Update `playwright.config.ts`** — point `testDir` to include both `tests/e2e/` and consolidate
2. **Add `test:integration` script** to `package.json`: `vitest run --dir src/test/integration`
3. **Add `test:e2e` script**: `npx playwright test`
4. **Remove duplicate `e2e/` directory** skeleton files (replaced by comprehensive `tests/e2e/`)

## Files Changed

| Area | Files |
|---|---|
| Integration tests | 12 new files in `src/test/integration/` |
| E2E tests | 16 new files in `tests/e2e/` |
| Config | `package.json` (scripts), cleanup of `e2e/` directory |
| Playwright | Minor config updates |

## Key Design Decisions
- Integration tests use real service instances, not mocks — they test the actual wiring
- E2E tests split into unauthenticated (route health, auth forms) and authenticated (skipped without credentials)
- Route health E2E auto-generates from the full route map — no manual maintenance
- All tests follow existing patterns (vitest globals, Playwright `test.describe`)
