

# Run and Fix All Tests to 100/100

## Problem

The full test suite (273 unit/integration + 68 E2E files = 341 total) exceeds the sandbox timeout when run as a single command. Tests must be run in targeted batches, failures identified, and fixes applied iteratively.

## Approach

Run tests in 10 focused batches by domain, fix any failures in each batch before moving to the next.

### Batch 1: Core Infrastructure
- `src/lib/__tests__/` (kernel, cross-domain, event-bus, policy-engine, etc.)
- `src/lib/core-services/__tests__/` (event-bus, policy-engine, receipt, workflow, etc.)

### Batch 2: Orchestration Pipeline
- `src/platform/orchestration/__tests__/` (facade-e2e, intent, planning, receipt-chain)
- `src/platform/orchestration/execution/__tests__/` (rollback-engine)

### Batch 3: Runtime, Release, Observability, Connectors
- `src/runtimes/__tests__/`
- `src/lib/release/__tests__/`
- `src/lib/observability/__tests__/`
- `src/lib/connectors/__tests__/`

### Batch 4: Nova SDK Kernel
- `src/platform/nova-sdk/kernel/__tests__/` (scheduler, syscall, memory, crash, power, fs)
- `src/platform/nova-sdk/runtime/__tests__/`
- `src/platform/nova-sdk/services/__tests__/`

### Batch 5: Components and UI Primitives
- `src/components/__tests__/`
- `src/components/sita/__tests__/`
- `src/__tests__/components/`
- `src/lib/ux-trust/__tests__/`

### Batch 6: Page Smoke Tests (Admin)
- `src/pages/__tests__/admin-pages-batch*.test.tsx`
- `src/pages/__tests__/admin-subdirs-batch*.test.tsx`

### Batch 7: Page Smoke Tests (Domain)
- `src/pages/__tests__/` (business, money, mobile, concierge, intelligence, investment, etc.)

### Batch 8: Contexts, Hooks, Services
- `src/contexts/__tests__/`
- `src/hooks/__tests__/`
- `src/lib/services/__tests__/`

### Batch 9: Test Suite (src/test/)
- `src/test/*.test.ts` and `src/test/*.test.tsx`
- `src/test/contracts/`
- `src/test/integration/`

### Batch 10: DB, Edge Functions, E2E
- `src/__tests__/db/`
- `src/__tests__/edge-functions/`
- `tests/integration/`

## Execution Strategy

For each batch:
1. Run with `npx vitest run <glob> --reporter=verbose` (120s timeout)
2. Capture failures
3. Fix root causes (missing mocks, import errors, stale assertions)
4. Re-run to confirm green
5. Move to next batch

## Expected Outcome

All 273 unit/integration test files passing. Any previously unknown failures will be fixed in-place. No test file skipped.

